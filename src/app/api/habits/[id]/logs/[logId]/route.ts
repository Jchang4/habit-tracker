import { prisma } from "@/lib/prisma";
import { extractDateFields } from "@/lib/utils";
import { withApiAuth } from "@/lib/with-api-auth";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  // Habit ID
  params: Promise<{ id: string; logId: string }>;
};

// Update a log
export const PUT = withApiAuth(
  async (
    req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const { id, logId } = await params;

    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const log = await prisma.habitLog.findFirst({
      where: { id: logId, habitId: id },
    });

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    const body = await req.json();
    const { amount, performedAt } = body;

    // Parse the performedAt date or use current time if not provided
    const logDate = performedAt ? new Date(performedAt) : new Date();
    const { day, week, month, year } = extractDateFields(logDate);

    const updatedLog = await prisma.habitLog.update({
      where: { id: logId },
      data: {
        amount,
        performedAt: logDate,
        day,
        week,
        month,
        year,
      },
    });

    return NextResponse.json(updatedLog);
  }
);

// Delete a log
export const DELETE = withApiAuth(
  async (
    req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const { id, logId } = await params;

    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const log = await prisma.habitLog.findFirst({
      where: { id: logId, habitId: id },
    });

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    await prisma.habitLog.delete({
      where: { id: logId },
    });

    return new NextResponse(null, { status: 204 });
  }
);
