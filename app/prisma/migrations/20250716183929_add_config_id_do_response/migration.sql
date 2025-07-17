/*
  Warnings:

  - You are about to drop the column `assistantId` on the `AgentAI` table. All the data in the column will be lost.
  - You are about to drop the column `thread_id` on the `FlowState` table. All the data in the column will be lost.
  - Added the required column `config_id` to the `AgentAI` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AgentAI" DROP COLUMN "assistantId",
ADD COLUMN     "config_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FlowState" DROP COLUMN "thread_id";
