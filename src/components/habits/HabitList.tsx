"use client";

import { useHabits } from "@/lib/api/habits";
import { Skeleton, Stack, Text, Title } from "@mantine/core";
import { HabitCard } from "./HabitCard";

export function HabitList() {
  const { data: habits, isLoading, error } = useHabits();

  if (isLoading) {
    return (
      <Stack>
        <Title order={2}>Your Habits</Title>
        <Skeleton height={120} radius="md" mb="sm" />
        <Skeleton height={120} radius="md" mb="sm" />
        <Skeleton height={120} radius="md" />
      </Stack>
    );
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
    <>
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </>
  );
}
