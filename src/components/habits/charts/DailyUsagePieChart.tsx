"use client";

import { useHabitLogStats } from "@/lib/api/habit-logs";
import { useHabit } from "@/lib/api/habits";
import { PieChart } from "@mantine/charts";
import {
  Alert,
  Center,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { addDays, endOfDay, format, startOfDay } from "date-fns";
import { useMemo } from "react";

interface DailyUsagePieChartProps {
  habitId: string;
  title?: string;
  size?: number;
}

export function DailyUsagePieChart({
  habitId,
  title = "Daily Usage",
  size = 300,
}: DailyUsagePieChartProps) {
  // Memoize date values to prevent re-renders
  const dateRange = useMemo(() => {
    const today = startOfDay(new Date());
    const tomorrow = endOfDay(addDays(today, 1));

    return {
      todayStr: format(today, "yyyy-MM-dd"),
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
    };
  }, []);

  // Fetch habit stats for today
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useHabitLogStats(habitId, {
    breakdown: "day",
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const { data: habit, isLoading: habitLoading } = useHabit(habitId);

  // Process data for pie chart
  const chartData = useMemo(() => {
    if (!statsData || !habit) return [];

    // Get today's data if available
    const todayData = statsData.stats.find(
      (stat) => stat.timeKey === dateRange.todayStr
    );
    const todayTotal = todayData?.total || 0;

    // Generate colors for pie chart segments
    const colors = [habit.goodHabit ? "blue.6" : "red.5", "gray.6"];
    const chartData = [
      {
        name: "Today",
        value: todayTotal,
        color: colors[0],
      },
    ];

    // If user has not hit limit for today, add a "Remaining" segment
    if (todayTotal < (habit.targetPerDay || 0)) {
      chartData.push({
        name: "Remaining",
        value: (habit.targetPerDay || 0) - todayTotal,
        color: colors[1],
      });
    }

    return chartData;
  }, [statsData, habit, dateRange.todayStr]);

  // Calculate total usage
  const totalUsage = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Handle loading states
  if (statsLoading || habitLoading) {
    return (
      <Stack gap="md" align="center">
        <Skeleton height={20} width={200} />
        <Skeleton height={size} width={size} radius="50%" />
      </Stack>
    );
  }

  // Handle error states
  if (statsError) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
        Failed to load habit data: {(statsError as Error).message}
      </Alert>
    );
  }

  // Handle no data
  if (!statsData || !habit || chartData.length === 0) {
    return (
      <Stack gap="md" align="center">
        <Title order={4}>{title}</Title>
        <Center h={size}>
          <Text c="dimmed" ta="center">
            No usage data available yet.
            <br />
            Start logging this habit to see your daily usage!
          </Text>
        </Center>
      </Stack>
    );
  }

  return (
    <Stack gap="md" align="center">
      <Title order={4}>{title}</Title>

      <PieChart
        data={chartData}
        size={size}
        withTooltip
        tooltipDataSource="segment"
        withLabels
        labelsPosition="outside"
        labelsType="value"
        strokeWidth={1}
      />

      <Group gap="lg" justify="center">
        <Text size="sm" c="dimmed">
          <Text span fw={500} c="dark">
            Total: {totalUsage.toFixed(1)} {habit.units || ""}
          </Text>
        </Text>
        <Text size="sm" c="dimmed">
          Today's Progress
        </Text>
      </Group>
    </Stack>
  );
}
