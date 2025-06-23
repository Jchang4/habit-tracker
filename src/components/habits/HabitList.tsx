"use client";

import { useHabits } from "@/lib/api/habits";
import { Skeleton, Stack, Text } from "@mantine/core";
import { HabitCard } from "./HabitCard";

export function HabitList() {
  const { data: habits, isLoading, error } = useHabits();

  if (isLoading) {
    return (
      <Stack>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} height={240} radius="md" mb="sm" />
        ))}
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
