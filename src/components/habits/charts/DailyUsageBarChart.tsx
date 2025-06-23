"use client";

import { useHabitLogs } from "@/lib/api/habit-logs";
import { useHabit } from "@/lib/api/habits";
import { BarChart } from "@mantine/charts";
import { SegmentedControl, Skeleton } from "@mantine/core";
import { format } from "date-fns";
import { useState } from "react";

interface DailyUsageBarChartProps {
  habitId: string;
}

export function DailyUsageBarChart({ habitId }: DailyUsageBarChartProps) {
  const [daysToShow, setDaysToShow] = useState<string>("7");
  const { data: logs, isLoading: isLogsLoading } = useHabitLogs(habitId);
  const { data: habit, isLoading: isHabitLoading } = useHabit(habitId);

  const isLoading = isLogsLoading || isHabitLoading;

  if (isLoading) {
    return <Skeleton height={300} />;
  }

  if (!logs || !habit) {
    return null;
  }

  // Generate an array of the last N days (including today)
  const generateDaysArray = (numDays: number) => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < numDays; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = format(date, "yyyy-MM-dd"); // Use date-fns consistently
      days.push({
        date: formattedDate,
        displayDate:
          i === 0
            ? "Today"
            : i === 1
            ? "Yesterday"
            : formatDateForDisplay(date),
        amount: 0,
      });
    }

    return days;
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Group logs by day and calculate total amount per day
  const processLogsData = (numDays: number) => {
    const daysArray = generateDaysArray(numDays);
    const daysMap = new Map(daysArray.map((day) => [day.date, { ...day }]));

    // Sum up amounts for each day
    logs.forEach((log) => {
      const logDate = format(new Date(log.performedAt), "yyyy-MM-dd");
      if (daysMap.has(logDate)) {
        const day = daysMap.get(logDate)!;
        day.amount += log.amount;
      }
    });

    return Array.from(daysMap.values());
  };

  const chartData = processLogsData(parseInt(daysToShow, 10));

  // Custom value formatter for tooltip and labels
  const valueFormatter = (value: number): string => {
    if (value === 0) {
      return "";
    }
    return `${value} ${habit.units}`;
  };

  return (
    <>
      <SegmentedControl
        value={daysToShow}
        onChange={setDaysToShow}
        data={[
          { value: "5", label: "5 days" },
          { value: "7", label: "7 days" },
          { value: "14", label: "14 days" },
          { value: "30", label: "30 days" },
        ]}
        mb="xl"
        fullWidth
      />
      <BarChart
        h={300}
        data={chartData}
        dataKey="displayDate"
        series={[
          {
            name: "amount",
            color: habit.goodHabit ? "teal.6" : "red.6",
          },
        ]}
        withBarValueLabel
        valueFormatter={valueFormatter}
        barProps={{ radius: [4, 4, 0, 0] }}
        tickLine="x"
        yAxisProps={{
          domain: [0, "auto"],
          allowDecimals: false,
        }}
      />
    </>
  );
}
