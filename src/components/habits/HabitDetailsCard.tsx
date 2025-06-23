import { Habit } from "@/lib/api/habits";
import { Card, Group, Stack, Text } from "@mantine/core";

interface HabitDetailsCardProps {
  habit: Habit;
}

export function HabitDetailsCard({ habit }: HabitDetailsCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
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
  );
}
