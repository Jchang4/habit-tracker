import { describe, expect, it } from "@jest/globals";
import { extractDateFields, getWeekNumber } from "./utils";

describe("utils", () => {
  describe("getWeekNumber", () => {
    it("should return correct week number for start of year", () => {
      const date = new Date("2023-01-01");
      const weekNumber = getWeekNumber(date);
      expect(weekNumber).toBe(52); // ISO week starts on Monday, so Jan 1 2023 (Sunday) is in week 52 of 2022
    });

    it("should return correct week number for middle of year", () => {
      const date = new Date("2023-07-01");
      const weekNumber = getWeekNumber(date);
      expect(weekNumber).toBe(26);
    });

    it("should return correct week number for end of year", () => {
      const date = new Date("2023-12-31");
      const weekNumber = getWeekNumber(date);
      expect(weekNumber).toBe(52);
    });
  });

  describe("extractDateFields", () => {
    it("should extract correct date fields", () => {
      const date = new Date(2023, 6, 15, 10, 30); // July 15, 2023, 10:30 AM local time
      const fields = extractDateFields(date);

      expect(fields.day).toEqual(new Date(2023, 6, 15)); // Note: month is 0-indexed in Date constructor
      expect(fields.week).toBe(28);
      expect(fields.month).toBe(7); // July
      expect(fields.year).toBe(2023);
    });

    it("should handle date at midnight", () => {
      const date = new Date(2023, 0, 1, 0, 0, 0); // Jan 1, 2023, midnight local time
      const fields = extractDateFields(date);

      expect(fields.day.getFullYear()).toBe(2023);
      expect(fields.day.getMonth()).toBe(0); // January (0-indexed)
      expect(fields.day.getDate()).toBe(1);
      expect(fields.month).toBe(1); // January (1-indexed in our schema)
      expect(fields.year).toBe(2023);
    });

    it("should handle leap year date", () => {
      const date = new Date(2024, 1, 29, 12, 0); // Feb 29, 2024, noon local time
      const fields = extractDateFields(date);

      expect(fields.day.getFullYear()).toBe(2024);
      expect(fields.day.getMonth()).toBe(1); // February (0-indexed)
      expect(fields.day.getDate()).toBe(29);
      expect(fields.month).toBe(2); // February (1-indexed)
      expect(fields.year).toBe(2024);
    });

    it("should handle current date consistently", () => {
      const now = new Date();
      const fields = extractDateFields(now);

      expect(fields.year).toBe(now.getFullYear());
      expect(fields.month).toBe(now.getMonth() + 1);
      expect(fields.day.getFullYear()).toBe(now.getFullYear());
      expect(fields.day.getMonth()).toBe(now.getMonth());
      expect(fields.day.getDate()).toBe(now.getDate());
    });
  });
});
