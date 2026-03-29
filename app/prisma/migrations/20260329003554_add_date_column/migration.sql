-- AlterTable
ALTER TABLE "DeliveryRouter" ADD COLUMN     "createAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "DeliveryRouterOnOrders" ADD COLUMN     "completedAt" TIMESTAMPTZ;
