-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "HabitLog" ALTER COLUMN "hour" DROP DEFAULT;
