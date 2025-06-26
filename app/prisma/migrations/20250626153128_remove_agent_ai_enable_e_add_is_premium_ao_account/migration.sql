/*
  Warnings:

  - You are about to drop the column `agentAIEnabled` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "agentAIEnabled",
ADD COLUMN     "isPremium" BOOLEAN DEFAULT false;
