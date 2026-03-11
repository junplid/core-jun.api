-- AlterTable
ALTER TABLE "MenusOnline" ADD COLUMN     "bg_capa" TEXT;

-- CreateTable
CREATE TABLE "MenuInfo" (
    "id" SERIAL NOT NULL,
    "address" TEXT,
    "state_uf" TEXT,
    "phone_contact" TEXT,
    "whatsapp_contact" TEXT,
    "links" TEXT[],
    "menuId" INTEGER NOT NULL,

    CONSTRAINT "MenuInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuOnlineOperatingDays" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startHourAt" TEXT NOT NULL,
    "endHourAt" TEXT NOT NULL,
    "menuInfoId" INTEGER NOT NULL,

    CONSTRAINT "MenuOnlineOperatingDays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuInfo_menuId_key" ON "MenuInfo"("menuId");

-- CreateIndex
CREATE INDEX "MenuInfo_menuId_idx" ON "MenuInfo"("menuId");

-- CreateIndex
CREATE INDEX "MenuOnlineOperatingDays_menuInfoId_startHourAt_idx" ON "MenuOnlineOperatingDays"("menuInfoId", "startHourAt");

-- AddForeignKey
ALTER TABLE "MenuInfo" ADD CONSTRAINT "MenuInfo_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenusOnline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuOnlineOperatingDays" ADD CONSTRAINT "MenuOnlineOperatingDays_menuInfoId_fkey" FOREIGN KEY ("menuInfoId") REFERENCES "MenuInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
