/*
  Warnings:

  - Made the column `assistantId` on table `AgentAI` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AgentAI" ALTER COLUMN "assistantId" SET NOT NULL;
