-- AlterTable
ALTER TABLE "Tickets" ADD COLUMN     "goBackFlowStateId" INTEGER;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_goBackFlowStateId_fkey" FOREIGN KEY ("goBackFlowStateId") REFERENCES "FlowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;
