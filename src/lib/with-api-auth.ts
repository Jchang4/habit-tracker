import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

export function withApiAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const apiKeyHeader = request.headers.get("x-api-key");
    if (!apiKeyHeader) {
      return NextResponse.json(
        { error: "API key is missing" },
        { status: 401 }
      );
    }

    const keyHash = createHash("sha256").update(apiKeyHeader).digest("hex");

    const keyInDb = await prisma.apiKey.findUnique({
      where: { keyHash, revoked: false },
    });

    if (!keyInDb) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
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

    // Call the original handler
    return handler(request);
  };
}
