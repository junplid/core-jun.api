/*
  Warnings:

  - You are about to drop the column `menuInfoId` on the `MenuOnlineOperatingDays` table. All the data in the column will be lost.
  - Added the required column `menuId` to the `MenuOnlineOperatingDays` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MenuOnlineOperatingDays" DROP CONSTRAINT "MenuOnlineOperatingDays_menuInfoId_fkey";

-- DropIndex
DROP INDEX "MenuOnlineOperatingDays_menuInfoId_startHourAt_idx";

-- AlterTable
ALTER TABLE "MenuOnlineOperatingDays" DROP COLUMN "menuInfoId",
ADD COLUMN     "menuId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "MenuOnlineOperatingDays_menuId_dayOfWeek_idx" ON "MenuOnlineOperatingDays"("menuId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "MenuOnlineOperatingDays" ADD CONSTRAINT "MenuOnlineOperatingDays_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenusOnline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
