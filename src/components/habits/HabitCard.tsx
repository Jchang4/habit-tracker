"use client";

import { HabitLogsTable } from "@/components/habit_logs/HabitLogsTable";
import { useCreateHabitLog } from "@/lib/api/habit-logs";
import { Habit } from "@/lib/api/habits";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Divider,
  Flex,
  Group,
  NumberInput,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const [showLogs, setShowLogs] = useState(false);
  const [amount, setAmount] = useState<number | string>(habit.targetPerDay);
  const { mutate: createLog, isPending } = useCreateHabitLog();

  const handleQuickLog = () => {
    if (!amount) return;

    createLog({
      habitId: habit.id,
      data: {
        amount: Number(amount),
        performedAt: new Date().toISOString(),
      },
    });
  };

  return (
    <Box style={{ width: "100%" }}>
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Text fw={500}>{habit.name}</Text>
          {habit.targetPerDay && (
            <Text size="sm" c="dimmed">
              Target: {habit.targetPerDay} {habit.units}
            </Text>
          )}
        </Group>

        {habit.description && (
          <Text size="sm" c="dimmed" mb="xs">
            {habit.description}
          </Text>
        )}

        <Divider my="sm" />

        <Group justify="space-between" mb="xs">
          <Text size="sm">Quick Log for {format(new Date(), "MMM d")}</Text>
          <Flex gap="xs" align="center">
            <NumberInput
              size="xs"
              value={amount}
              onChange={setAmount}
              min={0}
              style={{ width: "80px" }}
              placeholder={habit.units}
            />
            <Tooltip label="Log now">
              <ActionIcon
                color="blue"
                variant="filled"
                size="sm"
                onClick={handleQuickLog}
                loading={isPending}
              >
                <IconCheck size="1rem" />
              </ActionIcon>
            </Tooltip>
          </Flex>
        </Group>

        <Divider my="sm" />

        <Group justify="space-between" mt="md">
          <Badge color={habit.goodHabit ? "green" : "red"} variant="light">
            {habit.goodHabit ? "Build habit" : "Reduce habit"}
          </Badge>

          <Button
            variant="light"
            size="xs"
            onClick={() => setShowLogs(!showLogs)}
            rightSection={
              showLogs ? (
                <IconChevronUp size="1rem" />
              ) : (
                <IconChevronDown size="1rem" />
              )
            }
          >
            {showLogs ? "Hide Logs" : "Show Logs"}
          </Button>
        </Group>

        <Collapse in={showLogs}>
          <Divider my="md" />
          <HabitLogsTable habitId={habit.id} />
        </Collapse>
      </Card>
    </Box>
  );
}
