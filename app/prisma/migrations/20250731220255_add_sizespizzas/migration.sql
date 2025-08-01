-- DropForeignKey
ALTER TABLE "MenusOnline" DROP CONSTRAINT "MenusOnline_itemId_fkey";

-- AlterTable
ALTER TABLE "MenusOnline" ADD COLUMN     "bg_primary" TEXT,
ADD COLUMN     "bg_secondary" TEXT,
ADD COLUMN     "bg_tertiary" TEXT;

-- AlterTable
ALTER TABLE "MenusOnlineItems" ALTER COLUMN "beforePrice" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "afterPrice" SET DATA TYPE DECIMAL(6,2);

-- CreateTable
CREATE TABLE "SizesPizza" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(6,2) NOT NULL,
    "flavors" INTEGER NOT NULL,
    "slices" INTEGER,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menuId" INTEGER NOT NULL,

    CONSTRAINT "SizesPizza_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SizesPizza_id_menuId_idx" ON "SizesPizza"("id", "menuId");

-- AddForeignKey
ALTER TABLE "MenusOnline" ADD CONSTRAINT "MenusOnline_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MenusOnlineItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizesPizza" ADD CONSTRAINT "SizesPizza_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenusOnline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
