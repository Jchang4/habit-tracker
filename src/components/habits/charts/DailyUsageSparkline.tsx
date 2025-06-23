"use client";

import { useHabitLogs } from "@/lib/api/habit-logs";
import { useHabit } from "@/lib/api/habits";
import { Sparkline } from "@mantine/charts";
import { Box, Group, Skeleton, Text } from "@mantine/core";
import { format } from "date-fns";

interface DailyUsageSparklineProps {
  habitId: string;
  days?: number;
}

export function DailyUsageSparkline({
  habitId,
  days = 14,
}: DailyUsageSparklineProps) {
  const { data: logs, isLoading: isLogsLoading } = useHabitLogs(habitId);
  const { data: habit, isLoading: isHabitLoading } = useHabit(habitId);

  const isLoading = isLogsLoading || isHabitLoading;

  if (isLoading) {
    return <Skeleton height={60} />;
  }

  if (!logs || !habit) {
    return null;
  }

  // Generate data for the last N days
  const generateSparklineData = (numDays: number) => {
    const today = new Date();
    const daysMap = new Map();

    // Initialize with zeros for all days
    for (let i = 0; i < numDays; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = format(date, "yyyy-MM-dd");
      daysMap.set(formattedDate, 0);
    }

    // Sum up amounts for each day
    logs.forEach((log) => {
      const logDate = format(new Date(log.performedAt), "yyyy-MM-dd");
      if (daysMap.has(logDate)) {
        daysMap.set(logDate, daysMap.get(logDate) + log.amount);
      }
    });

    // Convert to array of values (oldest to newest)
    return Array.from(daysMap.values()).reverse();
  };

  const sparklineData = generateSparklineData(days);

  // Calculate trend (first value vs last value)
  const firstValue = sparklineData[0] || 0;
  const lastValue = sparklineData[sparklineData.length - 1] || 0;
  const trend = lastValue - firstValue;

  // Calculate percentage change
  const percentChange =
    firstValue === 0
      ? lastValue > 0
        ? 100
        : 0
      : Math.round((trend / firstValue) * 100);

  // Format the trend text
  const trendText =
    trend === 0
      ? "No change"
      : trend > 0
      ? `+${trend} (${percentChange}%)`
      : `${trend} (${percentChange}%)`;

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed">
          {days} day trend
        </Text>
        <Text
          size="sm"
          fw={500}
          c={trend > 0 ? "teal.6" : trend < 0 ? "red.6" : "dimmed"}
        >
          {trendText}
        </Text>
      </Group>

      <Sparkline
        h={60}
        data={sparklineData}
        trendColors={{
          positive: habit.goodHabit ? "teal.6" : "red.6",
          negative: habit.goodHabit ? "red.6" : "teal.6",
          neutral: "gray.5",
        }}
        fillOpacity={0.2}
        strokeWidth={1.5}
        curveType="monotone"
      />
    </Box>
  );
}
