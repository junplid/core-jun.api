/*
  Warnings:

  - You are about to drop the column `signAttendant` on the `InboxDepartments` table. All the data in the column will be lost.
  - You are about to drop the column `signSector` on the `InboxDepartments` table. All the data in the column will be lost.
  - You are about to drop the column `sign_business` on the `InboxDepartments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InboxDepartments" DROP COLUMN "signAttendant",
DROP COLUMN "signSector",
DROP COLUMN "sign_business",
ADD COLUMN     "signBusiness" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signDepartment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signUser" BOOLEAN NOT NULL DEFAULT false;
