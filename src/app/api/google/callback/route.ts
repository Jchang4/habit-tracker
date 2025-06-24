import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 }
    );
  }

  // TODO: verify `state` against stored CSRF token for this session

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  let tokenResponse;
  try {
    tokenResponse = await oauth2.getToken(code);
  } catch (e) {
    console.error("Token exchange failed", e);
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 500 }
    );
  }

  const tokens = tokenResponse.tokens;
  oauth2.setCredentials(tokens);

  if (!tokens.refresh_token) {
    console.warn("No refresh token; prompt user to reconnect next time");
  }

  const encryptedAccess = encrypt(tokens.access_token!);
  const encryptedRefresh = tokens.refresh_token
    ? encrypt(tokens.refresh_token)
    : null;

  await prisma.googleToken.upsert({
    where: { userId },
    update: {
      accessToken: encryptedAccess,
      expiry: new Date(Date.now() + (tokens.expiry_date! - Date.now())),
      scope: tokens.scope,
      ...(encryptedRefresh && { refreshToken: encryptedRefresh }),
    },
    create: {
      userId,
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh ?? "",
      expiry: new Date(tokens.expiry_date!),
      scope: tokens.scope!,
    },
  });

  // Get the protocol and host from headers for proper redirect
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host =
    req.headers.get("host") ||
    req.headers.get("x-forwarded-host") ||
    new URL(req.url).host;

  // Create the redirect URL with the correct domain
  const redirectUrl = `${protocol}://${host}/habits`;

  return NextResponse.redirect(redirectUrl);
}
