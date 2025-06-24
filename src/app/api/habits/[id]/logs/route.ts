import { syncHabitLogWithCalendar } from "@/lib/google/calendar.server";
import { prisma } from "@/lib/prisma";
import { extractDateFields } from "@/lib/utils";
import { withApiAuth } from "@/lib/with-api-auth";
import { Prisma } from "@prisma/client";
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
    const searchParams = req.nextUrl.searchParams;

    // Parse pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Parse date range parameters
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Build where conditions for date filtering
    const whereConditions: Prisma.HabitLogWhereInput = { habitId: id };

    if (startDate || endDate) {
      whereConditions.performedAt = {};

      if (startDate) {
        whereConditions.performedAt = {
          ...whereConditions.performedAt,
          gte: new Date(startDate),
        };
      }

      if (endDate) {
        whereConditions.performedAt = {
          ...whereConditions.performedAt,
          lte: new Date(endDate),
        };
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.habitLog.count({
      where: whereConditions,
    });

    // Get paginated logs
    const logs = await prisma.habitLog.findMany({
      where: whereConditions,
      orderBy: { performedAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
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
      include: {
        Habit: true,
      },
    });

    try {
      // Attempt to sync with Google Calendar, but don't block response
      const updatedLog = await syncHabitLogWithCalendar(userId, {
        ...newLog,
        habit: newLog.Habit,
      });

      return NextResponse.json(updatedLog, { status: 201 });
    } catch (error) {
      console.error("Failed to sync with Google Calendar:", error);
      // Return the original log if sync fails
      return NextResponse.json(newLog, { status: 201 });
    }
  }
);
