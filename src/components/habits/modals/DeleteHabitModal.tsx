import { Habit, useDeleteHabit } from "@/lib/api/habits";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface DeleteHabitModalProps {
  habit: Habit;
}

export function DeleteHabitModal({ habit }: DeleteHabitModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  const { mutate: deleteHabit, isPending } = useDeleteHabit();

  const handleDelete = () => {
    deleteHabit(habit.id, {
      onSuccess: () => {
        close();
        // Navigate back to habits list after deletion
        router.push("/habits");
      },
    });
  };

  return (
    <>
      <Button
        onClick={open}
        leftSection={<IconTrash size="1rem" />}
        color="red"
        variant="outline"
      >
        Delete Habit
      </Button>
      <Modal opened={opened} onClose={close} title="Delete Habit" size="md">
        <Stack gap="md">
          <Text>
            Are you sure you want to delete <strong>{habit.name}</strong>?
          </Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone. All logs associated with this habit
            will also be deleted.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={isPending}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
