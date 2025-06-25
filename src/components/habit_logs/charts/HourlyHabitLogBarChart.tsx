"use client";

import { HabitLogBreakdown } from "@/lib/api/habit-logs";
import { useHabit } from "@/lib/api/habits";
import { SegmentedControl, Skeleton, Stack, Text, Title } from "@mantine/core";
import { endOfDay, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import HabitLogsBarChart from "./HabitLogsBarChart";

interface HourlyHabitLogBarChartProps {
  habitId: string;
  title?: string;
}

/**
 * A bar chart showing habit log data broken down by hour of day.
 * Allows filtering by today, yesterday, or last 7 days.
 */
export default function HourlyHabitLogBarChart({
  habitId,
  title = "Hourly Activity",
}: HourlyHabitLogBarChartProps) {
  const [timeRange, setTimeRange] = useState<string>("today");
  const { data: habit, isLoading: isHabitLoading } = useHabit(habitId);

  // Calculate date range based on selected time range
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (timeRange) {
      case "today":
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        start = startOfDay(yesterday);
        end = endOfDay(yesterday);
        break;
      case "week":
        end = endOfDay(now);
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        start = startOfDay(start);
        break;
      default:
        start = startOfDay(now);
        end = endOfDay(now);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [timeRange]);

  // Get timezone offset in hours
  const timezoneOffset = useMemo(() => {
    return (new Date().getTimezoneOffset() / 60) * -1; // Convert to hours and invert (API returns UTC)
  }, []);

  // Custom formatter for hour labels that accounts for timezone
  const formatHourKey = (timeKey: string): string => {
    // Parse the hour from the timeKey
    let hour = parseInt(timeKey, 10);

    // Adjust for timezone
    hour = (hour + timezoneOffset) % 24;
    if (hour < 0) hour += 24; // Handle negative hours after timezone adjustment

    // Format the adjusted hour
    return new Date(0, 0, 0, hour).toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
    });
  };

  if (isHabitLoading) {
    return <Skeleton height={400} />;
  }

  if (!habit) {
    return null;
  }

  return (
    <Stack gap="md">
      <Title order={4}>{title}</Title>
      <SegmentedControl
        value={timeRange}
        onChange={setTimeRange}
        data={[
          { value: "today", label: "Today" },
          { value: "yesterday", label: "Yesterday" },
          { value: "week", label: "Last 7 Days" },
        ]}
        mb="md"
        fullWidth
      />
      <Text size="sm" c="dimmed" ta="center">
        All times shown in your local timezone
      </Text>
      <HabitLogsBarChart
        habitId={habitId}
        breakdown={HabitLogBreakdown.Hour}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        height={300}
        formatTimeKey={formatHourKey}
      />
    </Stack>
  );
}
