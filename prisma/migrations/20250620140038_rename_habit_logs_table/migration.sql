/*
  Warnings:

  - You are about to drop the `habit_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "habit_logs" DROP CONSTRAINT "habit_logs_habitId_fkey";

-- DropTable
DROP TABLE "habit_logs";

-- CreateTable
CREATE TABLE "HabitLog" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION,
    "day" DATE NOT NULL,
    "week" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "HabitLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HabitLog_habitId_performedAt_idx" ON "HabitLog"("habitId", "performedAt");

-- CreateIndex
CREATE INDEX "HabitLog_userId_performedAt_idx" ON "HabitLog"("userId", "performedAt");

-- CreateIndex
CREATE INDEX "HabitLog_day_idx" ON "HabitLog"("day");

-- CreateIndex
CREATE INDEX "HabitLog_week_idx" ON "HabitLog"("week");

-- CreateIndex
CREATE INDEX "HabitLog_month_idx" ON "HabitLog"("month");

-- CreateIndex
CREATE INDEX "HabitLog_year_idx" ON "HabitLog"("year");

-- AddForeignKey
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
