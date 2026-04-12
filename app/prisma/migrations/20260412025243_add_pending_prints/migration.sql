-- CreateTable
CREATE TABLE "PendingPrints" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "PendingPrints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingPrints_orderId_key" ON "PendingPrints"("orderId");

-- CreateIndex
CREATE INDEX "PendingPrints_id_orderId_idx" ON "PendingPrints"("id", "orderId");

-- AddForeignKey
ALTER TABLE "PendingPrints" ADD CONSTRAINT "PendingPrints_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
