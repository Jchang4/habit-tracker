-- AlterTable
ALTER TABLE "HabitLog"
ADD COLUMN "hour" INT NOT NULL DEFAULT 0;
-- Update existing records
UPDATE "HabitLog"
SET "hour" = EXTRACT(
        HOUR
        FROM "performedAt"
    )::INT;
-- Create index
CREATE INDEX "HabitLog_hour_idx" ON "HabitLog"("hour");