-- CreateEnum
CREATE TYPE "TypeAudience" AS ENUM ('ondemand', 'static', 'interactions', 'import');

-- CreateEnum
CREATE TYPE "TypeStatusCampaign" AS ENUM ('stopped', 'processing', 'paused', 'running', 'finished');

-- DropIndex
DROP INDEX "OperatingDays_id_chatbotId_idx";

-- AlterTable
ALTER TABLE "FlowState" ADD COLUMN     "audienceId" INTEGER,
ADD COLUMN     "campaignId" INTEGER;

-- AlterTable
ALTER TABLE "OperatingDays" ADD COLUMN     "campaignId" INTEGER;

-- CreateTable
CREATE TABLE "Audience" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(150) NOT NULL,
    "type" "TypeAudience" NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "Audience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactsWAOnAudience" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "audienceId" INTEGER NOT NULL,
    "contactWAOnAccountId" INTEGER NOT NULL,

    CONSTRAINT "ContactsWAOnAudience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceOnCampaign" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "audienceId" INTEGER NOT NULL,

    CONSTRAINT "AudienceOnCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceOnBusiness" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "audienceId" INTEGER NOT NULL,

    CONSTRAINT "AudienceOnBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionOnCampaign" (
    "id" SERIAL NOT NULL,
    "connectionWAId" INTEGER NOT NULL,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "ConnectionOnCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignOnBusiness" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "CampaignOnBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HasTag_Campaign" (
    "id" SERIAL NOT NULL,
    "tagId" INTEGER NOT NULL,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "HasTag_Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "name" VARCHAR(160) NOT NULL,
    "status" "TypeStatusCampaign" NOT NULL DEFAULT 'processing',
    "timeItWillStart" TEXT,
    "flowId" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "shootingSpeedId" INTEGER NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Audience_id_type_name_accountId_idx" ON "Audience"("id", "type", "name", "accountId");

-- CreateIndex
CREATE INDEX "ContactsWAOnAudience_contactWAOnAccountId_audienceId_idx" ON "ContactsWAOnAudience"("contactWAOnAccountId", "audienceId");

-- CreateIndex
CREATE INDEX "AudienceOnCampaign_campaignId_audienceId_idx" ON "AudienceOnCampaign"("campaignId", "audienceId");

-- CreateIndex
CREATE INDEX "ConnectionOnCampaign_campaignId_connectionWAId_idx" ON "ConnectionOnCampaign"("campaignId", "connectionWAId");

-- CreateIndex
CREATE INDEX "CampaignOnBusiness_id_businessId_campaignId_idx" ON "CampaignOnBusiness"("id", "businessId", "campaignId");

-- CreateIndex
CREATE INDEX "HasTag_Campaign_campaignId_idx" ON "HasTag_Campaign"("campaignId");

-- CreateIndex
CREATE INDEX "Campaign_name_accountId_flowId_createAt_status_idx" ON "Campaign"("name", "accountId", "flowId", "createAt", "status");

-- CreateIndex
CREATE INDEX "OperatingDays_id_chatbotId_campaignId_idx" ON "OperatingDays"("id", "chatbotId", "campaignId");

-- AddForeignKey
ALTER TABLE "OperatingDays" ADD CONSTRAINT "OperatingDays_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audience" ADD CONSTRAINT "Audience_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactsWAOnAudience" ADD CONSTRAINT "ContactsWAOnAudience_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactsWAOnAudience" ADD CONSTRAINT "ContactsWAOnAudience_contactWAOnAccountId_fkey" FOREIGN KEY ("contactWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceOnCampaign" ADD CONSTRAINT "AudienceOnCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceOnCampaign" ADD CONSTRAINT "AudienceOnCampaign_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceOnBusiness" ADD CONSTRAINT "AudienceOnBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceOnBusiness" ADD CONSTRAINT "AudienceOnBusiness_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionOnCampaign" ADD CONSTRAINT "ConnectionOnCampaign_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionOnCampaign" ADD CONSTRAINT "ConnectionOnCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignOnBusiness" ADD CONSTRAINT "CampaignOnBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignOnBusiness" ADD CONSTRAINT "CampaignOnBusiness_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasTag_Campaign" ADD CONSTRAINT "HasTag_Campaign_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasTag_Campaign" ADD CONSTRAINT "HasTag_Campaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_shootingSpeedId_fkey" FOREIGN KEY ("shootingSpeedId") REFERENCES "ShootingSpeed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
