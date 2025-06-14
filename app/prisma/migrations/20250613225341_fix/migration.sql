/*
  Warnings:

  - The values [new,open,resolved,deleted] on the enum `TypeStatusTicket` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `accountId` to the `InboxDepartments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeStatusTicket_new" AS ENUM ('NEW', 'OPEN', 'RESOLVED', 'DELETED');
ALTER TABLE "Tickets" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Tickets" ALTER COLUMN "status" TYPE "TypeStatusTicket_new" USING ("status"::text::"TypeStatusTicket_new");
ALTER TYPE "TypeStatusTicket" RENAME TO "TypeStatusTicket_old";
ALTER TYPE "TypeStatusTicket_new" RENAME TO "TypeStatusTicket";
DROP TYPE "TypeStatusTicket_old";
ALTER TABLE "Tickets" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- DropIndex
DROP INDEX "InboxDepartments_id_name_businessId_idx";

-- DropIndex
DROP INDEX "InboxUsers_email_hash_id_name_key";

-- AlterTable
ALTER TABLE "InboxDepartments" ADD COLUMN     "accountId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Tickets" ALTER COLUMN "status" SET DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "InboxDepartments_id_name_businessId_accountId_idx" ON "InboxDepartments"("id", "name", "businessId", "accountId");

-- CreateIndex
CREATE INDEX "InboxUsers_id_email_accountId_inboxDepartmentId_idx" ON "InboxUsers"("id", "email", "accountId", "inboxDepartmentId");

-- AddForeignKey
ALTER TABLE "InboxDepartments" ADD CONSTRAINT "InboxDepartments_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
