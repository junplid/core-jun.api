/*
  Warnings:

  - Added the required column `rank` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "rank" DECIMAL(20,10) NOT NULL;
