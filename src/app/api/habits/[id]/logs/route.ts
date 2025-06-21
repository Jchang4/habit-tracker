import { prisma } from "@/lib/prisma";
import { extractDateFields } from "@/lib/utils";
import { withApiAuth } from "@/lib/with-api-auth";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: {
    id: string; // habitId
  };
};

// List logs for a habit
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

    const logs = await prisma.habitLog.findMany({
      where: { habitId: params.id },
      orderBy: { performedAt: "desc" },
    });

    return NextResponse.json(logs);
  }
);

// Create a new log for a habit
export const POST = withApiAuth(
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

    const body = await req.json();
    const { amount, performedAt } = body;

    // Parse the performedAt date or use current time
    const logDate = performedAt ? new Date(performedAt) : new Date();

    // Extract date fields using utility function
    const dateFields = extractDateFields(logDate);

    const newLog = await prisma.habitLog.create({
      data: {
        habitId: params.id,
        userId,
        amount,
        performedAt: logDate,
        ...dateFields,
      },
    });

    return NextResponse.json(newLog, { status: 201 });
  }
);
