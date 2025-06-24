/*
  Warnings:

  - Made the column `cbj` on table `Chatbot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Chatbot" ALTER COLUMN "cbj" SET NOT NULL;
