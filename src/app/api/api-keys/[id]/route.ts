import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/with-api-auth";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const PUT = withApiAuth<RouteContext>(
  async (
    req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const { id } = await params;

    const key = await prisma.apiKey.findFirst({
      where: { id, userId },
    });
    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    const { name, description } = await req.json();

    const updatedKey = await prisma.apiKey.update({
      where: { id },
      data: { name, description },
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

export const DELETE = withApiAuth<RouteContext>(
  async (
    _req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const { id } = await params;

    const key = await prisma.apiKey.findFirst({
      where: { id, userId },
    });
    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await prisma.apiKey.update({
      where: { id },
      data: { revoked: true },
    });

    return new NextResponse(null, { status: 204 });
  }
);
