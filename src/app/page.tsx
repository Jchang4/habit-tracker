import ConnectGoogleCalendarButton from "@/components/google/ConnectGoogleCalendarButton";
import { SignedIn } from "@clerk/nextjs";
import { Box, Center, Stack, Title } from "@mantine/core";

export default function Home() {
  return (
    <Stack gap="md" p="md" pb="8rem">
      <Center>
        <Stack gap="md">
          <Title>Welcome to Habit Tracker</Title>
          <Box>
            <SignedIn>
              <ConnectGoogleCalendarButton />
            </SignedIn>
          </Box>
        </Stack>
      </Center>
    </Stack>
  );
}
