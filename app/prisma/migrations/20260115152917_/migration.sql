/*
  Warnings:

  - A unique constraint covering the columns `[connectionWAId]` on the table `AgentAI` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AgentAI" ADD COLUMN     "connectionWAId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "AgentAI_connectionWAId_key" ON "AgentAI"("connectionWAId");

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE SET NULL ON UPDATE CASCADE;
