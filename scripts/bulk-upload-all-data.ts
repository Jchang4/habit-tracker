import { ApiKey, GoogleToken, Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma";

// Configuration
const BATCH_SIZE = 1000; // Process records in batches of 1000 for inserts

// Type for JSON parsed data (with potential nested relations)
interface HabitWithLogs {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  units: string | null;
  defaultAmount: number;
  goodHabit: boolean;
  favorite: boolean;
  targetPerDay: number | null;
  aiNotes?: Prisma.JsonValue | null;
  createdAt: string;
  updatedAt: string;
  logs?: any[];
}

interface JsonHabitLog {
  id: string;
  habitId: string;
  userId: string;
  performedAt: string;
  day: string;
  amount: number | null;
  week: number;
  month: number;
  year: number;
  hour: number;
  calendarEventId: string | null;
  calendarId: string | null;
  calendarEventLink: string | null;
  calendarSyncedAt: string | null;
}

// Helper to process data in batches
async function processBatches<T>(
  items: T[],
  processor: (batch: T[]) => Promise<void>
): Promise<void> {
  const batches = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE));
  }

  let processed = 0;
  for (const batch of batches) {
    await processor(batch);
    processed += batch.length;
    process.stdout.write(`\rProcessed ${processed}/${items.length} items...`);
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
  process.stdout.write("\n");
}

async function main() {
  // Check if export directory was provided
  if (process.argv.length < 3) {
    console.error("Please provide the path to the export directory.");
    console.error(
      "Usage: npx tsx scripts/bulk-upload-all-data.ts ./scripts/db_export_TIMESTAMP"
    );
    process.exit(1);
  }

  const exportDir = process.argv[2];

  if (!fs.existsSync(exportDir)) {
    console.error(`Export directory does not exist: ${exportDir}`);
    process.exit(1);
  }

  console.log(`Starting import from ${exportDir}...`);

  try {
    // Import Habits
    const habitsPath = path.join(exportDir, "habits.json");
    if (fs.existsSync(habitsPath)) {
      console.log("Importing Habits...");
      const habits = JSON.parse(
        fs.readFileSync(habitsPath, "utf-8")
      ) as HabitWithLogs[];

      await processBatches(habits, async (batch) => {
        await Promise.all(
          batch.map(async (habit) => {
            // Remove logs relation to avoid conflicts
            const { logs, ...habitData } = habit;

            await prisma.habit.upsert({
              where: { id: habit.id },
              update: {
                name: habitData.name,
                description: habitData.description,
                units: habitData.units,
                defaultAmount: habitData.defaultAmount,
                goodHabit: habitData.goodHabit,
                favorite: habitData.favorite,
                targetPerDay: habitData.targetPerDay,
                aiNotes: habitData.aiNotes as Prisma.InputJsonValue,
                userId: habitData.userId,
              },
              create: {
                id: habitData.id,
                name: habitData.name,
                description: habitData.description,
                units: habitData.units,
                defaultAmount: habitData.defaultAmount,
                goodHabit: habitData.goodHabit,
                favorite: habitData.favorite,
                targetPerDay: habitData.targetPerDay,
                aiNotes: habitData.aiNotes as Prisma.InputJsonValue,
                userId: habitData.userId,
                createdAt: new Date(habitData.createdAt),
                updatedAt: new Date(habitData.updatedAt),
              },
            });
          })
        );
      });
      console.log(`✓ Imported ${habits.length} habits`);
    }

    // Import API Keys
    const apiKeysPath = path.join(exportDir, "api_keys.json");
    if (fs.existsSync(apiKeysPath)) {
      console.log("Importing API Keys...");
      const apiKeys = JSON.parse(
        fs.readFileSync(apiKeysPath, "utf-8")
      ) as ApiKey[];

      await processBatches(apiKeys, async (batch) => {
        await Promise.all(
          batch.map(async (apiKey) => {
            await prisma.apiKey.upsert({
              where: { id: apiKey.id },
              update: apiKey,
              create: apiKey,
            });
          })
        );
      });
      console.log(`✓ Imported ${apiKeys.length} API keys`);
    }

    // Import Google Tokens
    const googleTokensPath = path.join(exportDir, "google_tokens.json");
    if (fs.existsSync(googleTokensPath)) {
      console.log("Importing Google Tokens...");
      const googleTokens = JSON.parse(
        fs.readFileSync(googleTokensPath, "utf-8")
      ) as GoogleToken[];

      await processBatches(googleTokens, async (batch) => {
        await Promise.all(
          batch.map(async (token) => {
            await prisma.googleToken.upsert({
              where: { id: token.id },
              update: {
                ...token,
                expiry: new Date(token.expiry),
              },
              create: {
                ...token,
                expiry: new Date(token.expiry),
              },
            });
          })
        );
      });
      console.log(`✓ Imported ${googleTokens.length} Google tokens`);
    }

    // Import Habit Logs (last to ensure habits exist)
    const habitLogsPath = path.join(exportDir, "habit_logs.json");
    if (fs.existsSync(habitLogsPath)) {
      console.log("Importing Habit Logs...");
      const habitLogs = JSON.parse(
        fs.readFileSync(habitLogsPath, "utf-8")
      ) as JsonHabitLog[];

      await processBatches(habitLogs, async (batch) => {
        await Promise.all(
          batch.map(async (log) => {
            await prisma.habitLog.upsert({
              where: { id: log.id },
              update: {
                ...log,
                performedAt: new Date(log.performedAt),
                day: new Date(log.day),
                calendarSyncedAt: log.calendarSyncedAt
                  ? new Date(log.calendarSyncedAt)
                  : null,
              },
              create: {
                ...log,
                performedAt: new Date(log.performedAt),
                day: new Date(log.day),
                calendarSyncedAt: log.calendarSyncedAt
                  ? new Date(log.calendarSyncedAt)
                  : null,
              },
            });
          })
        );
      });
      console.log(`✓ Imported ${habitLogs.length} habit logs`);
    }

    console.log("\n✅ Import completed successfully!");
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("Error in main execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
