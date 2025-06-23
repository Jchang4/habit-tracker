"use client";

import { useHabitLogs } from "@/lib/api/habit-logs";
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
import { format, isToday, parseISO } from "date-fns";
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
  // Fetch habit logs and habit details
  const {
    data: logs,
    isLoading: logsLoading,
    error: logsError,
  } = useHabitLogs(habitId);

  const { data: habit, isLoading: habitLoading } = useHabit(habitId);

  // Process data for pie chart
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    // Group logs by date
    const dailyTotals = logs.reduce((acc, log) => {
      const date = format(parseISO(log.performedAt), "yyyy-MM-dd");
      const dayName = format(parseISO(log.performedAt), "EEEE");
      const isCurrentDay = isToday(parseISO(log.performedAt));

      if (!acc[date]) {
        acc[date] = {
          date,
          dayName,
          total: 0,
          isToday: isCurrentDay,
        };
      }
      acc[date].total += log.amount || 0;
      return acc;
    }, {} as Record<string, { date: string; dayName: string; total: number; isToday: boolean }>);

    // Convert to array and sort by date (most recent first)
    const today = format(new Date(), "yyyy-MM-dd");
    const todayData = dailyTotals[today]
      ? dailyTotals[today]
      : {
          date: today,
          dayName: "Today",
          total: 0,
          isToday: true,
        };

    // Generate colors for pie chart segments
    const colors = [habit?.goodHabit ? "blue.6" : "red.5", "gray.6"];
    const chartData = [
      {
        name: todayData.isToday
          ? `Today (${todayData.dayName})`
          : format(new Date(todayData.date), "MMM d"),
        value: todayData.total,
        color: colors[0],
      },
    ];

    // If user has not hit limit for today, add a "Remaining" segment
    if (todayData.total < (habit?.targetPerDay || 0)) {
      chartData.push({
        name: "Remaining",
        value: (habit?.targetPerDay || 0) - todayData.total,
        color: colors[1],
      });
    }

    return chartData;
  }, [logs]);

  // Calculate total usage
  const totalUsage = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Handle loading states
  if (logsLoading || habitLoading) {
    return (
      <Stack gap="md" align="center">
        <Skeleton height={20} width={200} />
        <Skeleton height={size} width={size} radius="50%" />
      </Stack>
    );
  }

  // Handle error states
  if (logsError) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
        Failed to load habit data: {(logsError as Error).message}
      </Alert>
    );
  }

  // Handle no data
  if (!logs || logs.length === 0 || chartData.length === 0) {
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
            Total: {totalUsage.toFixed(1)} {habit?.units || ""}
          </Text>
        </Text>
        <Text size="sm" c="dimmed">
          Last {chartData.length} {chartData.length === 1 ? "day" : "days"}
        </Text>
      </Group>
    </Stack>
  );
}
