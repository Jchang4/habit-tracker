"use client";

import { Habit } from "@/lib/api/habits";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit } from "@tabler/icons-react";
import { HabitForm } from "../forms/HabitForm";

interface EditHabitModalProps {
  habit: Habit;
}

export function EditHabitModal({ habit }: EditHabitModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button
        variant="light"
        leftSection={<IconEdit size="1rem" />}
        onClick={open}
      >
        Edit Habit
      </Button>
      <Modal opened={opened} onClose={close} title="Edit Habit" size="lg">
        <HabitForm mode="edit" initialData={habit} onSuccess={close} />
      </Modal>
    </>
  );
}
