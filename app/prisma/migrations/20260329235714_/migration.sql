/*
  Warnings:

  - Added the required column `flowStateId` to the `DeliveryRouter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nodeId` to the `DeliveryRouter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeoutAt` to the `DeliveryRouter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeliveryRouter" ADD COLUMN     "flowStateId" INTEGER NOT NULL,
ADD COLUMN     "nodeId" TEXT NOT NULL,
ADD COLUMN     "timeoutAt" TIMESTAMPTZ NOT NULL,
ALTER COLUMN "contactsWAOnAccountId" DROP NOT NULL;
