import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/with-api-auth";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type TimeBreakdown = "day" | "week" | "month" | "year";

// Type for raw database query results
interface StatsQueryResult {
  timeKey: string;
  total: string | number | null;
  count: string | number | null;
  average: string | number | null;
}

export const GET = withApiAuth(
  async (
    req: NextRequest,
    { userId }: { userId: string },
    { params }: RouteContext
  ) => {
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;

    // Get time breakdown parameter - defaults to "day"
    const breakdown = (searchParams.get("breakdown") || "day") as TimeBreakdown;

    // Get date range parameters
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Default to last 30 days if no date range provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    const startDate = startDateParam
      ? new Date(startDateParam)
      : defaultStartDate;

    // Validate habit ownership
    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Get aggregated stats directly from the database based on the breakdown type
    let stats: StatsQueryResult[];

    switch (breakdown) {
      case "day":
        // Group by day
        stats = await prisma.$queryRaw`
          SELECT 
            TO_CHAR("day", 'YYYY-MM-DD') as "timeKey",
            SUM("amount") as "total",
            COUNT(*) as "count",
            AVG("amount") as "average"
          FROM "HabitLog"
          WHERE 
            "habitId" = ${id}
            AND "performedAt" >= ${startDate}
            AND "performedAt" <= ${endDate}
          GROUP BY "day"
          ORDER BY "day" ASC
        `;
        break;

      case "week":
        // Group by year and week
        stats = await prisma.$queryRaw`
          SELECT 
            CONCAT(CAST("year" AS TEXT), '-W', LPAD(CAST("week" AS TEXT), 2, '0')) as "timeKey",
            SUM("amount") as "total",
            COUNT(*) as "count",
            AVG("amount") as "average"
          FROM "HabitLog"
          WHERE 
            "habitId" = ${id}
            AND "performedAt" >= ${startDate}
            AND "performedAt" <= ${endDate}
          GROUP BY "year", "week"
          ORDER BY "year" ASC, "week" ASC
        `;
        break;

      case "month":
        // Group by year and month
        stats = await prisma.$queryRaw`
          SELECT 
            CONCAT(CAST("year" AS TEXT), '-', LPAD(CAST("month" AS TEXT), 2, '0')) as "timeKey",
            SUM("amount") as "total",
            COUNT(*) as "count",
            AVG("amount") as "average"
          FROM "HabitLog"
          WHERE 
            "habitId" = ${id}
            AND "performedAt" >= ${startDate}
            AND "performedAt" <= ${endDate}
          GROUP BY "year", "month"
          ORDER BY "year" ASC, "month" ASC
        `;
        break;

      case "year":
        // Group by year
        stats = await prisma.$queryRaw`
          SELECT 
            CAST("year" AS TEXT) as "timeKey",
            SUM("amount") as "total",
            COUNT(*) as "count",
            AVG("amount") as "average"
          FROM "HabitLog"
          WHERE 
            "habitId" = ${id}
            AND "performedAt" >= ${startDate}
            AND "performedAt" <= ${endDate}
          GROUP BY "year"
          ORDER BY "year" ASC
        `;
        break;

      default:
        // Default to day if breakdown is not recognized
        stats = await prisma.$queryRaw`
          SELECT 
            TO_CHAR("day", 'YYYY-MM-DD') as "timeKey",
            SUM("amount") as "total",
            COUNT(*) as "count",
            AVG("amount") as "average"
          FROM "HabitLog"
          WHERE 
            "habitId" = ${id}
            AND "performedAt" >= ${startDate}
            AND "performedAt" <= ${endDate}
          GROUP BY "day"
          ORDER BY "day" ASC
        `;
    }

    // Format the numbers in the response
    const formattedStats = stats.map((stat) => ({
      timeKey: stat.timeKey,
      total: Number(stat.total) || 0,
      count: Number(stat.count) || 0,
      average: Number(stat.average) || 0,
    }));

    return NextResponse.json({
      habitId: id,
      breakdown,
      timeRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      stats: formattedStats,
    });
  }
);
