/*
  Warnings:

  - The values [NEW_ACCOUNT,NEW_CONTACT] on the enum `GeralLogDateType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `entity` to the `GeralLogDate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash` to the `GeralLogDate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `GeralLogDate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GeralLogDateType_new" AS ENUM ('TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');
ALTER TABLE "GeralLogDate" ALTER COLUMN "type" TYPE "GeralLogDateType_new" USING ("type"::text::"GeralLogDateType_new");
ALTER TYPE "GeralLogDateType" RENAME TO "GeralLogDateType_old";
ALTER TYPE "GeralLogDateType_new" RENAME TO "GeralLogDateType";
DROP TYPE "GeralLogDateType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "TypeStatusOrder" ADD VALUE 'completed';

-- AlterTable
ALTER TABLE "GeralLogDate" ADD COLUMN     "entity" TEXT NOT NULL,
ADD COLUMN     "hash" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;
