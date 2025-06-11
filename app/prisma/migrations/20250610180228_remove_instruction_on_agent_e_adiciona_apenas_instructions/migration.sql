/*
  Warnings:

  - You are about to drop the `InstructionOnAgentAI` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoragePathOnInstructionOnAgentAI` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InstructionOnAgentAI" DROP CONSTRAINT "InstructionOnAgentAI_agentAIId_fkey";

-- DropForeignKey
ALTER TABLE "StoragePathOnInstructionOnAgentAI" DROP CONSTRAINT "StoragePathOnInstructionOnAgentAI_instructionOnAgentAIId_fkey";

-- DropForeignKey
ALTER TABLE "StoragePathOnInstructionOnAgentAI" DROP CONSTRAINT "StoragePathOnInstructionOnAgentAI_storagePathId_fkey";

-- AlterTable
ALTER TABLE "AgentAI" ADD COLUMN     "debounce" INTEGER DEFAULT 9,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "timeout" INTEGER DEFAULT 900;

-- DropTable
DROP TABLE "InstructionOnAgentAI";

-- DropTable
DROP TABLE "StoragePathOnInstructionOnAgentAI";
