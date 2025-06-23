"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@mantine/core";

export function SignInButton() {
  const { openSignIn } = useClerk();
  return (
    <Button
      onClick={() => openSignIn({ afterSignInUrl: "/habits" })}
      variant="outline"
    >
      Sign In
    </Button>
  );
}

export function SignUpButton() {
  const { openSignUp } = useClerk();
  return (
    <Button
      onClick={() => openSignUp({ afterSignUpUrl: "/habits" })}
      variant="filled"
      color="pink.6"
    >
      Sign Up
    </Button>
  );
}
