CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DropForeignKey
ALTER TABLE "FlowState" DROP CONSTRAINT "FlowState_audienceId_fkey";

-- DropForeignKey
ALTER TABLE "FlowState" DROP CONSTRAINT "FlowState_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "FlowState" DROP CONSTRAINT "FlowState_connectionWAId_fkey";

-- DropIndex
DROP INDEX "FbPixel_pixel_id_key";

-- AlterTable
ALTER TABLE "Chatbot" ADD COLUMN     "cbj" TEXT,
ADD COLUMN     "destLink" TEXT;

-- atualizar todas as linhas do chatbot  
UPDATE "Chatbot"
SET "cbj" = uuid_generate_v4()::TEXT
WHERE "cbj" IS NULL;

-- Se quiser só uma string padrão para destLink:
UPDATE "Chatbot"
SET "destLink" = ''
WHERE "destLink" IS NULL; 

-- AlterTable
ALTER TABLE "FlowState" ADD COLUMN     "chatbotId" INTEGER,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "fbc" TEXT,
ADD COLUMN     "fbp" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "ua" TEXT;

-- CreateIndex
CREATE INDEX "FlowState_id_flowId_campaignId_contactsWAOnAccountId_connec_idx" ON "FlowState"("id", "flowId", "campaignId", "contactsWAOnAccountId", "connectionWAId", "audienceId", "isSent", "isFinish", "createAt");

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE SET NULL ON UPDATE SET NULL;
