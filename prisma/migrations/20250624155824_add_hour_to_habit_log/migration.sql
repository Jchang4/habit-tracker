/*
 Warnings:
 
 - Added the required column `hour` to the `HabitLog` table without a default value. This is not possible if the table is not empty.
 
 */
-- AlterTable
ALTER TABLE "HabitLog"
ADD COLUMN "hour" INTEGER NOT NULL;
-- CreateIndex
CREATE INDEX "HabitLog_hour_idx" ON "HabitLog"("hour");