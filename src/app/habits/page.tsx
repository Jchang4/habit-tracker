import { CreateHabitModal } from "@/components/habits/CreateHabitModal";
import { HabitList } from "@/components/habits/HabitList";
import { Container, Group, Stack, Title } from "@mantine/core";

export default function HabitsPage() {
  return (
    <Stack gap="md" p="md" pb="8rem">
      <Container size="md" px="md" w="100%" mb="md">
        <Group justify="space-between" align="center">
          <Title>Your Habits</Title>
          <CreateHabitModal />
        </Group>
      </Container>
      <Container size="md" px="md" w="100%">
        <Stack gap="md">
          <HabitList />
        </Stack>
      </Container>
    </Stack>
  );
}
