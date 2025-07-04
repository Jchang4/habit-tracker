"use client";

import { HabitLogsTable } from "@/components/habit_logs/HabitLogsTable";
import DailyHabitLogsBarChart from "@/components/habit_logs/charts/DailyHabitLogsBarChart";
import HourlyHabitLogBarChart from "@/components/habit_logs/charts/HourlyHabitLogBarChart";
import { CopyHabitApiUrl } from "@/components/habits/CopyHabitApiUrl";
import { GoodHabitBadge } from "@/components/habits/GoodHabitBadge";
import { HabitDetailsCard } from "@/components/habits/HabitDetailsCard";
import { DailyUsagePieChart } from "@/components/habits/charts/DailyUsagePieChart";
import { HabitQuickLogInput } from "@/components/habits/forms/HabitQuickLogInput";
import { DeleteHabitModal } from "@/components/habits/modals/DeleteHabitModal";
import { EditHabitModal } from "@/components/habits/modals/EditHabitModal";
import { useHabit } from "@/lib/api/habits";
import {
  Alert,
  Box,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconChartBar,
  IconChartPie,
} from "@tabler/icons-react";
import { notFound } from "next/navigation";
import React from "react";

interface HabitPageProps {
  params: Promise<{ id: string }>;
}

export default function HabitPage({ params }: HabitPageProps) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;

  const { data: habit, isLoading, error } = useHabit(id);

  if (isLoading) {
    return (
      <Container size="lg" py="md">
        <Stack gap="lg">
          <Skeleton height={60} />
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Skeleton height={400} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Skeleton height={200} mb="md" />
              <Skeleton height={200} />
            </Grid.Col>
          </Grid>
          <Skeleton height={300} />
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="md">
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
          Failed to load habit: {(error as Error).message}
        </Alert>
      </Container>
    );
  }

  if (!habit) {
    notFound();
  }

  return (
    <Stack gap="lg" p="md" pb="8rem">
      {/* Header */}
      <Stack>
        <Box w="100%">
          <Group gap="md" align="center">
            <Title order={1}>{habit.name}</Title>
            <GoodHabitBadge goodHabit={habit.goodHabit} />
          </Group>
          {habit.description && (
            <Text size="lg" c="dimmed" mt="xs">
              {habit.description}
            </Text>
          )}
        </Box>
        <Box>
          <EditHabitModal habit={habit} />
        </Box>
      </Stack>

      {/* Main Content Grid */}
      <Grid>
        {/* Left Column - Habit Details & Quick Log */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="md" h="100%">
            {/* Nested Grid for Details and Quick Log side by side */}
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <HabitDetailsCard habit={habit} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Text fw={500} size="lg" mb="md">
                    Quick Log
                  </Text>
                  <HabitQuickLogInput habit={habit} />
                </Card>
              </Grid.Col>
            </Grid>

            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <HourlyHabitLogBarChart habitId={habit.id} />
            </Card>

            {/* Usage Per Day Chart */}
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Group mb="md">
                <IconChartBar size="1.5rem" />
                <Text fw={500} size="lg">
                  Usage Per Day
                </Text>
              </Group>
              <DailyHabitLogsBarChart habitId={habit.id} />
            </Card>
          </Stack>
        </Grid.Col>

        {/* Right Column - Charts */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md" h="100%">
            <TodaysProgressCard habitId={habit.id} />
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Habit Logs Table */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text fw={500} size="lg" mb="md">
          Habit Logs
        </Text>
        <HabitLogsTable habitId={habit.id} />
      </Card>

      {/* API Access */}
      <CopyHabitApiUrl habit={habit} />

      <Group justify="flex-end">
        <DeleteHabitModal habit={habit} />
      </Group>
    </Stack>
  );
}

const TodaysProgressCard = ({ habitId }: { habitId: string }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Group mb="md">
        <IconChartPie size="1.5rem" />
        <Text fw={500} size="lg">
          Today&apos;s Progress
        </Text>
      </Group>
      <Paper
        p="xl"
        bg="gray.0"
        h="100%"
        style={{
          minHeight: 250,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DailyUsagePieChart habitId={habitId} />
      </Paper>
    </Card>
  );
};
