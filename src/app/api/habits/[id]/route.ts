import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/with-api-auth";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = withApiAuth(
  async (
    _req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const { id } = await params;

    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    return NextResponse.json(habit);
  }
);

export const PUT = withApiAuth(
  async (
    req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const { id } = await params;
    const body = await req.json();
    const { name, description, units, defaultAmount, goodHabit, targetPerDay } =
      body;

    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        name,
        description,
        units,
        defaultAmount,
        goodHabit,
        targetPerDay,
      },
    });

    return NextResponse.json(updatedHabit);
  }
);

export const DELETE = withApiAuth(
  async (
    _req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const { id } = await params;

    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    await prisma.habit.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  }
);
