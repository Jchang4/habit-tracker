import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { CreateApiKeyForm } from "./CreateApiKeyForm";

export function CreateApiKeyModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open} leftSection={<IconPlus size="1rem" />}>
        Create API Key
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title="Create API Key"
        centered
        size="md"
      >
        <CreateApiKeyForm onSuccess={close} />
      </Modal>
    </>
  );
}
