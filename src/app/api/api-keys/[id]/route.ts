import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/with-api-auth";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: {
    id: string; // apiKeyId
  };
};

// Update an API key
export const PUT = withApiAuth(
  async (
    req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const key = await prisma.apiKey.findFirst({
      where: { id: params.id, userId },
    });

    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, description } = body;

    const updatedKey = await prisma.apiKey.update({
      where: { id: params.id },
      data: {
        name,
        description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        revoked: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedKey);
  }
);

// Revoke (soft delete) an API key
export const DELETE = withApiAuth(
  async (
    req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const key = await prisma.apiKey.findFirst({
      where: { id: params.id, userId },
    });

    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await prisma.apiKey.update({
      where: { id: params.id },
      data: { revoked: true },
    });

    return new NextResponse(null, { status: 204 });
  }
);
