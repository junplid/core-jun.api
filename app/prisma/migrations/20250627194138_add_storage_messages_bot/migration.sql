/*
  Warnings:

  - You are about to drop the `TicketMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "TypeSentBy" ADD VALUE 'bot';

-- DropForeignKey
ALTER TABLE "TicketMessage" DROP CONSTRAINT "TicketMessage_inboxUserId_fkey";

-- DropForeignKey
ALTER TABLE "TicketMessage" DROP CONSTRAINT "TicketMessage_ticketsId_fkey";

-- DropTable
DROP TABLE "TicketMessage";

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
    "flowStateId" INTEGER,
    "inboxUserId" INTEGER,
    "ticketsId" INTEGER,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Messages_id_inboxUserId_ticketsId_flowStateId_messageKey_by_idx" ON "Messages"("id", "inboxUserId", "ticketsId", "flowStateId", "messageKey", "by", "read");

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_flowStateId_fkey" FOREIGN KEY ("flowStateId") REFERENCES "FlowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_inboxUserId_fkey" FOREIGN KEY ("inboxUserId") REFERENCES "InboxUsers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_ticketsId_fkey" FOREIGN KEY ("ticketsId") REFERENCES "Tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
