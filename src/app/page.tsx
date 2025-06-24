"use client";

import {
  Button,
  Container,
  Flex,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconCalendar,
  IconChartBar,
  IconCheck,
  IconDeviceWatch,
  IconExternalLink,
} from "@tabler/icons-react";
import Link from "next/link";

export default function Home() {
  return (
    <Container size="lg">
      <Stack gap="xl" py="xl">
        {/* Hero Section */}
        <Flex
          direction={{ base: "column", md: "row" }}
          gap="xl"
          align="center"
          justify="space-between"
          py="xl"
        >
          <Stack gap="md" maw={600}>
            <Title size="h1" fw={800}>
              Track Your Habits, Transform Your Life
            </Title>
            <Text size="lg" c="dimmed">
              Amor Habits helps you build better habits through simple tracking,
              insightful analytics, and seamless integrations.
            </Text>
            <Group mt="md">
              <Button
                component={Link}
                href="/habits"
                size="lg"
                variant="filled"
              >
                Get Started
              </Button>
              <Button
                component={Link}
                href="/api-keys"
                size="lg"
                variant="light"
                leftSection={<IconExternalLink size={20} />}
              >
                API Integration
              </Button>
            </Group>
          </Stack>
          <Image
            src="/habits-dashboard.png"
            alt="Habit Dashboard"
            radius="md"
            style={{
              maxWidth: "500px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
            fallbackSrc="https://placehold.co/500x300?text=Habit+Dashboard"
          />
        </Flex>

        {/* Features Section */}
        <Stack gap="xl" py="xl">
          <Title ta="center" order={2}>
            Everything you need to build better habits
          </Title>

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <ThemeIcon size={50} radius="md" variant="light">
                  <IconCheck size={30} />
                </ThemeIcon>
                <Title order={3}>Track Your Habits</Title>
                <Text c="dimmed">
                  Easily log your daily habits with just one click. Set targets,
                  track progress, and maintain streaks to stay motivated.
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <ThemeIcon size={50} radius="md" variant="light">
                  <IconChartBar size={30} />
                </ThemeIcon>
                <Title order={3}>Visualize Your Progress</Title>
                <Text c="dimmed">
                  See your habit data come to life with beautiful charts and
                  analytics. Identify patterns and track improvements over time.
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <ThemeIcon size={50} radius="md" variant="light">
                  <IconCalendar size={30} />
                </ThemeIcon>
                <Title order={3}>Google Calendar Integration</Title>
                <Text c="dimmed">
                  Sync your habit events with Google Calendar to keep everything
                  organized in one place and never miss a habit again.
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <ThemeIcon size={50} radius="md" variant="light">
                  <IconDeviceWatch size={30} />
                </ThemeIcon>
                <Title order={3}>API for External Devices</Title>
                <Text c="dimmed">
                  Use our API to log habits from any external source - Apple
                  Shortcuts, wearables, or custom applications you build.
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>

        {/* Call to Action */}
        <Flex
          direction="column"
          align="center"
          gap="lg"
          py="xl"
          my="xl"
          style={{
            background: "linear-gradient(to right, #f0f4ff, #e6f0ff)",
            borderRadius: "16px",
            padding: "3rem",
          }}
        >
          <Title ta="center" order={2}>
            Ready to transform your habits?
          </Title>
          <Text size="lg" ta="center" maw={600}>
            Start tracking your habits today and see the difference consistent
            tracking can make in your life.
          </Text>
          <Button component={Link} href="/habits" size="lg" mt="md">
            Get Started Now
          </Button>
        </Flex>
      </Stack>
    </Container>
  );
}
