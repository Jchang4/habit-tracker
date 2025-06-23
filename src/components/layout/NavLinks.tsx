"use client";

import { useUser } from "@clerk/nextjs";
import { Button, Flex } from "@mantine/core";
import Link from "next/link";

const ROUTES = [
  {
    label: "Habits",
    href: "/habits",
  },
  {
    label: "API Keys",
    href: "/api-keys",
  },
];

export default function NavLinks() {
  const { isSignedIn } = useUser();
  if (!isSignedIn) return null;
  return (
    <Flex gap="md">
      {ROUTES.map((route) => (
        <Button
          key={route.href}
          component={Link}
          href={route.href}
          variant="subtle"
          size="sm"
        >
          {route.label}
        </Button>
      ))}
    </Flex>
  );
}
