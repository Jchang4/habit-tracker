"use client";

import { Group, Stack, Title } from "@mantine/core";
import ApiKeyTable from "./ApiKeyTable";
import { CreateApiKeyModal } from "./CreateApiKeyModal";

export function ApiKeyList() {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="center" mb="md">
        <Title>API Keys</Title>
        <CreateApiKeyModal />
      </Group>

      <ApiKeyTable />
    </Stack>
  );
}
