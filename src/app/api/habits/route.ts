import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/with-api-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = withApiAuth(
  async (_req: NextRequest, { userId }: { userId: string }) => {
    const habits = await prisma.habit.findMany({
      where: { userId },
    });
    return NextResponse.json(habits);
  }
);

export const POST = withApiAuth(
  async (req: NextRequest, { userId }: { userId: string }) => {
    const body = await req.json();
    const { name, description, units, goodHabit, targetPerDay } = body;

    const newHabit = await prisma.habit.create({
      data: {
        userId,
        name,
        description,
        units,
        goodHabit,
        targetPerDay,
      },
    });

    return NextResponse.json(newHabit, { status: 201 });
  }
);
