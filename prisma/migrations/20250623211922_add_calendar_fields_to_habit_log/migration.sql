-- AlterTable
ALTER TABLE "HabitLog" ADD COLUMN     "calendarEventId" TEXT,
ADD COLUMN     "calendarEventLink" TEXT,
ADD COLUMN     "calendarId" TEXT,
ADD COLUMN     "calendarSyncedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "HabitLog_calendarEventId_idx" ON "HabitLog"("calendarEventId");
