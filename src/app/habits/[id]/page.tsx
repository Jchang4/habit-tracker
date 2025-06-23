"use client";

import { HabitLogsTable } from "@/components/habit_logs/HabitLogsTable";
import { CopyHabitApiUrl } from "@/components/habits/CopyHabitApiUrl";
import { GoodHabitBadge } from "@/components/habits/GoodHabitBadge";
import { HabitQuickLogInput } from "@/components/habits/HabitQuickLogInput";
import { useHabit } from "@/lib/api/habits";
import {
  Alert,
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
    <Container size="lg" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>{habit.name}</Title>
            {habit.description && (
              <Text size="lg" c="dimmed" mt="xs">
                {habit.description}
              </Text>
            )}
          </div>
          <GoodHabitBadge goodHabit={habit.goodHabit} />
        </Group>

        {/* Main Content Grid */}
        <Grid>
          {/* Left Column - Habit Details & Quick Log */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              {/* Habit Details Card */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Text fw={500} size="lg">
                    Habit Details
                  </Text>
                </Group>

                <Stack gap="sm">
                  <Group>
                    <Text fw={500}>Units:</Text>
                    <Text>{habit.units}</Text>
                  </Group>

                  <Group>
                    <Text fw={500}>Default Amount:</Text>
                    <Text>{habit.defaultAmount}</Text>
                  </Group>

                  {habit.targetPerDay && (
                    <Group>
                      <Text fw={500}>Daily Target:</Text>
                      <Text>
                        {habit.targetPerDay} {habit.units}
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Card>

              {/* Quick Log Input */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={500} size="lg" mb="md">
                  Quick Log
                </Text>
                <HabitQuickLogInput habit={habit} />
              </Card>

              {/* Usage Per Day Chart Placeholder */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <IconChartBar size="1.5rem" />
                  <Text fw={500} size="lg">
                    Usage Per Day
                  </Text>
                </Group>
                <Paper
                  p="xl"
                  bg="gray.0"
                  style={{
                    minHeight: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed #dee2e6",
                  }}
                >
                  <Text c="dimmed" ta="center">
                    Bar chart showing daily usage will be displayed here
                  </Text>
                </Paper>
              </Card>
            </Stack>
          </Grid.Col>

          {/* Right Column - Charts */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Remaining Usage Today Chart Placeholder */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <IconChartPie size="1.5rem" />
                  <Text fw={500} size="lg">
                    Today's Progress
                  </Text>
                </Group>
                <Paper
                  p="xl"
                  bg="gray.0"
                  style={{
                    minHeight: 250,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed #dee2e6",
                  }}
                >
                  <Text c="dimmed" ta="center">
                    Pie chart showing remaining usage today will be displayed
                    here
                  </Text>
                </Paper>
              </Card>

              {/* API Access */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={500} size="lg" mb="md">
                  API Access
                </Text>
                <CopyHabitApiUrl habit={habit} />
              </Card>
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
      </Stack>
    </Container>
  );
}
