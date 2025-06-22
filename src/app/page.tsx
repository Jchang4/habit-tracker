import { CreateHabitForm } from "@/components/habits/CreateHabitForm";
import { HabitList } from "@/components/habits/HabitList";
import { Center, Container, Divider, Stack, Title } from "@mantine/core";

export default function Home() {
  return (
    <Stack gap="md" p="md" pb="8rem">
      <Center>
        <Title>Your Habits</Title>
      </Center>
      <Container size="md" px="md" w="100%">
        <Stack gap="md">
          <HabitList />
          <Divider my="md" />
          <CreateHabitForm />
        </Stack>
      </Container>
    </Stack>
  );
}
