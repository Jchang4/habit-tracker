import { HabitList } from "@/components/habits/HabitList";
import { CreateHabitModal } from "@/components/habits/modals/CreateHabitModal";
import { Container, Flex, Group, Stack, Title } from "@mantine/core";

export default function HabitsPage() {
  return (
    <Stack gap="md" p="md" pb="8rem">
      <Container size="lg" px="md" w="100%">
        <Group justify="space-between" align="center" mb="md">
          <Title>Your Habits</Title>
          <CreateHabitModal />
        </Group>
        <Flex gap="md" wrap="wrap" justify="space-between">
          <HabitList cardProps={{ w: { base: "100%", md: "45%" } }} />
        </Flex>
      </Container>
    </Stack>
  );
}
