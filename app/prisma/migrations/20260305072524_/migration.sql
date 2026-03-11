-- AlterTable
ALTER TABLE "MenuOnlineCategory" ADD COLUMN     "days_in_the_week" INTEGER[],
ADD COLUMN     "endAt" TIMESTAMPTZ,
ADD COLUMN     "startAt" TIMESTAMPTZ;
