/*
  Warnings:

  - A unique constraint covering the columns `[completeNumber,page_id,channel]` on the table `ContactsWA` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ContactsWA_completeNumber_key";

-- AlterTable
ALTER TABLE "ContactsWA" ADD COLUMN     "page_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ContactsWA_completeNumber_page_id_channel_key" ON "ContactsWA"("completeNumber", "page_id", "channel");
