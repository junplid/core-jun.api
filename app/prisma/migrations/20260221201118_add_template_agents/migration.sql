-- CreateTable
CREATE TABLE "AgentTemplateInputsSection" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "collapsible" BOOLEAN NOT NULL DEFAULT false,
    "desc" TEXT,
    "inputs" JSONB[],
    "sequence" INTEGER NOT NULL,

    CONSTRAINT "AgentTemplateInputsSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentTemplates" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "card_desc" TEXT NOT NULL,
    "markdown_desc" TEXT NOT NULL,
    "config_flow" TEXT NOT NULL,
    "count_usage" INTEGER NOT NULL DEFAULT 0,
    "chat_demo" JSONB[],
    "script_runner" TEXT NOT NULL,
    "variables" TEXT[],
    "tags" TEXT[],
    "created_by" TEXT NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentTemplateInputsSection_name_idx" ON "AgentTemplateInputsSection"("name");
