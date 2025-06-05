/*
  Warnings:

  - You are about to drop the column `type` on the `StoragePaths` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StoragePaths" DROP COLUMN "type",
ADD COLUMN     "mimetype" TEXT;
