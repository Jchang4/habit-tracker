"use client";

import { HabitLogsTable } from "@/components/habit_logs/HabitLogsTable";
import { CopyHabitApiUrl } from "@/components/habits/CopyHabitApiUrl";
import { DailyUsageSparkline } from "@/components/habits/charts/DailyUsageSparkline";
import { HabitQuickLogInput } from "@/components/habits/forms/HabitQuickLogInput";
import { Habit } from "@/lib/api/habits";
import {
  Box,
  Button,
  Card,
  CardProps,
  Collapse,
  Divider,
  Group,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { GoodHabitBadge } from "./GoodHabitBadge";

interface HabitCardProps {
  habit: Habit;
  cardProps?: CardProps;
}

export function HabitCard({ habit, cardProps }: HabitCardProps) {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder {...cardProps}>
      <Group justify="space-between" mb="xs">
        <Link
          href={`/habits/${habit.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Title order={4}>{habit.name}</Title>
        </Link>
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

      {/* Trend Sparkline */}
      <Box my="md" w="100%">
        <DailyUsageSparkline habitId={habit.id} days={7} />
      </Box>

      <Divider my="sm" />

      <HabitQuickLogInput habit={habit} />

      <Divider my="sm" />

      <Group justify="space-between" mt="md">
        <GoodHabitBadge goodHabit={habit.goodHabit} />

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
        <Divider my="md" />
        <CopyHabitApiUrl habit={habit} />
      </Collapse>
    </Card>
  );
}
