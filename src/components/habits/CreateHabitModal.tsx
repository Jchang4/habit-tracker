"use client";

import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CreateHabitForm } from "./forms/CreateHabitForm";

export function CreateHabitModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>Create New Habit</Button>
      <Modal opened={opened} onClose={close} title="Create New Habit" size="lg">
        <CreateHabitForm onSuccess={close} />
      </Modal>
    </>
  );
}
