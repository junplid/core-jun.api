-- AlterTable
ALTER TABLE "Chatbot" ADD COLUMN     "fallback" TEXT;

-- AlterTable
ALTER TABLE "FlowState" ADD COLUMN     "fallbackSent" BOOLEAN NOT NULL DEFAULT false;
