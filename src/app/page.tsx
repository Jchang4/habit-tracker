import { Button, Center, Stack } from "@mantine/core";
import Link from "next/link";

export default function Home() {
  return (
    <Stack gap="md" p="md" pb="8rem">
      <Center>
        <Button component={Link} href="/habits" variant="light">
          Habits
        </Button>
        <Button component={Link} href="/api-keys" variant="light">
          API Keys
        </Button>
      </Center>
    </Stack>
  );
}
