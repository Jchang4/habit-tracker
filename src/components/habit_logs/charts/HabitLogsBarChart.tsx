import { HabitLogBreakdown } from "@/lib/api/habit-logs";

interface HabitLogsBarChartProps {
  habitIds: string[];
  breakdown: HabitLogBreakdown;
  startDate?: string;
  endDate?: string;
}

/**
 * Show multiple habits' logs in a bar chart.
 */
export default function HabitLogsBarChart({
  habitIds,
  breakdown,
  startDate,
  endDate,
}: HabitLogsBarChartProps) {
  return <div>HabitLogsBarChart</div>;
}
