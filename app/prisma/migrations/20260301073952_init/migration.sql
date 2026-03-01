-- CreateEnum
CREATE TYPE "TypeStatusTicket" AS ENUM ('NEW', 'OPEN', 'RESOLVED', 'DELETED');

-- CreateEnum
CREATE TYPE "TypeDestinationTicket" AS ENUM ('department', 'user');

-- CreateEnum
CREATE TYPE "TypeSentBy" AS ENUM ('bot', 'contact', 'user', 'system');

-- CreateEnum
CREATE TYPE "TypeStatusMessage" AS ENUM ('SENT', 'DELIVERED');

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
CREATE TYPE "TypeAudience" AS ENUM ('ondemand', 'static', 'interactions', 'import');

-- CreateEnum
CREATE TYPE "TypeFlowState" AS ENUM ('campaign', 'chatbot');

-- CreateEnum
CREATE TYPE "TypeStatusCampaign" AS ENUM ('stopped', 'processing', 'paused', 'running', 'finished');

-- CreateEnum
CREATE TYPE "TypeActivation" AS ENUM ('message', 'qrcode', 'link');

-- CreateEnum
CREATE TYPE "TypeMessageWhatsApp" AS ENUM ('textDetermined', 'anyMessage');

-- CreateEnum
CREATE TYPE "TypeTime" AS ENUM ('seconds', 'minutes', 'hours', 'days');

-- CreateEnum
CREATE TYPE "TypeChatbotInactivity" AS ENUM ('seconds', 'minutes', 'hours', 'days');

-- CreateEnum
CREATE TYPE "TypeContact" AS ENUM ('instagram', 'whatsapp', 'messenger');

-- CreateEnum
CREATE TYPE "TypeVariable" AS ENUM ('dynamics', 'constant', 'system');

-- CreateEnum
CREATE TYPE "TypeTag" AS ENUM ('contactwa', 'audience');

-- CreateEnum
CREATE TYPE "AccountLogDateType" AS ENUM ('CONVERSATIONS_STARTED_BOT', 'NEW_CONTACT');

-- CreateEnum
CREATE TYPE "GeralLogDateType" AS ENUM ('TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');

-- CreateEnum
CREATE TYPE "TypeProviderCredential" AS ENUM ('openai');

-- CreateEnum
CREATE TYPE "TypeEmojiLevel" AS ENUM ('none', 'low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "TypeServiceTier" AS ENUM ('default', 'flex', 'auto', 'scale', 'priority');

-- CreateEnum
CREATE TYPE "TypeProviderPayment" AS ENUM ('mercadopago', 'itau');

-- CreateEnum
CREATE TYPE "TypeStatusOrder" AS ENUM ('draft', 'pending', 'processing', 'confirmed', 'completed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded', 'failed', 'on_way', 'ready');

-- CreateEnum
CREATE TYPE "TypePriorityOrder" AS ENUM ('low', 'medium', 'high', 'urgent', 'critical');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('created', 'pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'charged_back', 'refunded', 'refused', 'cancelled');

-- CreateEnum
CREATE TYPE "TypeMethodCharge" AS ENUM ('pix');

-- CreateEnum
CREATE TYPE "TypeCategory" AS ENUM ('pizzas', 'drinks');

-- CreateEnum
CREATE TYPE "TypeChannelsNotification" AS ENUM ('websocket', 'push', 'email', 'wa');

-- CreateEnum
CREATE TYPE "TypeStatusChannelsNotification" AS ENUM ('unread', 'read');

-- CreateEnum
CREATE TYPE "TypeCreateByAppointments" AS ENUM ('human', 'bot');

-- CreateEnum
CREATE TYPE "StatusAppointments" AS ENUM ('suggested', 'pending_confirmation', 'confirmed', 'canceled', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "StatusAppointmentReminders" AS ENUM ('pending', 'sent', 'failed', 'canceled');

-- CreateEnum
CREATE TYPE "StatusFollowUp" AS ENUM ('pending', 'sent', 'failed', 'canceled');

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
    "hash" TEXT NOT NULL,
    "isUsedFreeTrialTime" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50),
    "cpfCnpjEncrypted" TEXT,
    "cpfCnpjHash" TEXT,
    "emailEncrypted" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "isPremium" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "customerId" TEXT,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "assetsUsedId" INTEGER NOT NULL,
    "contactWAId" INTEGER NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxUsers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "hash" TEXT NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "password" TEXT NOT NULL,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "inboxDepartmentId" INTEGER,

    CONSTRAINT "InboxUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxDepartments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "signBusiness" BOOLEAN NOT NULL DEFAULT false,
    "signDepartment" BOOLEAN NOT NULL DEFAULT false,
    "signUser" BOOLEAN NOT NULL DEFAULT false,
    "previewNumber" BOOLEAN NOT NULL DEFAULT true,
    "previewPhoto" BOOLEAN NOT NULL DEFAULT true,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "InboxDepartments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tickets" (
    "id" SERIAL NOT NULL,
    "protocol" TEXT NOT NULL,
    "status" "TypeStatusTicket" NOT NULL DEFAULT 'NEW',
    "destination" "TypeDestinationTicket" NOT NULL,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "goBackFlowStateId" INTEGER,
    "inboxUserId" INTEGER,
    "inboxDepartmentId" INTEGER NOT NULL,
    "contactWAOnAccountId" INTEGER NOT NULL,
    "connectionWAId" INTEGER,
    "connectionIgId" INTEGER,

    CONSTRAINT "Tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "by" "TypeSentBy" NOT NULL,
    "latitude" TEXT NOT NULL DEFAULT '',
    "longitude" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "fullName" TEXT NOT NULL DEFAULT '',
    "number" TEXT NOT NULL DEFAULT '',
    "org" TEXT NOT NULL DEFAULT '',
    "fileNameOriginal" TEXT NOT NULL DEFAULT '',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "ptt" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "fileName" TEXT NOT NULL DEFAULT '',
    "messageKey" TEXT,
    "status" "TypeStatusMessage" NOT NULL DEFAULT 'SENT',
    "flowStateId" INTEGER,
    "inboxUserId" INTEGER,
    "ticketsId" INTEGER,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
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
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionWA" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "type" "TypeConnetion" NOT NULL,
    "countShots" INTEGER NOT NULL DEFAULT 0,
    "number" TEXT,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "ConnectionWA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionIg" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "page_id" TEXT NOT NULL,
    "page_name" TEXT NOT NULL,
    "ig_username" TEXT NOT NULL,
    "ig_id" TEXT NOT NULL,
    "ig_picture" TEXT,
    "credentials" TEXT NOT NULL,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "ConnectionIg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionWAOnGroups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "jid" TEXT NOT NULL,
    "connectionWAId" INTEGER NOT NULL,

    CONSTRAINT "ConnectionWAOnGroups_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "OperatingDays" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "chatbotId" INTEGER,
    "campaignId" INTEGER,

    CONSTRAINT "OperatingDays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingTimes" (
    "id" SERIAL NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "operatingDayId" INTEGER NOT NULL,

    CONSTRAINT "WorkingTimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audience" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(150) NOT NULL,
    "type" "TypeAudience" NOT NULL,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "Audience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactsWAOnAudience" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
CREATE TABLE "FlowState" (
    "id" SERIAL NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "firedOnDate" TIMESTAMPTZ,
    "isFinish" BOOLEAN DEFAULT false,
    "finishedAt" TIMESTAMPTZ,
    "indexNode" TEXT,
    "agentId" INTEGER,
    "fbc" TEXT,
    "fbp" TEXT,
    "ua" TEXT,
    "expires_at" TIMESTAMPTZ,
    "ip" TEXT,
    "flowId" TEXT,
    "previous_response_id" TEXT,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "fallbackSent" BOOLEAN NOT NULL DEFAULT false,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" INTEGER,
    "contactsWAOnAccountId" INTEGER,
    "connectionWAId" INTEGER,
    "connectionIgId" INTEGER,
    "audienceId" INTEGER,
    "chatbotId" INTEGER,

    CONSTRAINT "FlowState_pkey" PRIMARY KEY ("id")
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
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "shootingSpeedId" INTEGER NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeToRestartChatbot" (
    "chatbotId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "type" "TypeTime" NOT NULL,

    CONSTRAINT "TimeToRestartChatbot_pkey" PRIMARY KEY ("chatbotId")
);

-- CreateTable
CREATE TABLE "Chatbot" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "cbj" TEXT NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "status" BOOLEAN DEFAULT false,
    "description" TEXT,
    "connectionWAId" INTEGER,
    "leadOriginList" TEXT,
    "destLink" TEXT,
    "fallback" TEXT,
    "flowId" TEXT NOT NULL,
    "addLeadToAudiencesIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "addToLeadTagsIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "trigger" VARCHAR(160),
    "flowBId" TEXT,
    "connectionIgId" INTEGER,
    "businessId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chatbot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactsWA" (
    "id" SERIAL NOT NULL,
    "img" VARCHAR(250) NOT NULL DEFAULT '',
    "completeNumber" TEXT NOT NULL,
    "page_id" TEXT,
    "name" VARCHAR(255),
    "username" VARCHAR(150),
    "channel" "TypeContact" NOT NULL DEFAULT 'whatsapp',
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactsWA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactsWAOnAccount" (
    "id" SERIAL NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(150) NOT NULL,
    "accountId" INTEGER NOT NULL,
    "contactWAId" INTEGER NOT NULL,
    "last_interaction" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
CREATE TABLE "StoragePaths" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "attachment_id" TEXT,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "mimetype" TEXT,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "StoragePaths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoragePathsOnBusiness" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "storagePathId" INTEGER NOT NULL,

    CONSTRAINT "StoragePathsOnBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShootingSpeed" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "timeBetweenShots" INTEGER NOT NULL,
    "timeRest" INTEGER NOT NULL,
    "numberShots" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ShootingSpeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FbPixel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pixel_id" TEXT NOT NULL,
    "access_token" VARCHAR(240) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "businessId" INTEGER,

    CONSTRAINT "FbPixel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountLogDate" (
    "id" SERIAL NOT NULL,
    "type" "AccountLogDateType" NOT NULL,
    "accountId" INTEGER NOT NULL,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountLogDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeralLogDate" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "type" "GeralLogDateType" NOT NULL,
    "entity" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeralLogDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderCredential" (
    "id" SERIAL NOT NULL,
    "provider" "TypeProviderCredential" NOT NULL,
    "label" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAI" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "service_tier" "TypeServiceTier" NOT NULL DEFAULT 'default',
    "personality" TEXT,
    "vectorStoreId" TEXT,
    "knowledgeBase" TEXT,
    "instructions" TEXT,
    "timeout" INTEGER NOT NULL DEFAULT 900,
    "debounce" INTEGER NOT NULL DEFAULT 9,
    "emojiLevel" "TypeEmojiLevel" NOT NULL DEFAULT 'none',
    "language" TEXT NOT NULL DEFAULT 'PT-BR',
    "model" TEXT NOT NULL,
    "modelTranscription" TEXT,
    "temperature" DECIMAL(2,1) NOT NULL DEFAULT 0.1,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "connectionWAId" INTEGER,
    "connectionIgId" INTEGER,
    "chatbotId" INTEGER,
    "providerCredentialId" INTEGER NOT NULL,

    CONSTRAINT "AgentAI_pkey" PRIMARY KEY ("id")
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
    "fileId" TEXT,
    "agentAIId" INTEGER NOT NULL,
    "storagePathId" INTEGER NOT NULL,

    CONSTRAINT "StoragePathOnAgentAI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIntegrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "provider" "TypeProviderPayment" NOT NULL DEFAULT 'mercadopago',
    "status" BOOLEAN NOT NULL DEFAULT true,
    "credentials" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "PaymentIntegrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PixKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "webhookRegisteredAt" TIMESTAMPTZ,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentIntegrationId" INTEGER NOT NULL,

    CONSTRAINT "PixKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrelloIntegration" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "key" VARCHAR(240) NOT NULL,
    "token" VARCHAR(240) NOT NULL,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "TrelloIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" SERIAL NOT NULL,
    "n_order" TEXT NOT NULL,
    "name" VARCHAR(150),
    "description" TEXT,
    "payment_method" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "TypeStatusOrder" NOT NULL DEFAULT 'draft',
    "isDragDisabled" BOOLEAN NOT NULL DEFAULT false,
    "priority" "TypePriorityOrder",
    "origin" VARCHAR(150),
    "delivery_address" TEXT,
    "delivery_complement" TEXT,
    "delivery_cep" TEXT,
    "who_receives" TEXT,
    "rank" DECIMAL(20,10) NOT NULL,
    "tracking_code" VARCHAR(150),
    "delivery_code" VARCHAR(12),
    "itens_count" INTEGER DEFAULT 0,
    "completedAt" TIMESTAMPTZ,
    "data" TEXT,
    "total" DECIMAL(10,2),
    "net_total" DECIMAL(10,2),
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectionWAId" INTEGER,
    "actionChannels" TEXT[],
    "flowNodeId" TEXT,
    "flowId" TEXT,
    "menuId" INTEGER,
    "flowStateId" INTEGER,
    "contactsWAOnAccountId" INTEGER,
    "accountId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "connectionIgId" INTEGER,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charges" (
    "id" SERIAL NOT NULL,
    "txid" TEXT,
    "provider" "TypeProviderPayment" NOT NULL DEFAULT 'mercadopago',
    "total" DECIMAL(10,2) NOT NULL,
    "net_total" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'created',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "method_type" "TypeMethodCharge" NOT NULL,
    "pix_link" TEXT,
    "pix_emv" TEXT,
    "expires_at" TIMESTAMPTZ,
    "paid_at" TIMESTAMPTZ,
    "e2e_id" TEXT,
    "content" TEXT,
    "metadata" JSONB,
    "flowNodeId" TEXT,
    "contactsWAOnAccountId" INTEGER,
    "businessId" INTEGER,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "paymentIntegrationId" INTEGER,
    "orderId" INTEGER,
    "pixKeyId" INTEGER,
    "flowStateId" INTEGER,
    "inboxUserId" INTEGER,
    "ticketId" INTEGER,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogSystem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "accountId" INTEGER,
    "connectionWAId" INTEGER,
    "connectionIgId" INTEGER,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenusOnline" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "logoImg" TEXT NOT NULL,
    "desc" TEXT,
    "bg_primary" TEXT,
    "bg_secondary" TEXT,
    "bg_tertiary" TEXT,
    "logoLabel" TEXT,
    "titlePage" TEXT,
    "status" BOOLEAN DEFAULT false,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "connectionWAId" INTEGER NOT NULL,
    "connectionIgId" INTEGER,

    CONSTRAINT "MenusOnline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizesPizza" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(6,2) NOT NULL,
    "flavors" INTEGER NOT NULL,
    "slices" INTEGER,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menuId" INTEGER NOT NULL,

    CONSTRAINT "SizesPizza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenusOnlineItems" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "category" "TypeCategory" NOT NULL,
    "img" TEXT NOT NULL,
    "qnt" INTEGER NOT NULL DEFAULT 0,
    "beforePrice" DECIMAL(6,2),
    "afterPrice" DECIMAL(6,2),
    "accountId" INTEGER,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menuId" INTEGER NOT NULL,

    CONSTRAINT "MenusOnlineItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "title_txt" TEXT NOT NULL,
    "body_txt" TEXT NOT NULL,
    "title_html" TEXT,
    "body_html" TEXT,
    "channels" "TypeChannelsNotification"[],
    "toast_position" TEXT,
    "toast_duration" INTEGER,
    "status" "TypeStatusChannelsNotification" NOT NULL DEFAULT 'unread',
    "url_redirect" TEXT,
    "readAt" TIMESTAMPTZ,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushTokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "PushTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointments" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT,
    "n_appointment" TEXT NOT NULL,
    "status" "StatusAppointments" NOT NULL,
    "startAt" TIMESTAMPTZ NOT NULL,
    "endAt" TIMESTAMPTZ NOT NULL,
    "createdBy" "TypeCreateByAppointments" NOT NULL DEFAULT 'bot',
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "actionChannels" TEXT[],
    "flowNodeId" TEXT,
    "flowId" TEXT,
    "flowStateId" INTEGER,
    "contactsWAOnAccountId" INTEGER,
    "connectionWAId" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "connectionIgId" INTEGER,

    CONSTRAINT "Appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentReminders" (
    "id" SERIAL NOT NULL,
    "notify_at" TIMESTAMPTZ NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusAppointmentReminders" NOT NULL DEFAULT 'pending',
    "moment" TEXT NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentReminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "notify_at" TIMESTAMPTZ NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusAppointmentReminders" NOT NULL DEFAULT 'pending',
    "flowNodeId" TEXT NOT NULL,
    "flowStateId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

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
    "templateId" INTEGER NOT NULL,

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
    "chat_demo" JSONB NOT NULL,
    "script_runner" TEXT NOT NULL,
    "script_build_agentai_for_test" TEXT NOT NULL,
    "variables" TEXT[],
    "tags" TEXT[],
    "created_by" TEXT NOT NULL,
    "updateAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RootUsers_id_email_hash_idx" ON "RootUsers"("id", "email", "hash");

-- CreateIndex
CREATE INDEX "RootConnectionWA_id_connectionWAId_idx" ON "RootConnectionWA"("id", "connectionWAId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_hash_key" ON "Account"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Account_cpfCnpjEncrypted_key" ON "Account"("cpfCnpjEncrypted");

-- CreateIndex
CREATE UNIQUE INDEX "Account_cpfCnpjHash_key" ON "Account"("cpfCnpjHash");

-- CreateIndex
CREATE UNIQUE INDEX "Account_emailEncrypted_key" ON "Account"("emailEncrypted");

-- CreateIndex
CREATE UNIQUE INDEX "Account_emailHash_key" ON "Account"("emailHash");

-- CreateIndex
CREATE UNIQUE INDEX "Account_contactWAId_key" ON "Account"("contactWAId");

-- CreateIndex
CREATE INDEX "Account_id_emailHash_hash_cpfCnpjHash_status_available_isUs_idx" ON "Account"("id", "emailHash", "hash", "cpfCnpjHash", "status", "available", "isUsedFreeTrialTime");

-- CreateIndex
CREATE UNIQUE INDEX "InboxUsers_email_key" ON "InboxUsers"("email");

-- CreateIndex
CREATE INDEX "InboxUsers_id_email_accountId_inboxDepartmentId_idx" ON "InboxUsers"("id", "email", "accountId", "inboxDepartmentId");

-- CreateIndex
CREATE INDEX "InboxDepartments_id_name_businessId_accountId_idx" ON "InboxDepartments"("id", "name", "businessId", "accountId");

-- CreateIndex
CREATE INDEX "Tickets_id_protocol_contactWAOnAccountId_status_destination_idx" ON "Tickets"("id", "protocol", "contactWAOnAccountId", "status", "destination", "inboxDepartmentId", "inboxUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Messages_messageKey_key" ON "Messages"("messageKey");

-- CreateIndex
CREATE INDEX "Messages_id_inboxUserId_ticketsId_flowStateId_messageKey_by_idx" ON "Messages"("id", "inboxUserId", "ticketsId", "flowStateId", "messageKey", "by", "read");

-- CreateIndex
CREATE INDEX "AccountAssetsUsed_id_idx" ON "AccountAssetsUsed"("id");

-- CreateIndex
CREATE INDEX "Business_id_accountId_idx" ON "Business"("id", "accountId");

-- CreateIndex
CREATE INDEX "ConnectionWA_id_name_type_number_idx" ON "ConnectionWA"("id", "name", "type", "number");

-- CreateIndex
CREATE INDEX "ConnectionIg_id_ig_username_idx" ON "ConnectionIg"("id", "ig_username");

-- CreateIndex
CREATE INDEX "ConnectionWAOnGroups_name_connectionWAId_id_idx" ON "ConnectionWAOnGroups"("name", "connectionWAId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionConfig_connectionWAId_key" ON "ConnectionConfig"("connectionWAId");

-- CreateIndex
CREATE INDEX "ConnectionConfig_connectionWAId_idx" ON "ConnectionConfig"("connectionWAId");

-- CreateIndex
CREATE INDEX "OperatingDays_id_chatbotId_campaignId_idx" ON "OperatingDays"("id", "chatbotId", "campaignId");

-- CreateIndex
CREATE INDEX "WorkingTimes_id_operatingDayId_idx" ON "WorkingTimes"("id", "operatingDayId");

-- CreateIndex
CREATE INDEX "Audience_id_type_name_accountId_idx" ON "Audience"("id", "type", "name", "accountId");

-- CreateIndex
CREATE INDEX "ContactsWAOnAudience_contactWAOnAccountId_audienceId_idx" ON "ContactsWAOnAudience"("contactWAOnAccountId", "audienceId");

-- CreateIndex
CREATE INDEX "AudienceOnCampaign_campaignId_audienceId_idx" ON "AudienceOnCampaign"("campaignId", "audienceId");

-- CreateIndex
CREATE INDEX "FlowState_createAt_finishedAt_idx" ON "FlowState"("createAt", "finishedAt");

-- CreateIndex
CREATE INDEX "ConnectionOnCampaign_campaignId_connectionWAId_idx" ON "ConnectionOnCampaign"("campaignId", "connectionWAId");

-- CreateIndex
CREATE INDEX "CampaignOnBusiness_id_businessId_campaignId_idx" ON "CampaignOnBusiness"("id", "businessId", "campaignId");

-- CreateIndex
CREATE INDEX "HasTag_Campaign_campaignId_idx" ON "HasTag_Campaign"("campaignId");

-- CreateIndex
CREATE INDEX "Campaign_name_accountId_flowId_createAt_status_idx" ON "Campaign"("name", "accountId", "flowId", "createAt", "status");

-- CreateIndex
CREATE INDEX "TimeToRestartChatbot_chatbotId_idx" ON "TimeToRestartChatbot"("chatbotId");

-- CreateIndex
CREATE INDEX "Chatbot_name_accountId_businessId_status_idx" ON "Chatbot"("name", "accountId", "businessId", "status");

-- CreateIndex
CREATE INDEX "ContactsWA_id_completeNumber_createAt_idx" ON "ContactsWA"("id", "completeNumber", "createAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContactsWA_completeNumber_page_id_channel_key" ON "ContactsWA"("completeNumber", "page_id", "channel");

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
CREATE INDEX "StoragePaths_name_id_idx" ON "StoragePaths"("name", "id");

-- CreateIndex
CREATE INDEX "StoragePathsOnBusiness_businessId_storagePathId_idx" ON "StoragePathsOnBusiness"("businessId", "storagePathId");

-- CreateIndex
CREATE INDEX "ShootingSpeed_id_name_status_idx" ON "ShootingSpeed"("id", "name", "status");

-- CreateIndex
CREATE INDEX "FbPixel_id_name_pixel_id_businessId_accountId_idx" ON "FbPixel"("id", "name", "pixel_id", "businessId", "accountId");

-- CreateIndex
CREATE INDEX "AccountLogDate_accountId_createAt_type_idx" ON "AccountLogDate"("accountId", "createAt", "type");

-- CreateIndex
CREATE INDEX "GeralLogDate_createAt_type_idx" ON "GeralLogDate"("createAt", "type");

-- CreateIndex
CREATE INDEX "ProviderCredential_createAt_label_accountId_provider_idx" ON "ProviderCredential"("createAt", "label", "accountId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderCredential_label_accountId_provider_key" ON "ProviderCredential"("label", "accountId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "AgentAI_connectionWAId_key" ON "AgentAI"("connectionWAId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentAI_connectionIgId_key" ON "AgentAI"("connectionIgId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentAI_chatbotId_key" ON "AgentAI"("chatbotId");

-- CreateIndex
CREATE INDEX "AgentAI_id_name_accountId_idx" ON "AgentAI"("id", "name", "accountId");

-- CreateIndex
CREATE INDEX "AgentAIOnBusiness_businessId_agentId_idx" ON "AgentAIOnBusiness"("businessId", "agentId");

-- CreateIndex
CREATE INDEX "StoragePathOnAgentAI_agentAIId_storagePathId_idx" ON "StoragePathOnAgentAI"("agentAIId", "storagePathId");

-- CreateIndex
CREATE INDEX "PaymentIntegrations_id_name_accountId_status_idx" ON "PaymentIntegrations"("id", "name", "accountId", "status");

-- CreateIndex
CREATE INDEX "PixKey_id_paymentIntegrationId_idx" ON "PixKey"("id", "paymentIntegrationId");

-- CreateIndex
CREATE INDEX "TrelloIntegration_id_name_accountId_status_idx" ON "TrelloIntegration"("id", "name", "accountId", "status");

-- CreateIndex
CREATE INDEX "Orders_id_name_accountId_idx" ON "Orders"("id", "name", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Charges_txid_key" ON "Charges"("txid");

-- CreateIndex
CREATE INDEX "Charges_provider_txid_paid_at_ticketId_inboxUserId_status_d_idx" ON "Charges"("provider", "txid", "paid_at", "ticketId", "inboxUserId", "status", "deleted");

-- CreateIndex
CREATE INDEX "LogSystem_id_connectionWAId_accountId_idx" ON "LogSystem"("id", "connectionWAId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "MenusOnline_uuid_key" ON "MenusOnline"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "MenusOnline_identifier_key" ON "MenusOnline"("identifier");

-- CreateIndex
CREATE INDEX "MenusOnline_id_uuid_accountId_idx" ON "MenusOnline"("id", "uuid", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "SizesPizza_uuid_key" ON "SizesPizza"("uuid");

-- CreateIndex
CREATE INDEX "SizesPizza_id_menuId_idx" ON "SizesPizza"("id", "menuId");

-- CreateIndex
CREATE UNIQUE INDEX "MenusOnlineItems_uuid_key" ON "MenusOnlineItems"("uuid");

-- CreateIndex
CREATE INDEX "MenusOnlineItems_uuid_menuId_accountId_idx" ON "MenusOnlineItems"("uuid", "menuId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PushTokens_token_key" ON "PushTokens"("token");

-- CreateIndex
CREATE INDEX "FollowUp_code_flowStateId_idx" ON "FollowUp"("code", "flowStateId");

-- CreateIndex
CREATE INDEX "AgentTemplateInputsSection_name_idx" ON "AgentTemplateInputsSection"("name");

-- CreateIndex
CREATE INDEX "AgentTemplates_count_usage_createAt_idx" ON "AgentTemplates"("count_usage", "createAt");

-- AddForeignKey
ALTER TABLE "RootConnectionWA" ADD CONSTRAINT "RootConnectionWA_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_assetsUsedId_fkey" FOREIGN KEY ("assetsUsedId") REFERENCES "AccountAssetsUsed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_contactWAId_fkey" FOREIGN KEY ("contactWAId") REFERENCES "ContactsWA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxUsers" ADD CONSTRAINT "InboxUsers_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxUsers" ADD CONSTRAINT "InboxUsers_inboxDepartmentId_fkey" FOREIGN KEY ("inboxDepartmentId") REFERENCES "InboxDepartments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxDepartments" ADD CONSTRAINT "InboxDepartments_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxDepartments" ADD CONSTRAINT "InboxDepartments_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_goBackFlowStateId_fkey" FOREIGN KEY ("goBackFlowStateId") REFERENCES "FlowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_inboxUserId_fkey" FOREIGN KEY ("inboxUserId") REFERENCES "InboxUsers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_inboxDepartmentId_fkey" FOREIGN KEY ("inboxDepartmentId") REFERENCES "InboxDepartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_contactWAOnAccountId_fkey" FOREIGN KEY ("contactWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_flowStateId_fkey" FOREIGN KEY ("flowStateId") REFERENCES "FlowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_inboxUserId_fkey" FOREIGN KEY ("inboxUserId") REFERENCES "InboxUsers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_ticketsId_fkey" FOREIGN KEY ("ticketsId") REFERENCES "Tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionWA" ADD CONSTRAINT "ConnectionWA_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionIg" ADD CONSTRAINT "ConnectionIg_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionWAOnGroups" ADD CONSTRAINT "ConnectionWAOnGroups_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionConfig" ADD CONSTRAINT "ConnectionConfig_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatingDays" ADD CONSTRAINT "OperatingDays_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatingDays" ADD CONSTRAINT "OperatingDays_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingTimes" ADD CONSTRAINT "WorkingTimes_operatingDayId_fkey" FOREIGN KEY ("operatingDayId") REFERENCES "OperatingDays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_contactsWAOnAccountId_fkey" FOREIGN KEY ("contactsWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE SET NULL ON UPDATE SET NULL;

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

-- AddForeignKey
ALTER TABLE "TimeToRestartChatbot" ADD CONSTRAINT "TimeToRestartChatbot_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "StoragePaths" ADD CONSTRAINT "StoragePaths_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoragePathsOnBusiness" ADD CONSTRAINT "StoragePathsOnBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoragePathsOnBusiness" ADD CONSTRAINT "StoragePathsOnBusiness_storagePathId_fkey" FOREIGN KEY ("storagePathId") REFERENCES "StoragePaths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FbPixel" ADD CONSTRAINT "FbPixel_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FbPixel" ADD CONSTRAINT "FbPixel_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountLogDate" ADD CONSTRAINT "AccountLogDate_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderCredential" ADD CONSTRAINT "ProviderCredential_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_providerCredentialId_fkey" FOREIGN KEY ("providerCredentialId") REFERENCES "ProviderCredential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAIOnBusiness" ADD CONSTRAINT "AgentAIOnBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAIOnBusiness" ADD CONSTRAINT "AgentAIOnBusiness_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentAI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoragePathOnAgentAI" ADD CONSTRAINT "StoragePathOnAgentAI_agentAIId_fkey" FOREIGN KEY ("agentAIId") REFERENCES "AgentAI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoragePathOnAgentAI" ADD CONSTRAINT "StoragePathOnAgentAI_storagePathId_fkey" FOREIGN KEY ("storagePathId") REFERENCES "StoragePaths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntegrations" ADD CONSTRAINT "PaymentIntegrations_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PixKey" ADD CONSTRAINT "PixKey_paymentIntegrationId_fkey" FOREIGN KEY ("paymentIntegrationId") REFERENCES "PaymentIntegrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrelloIntegration" ADD CONSTRAINT "TrelloIntegration_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenusOnline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_flowStateId_fkey" FOREIGN KEY ("flowStateId") REFERENCES "FlowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_contactsWAOnAccountId_fkey" FOREIGN KEY ("contactsWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_contactsWAOnAccountId_fkey" FOREIGN KEY ("contactsWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_inboxUserId_fkey" FOREIGN KEY ("inboxUserId") REFERENCES "InboxUsers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_paymentIntegrationId_fkey" FOREIGN KEY ("paymentIntegrationId") REFERENCES "PaymentIntegrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_flowStateId_fkey" FOREIGN KEY ("flowStateId") REFERENCES "FlowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_pixKeyId_fkey" FOREIGN KEY ("pixKeyId") REFERENCES "PixKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogSystem" ADD CONSTRAINT "LogSystem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogSystem" ADD CONSTRAINT "LogSystem_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogSystem" ADD CONSTRAINT "LogSystem_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenusOnline" ADD CONSTRAINT "MenusOnline_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenusOnline" ADD CONSTRAINT "MenusOnline_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenusOnline" ADD CONSTRAINT "MenusOnline_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizesPizza" ADD CONSTRAINT "SizesPizza_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenusOnline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenusOnlineItems" ADD CONSTRAINT "MenusOnlineItems_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenusOnline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenusOnlineItems" ADD CONSTRAINT "MenusOnlineItems_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushTokens" ADD CONSTRAINT "PushTokens_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_flowStateId_fkey" FOREIGN KEY ("flowStateId") REFERENCES "FlowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_contactsWAOnAccountId_fkey" FOREIGN KEY ("contactsWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReminders" ADD CONSTRAINT "AppointmentReminders_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_flowStateId_fkey" FOREIGN KEY ("flowStateId") REFERENCES "FlowState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTemplateInputsSection" ADD CONSTRAINT "AgentTemplateInputsSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AgentTemplates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
