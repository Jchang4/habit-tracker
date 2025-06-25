"use client";

import { HabitLogBreakdown, useHabitLogStats } from "@/lib/api/habit-logs";
import { useHabit } from "@/lib/api/habits";
import { BarChart } from "@mantine/charts";
import { SegmentedControl, Skeleton } from "@mantine/core";
import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { useMemo, useState } from "react";

interface DailyUsageBarChartProps {
  habitId: string;
}

export function DailyUsageBarChart({ habitId }: DailyUsageBarChartProps) {
  const [daysToShow, setDaysToShow] = useState<string>("7");

  // Calculate date range based on days to show - memoized to avoid re-renders
  const dateRange = useMemo(() => {
    const end = endOfDay(new Date());
    const start = startOfDay(new Date());
    start.setDate(end.getDate() - parseInt(daysToShow, 10) + 1);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [daysToShow]);

  const { data: statsData, isLoading: isStatsLoading } = useHabitLogStats(
    habitId,
    {
      breakdown: HabitLogBreakdown.Day,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }
  );

  const { data: habit, isLoading: isHabitLoading } = useHabit(habitId);

  const isLoading = isStatsLoading || isHabitLoading;

  if (isLoading) {
    return <Skeleton height={300} />;
  }

  if (!statsData || !habit) {
    return null;
  }

  // Create a map of dates to stats for quick lookup
  const statsMap = new Map();
  statsData.stats.forEach((stat) => {
    statsMap.set(stat.timeKey, stat);
  });

  // Parse the date range for generating all dates
  const startDateObj = parseISO(dateRange.startDate);
  const endDateObj = parseISO(dateRange.endDate);

  // Generate all dates in the range
  const allDates = eachDayOfInterval({ start: startDateObj, end: endDateObj });

  // Format the stats data for the chart, including all days in the range
  const chartData = allDates
    .map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const stat = statsMap.get(dateKey);
      const isToday =
        format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
      const isYesterday =
        format(date, "yyyy-MM-dd") ===
        format(addDays(new Date(), -1), "yyyy-MM-dd");

      return {
        date: dateKey,
        displayDate: isToday
          ? "Today"
          : isYesterday
          ? "Yesterday"
          : formatDateForDisplay(date),
        amount: stat ? stat.total : 0,
      };
    })
    .reverse(); // Most recent days first

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
            color: habit.goodHabit ? "blue.6" : "red.5",
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

function formatDateForDisplay(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
