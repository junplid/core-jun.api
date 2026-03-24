-- CreateEnum
CREATE TYPE "TypeOrderAdjustments" AS ENUM ('in', 'out');

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "delivery_reference_point" TEXT;

-- CreateTable
CREATE TABLE "OrderAdjustments" (
    "id" SERIAL NOT NULL,
    "type" "TypeOrderAdjustments" NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "OrderAdjustments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderAdjustments_orderId_type_id_idx" ON "OrderAdjustments"("orderId", "type", "id");

-- AddForeignKey
ALTER TABLE "OrderAdjustments" ADD CONSTRAINT "OrderAdjustments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
