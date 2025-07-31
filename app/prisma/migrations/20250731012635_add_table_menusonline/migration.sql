-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "menuId" INTEGER;

-- CreateTable
CREATE TABLE "MenusOnline" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "logoImg" TEXT NOT NULL,
    "desc" TEXT,
    "accountId" INTEGER,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenusOnline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenusOnline_identifier_key" ON "MenusOnline"("identifier");

-- CreateIndex
CREATE INDEX "MenusOnline_id_uuid_accountId_idx" ON "MenusOnline"("id", "uuid", "accountId");

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenusOnline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenusOnline" ADD CONSTRAINT "MenusOnline_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
