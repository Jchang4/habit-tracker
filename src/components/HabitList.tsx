"use client";

import { useHabits } from "@/lib/api/habits";
import { Card, Group, Stack, Text, Title } from "@mantine/core";

export function HabitList() {
  const { data: habits, isLoading, error } = useHabits();

  if (isLoading) {
    return <div>Loading habits...</div>;
  }

  if (error) {
    return <div>Error loading habits: {(error as Error).message}</div>;
  }

  if (!habits || habits.length === 0) {
    return (
      <Text>No habits found. Create your first habit to get started!</Text>
    );
  }

  return (
    <Stack>
      <Title order={2}>Your Habits</Title>
      {habits.map((habit) => (
        <Card key={habit.id} shadow="sm" padding="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={500}>{habit.name}</Text>
            {habit.targetPerDay && (
              <Text size="sm" c="dimmed">
                Target: {habit.targetPerDay} {habit.units}
              </Text>
            )}
          </Group>
          {habit.description && (
            <Text size="sm" c="dimmed">
              {habit.description}
            </Text>
          )}
          <Text size="xs" c="dimmed" mt="xs">
            {habit.goodHabit ? "Build habit" : "Reduce habit"}
          </Text>
        </Card>
      ))}
    </Stack>
  );
}
