/*
  Warnings:

  - You are about to drop the column `category` on the `MenusOnlineItems` table. All the data in the column will be lost.
  - You are about to drop the `SizesPizza` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SizesPizza" DROP CONSTRAINT "SizesPizza_menuId_fkey";

-- AlterTable
ALTER TABLE "MenusOnlineItems" DROP COLUMN "category";

-- DropTable
DROP TABLE "SizesPizza";

-- DropEnum
DROP TYPE "TypeCategory";

-- CreateTable
CREATE TABLE "MenuOnlineCategory" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image45x45png" TEXT NOT NULL,
    "menuId" INTEGER NOT NULL,

    CONSTRAINT "MenuOnlineCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuOnlineCategoryOnMenusOnlineItems" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "MenuOnlineCategoryOnMenusOnlineItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuOnlineItemSections" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT,
    "helpText" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "minOptions" INTEGER NOT NULL DEFAULT 0,
    "maxOptions" INTEGER,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "MenuOnlineItemSections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuOnlineItemSectionsSubItems" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "image55x55png" TEXT,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "before_additional_price" DECIMAL(6,2),
    "after_additional_price" DECIMAL(6,2),
    "required" BOOLEAN NOT NULL DEFAULT false,
    "numberOptions" INTEGER NOT NULL DEFAULT 1,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "MenuOnlineItemSectionsSubItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuOnlineCategory_uuid_key" ON "MenuOnlineCategory"("uuid");

-- CreateIndex
CREATE INDEX "MenuOnlineCategory_menuId_name_idx" ON "MenuOnlineCategory"("menuId", "name");

-- CreateIndex
CREATE INDEX "MenuOnlineCategoryOnMenusOnlineItems_categoryId_itemId_idx" ON "MenuOnlineCategoryOnMenusOnlineItems"("categoryId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuOnlineItemSections_uuid_key" ON "MenuOnlineItemSections"("uuid");

-- CreateIndex
CREATE INDEX "MenuOnlineItemSections_itemId_idx" ON "MenuOnlineItemSections"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuOnlineItemSectionsSubItems_uuid_key" ON "MenuOnlineItemSectionsSubItems"("uuid");

-- CreateIndex
CREATE INDEX "MenuOnlineItemSectionsSubItems_itemId_idx" ON "MenuOnlineItemSectionsSubItems"("itemId");

-- AddForeignKey
ALTER TABLE "MenuOnlineCategory" ADD CONSTRAINT "MenuOnlineCategory_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenusOnline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuOnlineCategoryOnMenusOnlineItems" ADD CONSTRAINT "MenuOnlineCategoryOnMenusOnlineItems_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuOnlineCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuOnlineCategoryOnMenusOnlineItems" ADD CONSTRAINT "MenuOnlineCategoryOnMenusOnlineItems_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MenusOnlineItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuOnlineItemSections" ADD CONSTRAINT "MenuOnlineItemSections_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MenusOnlineItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuOnlineItemSectionsSubItems" ADD CONSTRAINT "MenuOnlineItemSectionsSubItems_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MenusOnlineItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
