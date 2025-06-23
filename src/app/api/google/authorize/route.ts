import { google } from "googleapis";
import { NextResponse } from "next/server";

const oauth2 = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);

export async function GET() {
  const url = oauth2.generateAuthUrl({
    access_type: "offline", // → refresh token
    prompt: "consent", // force once to get refresh
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    include_granted_scopes: true,
    state: crypto.randomUUID(), // CSRF
  });
  return NextResponse.redirect(url);
}
