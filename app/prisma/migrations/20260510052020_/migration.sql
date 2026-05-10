/*
  Warnings:

  - You are about to drop the `AgentTemplateInputsSection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AgentTemplates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AgentTemplateInputsSection" DROP CONSTRAINT "AgentTemplateInputsSection_templateId_fkey";

-- DropTable
DROP TABLE "AgentTemplateInputsSection";

-- DropTable
DROP TABLE "AgentTemplates";

-- CreateTable
CREATE TABLE "TemplateInputsSection" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "collapsible" BOOLEAN NOT NULL DEFAULT false,
    "desc" TEXT,
    "inputs" JSONB[],
    "sequence" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,

    CONSTRAINT "TemplateInputsSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Templates" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "card_desc" TEXT NOT NULL,
    "type" TEXT,
    "flag" TEXT,
    "markdown_desc" TEXT NOT NULL,
    "config_flow" TEXT NOT NULL,
    "count_usage" INTEGER NOT NULL DEFAULT 0,
    "chat_demo" JSONB,
    "script_runner" TEXT NOT NULL,
    "script_build_agentai_for_test" TEXT,
    "variables" TEXT[],
    "tags" TEXT[],
    "created_by" TEXT NOT NULL,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemplateInputsSection_name_idx" ON "TemplateInputsSection"("name");

-- CreateIndex
CREATE INDEX "Templates_type_count_usage_createAt_idx" ON "Templates"("type", "count_usage", "createAt");

-- AddForeignKey
ALTER TABLE "TemplateInputsSection" ADD CONSTRAINT "TemplateInputsSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
