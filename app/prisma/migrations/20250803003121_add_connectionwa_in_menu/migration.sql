/*
  Warnings:

  - You are about to drop the column `label` on the `MenusOnline` table. All the data in the column will be lost.
  - You are about to drop the column `label1` on the `MenusOnline` table. All the data in the column will be lost.
  - Added the required column `connectionWAId` to the `MenusOnline` table without a default value. This is not possible if the table is not empty.
  - Made the column `accountId` on table `MenusOnline` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MenusOnline" DROP COLUMN "label",
DROP COLUMN "label1",
ADD COLUMN     "connectionWAId" INTEGER NOT NULL,
ADD COLUMN     "logoLabel" TEXT,
ALTER COLUMN "accountId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MenusOnline" ADD CONSTRAINT "MenusOnline_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
