// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
// @ts-ignore
import "@mantine/charts/styles.css";

import Navbar from "@/components/layout/Navbar";
import { ReactQueryProvider } from "@/lib/react-query-client";
import { ClerkProvider } from "@clerk/nextjs";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

export const metadata = {
  title: "Amor Habits",
  description:
    "Amor Habits is an AI-powered habit tracker that helps you build healthy habits and achieve your goals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <ClerkProvider>
            <Navbar />
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </ClerkProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
