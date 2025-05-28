/*
  Warnings:

  - Made the column `type` on table `ConnectionWA` required. This step will fail if there are existing NULL values in that column.
  - Made the column `businessId` on table `ConnectionWA` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ConnectionWA" ADD COLUMN     "description" TEXT,
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "businessId" SET NOT NULL;
