-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'authorized';
ALTER TYPE "PaymentStatus" ADD VALUE 'in_process';
ALTER TYPE "PaymentStatus" ADD VALUE 'in_mediation';
ALTER TYPE "PaymentStatus" ADD VALUE 'rejected';
ALTER TYPE "PaymentStatus" ADD VALUE 'charged_back';

-- CreateTable
CREATE TABLE "ConnectionWAOnGroups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "jid" TEXT NOT NULL,
    "connectionWAId" INTEGER NOT NULL,

    CONSTRAINT "ConnectionWAOnGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogSystem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "accountId" INTEGER,
    "connectionWAId" INTEGER,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogSystem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConnectionWAOnGroups_name_connectionWAId_id_idx" ON "ConnectionWAOnGroups"("name", "connectionWAId", "id");

-- CreateIndex
CREATE INDEX "LogSystem_id_connectionWAId_accountId_idx" ON "LogSystem"("id", "connectionWAId", "accountId");

-- AddForeignKey
ALTER TABLE "ConnectionWAOnGroups" ADD CONSTRAINT "ConnectionWAOnGroups_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogSystem" ADD CONSTRAINT "LogSystem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogSystem" ADD CONSTRAINT "LogSystem_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;
