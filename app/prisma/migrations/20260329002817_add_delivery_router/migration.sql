-- CreateEnum
CREATE TYPE "StatusDeliveryRouter" AS ENUM ('open', 'in_progress', 'finished');

-- CreateEnum
CREATE TYPE "StatusDeliveryRouterOnOrder" AS ENUM ('delivered', 'returned', 'pending', 'canceled');

-- CreateTable
CREATE TABLE "DeliveryRouterOnOrders" (
    "id" SERIAL NOT NULL,
    "status" "StatusDeliveryRouterOnOrder" NOT NULL,
    "orderId" INTEGER NOT NULL,
    "routerId" INTEGER NOT NULL,

    CONSTRAINT "DeliveryRouterOnOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryRouter" (
    "id" SERIAL NOT NULL,
    "n_router" TEXT NOT NULL,
    "status" "StatusDeliveryRouter" NOT NULL,
    "menuId" INTEGER NOT NULL,
    "contactsWAOnAccountId" INTEGER NOT NULL,

    CONSTRAINT "DeliveryRouter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryRouterOnOrders_orderId_key" ON "DeliveryRouterOnOrders"("orderId");

-- CreateIndex
CREATE INDEX "DeliveryRouterOnOrders_orderId_routerId_status_idx" ON "DeliveryRouterOnOrders"("orderId", "routerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryRouter_n_router_key" ON "DeliveryRouter"("n_router");

-- CreateIndex
CREATE INDEX "DeliveryRouter_id_n_router_status_menuId_contactsWAOnAccoun_idx" ON "DeliveryRouter"("id", "n_router", "status", "menuId", "contactsWAOnAccountId");

-- AddForeignKey
ALTER TABLE "DeliveryRouterOnOrders" ADD CONSTRAINT "DeliveryRouterOnOrders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRouterOnOrders" ADD CONSTRAINT "DeliveryRouterOnOrders_routerId_fkey" FOREIGN KEY ("routerId") REFERENCES "DeliveryRouter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRouter" ADD CONSTRAINT "DeliveryRouter_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenusOnline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRouter" ADD CONSTRAINT "DeliveryRouter_contactsWAOnAccountId_fkey" FOREIGN KEY ("contactsWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
