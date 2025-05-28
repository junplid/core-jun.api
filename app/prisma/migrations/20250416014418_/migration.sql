-- CreateEnum
CREATE TYPE "TypeConnetion" AS ENUM ('chatbot', 'marketing');

-- CreateEnum
CREATE TYPE "WAPrivacyValue" AS ENUM ('all', 'contacts', 'contact_blacklist', 'none');

-- CreateEnum
CREATE TYPE "WAPrivacyValueGroup" AS ENUM ('all', 'contacts', 'contact_blacklist');

-- CreateEnum
CREATE TYPE "WAPrivacyOnlineValue" AS ENUM ('all', 'match_last_seen');

-- CreateEnum
CREATE TYPE "WAReadReceiptsValue" AS ENUM ('all', 'none');

-- CreateEnum
CREATE TYPE "TypeFlowState" AS ENUM ('campaign', 'chatbot');

-- CreateEnum
CREATE TYPE "TypeActivation" AS ENUM ('message', 'qrcode', 'link');

-- CreateEnum
CREATE TYPE "TypeMessageWhatsApp" AS ENUM ('textDetermined', 'anyMessage');

-- CreateEnum
CREATE TYPE "TypeChatbotInactivity" AS ENUM ('seconds', 'minutes', 'hours', 'days');

-- CreateEnum
CREATE TYPE "TypeChatbotActivations" AS ENUM ('contains', 'startWith', 'equal', 'different');

-- CreateEnum
CREATE TYPE "TypeVariable" AS ENUM ('dynamics', 'constant', 'system');

-- CreateEnum
CREATE TYPE "TypeStaticPath" AS ENUM ('video', 'image', 'pdf', 'file', 'audio');

-- CreateEnum
CREATE TYPE "TypeTag" AS ENUM ('contactwa', 'audience');

-- CreateTable
CREATE TABLE "RootUsers" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "RootUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RootConnectionWA" (
    "id" SERIAL NOT NULL,
    "connectionWAId" INTEGER,

    CONSTRAINT "RootConnectionWA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "isUsedFreeTrialTime" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50),
    "email" VARCHAR(200) NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "customerId" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "assetsUsedId" INTEGER NOT NULL,
    "contactWAId" INTEGER NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountAssetsUsed" (
    "id" SERIAL NOT NULL,
    "chatbots" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AccountAssetsUsed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "accountId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionWA" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50) NOT NULL,
    "type" "TypeConnetion",
    "countShots" INTEGER NOT NULL DEFAULT 0,
    "number" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" INTEGER,

    CONSTRAINT "ConnectionWA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionConfig" (
    "profileName" TEXT,
    "profileStatus" TEXT,
    "lastSeenPrivacy" "WAPrivacyValue",
    "onlinePrivacy" "WAPrivacyOnlineValue",
    "imgPerfilPrivacy" "WAPrivacyValue",
    "statusPrivacy" "WAPrivacyValue",
    "groupsAddPrivacy" "WAPrivacyValueGroup",
    "readReceiptsPrivacy" "WAReadReceiptsValue",
    "fileNameImgPerfil" TEXT,
    "connectionWAId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "TimesWork" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "chatbotId" INTEGER,

    CONSTRAINT "TimesWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowState" (
    "id" SERIAL NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "firedOnDate" TIMESTAMP(3),
    "isFinish" BOOLEAN DEFAULT false,
    "indexNode" TEXT,
    "connectionWAId" INTEGER,
    "flowId" INTEGER,
    "type" "TypeFlowState",
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactsWAOnAccountId" INTEGER,

    CONSTRAINT "FlowState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chatbot" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(60) NOT NULL,
    "status" BOOLEAN DEFAULT false,
    "description" TEXT,
    "connectionWAId" INTEGER,
    "leadOriginList" TEXT,
    "flowId" INTEGER NOT NULL,
    "insertNewLeadsOnAudienceId" INTEGER,
    "insertTagsLead" TEXT,
    "typeActivation" "TypeActivation",
    "inputActivation" TEXT,
    "businessId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "typeMessageWhatsApp" "TypeMessageWhatsApp",
    "chatbotInactivityId" INTEGER,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chatbot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotInactivity" (
    "id" SERIAL NOT NULL,
    "type" "TypeChatbotInactivity" NOT NULL DEFAULT 'seconds',
    "flowId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "ChatbotInactivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotAlternativeFlows" (
    "id" SERIAL NOT NULL,
    "receivingNonStandardMessages" INTEGER,
    "receivingAudioMessages" INTEGER,
    "receivingImageMessages" INTEGER,
    "receivingVideoMessages" INTEGER,
    "chatbotId" INTEGER NOT NULL,

    CONSTRAINT "ChatbotAlternativeFlows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotMessageActivations" (
    "id" SERIAL NOT NULL,
    "type" "TypeChatbotActivations" DEFAULT 'contains',
    "caseSensitive" BOOLEAN DEFAULT false,
    "chatbotId" INTEGER NOT NULL,

    CONSTRAINT "ChatbotMessageActivations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotMessageActivationValues" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "chatbotMessageActivationsId" INTEGER NOT NULL,

    CONSTRAINT "ChatbotMessageActivationValues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotMessageActivationsFail" (
    "id" SERIAL NOT NULL,
    "text" BOOLEAN DEFAULT true,
    "image" BOOLEAN DEFAULT false,
    "audio" BOOLEAN DEFAULT false,
    "chatbotId" INTEGER NOT NULL,

    CONSTRAINT "ChatbotMessageActivationsFail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactsWA" (
    "id" SERIAL NOT NULL,
    "img" VARCHAR(250) NOT NULL DEFAULT '',
    "completeNumber" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactsWA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactsWAOnAccount" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(150) NOT NULL,
    "accountId" INTEGER NOT NULL,
    "contactWAId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactsWAOnAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentsOnContact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contactAccountId" INTEGER NOT NULL,

    CONSTRAINT "DocumentsOnContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(150) NOT NULL,
    "accountId" INTEGER NOT NULL,
    "type" "TypeTag" NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagOnBusiness" (
    "id" SERIAL NOT NULL,
    "tagId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "TagOnBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagOnContactsWAOnAccount" (
    "id" SERIAL NOT NULL,
    "tagId" INTEGER NOT NULL,
    "contactsWAOnAccountId" INTEGER NOT NULL,

    CONSTRAINT "TagOnContactsWAOnAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variable" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "type" "TypeVariable" NOT NULL DEFAULT 'dynamics',
    "name" VARCHAR(150) NOT NULL,
    "value" TEXT,
    "accountId" INTEGER,

    CONSTRAINT "Variable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariableOnBusiness" (
    "id" SERIAL NOT NULL,
    "variableId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "VariableOnBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactsWAOnAccountVariable" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "contactsWAOnAccountId" INTEGER NOT NULL,
    "variableId" INTEGER NOT NULL,

    CONSTRAINT "ContactsWAOnAccountVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaticPaths" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "type" "TypeStaticPath" NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "StaticPaths_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RootUsers_id_email_hash_idx" ON "RootUsers"("id", "email", "hash");

-- CreateIndex
CREATE INDEX "RootConnectionWA_id_connectionWAId_idx" ON "RootConnectionWA"("id", "connectionWAId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_cpfCnpj_key" ON "Account"("cpfCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Account_contactWAId_key" ON "Account"("contactWAId");

-- CreateIndex
CREATE INDEX "Account_id_email_hash_status_available_isUsedFreeTrialTime_idx" ON "Account"("id", "email", "hash", "status", "available", "isUsedFreeTrialTime");

-- CreateIndex
CREATE INDEX "AccountAssetsUsed_id_idx" ON "AccountAssetsUsed"("id");

-- CreateIndex
CREATE INDEX "Business_id_accountId_idx" ON "Business"("id", "accountId");

-- CreateIndex
CREATE INDEX "ConnectionWA_id_name_type_number_idx" ON "ConnectionWA"("id", "name", "type", "number");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionConfig_connectionWAId_key" ON "ConnectionConfig"("connectionWAId");

-- CreateIndex
CREATE INDEX "ConnectionConfig_connectionWAId_idx" ON "ConnectionConfig"("connectionWAId");

-- CreateIndex
CREATE INDEX "TimesWork_id_chatbotId_idx" ON "TimesWork"("id", "chatbotId");

-- CreateIndex
CREATE UNIQUE INDEX "Chatbot_chatbotInactivityId_key" ON "Chatbot"("chatbotInactivityId");

-- CreateIndex
CREATE INDEX "Chatbot_name_accountId_businessId_status_idx" ON "Chatbot"("name", "accountId", "businessId", "status");

-- CreateIndex
CREATE INDEX "ChatbotInactivity_id_idx" ON "ChatbotInactivity"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotAlternativeFlows_chatbotId_key" ON "ChatbotAlternativeFlows"("chatbotId");

-- CreateIndex
CREATE INDEX "ChatbotAlternativeFlows_id_idx" ON "ChatbotAlternativeFlows"("id");

-- CreateIndex
CREATE INDEX "ChatbotMessageActivations_id_type_idx" ON "ChatbotMessageActivations"("id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotMessageActivationsFail_chatbotId_key" ON "ChatbotMessageActivationsFail"("chatbotId");

-- CreateIndex
CREATE INDEX "ChatbotMessageActivationsFail_id_idx" ON "ChatbotMessageActivationsFail"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContactsWA_completeNumber_key" ON "ContactsWA"("completeNumber");

-- CreateIndex
CREATE INDEX "ContactsWA_id_completeNumber_createAt_idx" ON "ContactsWA"("id", "completeNumber", "createAt");

-- CreateIndex
CREATE INDEX "ContactsWAOnAccount_id_contactWAId_createAt_idx" ON "ContactsWAOnAccount"("id", "contactWAId", "createAt");

-- CreateIndex
CREATE INDEX "DocumentsOnContact_id_name_contactAccountId_idx" ON "DocumentsOnContact"("id", "name", "contactAccountId");

-- CreateIndex
CREATE INDEX "Tag_name_type_accountId_idx" ON "Tag"("name", "type", "accountId");

-- CreateIndex
CREATE INDEX "TagOnBusiness_id_tagId_businessId_idx" ON "TagOnBusiness"("id", "tagId", "businessId");

-- CreateIndex
CREATE INDEX "TagOnContactsWAOnAccount_tagId_contactsWAOnAccountId_idx" ON "TagOnContactsWAOnAccount"("tagId", "contactsWAOnAccountId");

-- CreateIndex
CREATE INDEX "Variable_name_id_accountId_type_idx" ON "Variable"("name", "id", "accountId", "type");

-- CreateIndex
CREATE INDEX "VariableOnBusiness_variableId_businessId_idx" ON "VariableOnBusiness"("variableId", "businessId");

-- CreateIndex
CREATE INDEX "ContactsWAOnAccountVariable_value_variableId_contactsWAOnAc_idx" ON "ContactsWAOnAccountVariable"("value", "variableId", "contactsWAOnAccountId");

-- CreateIndex
CREATE INDEX "StaticPaths_name_id_idx" ON "StaticPaths"("name", "id");

-- AddForeignKey
ALTER TABLE "RootConnectionWA" ADD CONSTRAINT "RootConnectionWA_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_assetsUsedId_fkey" FOREIGN KEY ("assetsUsedId") REFERENCES "AccountAssetsUsed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_contactWAId_fkey" FOREIGN KEY ("contactWAId") REFERENCES "ContactsWA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionWA" ADD CONSTRAINT "ConnectionWA_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionConfig" ADD CONSTRAINT "ConnectionConfig_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesWork" ADD CONSTRAINT "TimesWork_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_contactsWAOnAccountId_fkey" FOREIGN KEY ("contactsWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_chatbotInactivityId_fkey" FOREIGN KEY ("chatbotInactivityId") REFERENCES "ChatbotInactivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotAlternativeFlows" ADD CONSTRAINT "ChatbotAlternativeFlows_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotMessageActivations" ADD CONSTRAINT "ChatbotMessageActivations_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotMessageActivationValues" ADD CONSTRAINT "ChatbotMessageActivationValues_chatbotMessageActivationsId_fkey" FOREIGN KEY ("chatbotMessageActivationsId") REFERENCES "ChatbotMessageActivations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotMessageActivationsFail" ADD CONSTRAINT "ChatbotMessageActivationsFail_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactsWAOnAccount" ADD CONSTRAINT "ContactsWAOnAccount_contactWAId_fkey" FOREIGN KEY ("contactWAId") REFERENCES "ContactsWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactsWAOnAccount" ADD CONSTRAINT "ContactsWAOnAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsOnContact" ADD CONSTRAINT "DocumentsOnContact_contactAccountId_fkey" FOREIGN KEY ("contactAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagOnBusiness" ADD CONSTRAINT "TagOnBusiness_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagOnBusiness" ADD CONSTRAINT "TagOnBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagOnContactsWAOnAccount" ADD CONSTRAINT "TagOnContactsWAOnAccount_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagOnContactsWAOnAccount" ADD CONSTRAINT "TagOnContactsWAOnAccount_contactsWAOnAccountId_fkey" FOREIGN KEY ("contactsWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variable" ADD CONSTRAINT "Variable_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariableOnBusiness" ADD CONSTRAINT "VariableOnBusiness_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "Variable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariableOnBusiness" ADD CONSTRAINT "VariableOnBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactsWAOnAccountVariable" ADD CONSTRAINT "ContactsWAOnAccountVariable_contactsWAOnAccountId_fkey" FOREIGN KEY ("contactsWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactsWAOnAccountVariable" ADD CONSTRAINT "ContactsWAOnAccountVariable_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "Variable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaticPaths" ADD CONSTRAINT "StaticPaths_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
