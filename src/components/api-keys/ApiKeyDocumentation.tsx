"use client";

import {
  Alert,
  Code,
  Divider,
  Group,
  List,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconInfoCircle, IconKey } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function ApiKeyDocumentation() {
  const [baseUrl, setBaseUrl] = useState("https://amor-habits.fly.dev/");

  useEffect(() => {
    // Get the current hostname in the browser
    const host = window.location.host;
    const protocol = window.location.protocol;
    setBaseUrl(`${protocol}//${host}`);
  }, []);

  return (
    <Paper withBorder p="lg" radius="md">
      <Stack gap="md">
        <Group gap="xs">
          <IconKey size={24} />
          <Title order={3}>About API Keys</Title>
        </Group>

        <Text>
          API keys allow you to integrate Amor Habits with external
          applications, services, or devices. Use these keys to authenticate API
          requests when logging habits programmatically.
        </Text>

        <Alert
          icon={<IconInfoCircle size="1rem" />}
          title="Security Notice"
          color="blue"
          variant="light"
        >
          Keep your API keys secure. Anyone with your key can add or modify
          habit logs on your behalf. If a key is compromised, revoke it
          immediately and create a new one.
        </Alert>

        <Divider my="sm" />

        <Title order={4}>How to Use API Keys</Title>

        <List>
          <List.Item>
            <Text fw={500}>Create a key</Text>
            <Text size="sm">
              Click &quot;Create API Key&quot; and give it a descriptive name
              and optional description.
            </Text>
          </List.Item>

          <List.Item>
            <Text fw={500}>Copy the key immediately</Text>
            <Text size="sm">
              For security reasons, the full key is only shown once when
              created. Make sure to copy it.
            </Text>
          </List.Item>

          <List.Item>
            <Text fw={500}>Include in API requests</Text>
            <Text size="sm">Add the key to your request headers:</Text>
            <Code block mt="xs">
              {`// Example API request
fetch('${baseUrl}/api/habits/{habitId}/logs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-amor-api-key': 'your_api_key_here'
  },
  body: JSON.stringify({
    amount: 1,
    performedAt: '2025-06-24T14:15:22.000Z'
  })
})`}
            </Code>
          </List.Item>

          <List.Item>
            <Text fw={500}>Integration examples</Text>
            <Text size="sm">
              Common uses include Apple Shortcuts, wearable devices, or custom
              applications.
            </Text>
          </List.Item>

          <List.Item>
            <Text fw={500}>Revoke when needed</Text>
            <Text size="sm">
              If a key is compromised or no longer needed, click the trash icon
              to revoke it.
            </Text>
          </List.Item>
        </List>
      </Stack>
    </Paper>
  );
}
