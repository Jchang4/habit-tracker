"use client";

import { Button } from "@mantine/core";

export default function ConnectGoogleCalendarButton() {
  const handleConnect = () => {
    // Redirect to Google authorization endpoint
    window.location.href = "/api/google/authorize";
  };

  return (
    <Button onClick={handleConnect} color="blue">
      Connect Google Calendar
    </Button>
  );
}
