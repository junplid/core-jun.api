/*
  Warnings:

  - Added the required column `fileName` to the `StoragePaths` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StoragePaths" ADD COLUMN     "fileName" TEXT NOT NULL;
