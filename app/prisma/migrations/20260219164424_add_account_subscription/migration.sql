/*
  Warnings:

  - You are about to drop the column `customerId` on the `Account` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeSubscriptionStatus" AS ENUM ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid');

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "customerId";

-- CreateTable
CREATE TABLE "AccountSubscription" (
    "customerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" "TypeSubscriptionStatus",
    "cardFingerprint" TEXT,
    "accountId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountSubscription_customerId_key" ON "AccountSubscription"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountSubscription_accountId_key" ON "AccountSubscription"("accountId");

-- CreateIndex
CREATE INDEX "AccountSubscription_subscriptionStatus_cardFingerprint_idx" ON "AccountSubscription"("subscriptionStatus", "cardFingerprint");

-- AddForeignKey
ALTER TABLE "AccountSubscription" ADD CONSTRAINT "AccountSubscription_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
