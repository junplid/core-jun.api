/*
  Warnings:

  - A unique constraint covering the columns `[messageKey]` on the table `Messages` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FlowState_id_flowId_campaignId_contactsWAOnAccountId_connec_idx";

-- AlterTable
ALTER TABLE "FlowState" ADD COLUMN     "finishedAt" TIMESTAMP(3);

-- CreateIndex (GIST for temporal overlap)
CREATE INDEX "FlowState_active_range_gist_idx"
ON "FlowState"
USING GIST (
  tsrange(
    "createAt",
    COALESCE("finishedAt", 'infinity')
  )
);

-- CreateIndex
CREATE UNIQUE INDEX "Messages_messageKey_key" ON "Messages"("messageKey");
