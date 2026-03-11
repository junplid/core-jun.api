/*
  Warnings:

  - You are about to drop the column `numberOptions` on the `MenuOnlineItemSectionSubItems` table. All the data in the column will be lost.
  - You are about to drop the column `required` on the `MenuOnlineItemSectionSubItems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuOnlineItemSectionSubItems" DROP COLUMN "numberOptions",
DROP COLUMN "required";
