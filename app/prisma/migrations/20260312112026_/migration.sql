/*
  Warnings:

  - Made the column `connectionWAId` on table `MenusOnline` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MenusOnline" ALTER COLUMN "connectionWAId" SET NOT NULL;
