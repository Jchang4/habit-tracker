import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Flex, Title } from "@mantine/core";
import Link from "next/link";
import { SignInButton, SignUpButton } from "./AuthButtons";
import NavLinks from "./NavLinks";

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
    <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
      <Title order={1} size="md">
        Amor Habits
      </Title>
    </Link>
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
