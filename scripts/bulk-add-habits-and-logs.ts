import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma";
import { extractDateFields } from "../src/lib/utils";

const USER_ID = "user_2UP81r7ZcekzECq8budFrGCV8AH";

interface HabitEvent {
  id: string;
  created: string;
  updated: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  timezone: string;
  htmlLink: string;
  name: string;
  amount: number;
  unit: string;
}

async function main() {
  // Get the file path from command line arguments
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error(
      "Usage: ts-node scripts/bulk-add-habits-and-logs.ts <file_path>"
    );
    process.exit(1);
  }

  const filePath = args[0];

  // Read and parse the JSON file
  try {
    const fileContent = fs.readFileSync(path.resolve(filePath), "utf-8");
    const habitEvents: HabitEvent[] = JSON.parse(fileContent);

    console.log(`Found ${habitEvents.length} habit events to process`);

    // Group events by habit name
    const habitsByName = new Map<string, HabitEvent[]>();

    for (const event of habitEvents) {
      if (!habitsByName.has(event.name)) {
        habitsByName.set(event.name, []);
      }
      habitsByName.get(event.name)?.push(event);
    }

    console.log(`Found ${habitsByName.size} unique habits`);

    // Process each habit and its logs
    for (const [habitName, events] of habitsByName.entries()) {
      const firstEvent = events[0];

      // Check if habit already exists
      let habit = await prisma.habit.findFirst({
        where: {
          userId: USER_ID,
          name: habitName,
          units: firstEvent.unit || undefined,
        },
      });

      // Create habit if it doesn't exist
      if (!habit) {
        habit = await prisma.habit.create({
          data: {
            userId: USER_ID,
            name: habitName,
            description: undefined,
            units: firstEvent.unit || undefined,
            goodHabit: true, // Default to good habit
            targetPerDay: null, // No target by default
          },
        });
        console.log(`Created new habit: ${habitName} (${habit.id})`);
      } else {
        console.log(`Found existing habit: ${habitName} (${habit.id})`);
      }

      // Add logs for this habit
      let createdCount = 0;
      let skippedCount = 0;

      for (const event of events) {
        const performedAt = new Date(event.start);

        // Check if log already exists at this time
        const existingLog = await prisma.habitLog.findFirst({
          where: {
            habitId: habit.id,
            userId: USER_ID,
            performedAt,
          },
        });

        if (!existingLog) {
          // Extract date fields for the log
          const dateFields = extractDateFields(performedAt);
          // Create the log
          await prisma.habitLog.create({
            data: {
              habitId: habit.id,
              userId: USER_ID,
              amount: event.amount,
              performedAt,
              ...dateFields,
            },
          });
          createdCount++;
        } else {
          skippedCount++;
        }
      }

      console.log(
        `Added ${createdCount} logs for ${habitName}, skipped ${skippedCount} existing logs`
      );
    }

    console.log("Finished processing all habit events");
  } catch (error) {
    console.error("Error processing file:", error);
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
