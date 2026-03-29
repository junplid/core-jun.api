/*
  Warnings:

  - You are about to drop the column `status` on the `DeliveryRouterOnOrders` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "DeliveryRouterOnOrders_orderId_routerId_status_idx";

-- AlterTable
ALTER TABLE "DeliveryRouterOnOrders" DROP COLUMN "status";

-- DropEnum
DROP TYPE "StatusDeliveryRouterOnOrder";

-- CreateIndex
CREATE INDEX "DeliveryRouterOnOrders_orderId_routerId_idx" ON "DeliveryRouterOnOrders"("orderId", "routerId");
