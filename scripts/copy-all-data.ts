import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma";

// Configuration
const BATCH_SIZE = 10000; // Process records in batches of 10,000

async function fetchAllInBatches<T>(
  fetcher: (skip: number, take: number) => Promise<T[]>,
  batchSize: number = BATCH_SIZE
): Promise<T[]> {
  let allResults: T[] = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await fetcher(skip, batchSize);
    allResults = [...allResults, ...batch];
    skip += batchSize;
    hasMore = batch.length === batchSize;

    if (batch.length > 0) {
      process.stdout.write(`\rFetched ${allResults.length} records...`);
    }
  }

  process.stdout.write("\n");
  return allResults;
}

async function main() {
  console.log("Starting database export...");

  // Create timestamped directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir = path.join(__dirname, `db_export_${timestamp}`);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Export Habits
    console.log("Exporting Habits...");
    const habits = await fetchAllInBatches((skip, take) =>
      prisma.habit.findMany({
        skip,
        take,
        orderBy: { id: "asc" },
      })
    );
    fs.writeFileSync(
      path.join(outputDir, "habits.json"),
      JSON.stringify(habits, null, 2)
    );
    console.log(`✓ Exported ${habits.length} habits`);

    // Export HabitLogs
    console.log("Exporting HabitLogs...");
    const habitLogs = await fetchAllInBatches((skip, take) =>
      prisma.habitLog.findMany({
        skip,
        take,
        orderBy: { id: "asc" },
      })
    );
    fs.writeFileSync(
      path.join(outputDir, "habit_logs.json"),
      JSON.stringify(habitLogs, null, 2)
    );
    console.log(`✓ Exported ${habitLogs.length} habit logs`);

    // Export ApiKeys
    console.log("Exporting ApiKeys...");
    const apiKeys = await fetchAllInBatches((skip, take) =>
      prisma.apiKey.findMany({
        skip,
        take,
        orderBy: { id: "asc" },
      })
    );
    fs.writeFileSync(
      path.join(outputDir, "api_keys.json"),
      JSON.stringify(apiKeys, null, 2)
    );
    console.log(`✓ Exported ${apiKeys.length} API keys`);

    // Export GoogleTokens
    console.log("Exporting GoogleTokens...");
    const googleTokens = await fetchAllInBatches((skip, take) =>
      prisma.googleToken.findMany({
        skip,
        take,
        orderBy: { id: "asc" },
      })
    );
    fs.writeFileSync(
      path.join(outputDir, "google_tokens.json"),
      JSON.stringify(googleTokens, null, 2)
    );
    console.log(`✓ Exported ${googleTokens.length} Google tokens`);

    // Create metadata file with export information
    const metadata = {
      exportedAt: new Date().toISOString(),
      totalCounts: {
        habits: habits.length,
        habitLogs: habitLogs.length,
        apiKeys: apiKeys.length,
        googleTokens: googleTokens.length,
      },
    };

    fs.writeFileSync(
      path.join(outputDir, "metadata.json"),
      JSON.stringify(metadata, null, 2)
    );

    console.log(`\n✅ Export complete! Files saved to ${outputDir}`);
  } catch (error) {
    console.error("Export failed:", error);
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
