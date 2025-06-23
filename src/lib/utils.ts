/**
 * Utility functions for date manipulation and extraction
 */

// Helper function to get ISO week number
export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Extract date fields from a Date object for HabitLog storage
 */
export function extractDateFields(date: Date) {
  return {
    day: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    week: getWeekNumber(date),
    month: date.getMonth() + 1, // JavaScript months are 0-indexed
    year: date.getFullYear(),
  };
}

/**
 * Sort an array of objects by their createdAt field. Used in the Array.sort
 * method.
 *
 * @param a - The first object to compare.
 * @param b - The second object to compare.
 * @returns A negative value if a is before b, a positive value if a is after b,
 * or 0 if they are the same.
 *
 * @example
 * const sorted = array.sort(sortByCreatedAt);
 */
export function sortByCreatedAt<T extends { createdAt: string }>(
  a: T,
  b: T
): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
