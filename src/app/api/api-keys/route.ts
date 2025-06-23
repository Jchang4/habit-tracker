import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/with-api-auth";
import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// List API keys (excluding hash)
export const GET = withApiAuth(
  async (_req: NextRequest, { userId }: { userId: string }) => {
    const keys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        keyPrefix: true,
        revoked: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
    return NextResponse.json(keys);
  }
);

// Create a new API key
export const POST = withApiAuth(
  async (req: NextRequest, { userId }: { userId: string }) => {
    const body = await req.json();
    const { name, description } = body;

    const newKey = `amor_${randomBytes(16).toString("hex")}`;
    const keyHash = createHash("sha256").update(newKey).digest("hex");
    const keyPrefix = newKey.substring(0, 10); // "amor_" + first 5 hex chars

    await prisma.apiKey.create({
      data: {
        userId,
        keyHash,
        keyPrefix,
        name,
        description,
      },
    });

    // Return the raw key, it will not be stored
    return NextResponse.json({ key: newKey }, { status: 201 });
  }
);
