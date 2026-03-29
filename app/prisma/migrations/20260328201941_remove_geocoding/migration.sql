/*
  Warnings:

  - You are about to drop the column `geocoding` on the `MenusOnline` table. All the data in the column will be lost.
  - You are about to drop the column `geocoding` on the `Orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenusOnline" DROP COLUMN "geocoding";

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "geocoding";
