/*
  Warnings:

  - A unique constraint covering the columns `[chatbotId]` on the table `AgentAI` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AgentAI" ADD COLUMN     "chatbotId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "AgentAI_chatbotId_key" ON "AgentAI"("chatbotId");

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
