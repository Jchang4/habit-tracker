import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/with-api-auth";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: {
    id: string;
  };
};

export const GET = withApiAuth(
  async (
    req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId },
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
    const body = await req.json();
    const { name, description, units, goodHabit, targetPerDay } = body;

    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: params.id },
      data: {
        name,
        description,
        units,
        goodHabit,
        targetPerDay,
      },
    });

    return NextResponse.json(updatedHabit);
  }
);

export const DELETE = withApiAuth(
  async (
    req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    await prisma.habit.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  }
);
