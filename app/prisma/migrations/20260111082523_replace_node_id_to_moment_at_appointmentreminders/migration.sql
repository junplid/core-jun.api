/*
  Warnings:

  - You are about to drop the column `flowNodeId` on the `AppointmentReminders` table. All the data in the column will be lost.
  - Added the required column `moment` to the `AppointmentReminders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppointmentReminders" DROP COLUMN "flowNodeId",
ADD COLUMN     "moment" TEXT NOT NULL;
