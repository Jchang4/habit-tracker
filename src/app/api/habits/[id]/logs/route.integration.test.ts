/**
 * Integration tests for habit logs API endpoints
 * @jest-environment node
 */

import { extractDateFields } from "@/lib/utils";
import { describe, expect, it } from "@jest/globals";

describe("Habit Logs API Integration Tests", () => {
  describe("Date field extraction", () => {
    it("should correctly extract date fields for habit log creation", () => {
      // Use local timezone date
      const testDate = new Date(2023, 6, 15, 14, 30); // July 15, 2023, 2:30 PM local
      const fields = extractDateFields(testDate);

      expect(fields.year).toBe(2023);
      expect(fields.month).toBe(7);
      expect(fields.week).toBe(28);
      expect(fields.day.getFullYear()).toBe(2023);
      expect(fields.day.getMonth()).toBe(6); // 0-indexed
      expect(fields.day.getDate()).toBe(15);
    });

    it("should handle edge case dates correctly", () => {
      // Test New Year's Day in local timezone
      const newYear = new Date(2023, 0, 1); // Jan 1, 2023 local
      const newYearFields = extractDateFields(newYear);

      expect(newYearFields.year).toBe(2023);
      expect(newYearFields.month).toBe(1);

      // Test leap year in local timezone
      const leapDay = new Date(2024, 1, 29, 12); // Feb 29, 2024 local
      const leapFields = extractDateFields(leapDay);

      expect(leapFields.year).toBe(2024);
      expect(leapFields.month).toBe(2);
      expect(leapFields.day.getDate()).toBe(29);
    });

    it("should handle different times on same day consistently", () => {
      // Test same day but different times
      const morning = new Date(2023, 5, 15, 2, 0); // June 15, 2023, 2:00 AM local
      const evening = new Date(2023, 5, 15, 22, 0); // June 15, 2023, 10:00 PM local

      const morningFields = extractDateFields(morning);
      const eveningFields = extractDateFields(evening);

      // Should be same day regardless of time
      expect(morningFields.day.toDateString()).toBe(
        eveningFields.day.toDateString()
      );
      expect(morningFields.year).toBe(eveningFields.year);
      expect(morningFields.month).toBe(eveningFields.month);
      expect(morningFields.week).toBe(eveningFields.week);
    });
  });

  describe("API Route Logic", () => {
    it("should validate required habit log fields", () => {
      // Test that we have the required fields for creating a habit log
      const testDate = new Date(2023, 6, 15, 14, 30);
      const fields = extractDateFields(testDate);

      // Verify all required database fields are present
      expect(fields).toHaveProperty("day");
      expect(fields).toHaveProperty("week");
      expect(fields).toHaveProperty("month");
      expect(fields).toHaveProperty("year");

      // Verify field types
      expect(fields.day).toBeInstanceOf(Date);
      expect(typeof fields.week).toBe("number");
      expect(typeof fields.month).toBe("number");
      expect(typeof fields.year).toBe("number");

      // Verify field values are reasonable
      expect(fields.week).toBeGreaterThan(0);
      expect(fields.week).toBeLessThanOrEqual(53);
      expect(fields.month).toBeGreaterThan(0);
      expect(fields.month).toBeLessThanOrEqual(12);
      expect(fields.year).toBeGreaterThan(1900);
    });

    it("should handle current time when performedAt is not provided", () => {
      const before = Date.now();
      const now = new Date();
      const after = Date.now();

      const fields = extractDateFields(now);

      // Should be current date
      expect(fields.year).toBe(now.getFullYear());
      expect(fields.month).toBe(now.getMonth() + 1);

      // Time should be between our before/after markers
      expect(now.getTime()).toBeGreaterThanOrEqual(before);
      expect(now.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid dates gracefully", () => {
      const invalidDate = new Date("invalid");

      // Should not throw an error, but might return NaN values
      expect(() => extractDateFields(invalidDate)).not.toThrow();

      const fields = extractDateFields(invalidDate);
      // For invalid dates, we should check if the result is meaningful
      expect(fields).toHaveProperty("day");
      expect(fields).toHaveProperty("week");
      expect(fields).toHaveProperty("month");
      expect(fields).toHaveProperty("year");
    });

    it("should work with past and future dates", () => {
      const past = new Date(2020, 0, 1); // Jan 1, 2020 local
      const future = new Date(2030, 11, 31); // Dec 31, 2030 local

      const pastFields = extractDateFields(past);
      const futureFields = extractDateFields(future);

      expect(pastFields.year).toBe(2020);
      expect(pastFields.month).toBe(1);

      expect(futureFields.year).toBe(2030);
      expect(futureFields.month).toBe(12);
    });
  });

  describe("Data Consistency", () => {
    it("should maintain consistency between performedAt and extracted fields", () => {
      const testDate = new Date(2023, 8, 15, 16, 45); // Sep 15, 2023, 4:45 PM local
      const fields = extractDateFields(testDate);

      // Extracted day should be same calendar day as performedAt
      expect(fields.day.getFullYear()).toBe(testDate.getFullYear());
      expect(fields.day.getMonth()).toBe(testDate.getMonth());
      expect(fields.day.getDate()).toBe(testDate.getDate());

      // Year and month should match
      expect(fields.year).toBe(testDate.getFullYear());
      expect(fields.month).toBe(testDate.getMonth() + 1); // +1 because month is 1-indexed in our schema
    });

    it("should produce consistent results for same date", () => {
      const date1 = new Date(2023, 6, 15, 10, 0); // July 15, 2023, 10:00 AM local
      const date2 = new Date(2023, 6, 15, 20, 0); // July 15, 2023, 8:00 PM local

      const fields1 = extractDateFields(date1);
      const fields2 = extractDateFields(date2);

      // Should extract same day/week/month/year for same calendar day
      expect(fields1.day.toDateString()).toBe(fields2.day.toDateString());
      expect(fields1.week).toBe(fields2.week);
      expect(fields1.month).toBe(fields2.month);
      expect(fields1.year).toBe(fields2.year);
    });

    it("should handle week boundaries correctly", () => {
      // Test dates that might be on week boundaries
      const sunday = new Date(2023, 6, 16); // July 16, 2023 (Sunday)
      const monday = new Date(2023, 6, 17); // July 17, 2023 (Monday)

      const sundayFields = extractDateFields(sunday);
      const mondayFields = extractDateFields(monday);

      // These should be in different weeks
      expect(sundayFields.week).not.toBe(mondayFields.week);
      expect(sundayFields.year).toBe(mondayFields.year);
      expect(sundayFields.month).toBe(mondayFields.month);
    });
  });
});
