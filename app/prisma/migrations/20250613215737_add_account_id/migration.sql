/*
  Warnings:

  - A unique constraint covering the columns `[email,hash,id,name]` on the table `InboxUsers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `InboxUsers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "InboxUsers_email_hash_key";

-- AlterTable
ALTER TABLE "InboxUsers" ADD COLUMN     "accountId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InboxUsers_email_hash_id_name_key" ON "InboxUsers"("email", "hash", "id", "name");

-- AddForeignKey
ALTER TABLE "InboxUsers" ADD CONSTRAINT "InboxUsers_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
