/*
  Warnings:

  - Added the required column `templateId` to the `AgentTemplateInputsSection` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `chat_demo` on the `AgentTemplates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "AgentTemplateInputsSection" ADD COLUMN     "templateId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "AgentTemplates" DROP COLUMN "chat_demo",
ADD COLUMN     "chat_demo" JSONB NOT NULL;

-- CreateIndex
CREATE INDEX "AgentTemplates_count_usage_createAt_idx" ON "AgentTemplates"("count_usage", "createAt");

-- AddForeignKey
ALTER TABLE "AgentTemplateInputsSection" ADD CONSTRAINT "AgentTemplateInputsSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AgentTemplates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
