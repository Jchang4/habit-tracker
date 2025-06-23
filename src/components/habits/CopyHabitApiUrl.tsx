"use client";

import { Habit } from "@/lib/api/habits";
import {
  Box,
  Button,
  Code,
  CopyButton,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCheck, IconCopy, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";

interface CopyHabitApiUrlProps {
  habit: Habit;
}

export function CopyHabitApiUrl({ habit }: CopyHabitApiUrlProps) {
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";

  const apiUrl = `${baseUrl}/api/habits/${habit.id}/logs`;

  const samplePayload = JSON.stringify(
    {
      amount: 1,
      performedAt: new Date().toISOString(),
    },
    null,
    2
  );

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Group gap="xs">
          <IconInfoCircle size="1.2rem" />
          <Title order={5}>API Integration</Title>
        </Group>

        <Text size="sm">
          Use this endpoint to log your habit via API. You'll need an API key to
          authenticate.
        </Text>

        <Box>
          <Text fw={500} size="sm" mb="xs">
            Endpoint URL:
          </Text>
          <Group gap="xs">
            <Code style={{ flexGrow: 1, overflow: "auto" }}>{apiUrl}</Code>
            <CopyButton value={apiUrl} timeout={2000}>
              {({ copied, copy }) => (
                <Button
                  color={copied ? "teal" : "blue"}
                  size="xs"
                  onClick={copy}
                  leftSection={
                    copied ? (
                      <IconCheck size="1rem" />
                    ) : (
                      <IconCopy size="1rem" />
                    )
                  }
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </CopyButton>
          </Group>
        </Box>

        <Box>
          <Text fw={500} size="sm" mb="xs">
            Request Method:
          </Text>
          <Code>POST</Code>
        </Box>

        <Box>
          <Text fw={500} size="sm" mb="xs">
            Headers:
          </Text>
          <Code block>
            Content-Type: application/json{"\n"}
            x-amor-api-key: your_api_key_here
          </Code>
        </Box>

        <Box>
          <Text fw={500} size="sm" mb="xs">
            Request Body:
          </Text>
          <Code block>{samplePayload}</Code>
        </Box>

        <Box>
          <Text fw={500} size="sm" mb="xs">
            How to get an API key:
          </Text>
          <Text size="sm">
            1. Go to the{" "}
            <Link
              href="/api-keys"
              style={{ color: "var(--mantine-color-blue-6)" }}
            >
              API Keys
            </Link>{" "}
            page
            <br />
            2. Create a new API key with a name and optional description
            <br />
            3. Copy the generated key immediately (it won't be shown again)
            <br />
            4. Use this key in the x-amor-api-key header for all API requests
          </Text>
        </Box>

        <Text size="xs" c="dimmed">
          Note: Keep your API key secure. You can revoke keys at any time from
          the API Keys page.
        </Text>
      </Stack>
    </Paper>
  );
}
