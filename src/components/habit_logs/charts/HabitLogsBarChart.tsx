"use client";

import { HabitLogBreakdown, useHabitLogStats } from "@/lib/api/habit-logs";
import { useHabit } from "@/lib/api/habits";
import { BarChart } from "@mantine/charts";
import { Skeleton } from "@mantine/core";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  endOfWeek,
  format,
  getMonth,
  getWeek,
  getYear,
  parseISO,
  startOfWeek,
} from "date-fns";
import { useMemo } from "react";

interface HabitLogsBarChartProps {
  habitId: string;
  breakdown: HabitLogBreakdown;
  startDate?: string;
  endDate?: string;
  height?: number;
  formatTimeKey?: (timeKey: string) => string;
  valueFormatter?: (value: number) => string;
  barColor?: string;
  reverse?: boolean;
}

/**
 * A flexible bar chart component for displaying habit logs with various time breakdowns.
 * Can be used for daily, hourly, or other time-based visualizations.
 */
export default function HabitLogsBarChart({
  habitId,
  breakdown,
  startDate,
  endDate,
  height = 300,
  formatTimeKey,
  valueFormatter,
  barColor,
  reverse = false,
}: HabitLogsBarChartProps) {
  const { data: statsData, isLoading: isStatsLoading } = useHabitLogStats(
    habitId,
    {
      breakdown,
      startDate,
      endDate,
    }
  );

  const { data: habitData, isLoading: isHabitLoading } = useHabit(habitId);

  // Get timezone offset in hours for hour adjustments
  const timezoneOffset = useMemo(() => {
    return (new Date().getTimezoneOffset() / 60) * -1; // Convert to hours and invert (API returns UTC)
  }, []);

  const isLoading = isStatsLoading || isHabitLoading;

  if (isLoading) {
    return <Skeleton height={height} />;
  }

  if (!statsData || !habitData || statsData.stats.length === 0) {
    return null;
  }

  // Default formatters if not provided
  const defaultFormatTimeKey = (timeKey: string): string => {
    if (breakdown === HabitLogBreakdown.Hour) {
      // For hourly breakdown, format as "1 PM", "2 PM", etc.
      const hour = parseInt(timeKey, 10);
      return format(new Date().setHours(hour, 0, 0, 0), "h a");
    } else if (breakdown === HabitLogBreakdown.Day) {
      // For daily breakdown, check if it's today or yesterday
      const today = format(new Date(), "yyyy-MM-dd");
      const yesterday = format(
        new Date(new Date().setDate(new Date().getDate() - 1)),
        "yyyy-MM-dd"
      );

      if (timeKey === today) return "Today";
      if (timeKey === yesterday) return "Yesterday";

      // Otherwise format as "Mon, Jan 1"
      return format(parseISO(timeKey), "EEE, MMM d");
    } else if (breakdown === HabitLogBreakdown.Week) {
      // For weekly breakdown, format as "Week 1, 2023"
      const [year, week] = timeKey.split("-W");
      return `Week ${week}`;
    } else if (breakdown === HabitLogBreakdown.Month) {
      // For monthly breakdown, format as "Jan 2023"
      const [year, month] = timeKey.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return format(date, "MMM yyyy");
    }

    return timeKey;
  };

  const defaultValueFormatter = (value: number): string => {
    if (value === 0) return "";
    return `${value} ${habitData.units || ""}`;
  };

  // Use provided formatters or defaults
  const timeKeyFormatter = formatTimeKey || defaultFormatTimeKey;
  const valueFormatterFn = valueFormatter || defaultValueFormatter;

  // Create a map of time keys to stats for quick lookup
  const statsMap = new Map();
  statsData.stats.forEach((stat) => {
    statsMap.set(stat.timeKey, stat);
  });

  // Format data for the chart
  let chartData;

  // Ensure we have valid dates for interval operations
  const validStartDate = startDate
    ? parseISO(startDate)
    : new Date(new Date().setDate(new Date().getDate() - 30));
  const validEndDate = endDate ? parseISO(endDate) : new Date();

  // For hourly breakdown, ensure all 24 hours are represented
  if (breakdown === HabitLogBreakdown.Hour) {
    // Create an array of hours adjusted for local timezone
    chartData = Array.from({ length: 24 }, (_, i) => {
      // Calculate the UTC hour that corresponds to this local hour
      let localHour = i;
      let utcHour = (localHour - timezoneOffset + 24) % 24;

      // Convert to string to match the format from the API
      const hourKey = Math.floor(utcHour).toString();

      // Look up the stat for this UTC hour
      const stat = statsMap.get(hourKey);

      return {
        timeKey: i.toString(), // Use local hour index for sorting
        displayTime: format(new Date().setHours(localHour, 0, 0, 0), "h a"), // Format local hour
        amount: stat ? stat.total : 0,
        utcHour: hourKey, // Keep track of the UTC hour for debugging
      };
    });
  } else if (breakdown === HabitLogBreakdown.Day) {
    // For daily breakdown, ensure all days in the range are represented
    // Generate all days in the interval
    const allDays = eachDayOfInterval({
      start: validStartDate,
      end: validEndDate,
    });

    // Create data points for each day
    chartData = allDays.map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const stat = statsMap.get(dateKey);

      return {
        timeKey: dateKey,
        displayTime: timeKeyFormatter(dateKey),
        amount: stat ? stat.total : 0,
      };
    });
  } else if (breakdown === HabitLogBreakdown.Week) {
    // For weekly breakdown, ensure all weeks in the range are represented
    // Generate all weeks in the interval
    const allWeeks = eachWeekOfInterval(
      { start: validStartDate, end: validEndDate },
      { weekStartsOn: 1 } // Week starts on Monday
    );

    // Create data points for each week
    chartData = allWeeks.map((date) => {
      const year = getYear(date);
      const week = getWeek(date, { weekStartsOn: 1 });
      const weekKey = `${year}-W${week.toString().padStart(2, "0")}`;
      const stat = statsMap.get(weekKey);

      // Get the start and end of the week for display
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      const displayKey = `${format(weekStart, "MMM d")} - ${format(
        weekEnd,
        "MMM d"
      )}`;

      return {
        timeKey: weekKey,
        displayTime: displayKey,
        amount: stat ? stat.total : 0,
      };
    });
  } else if (breakdown === HabitLogBreakdown.Month) {
    // For monthly breakdown, ensure all months in the range are represented
    // Generate all months in the interval
    const allMonths = eachMonthOfInterval({
      start: validStartDate,
      end: validEndDate,
    });

    // Create data points for each month
    chartData = allMonths.map((date) => {
      const year = getYear(date);
      const month = getMonth(date) + 1; // getMonth is 0-indexed
      const monthKey = `${year}-${month.toString().padStart(2, "0")}`;
      const stat = statsMap.get(monthKey);

      return {
        timeKey: monthKey,
        displayTime: format(date, "MMM yyyy"),
        amount: stat ? stat.total : 0,
      };
    });
  } else {
    // For other breakdowns or year, use the data as is or generate all years
    if (breakdown === HabitLogBreakdown.Year) {
      // Generate all years in the interval
      const allYears = eachYearOfInterval({
        start: validStartDate,
        end: validEndDate,
      });

      // Create data points for each year
      chartData = allYears.map((date) => {
        const year = getYear(date);
        const yearKey = year.toString();
        const stat = statsMap.get(yearKey);

        return {
          timeKey: yearKey,
          displayTime: yearKey,
          amount: stat ? stat.total : 0,
        };
      });
    } else {
      // Fallback to using the data as is
      chartData = statsData.stats.map((stat) => ({
        timeKey: stat.timeKey,
        displayTime: timeKeyFormatter(stat.timeKey),
        amount: stat.total,
      }));
    }
  }

  // Apply reverse if needed (e.g., for showing most recent days first)
  if (reverse) {
    chartData.reverse();
  }

  // Determine color based on habit type if not provided
  const color = barColor || (habitData.goodHabit ? "blue.6" : "red.5");

  return (
    <BarChart
      h={height}
      data={chartData}
      dataKey="displayTime"
      series={[
        {
          name: "amount",
          color: color,
        },
      ]}
      withBarValueLabel
      valueFormatter={valueFormatterFn}
      barProps={{ radius: [4, 4, 0, 0] }}
      tickLine="x"
      yAxisProps={{
        domain: [0, "auto"],
        allowDecimals: false,
      }}
    />
  );
}
