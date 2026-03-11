/*
  Warnings:

  - You are about to drop the `MenuOnlineItemSectionsSubItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MenuOnlineItemSectionsSubItems" DROP CONSTRAINT "MenuOnlineItemSectionsSubItems_itemId_fkey";

-- DropTable
DROP TABLE "MenuOnlineItemSectionsSubItems";

-- CreateTable
CREATE TABLE "MenuOnlineItemSectionSubItems" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "image55x55png" TEXT,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "before_additional_price" DECIMAL(6,2),
    "after_additional_price" DECIMAL(6,2),
    "required" BOOLEAN NOT NULL DEFAULT false,
    "numberOptions" INTEGER NOT NULL DEFAULT 1,
    "sectionId" INTEGER NOT NULL,

    CONSTRAINT "MenuOnlineItemSectionSubItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuOnlineItemSectionSubItems_uuid_key" ON "MenuOnlineItemSectionSubItems"("uuid");

-- CreateIndex
CREATE INDEX "MenuOnlineItemSectionSubItems_sectionId_idx" ON "MenuOnlineItemSectionSubItems"("sectionId");

-- AddForeignKey
ALTER TABLE "MenuOnlineItemSectionSubItems" ADD CONSTRAINT "MenuOnlineItemSectionSubItems_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "MenuOnlineItemSections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
