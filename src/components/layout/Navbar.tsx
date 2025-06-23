import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button, Flex, Title } from "@mantine/core";
import Link from "next/link";
import { SignInButton, SignUpButton } from "./AuthButtons";

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

export default function Navbar() {
  return (
    <header>
      <Flex p="md" justify="space-between" align="center" gap="md">
        <Logo />
        <Flex gap="md">
          <NavLinks />
          <UserProfile />
        </Flex>
      </Flex>
    </header>
  );
}

const Logo = () => {
  return (
    <Title order={1} size="md">
      Amor Habits
    </Title>
  );
};

const UserProfile = () => {
  return (
    <>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
};

const NavLinks = () => {
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
};
