import { ApiKey, useApiKeys, useRevokeApiKey } from "@/lib/api/api-keys";
import { sortByCreatedAt } from "@/lib/utils";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Code,
  Group,
  Modal,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconAlertCircle, IconTrash } from "@tabler/icons-react";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";

export default function ApiKeyTable() {
  const { data: apiKeys, isLoading, error } = useApiKeys();
  const { mutate: revokeApiKey, isPending: isRevoking } = useRevokeApiKey();
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);

  const handleRevoke = () => {
    if (keyToRevoke) {
      revokeApiKey(keyToRevoke.id, {
        onSuccess: () => {
          setKeyToRevoke(null);
        },
      });
    }
  };

  if (isLoading) {
    return <Skeleton height={200} radius="md" />;
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
        Failed to load API keys: {(error as Error).message}
      </Alert>
    );
  }

  return (
    <>
      <Paper withBorder p={0}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Key</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Last Used</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {apiKeys?.sort(sortByCreatedAt).map((key) => (
              <Table.Tr key={key.id}>
                <Table.Td>
                  <Stack gap={0}>
                    <Text fw={500}>{key.name}</Text>
                    {key.description && (
                      <Text size="xs" c="dimmed">
                        {key.description}
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  {key.keyPrefix && (
                    <Code color="gray">{key.keyPrefix}...</Code>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {format(new Date(key.createdAt), "MMM d, yyyy")}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatDistanceToNow(new Date(key.createdAt), {
                      addSuffix: true,
                    })}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {key.lastUsedAt ? (
                    <>
                      <Text size="sm">
                        {format(new Date(key.lastUsedAt), "MMM d, yyyy")}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDistanceToNow(new Date(key.lastUsedAt), {
                          addSuffix: true,
                        })}
                      </Text>
                    </>
                  ) : (
                    <Text size="sm" c="dimmed">
                      Never
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Badge color={key.revoked ? "red" : "green"} variant="light">
                    {key.revoked ? "Revoked" : "Active"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {!key.revoked && (
                    <Tooltip label="Revoke key">
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => setKeyToRevoke(key)}
                      >
                        <IconTrash size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <RevokeConfirmationModal
        keyToRevoke={keyToRevoke}
        setKeyToRevoke={setKeyToRevoke}
        handleRevoke={handleRevoke}
        isRevoking={isRevoking}
      />
    </>
  );
}

function RevokeConfirmationModal({
  keyToRevoke,
  setKeyToRevoke,
  handleRevoke,
  isRevoking,
}: {
  keyToRevoke: ApiKey | null;
  setKeyToRevoke: (key: ApiKey | null) => void;
  handleRevoke: () => void;
  isRevoking: boolean;
}) {
  return (
    <Modal
      opened={!!keyToRevoke}
      onClose={() => setKeyToRevoke(null)}
      title="Revoke API Key"
      centered
      size="sm"
    >
      <Stack gap="md">
        <Text>
          Are you sure you want to revoke the API key{" "}
          <Text span fw={700}>
            {keyToRevoke?.name}
          </Text>
          ?
        </Text>
        <Text size="sm" c="dimmed">
          This action cannot be undone. Once revoked, the API key will no longer
          work.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setKeyToRevoke(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleRevoke}
            loading={isRevoking}
            leftSection={<IconTrash size="1rem" />}
          >
            Revoke Key
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
