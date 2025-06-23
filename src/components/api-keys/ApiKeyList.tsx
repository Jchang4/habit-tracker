"use client";

import { ApiKey, useApiKeys, useRevokeApiKey } from "@/lib/api/api-keys";
import { Alert, Group, Skeleton, Stack, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import ApiKeyTable from "./ApiKeyTable";
import { CreateApiKeyModal } from "./CreateApiKeyModal";

export function ApiKeyList() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);

  const { data: apiKeys, isLoading, error } = useApiKeys();
  const { mutate: revokeApiKey, isPending: isRevoking } = useRevokeApiKey();

  const handleRevoke = () => {
    if (keyToRevoke) {
      revokeApiKey(keyToRevoke.id, {
        onSuccess: () => {
          setKeyToRevoke(null);
        },
      });
    }
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2}>API Keys</Title>
          <Skeleton height={36} width={120} radius="sm" />
        </Group>
        <Skeleton height={200} radius="md" />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
        Failed to load API keys: {(error as Error).message}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>API Keys</Title>
        <CreateApiKeyModal />
      </Group>

      <ApiKeyTable />
    </Stack>
  );
}
