-- CreateEnum
CREATE TYPE "TypeProviderPayment" AS ENUM ('mercadopago');

-- CreateEnum
CREATE TYPE "TypeStatusOrder" AS ENUM ('draft', 'pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded', 'failed', 'on_way');

-- CreateEnum
CREATE TYPE "TypePriorityOrder" AS ENUM ('low', 'medium', 'high', 'urgent', 'critical');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('created', 'pending', 'approved', 'refused', 'refunded', 'cancelled');

-- CreateEnum
CREATE TYPE "TypeMethodCharge" AS ENUM ('pix');

-- CreateTable
CREATE TABLE "PaymentIntegrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "provider" "TypeProviderPayment" NOT NULL DEFAULT 'mercadopago',
    "status" BOOLEAN NOT NULL DEFAULT true,
    "access_token" VARCHAR(240) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "PaymentIntegrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" SERIAL NOT NULL,
    "n_order" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "TypeStatusOrder" NOT NULL DEFAULT 'draft',
    "priority" "TypePriorityOrder",
    "origin" VARCHAR(150),
    "delivery_address" TEXT,
    "tracking_code" VARCHAR(150),
    "itens_count" INTEGER DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "note" TEXT,
    "total" DECIMAL(10,2),
    "net_total" DECIMAL(10,2),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flowNodeId" TEXT,
    "flowStateId" INTEGER,
    "contactsWAOnAccountId" INTEGER,
    "accountId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charges" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "provider" "TypeProviderPayment" NOT NULL DEFAULT 'mercadopago',
    "transactionId" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "net_total" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'created',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "method_type" "TypeMethodCharge" NOT NULL,
    "content" TEXT,
    "metadata" JSONB,
    "flowNodeId" TEXT,
    "contactsWAOnAccountId" INTEGER,
    "businessId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "paymentIntegrationId" INTEGER,
    "orderId" INTEGER,
    "flowStateId" INTEGER,
    "inboxUserId" INTEGER,
    "ticketId" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentIntegrations_id_name_accountId_status_idx" ON "PaymentIntegrations"("id", "name", "accountId", "status");

-- CreateIndex
CREATE INDEX "Orders_id_name_accountId_idx" ON "Orders"("id", "name", "accountId");

-- CreateIndex
CREATE INDEX "Charges_provider_transactionId_ticketId_inboxUserId_status__idx" ON "Charges"("provider", "transactionId", "ticketId", "inboxUserId", "status", "deleted");

-- AddForeignKey
ALTER TABLE "PaymentIntegrations" ADD CONSTRAINT "PaymentIntegrations_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_flowStateId_fkey" FOREIGN KEY ("flowStateId") REFERENCES "FlowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_contactsWAOnAccountId_fkey" FOREIGN KEY ("contactsWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_contactsWAOnAccountId_fkey" FOREIGN KEY ("contactsWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_inboxUserId_fkey" FOREIGN KEY ("inboxUserId") REFERENCES "InboxUsers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_paymentIntegrationId_fkey" FOREIGN KEY ("paymentIntegrationId") REFERENCES "PaymentIntegrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_flowStateId_fkey" FOREIGN KEY ("flowStateId") REFERENCES "FlowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;
