import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Flex } from "@mantine/core";
import Link from "next/link";
import { SignInButton, SignUpButton } from "./AuthButtons";
import Logo from "./Logo";
import NavLinks from "./NavLinks";

export default function Navbar() {
  return (
    <header>
      <Flex
        p="md"
        justify="space-between"
        align="center"
        gap="md"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "white",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Logo height={50} />
        </Link>
        <Flex gap="md">
          <NavLinks />
          <UserProfile />
        </Flex>
      </Flex>
    </header>
  );
}

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
