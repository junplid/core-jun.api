-- CreateEnum
CREATE TYPE "TypeProviderCredential" AS ENUM ('openai');

-- CreateEnum
CREATE TYPE "TypeEmojiLevel" AS ENUM ('none', 'low', 'medium', 'high');

-- CreateTable
CREATE TABLE "ProviderCredential" (
    "id" SERIAL NOT NULL,
    "provider" "TypeProviderCredential" NOT NULL,
    "label" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAI" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "personality" TEXT,
    "knowledgeBase" TEXT,
    "emojiLevel" "TypeEmojiLevel" NOT NULL DEFAULT 'none',
    "language" TEXT NOT NULL DEFAULT 'PT-BR',
    "model" TEXT NOT NULL,
    "temperature" DECIMAL(2,1) DEFAULT 0.1,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "providerCredentialId" INTEGER NOT NULL,

    CONSTRAINT "AgentAI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructionOnAgentAI" (
    "id" SERIAL NOT NULL,
    "prompt" TEXT NOT NULL,
    "promptAfterReply" TEXT NOT NULL,
    "agentAIId" INTEGER NOT NULL,

    CONSTRAINT "InstructionOnAgentAI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAIOnBusiness" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "agentId" INTEGER NOT NULL,

    CONSTRAINT "AgentAIOnBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoragePathOnAgentAI" (
    "id" SERIAL NOT NULL,
    "agentAIId" INTEGER NOT NULL,
    "storagePathId" INTEGER NOT NULL,

    CONSTRAINT "StoragePathOnAgentAI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoragePathOnInstructionOnAgentAI" (
    "id" SERIAL NOT NULL,
    "instructionOnAgentAIId" INTEGER NOT NULL,
    "storagePathId" INTEGER NOT NULL,

    CONSTRAINT "StoragePathOnInstructionOnAgentAI_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderCredential_createAt_label_accountId_provider_idx" ON "ProviderCredential"("createAt", "label", "accountId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderCredential_label_accountId_provider_key" ON "ProviderCredential"("label", "accountId", "provider");

-- CreateIndex
CREATE INDEX "AgentAI_id_name_accountId_idx" ON "AgentAI"("id", "name", "accountId");

-- CreateIndex
CREATE INDEX "InstructionOnAgentAI_id_agentAIId_idx" ON "InstructionOnAgentAI"("id", "agentAIId");

-- CreateIndex
CREATE INDEX "AgentAIOnBusiness_businessId_agentId_idx" ON "AgentAIOnBusiness"("businessId", "agentId");

-- CreateIndex
CREATE INDEX "StoragePathOnAgentAI_agentAIId_storagePathId_idx" ON "StoragePathOnAgentAI"("agentAIId", "storagePathId");

-- CreateIndex
CREATE INDEX "StoragePathOnInstructionOnAgentAI_instructionOnAgentAIId_st_idx" ON "StoragePathOnInstructionOnAgentAI"("instructionOnAgentAIId", "storagePathId");

-- AddForeignKey
ALTER TABLE "ProviderCredential" ADD CONSTRAINT "ProviderCredential_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_providerCredentialId_fkey" FOREIGN KEY ("providerCredentialId") REFERENCES "ProviderCredential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructionOnAgentAI" ADD CONSTRAINT "InstructionOnAgentAI_agentAIId_fkey" FOREIGN KEY ("agentAIId") REFERENCES "AgentAI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAIOnBusiness" ADD CONSTRAINT "AgentAIOnBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAIOnBusiness" ADD CONSTRAINT "AgentAIOnBusiness_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentAI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoragePathOnAgentAI" ADD CONSTRAINT "StoragePathOnAgentAI_agentAIId_fkey" FOREIGN KEY ("agentAIId") REFERENCES "AgentAI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoragePathOnAgentAI" ADD CONSTRAINT "StoragePathOnAgentAI_storagePathId_fkey" FOREIGN KEY ("storagePathId") REFERENCES "StoragePaths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoragePathOnInstructionOnAgentAI" ADD CONSTRAINT "StoragePathOnInstructionOnAgentAI_instructionOnAgentAIId_fkey" FOREIGN KEY ("instructionOnAgentAIId") REFERENCES "InstructionOnAgentAI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoragePathOnInstructionOnAgentAI" ADD CONSTRAINT "StoragePathOnInstructionOnAgentAI_storagePathId_fkey" FOREIGN KEY ("storagePathId") REFERENCES "StoragePaths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
