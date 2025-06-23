"use client";

import { CreateApiKeyData, useCreateApiKey } from "@/lib/api/api-keys";
import {
  ActionIcon,
  Alert,
  Button,
  Code,
  CopyButton,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconCopy, IconKey } from "@tabler/icons-react";
import { useState } from "react";

interface CreateApiKeyFormProps {
  onSuccess?: () => void;
}

export function CreateApiKeyForm({ onSuccess }: CreateApiKeyFormProps) {
  const { mutate: createApiKey, isPending } = useCreateApiKey();
  const [formData, setFormData] = useState<CreateApiKeyData>({
    name: "",
    description: "",
  });
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createApiKey(formData, {
      onSuccess: (data) => {
        setNewApiKey(data.key);
        setFormData({
          name: "",
          description: "",
        });
      },
    });
  };

  if (newApiKey) {
    return (
      <Paper p="md" withBorder>
        <Alert
          title="API Key Created Successfully"
          color="green"
          icon={<IconKey size="1rem" />}
          mb="md"
        >
          <Text size="sm" mb="xs">
            Please copy your API key now. You won&apos;t be able to see it
            again!
          </Text>

          <Group>
            <Code style={{ flexGrow: 1, padding: "0.5rem" }}>{newApiKey}</Code>
            <CopyButton value={newApiKey} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? "Copied" : "Copy"}
                  withArrow
                  position="right"
                >
                  <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                    {copied ? (
                      <IconCheck size="1rem" />
                    ) : (
                      <IconCopy size="1rem" />
                    )}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Alert>

        <Group justify="flex-end">
          <Button
            onClick={() => {
              setNewApiKey(null);
              if (onSuccess) {
                onSuccess();
              }
            }}
            mt="md"
          >
            Close
          </Button>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} p="md" withBorder>
      <Stack gap="md">
        <Title order={3}>Create New API Key</Title>

        <TextInput
          required
          label="Key Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Development Key"
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Optional description for this API key"
        />

        <Button
          type="submit"
          loading={isPending}
          leftSection={<IconKey size="1rem" />}
        >
          Generate API Key
        </Button>
      </Stack>
    </Paper>
  );
}
