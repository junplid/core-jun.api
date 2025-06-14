/*
  Warnings:

  - You are about to drop the column `previewPhone` on the `InboxDepartments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InboxDepartments" DROP COLUMN "previewPhone",
ADD COLUMN     "previewPhoto" BOOLEAN NOT NULL DEFAULT true;
