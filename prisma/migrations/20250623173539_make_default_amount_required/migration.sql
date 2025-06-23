/*
 Warnings:
 
 - Made the column `defaultAmount` on table `Habit` required. This step will fail if there are existing NULL values in that column.
 
 */
-- First update all existing NULL values to 1
UPDATE "Habit"
SET "defaultAmount" = 1
WHERE "defaultAmount" IS NULL;
-- Now make the column required with a default value
ALTER TABLE "Habit"
ALTER COLUMN "defaultAmount"
SET NOT NULL,
  ALTER COLUMN "defaultAmount"
SET DEFAULT 1;