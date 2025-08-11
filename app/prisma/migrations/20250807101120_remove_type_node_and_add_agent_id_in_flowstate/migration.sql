/*
  Warnings:

  - You are about to drop the column `typeNode` on the `FlowState` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FlowState" DROP COLUMN "typeNode",
ADD COLUMN     "agentId" INTEGER;
