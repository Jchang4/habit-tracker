import { Badge } from "@mantine/core";

interface GoodHabitBadgeProps {
  goodHabit: boolean;
}

export function GoodHabitBadge({ goodHabit }: GoodHabitBadgeProps) {
  return (
    <Badge color={goodHabit ? "green" : "red"} variant="light">
      {goodHabit ? "Build habit" : "Reduce habit"}
    </Badge>
  );
}
