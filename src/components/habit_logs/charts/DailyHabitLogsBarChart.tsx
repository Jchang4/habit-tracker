"use client";

import { HabitLogBreakdown } from "@/lib/api/habit-logs";
import { SegmentedControl, Stack, Title } from "@mantine/core";
import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { useMemo, useState } from "react";
import HabitLogsBarChart from "./HabitLogsBarChart";

interface DailyHabitLogsBarChartProps {
  habitId: string;
  title?: string;
}

/**
 * A bar chart showing habit log data broken down by day.
 * Shows all days in the selected range, even those without data.
 */
export default function DailyHabitLogsBarChart({
  habitId,
  title = "Daily Activity",
}: DailyHabitLogsBarChartProps) {
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

  // Custom formatter for day labels that checks if it's today or yesterday
  const formatDayKey = (timeKey: string): string => {
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(addDays(new Date(), -1), "yyyy-MM-dd");

    if (timeKey === today) return "Today";
    if (timeKey === yesterday) return "Yesterday";

    // Otherwise format as "Mon, Jan 1"
    return format(parseISO(timeKey), "EEE, MMM d");
  };

  // Generate all days in the range for the chart
  const allDaysInRange = useMemo(() => {
    const startDateObj = parseISO(dateRange.startDate);
    const endDateObj = parseISO(dateRange.endDate);

    // Get all dates in the interval
    const dates = eachDayOfInterval({ start: startDateObj, end: endDateObj });

    // Return the dates as formatted strings
    return dates.map((date) => format(date, "yyyy-MM-dd"));
  }, [dateRange]);

  return (
    <Stack gap="md">
      <Title order={4}>{title}</Title>
      <SegmentedControl
        value={daysToShow}
        onChange={setDaysToShow}
        data={[
          { value: "5", label: "5 days" },
          { value: "7", label: "7 days" },
          { value: "14", label: "14 days" },
          { value: "30", label: "30 days" },
        ]}
        mb="md"
        fullWidth
      />
      <HabitLogsBarChart
        habitId={habitId}
        breakdown={HabitLogBreakdown.Day}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        height={300}
        formatTimeKey={formatDayKey}
        reverse={true} // Display most recent days first
      />
    </Stack>
  );
}
