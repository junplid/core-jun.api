/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `MenusOnline` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MenusOnline_uuid_key" ON "MenusOnline"("uuid");
