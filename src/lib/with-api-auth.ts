import { auth } from "@clerk/nextjs/server";
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

type AuthenticatedApiHandler<T> = (
  request: NextRequest,
  auth: { userId: string },
  context: T
) => Promise<NextResponse>;

async function getUserIdFromApiKey(
  request: NextRequest
): Promise<string | undefined> {
  const apiKeyHeader = request.headers.get("x-amor-api-key");
  if (!apiKeyHeader) {
    return;
  }

  const keyHash = createHash("sha256").update(apiKeyHeader).digest("hex");

  const keyInDb = await prisma.apiKey.findUnique({
    where: { keyHash, revoked: false },
  });

  if (!keyInDb) {
    return;
  }

  // Update lastUsedAt without blocking
  prisma.apiKey
    .update({
      where: { id: keyInDb.id },
      data: { lastUsedAt: new Date() },
    })
    .catch((e: unknown) =>
      console.error("Failed to update lastUsedAt for key", e)
    );

  return keyInDb.userId;
}

export function withApiAuth<T>(handler: AuthenticatedApiHandler<T>) {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    const apiKeyUserId = await getUserIdFromApiKey(request);
    if (apiKeyUserId) {
      return handler(request, { userId: apiKeyUserId }, context);
    }

    const { userId } = await auth();
    if (userId) {
      return handler(request, { userId }, context);
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  };
}
