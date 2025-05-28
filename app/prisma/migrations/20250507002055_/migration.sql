/*
  Warnings:

  - You are about to drop the column `chatbotInactivityId` on the `Chatbot` table. All the data in the column will be lost.
  - You are about to drop the column `inputActivation` on the `Chatbot` table. All the data in the column will be lost.
  - You are about to drop the column `insertNewLeadsOnAudienceId` on the `Chatbot` table. All the data in the column will be lost.
  - You are about to drop the column `insertTagsLead` on the `Chatbot` table. All the data in the column will be lost.
  - You are about to drop the column `typeActivation` on the `Chatbot` table. All the data in the column will be lost.
  - You are about to drop the column `typeMessageWhatsApp` on the `Chatbot` table. All the data in the column will be lost.
  - You are about to drop the `ChatbotAlternativeFlows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatbotInactivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatbotMessageActivationValues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatbotMessageActivations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatbotMessageActivationsFail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimesWork` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeTime" AS ENUM ('seconds', 'minutes', 'hours', 'days');

-- DropForeignKey
ALTER TABLE "Chatbot" DROP CONSTRAINT "Chatbot_chatbotInactivityId_fkey";

-- DropForeignKey
ALTER TABLE "ChatbotAlternativeFlows" DROP CONSTRAINT "ChatbotAlternativeFlows_chatbotId_fkey";

-- DropForeignKey
ALTER TABLE "ChatbotMessageActivationValues" DROP CONSTRAINT "ChatbotMessageActivationValues_chatbotMessageActivationsId_fkey";

-- DropForeignKey
ALTER TABLE "ChatbotMessageActivations" DROP CONSTRAINT "ChatbotMessageActivations_chatbotId_fkey";

-- DropForeignKey
ALTER TABLE "ChatbotMessageActivationsFail" DROP CONSTRAINT "ChatbotMessageActivationsFail_chatbotId_fkey";

-- DropForeignKey
ALTER TABLE "TimesWork" DROP CONSTRAINT "TimesWork_chatbotId_fkey";

-- DropIndex
DROP INDEX "Chatbot_chatbotInactivityId_key";

-- AlterTable
ALTER TABLE "Chatbot" DROP COLUMN "chatbotInactivityId",
DROP COLUMN "inputActivation",
DROP COLUMN "insertNewLeadsOnAudienceId",
DROP COLUMN "insertTagsLead",
DROP COLUMN "typeActivation",
DROP COLUMN "typeMessageWhatsApp",
ADD COLUMN     "addLeadToAudiencesIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "addToLeadTagsIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- DropTable
DROP TABLE "ChatbotAlternativeFlows";

-- DropTable
DROP TABLE "ChatbotInactivity";

-- DropTable
DROP TABLE "ChatbotMessageActivationValues";

-- DropTable
DROP TABLE "ChatbotMessageActivations";

-- DropTable
DROP TABLE "ChatbotMessageActivationsFail";

-- DropTable
DROP TABLE "TimesWork";

-- DropEnum
DROP TYPE "TypeChatbotActivations";

-- CreateTable
CREATE TABLE "OperatingDays" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "chatbotId" INTEGER,

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
CREATE TABLE "TimeToRestartChatbot" (
    "chatbotId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "type" "TypeTime" NOT NULL,

    CONSTRAINT "TimeToRestartChatbot_pkey" PRIMARY KEY ("chatbotId")
);

-- CreateIndex
CREATE INDEX "OperatingDays_id_chatbotId_idx" ON "OperatingDays"("id", "chatbotId");

-- CreateIndex
CREATE INDEX "WorkingTimes_id_operatingDayId_idx" ON "WorkingTimes"("id", "operatingDayId");

-- CreateIndex
CREATE INDEX "TimeToRestartChatbot_chatbotId_idx" ON "TimeToRestartChatbot"("chatbotId");

-- AddForeignKey
ALTER TABLE "OperatingDays" ADD CONSTRAINT "OperatingDays_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingTimes" ADD CONSTRAINT "WorkingTimes_operatingDayId_fkey" FOREIGN KEY ("operatingDayId") REFERENCES "OperatingDays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeToRestartChatbot" ADD CONSTRAINT "TimeToRestartChatbot_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
