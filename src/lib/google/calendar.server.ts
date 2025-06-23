import "server-only";

import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { Habit, HabitLog } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import { calendar_v3, google } from "googleapis";

/**
 * Creates an authenticated Google OAuth2 client for a specific user
 * Handles token refreshing and updates the database with new tokens
 */
export async function getClientForUser(userId: string): Promise<OAuth2Client> {
  // Fetch the user's Google tokens from the database
  const googleToken = await prisma.googleToken.findUnique({
    where: { userId },
  });

  if (!googleToken) {
    throw new Error("User has not connected their Google account");
  }

  // Create OAuth2 client with our app credentials
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  // Decrypt the stored tokens
  const accessToken = decrypt(googleToken.accessToken);
  const refreshToken = decrypt(googleToken.refreshToken);

  // Set the credentials on the client
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: googleToken.expiry.getTime(),
  });

  // Set up a tokens event listener to handle token refreshes
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      // Update the tokens in the database when they refresh
      await prisma.googleToken.update({
        where: { userId },
        data: {
          accessToken: tokens.access_token,
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
          ...(tokens.expiry_date && { expiry: new Date(tokens.expiry_date) }),
          updatedAt: new Date(),
        },
      });
    }
  });

  return oauth2Client;
}

export async function getCalendars(
  oauth2Client: OAuth2Client
): Promise<calendar_v3.Schema$CalendarListEntry[]> {
  const calendar = google.calendar("v3");
  const res = await calendar.calendarList.list({
    auth: oauth2Client,
  });
  return res.data.items ?? [];
}

export async function createHabitsCalendar(
  oauth2Client: OAuth2Client
): Promise<calendar_v3.Schema$CalendarListEntry> {
  const calendar = google.calendar("v3");
  // Check if a calendar named "BB Habits" exists.
  // If not, create the calendar
  const calendars = await getCalendars(oauth2Client);
  let habitsCalendar = calendars.find(
    (calendar) => calendar.summary === "BB Habits"
  );
  if (!habitsCalendar) {
    const res = await calendar.calendars.insert({
      auth: oauth2Client,
      requestBody: { summary: "BB Habits" },
    });
    habitsCalendar = res.data;
  }
  return habitsCalendar;
}

export async function createHabitLogEvent(
  oauth2Client: OAuth2Client,
  name: string,
  amount: number,
  units: string,
  performedAt: Date
): Promise<{
  calendarEventId: string;
  calendarId: string;
  calendarEventLink: string;
  calendarSyncedAt: Date;
}> {
  const calendar = google.calendar("v3");
  const habitsCalendar = await createHabitsCalendar(oauth2Client);
  const res = await calendar.events.insert({
    auth: oauth2Client,
    calendarId: habitsCalendar.id ?? "primary",
    requestBody: {
      summary: name,
      description: `${amount} ${units}`,
      start: {
        dateTime: performedAt.toISOString(),
      },
      end: {
        dateTime: new Date(performedAt.getTime() + 15 * 60000).toISOString(), // Add 15 minutes
      },
    },
  });

  const event = res.data;
  const now = new Date();

  return {
    calendarEventId: event.id ?? "",
    calendarId: habitsCalendar.id ?? "primary",
    calendarEventLink: event.htmlLink ?? "",
    calendarSyncedAt: now,
  };
}

export async function checkGoogleConnection(userId: string): Promise<boolean> {
  try {
    const googleToken = await prisma.googleToken.findUnique({
      where: { userId },
    });
    return !!googleToken;
  } catch (error) {
    return false;
  }
}

/**
 * Syncs a habit log with Google Calendar
 * If the log already has a calendar event, it will be updated
 * Otherwise, a new calendar event will be created
 */
export async function syncHabitLogWithCalendar(
  userId: string,
  habitLog: HabitLog & { habit: Habit }
): Promise<HabitLog> {
  try {
    // Check if user has Google connected
    const isConnected = await checkGoogleConnection(userId);
    if (!isConnected) {
      return habitLog;
    }

    const oauth2Client = await getClientForUser(userId);

    // If the log already has a calendar event, update it
    if (habitLog.calendarEventId && habitLog.calendarId) {
      const calendar = google.calendar("v3");
      await calendar.events.update({
        auth: oauth2Client,
        calendarId: habitLog.calendarId,
        eventId: habitLog.calendarEventId,
        requestBody: {
          summary: habitLog.habit.name,
          description: `${habitLog.amount ?? habitLog.habit.defaultAmount} ${
            habitLog.habit.units ?? "units"
          }`,
          start: {
            dateTime: habitLog.performedAt.toISOString(),
          },
          end: {
            dateTime: new Date(
              habitLog.performedAt.getTime() + 15 * 60000
            ).toISOString(),
          },
        },
      });

      // Update the sync timestamp
      return prisma.habitLog.update({
        where: { id: habitLog.id },
        data: {
          calendarSyncedAt: new Date(),
        },
        include: {
          Habit: true,
        },
      });
    }

    // Otherwise, create a new calendar event
    const eventDetails = await createHabitLogEvent(
      oauth2Client,
      habitLog.habit.name,
      habitLog.amount ?? habitLog.habit.defaultAmount,
      habitLog.habit.units ?? "units",
      habitLog.performedAt
    );

    // Update the habit log with the calendar event details
    const updatedLog = await prisma.habitLog.update({
      where: { id: habitLog.id },
      data: {
        calendarEventId: eventDetails.calendarEventId,
        calendarId: eventDetails.calendarId,
        calendarEventLink: eventDetails.calendarEventLink,
        calendarSyncedAt: eventDetails.calendarSyncedAt,
      },
      include: {
        Habit: true,
      },
    });

    return updatedLog;
  } catch (error) {
    console.error("Failed to sync habit log with calendar:", error);
    return habitLog;
  }
}
