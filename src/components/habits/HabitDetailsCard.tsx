import { Habit, useUpdateHabit } from "@/lib/api/habits";
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";

interface HabitDetailsCardProps {
  habit: Habit;
}

export function HabitDetailsCard({ habit }: HabitDetailsCardProps) {
  const { mutate: updateHabit } = useUpdateHabit();

  const toggleFavorite = () => {
    updateHabit({
      id: habit.id,
      data: { favorite: !habit.favorite },
    });
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Group>
          <Text fw={500} size="lg">
            Habit Details
          </Text>
          {habit.favorite && (
            <Badge color="yellow" variant="filled">
              Favorite
            </Badge>
          )}
        </Group>
        <Tooltip
          label={habit.favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <ActionIcon
            color={habit.favorite ? "yellow" : "gray"}
            onClick={toggleFavorite}
            variant={habit.favorite ? "filled" : "subtle"}
          >
            {habit.favorite ? (
              <IconStarFilled size="1.2rem" />
            ) : (
              <IconStar size="1.2rem" />
            )}
          </ActionIcon>
        </Tooltip>
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
