-- CreateEnum
CREATE TYPE "TypeServiceTier" AS ENUM ('default', 'flex', 'auto', 'scale', 'priority');

-- DropForeignKey
ALTER TABLE "AgentAI" DROP CONSTRAINT "AgentAI_chatbotId_fkey";

-- DropForeignKey
ALTER TABLE "AgentAI" DROP CONSTRAINT "AgentAI_connectionWAId_fkey";

-- AlterTable
ALTER TABLE "AgentAI" ADD COLUMN     "service_tier" "TypeServiceTier" NOT NULL DEFAULT 'default';

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
