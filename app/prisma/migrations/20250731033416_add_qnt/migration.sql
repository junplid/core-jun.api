-- CreateEnum
CREATE TYPE "TypeCategory" AS ENUM ('pizzas', 'drinks');

-- AlterTable
ALTER TABLE "MenusOnline" ADD COLUMN     "itemId" INTEGER;

-- CreateTable
CREATE TABLE "MenusOnlineItems" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "category" "TypeCategory" NOT NULL,
    "img" TEXT NOT NULL,
    "qnt" INTEGER NOT NULL DEFAULT 0,
    "beforePrice" DECIMAL(3,2),
    "afterPrice" DECIMAL(3,2) NOT NULL,
    "accountId" INTEGER,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenusOnlineItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenusOnlineItems_uuid_key" ON "MenusOnlineItems"("uuid");

-- CreateIndex
CREATE INDEX "MenusOnlineItems_id_uuid_accountId_idx" ON "MenusOnlineItems"("id", "uuid", "accountId");

-- AddForeignKey
ALTER TABLE "MenusOnline" ADD CONSTRAINT "MenusOnline_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MenusOnlineItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenusOnlineItems" ADD CONSTRAINT "MenusOnlineItems_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
