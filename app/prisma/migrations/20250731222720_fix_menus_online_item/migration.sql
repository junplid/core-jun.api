/*
  Warnings:

  - You are about to drop the column `itemId` on the `MenusOnline` table. All the data in the column will be lost.
  - Added the required column `menuId` to the `MenusOnlineItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MenusOnline" DROP CONSTRAINT "MenusOnline_itemId_fkey";

-- DropIndex
DROP INDEX "MenusOnlineItems_id_uuid_accountId_idx";

-- AlterTable
ALTER TABLE "MenusOnline" DROP COLUMN "itemId";

-- AlterTable
ALTER TABLE "MenusOnlineItems" ADD COLUMN     "menuId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "MenusOnlineItems_uuid_menuId_accountId_idx" ON "MenusOnlineItems"("uuid", "menuId", "accountId");

-- AddForeignKey
ALTER TABLE "MenusOnlineItems" ADD CONSTRAINT "MenusOnlineItems_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenusOnline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
