import {
  getClientForUser,
  syncHabitLogWithCalendar,
} from "@/lib/google/calendar.server";
import { prisma } from "@/lib/prisma";
import { extractDateFields } from "@/lib/utils";
import { withApiAuth } from "@/lib/with-api-auth";
import { google } from "googleapis";
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
      include: {
        Habit: true,
      },
    });

    try {
      // Attempt to sync with Google Calendar if the log has calendar data
      if (updatedLog.calendarEventId) {
        const syncedLog = await syncHabitLogWithCalendar(userId, {
          ...updatedLog,
          habit: updatedLog.Habit,
        });
        return NextResponse.json(syncedLog);
      }
    } catch (error) {
      console.error("Failed to sync with Google Calendar:", error);
      // Continue with the response even if sync fails
    }

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

    // If the log has a calendar event, delete it
    if (log.calendarEventId && log.calendarId) {
      try {
        const oauth2Client = await getClientForUser(userId);
        const calendar = google.calendar("v3");
        await calendar.events.delete({
          auth: oauth2Client,
          calendarId: log.calendarId,
          eventId: log.calendarEventId,
        });
      } catch (error) {
        console.error("Failed to delete calendar event:", error);
        // Continue with deletion even if calendar event deletion fails
      }
    }

    await prisma.habitLog.delete({
      where: { id: logId },
    });

    return new NextResponse(null, { status: 204 });
  }
);
