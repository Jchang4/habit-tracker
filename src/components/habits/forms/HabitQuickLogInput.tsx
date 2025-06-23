"use client";

import { useCreateHabitLog } from "@/lib/api/habit-logs";
import { Habit } from "@/lib/api/habits";
import {
  ActionIcon,
  Flex,
  Group,
  NumberInput,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";

interface HabitQuickLogInputProps {
  habit: Habit;
}

export function HabitQuickLogInput({ habit }: HabitQuickLogInputProps) {
  const [amount, setAmount] = useState<number | string>(habit.defaultAmount);
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
    <>
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
    </>
  );
}
