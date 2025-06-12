/*
  Warnings:

  - Made the column `temperature` on table `AgentAI` required. This step will fail if there are existing NULL values in that column.
  - Made the column `debounce` on table `AgentAI` required. This step will fail if there are existing NULL values in that column.
  - Made the column `timeout` on table `AgentAI` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AgentAI" ALTER COLUMN "temperature" SET NOT NULL,
ALTER COLUMN "debounce" SET NOT NULL,
ALTER COLUMN "timeout" SET NOT NULL;

-- AlterTable
ALTER TABLE "FlowState" ADD COLUMN     "previous_response_id" TEXT;
