"use client";

import { useHabitLogStats } from "@/lib/api/habit-logs";
import { useHabit } from "@/lib/api/habits";
import { Sparkline } from "@mantine/charts";
import { Box, Group, Skeleton, Text } from "@mantine/core";
import { endOfDay, startOfDay } from "date-fns";
import { useMemo } from "react";

interface DailyUsageSparklineProps {
  habitId: string;
  days?: number;
}

export function DailyUsageSparkline({
  habitId,
  days = 14,
}: DailyUsageSparklineProps) {
  // Memoize date range based on days to prevent re-renders
  const dateRange = useMemo(() => {
    const end = endOfDay(new Date());
    const start = startOfDay(new Date());
    start.setDate(end.getDate() - days + 1);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [days]);

  const { data: statsData, isLoading: isStatsLoading } = useHabitLogStats(
    habitId,
    {
      breakdown: "day",
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }
  );

  const { data: habit, isLoading: isHabitLoading } = useHabit(habitId);

  const isLoading = isStatsLoading || isHabitLoading;

  if (isLoading) {
    return <Skeleton height={60} />;
  }

  if (!statsData || !habit) {
    return null;
  }

  // Process stats data for sparkline
  // Sort by date and extract just the values
  const sparklineData = statsData.stats
    .sort((a, b) => a.timeKey.localeCompare(b.timeKey))
    .map((stat) => stat.total);

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
