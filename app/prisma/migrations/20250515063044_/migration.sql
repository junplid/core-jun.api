/*
  Warnings:

  - You are about to drop the column `type` on the `FlowState` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountLogDateType" AS ENUM ('CONVERSATIONS_STARTED_BOT', 'NEW_CONTACT');

-- CreateEnum
CREATE TYPE "GeralLogDateType" AS ENUM ('NEW_ACCOUNT', 'NEW_CONTACT');

-- AlterTable
ALTER TABLE "FlowState" DROP COLUMN "type";

-- CreateTable
CREATE TABLE "AccountLogDate" (
    "id" SERIAL NOT NULL,
    "type" "AccountLogDateType" NOT NULL,
    "accountId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountLogDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeralLogDate" (
    "id" SERIAL NOT NULL,
    "type" "GeralLogDateType" NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeralLogDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountLogDate_accountId_createAt_type_idx" ON "AccountLogDate"("accountId", "createAt", "type");

-- CreateIndex
CREATE INDEX "GeralLogDate_createAt_type_idx" ON "GeralLogDate"("createAt", "type");

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountLogDate" ADD CONSTRAINT "AccountLogDate_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
