/*
  Warnings:

  - A unique constraint covering the columns `[connectionIgId]` on the table `AgentAI` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AgentAI" ADD COLUMN     "connectionIgId" INTEGER;

-- AlterTable
ALTER TABLE "Appointments" ADD COLUMN     "connectionIgId" INTEGER;

-- AlterTable
ALTER TABLE "Chatbot" ADD COLUMN     "connectionIgId" INTEGER;

-- AlterTable
ALTER TABLE "FlowState" ADD COLUMN     "connectionIgId" INTEGER;

-- AlterTable
ALTER TABLE "LogSystem" ADD COLUMN     "connectionIgId" INTEGER;

-- AlterTable
ALTER TABLE "MenusOnline" ADD COLUMN     "connectionIgId" INTEGER;

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "connectionIgId" INTEGER;

-- AlterTable
ALTER TABLE "Tickets" ADD COLUMN     "connectionIgId" INTEGER,
ALTER COLUMN "connectionWAId" DROP NOT NULL;

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
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "ConnectionIg_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConnectionIg_id_ig_username_idx" ON "ConnectionIg"("id", "ig_username");

-- CreateIndex
CREATE UNIQUE INDEX "AgentAI_connectionIgId_key" ON "AgentAI"("connectionIgId");

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionIg" ADD CONSTRAINT "ConnectionIg_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAI" ADD CONSTRAINT "AgentAI_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogSystem" ADD CONSTRAINT "LogSystem_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenusOnline" ADD CONSTRAINT "MenusOnline_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_connectionIgId_fkey" FOREIGN KEY ("connectionIgId") REFERENCES "ConnectionIg"("id") ON DELETE CASCADE ON UPDATE CASCADE;
