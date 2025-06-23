import { prisma } from "@/lib/prisma";
import { extractDateFields } from "@/lib/utils";
import { withApiAuth } from "@/lib/with-api-auth";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  // Habit ID
  params: Promise<{ id: string }>;
};

// List logs for a habit
export const GET = withApiAuth(
  async (
    req: NextRequest,
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

    const logs = await prisma.habitLog.findMany({
      where: { habitId: id },
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
    const { id } = await params;

    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const body = await req.json();
    const { amount: requestAmount, performedAt } = body;

    // Use defaultAmount from habit if no amount is provided
    const amount =
      requestAmount !== undefined ? requestAmount : habit.defaultAmount;

    // Parse the performedAt date or use current time
    const logDate = performedAt ? new Date(performedAt) : new Date();

    // Extract date fields using utility function
    const dateFields = extractDateFields(logDate);

    const newLog = await prisma.habitLog.create({
      data: {
        habitId: id,
        userId,
        amount,
        performedAt: logDate,
        ...dateFields,
      },
    });

    return NextResponse.json(newLog, { status: 201 });
  }
);
