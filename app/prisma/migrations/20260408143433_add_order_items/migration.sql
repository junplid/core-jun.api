-- CreateTable
CREATE TABLE "MenuOnlineItemOfOrder" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(6,2),
    "obs" TEXT,
    "side_dishes" TEXT,
    "itemId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "MenuOnlineItemOfOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuOnlineItemOfOrder_itemId_orderId_idx" ON "MenuOnlineItemOfOrder"("itemId", "orderId");

-- AddForeignKey
ALTER TABLE "MenuOnlineItemOfOrder" ADD CONSTRAINT "MenuOnlineItemOfOrder_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MenusOnlineItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuOnlineItemOfOrder" ADD CONSTRAINT "MenuOnlineItemOfOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
