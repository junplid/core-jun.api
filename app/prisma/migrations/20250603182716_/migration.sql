/*
  Warnings:

  - You are about to drop the `StaticPaths` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StaticPaths" DROP CONSTRAINT "StaticPaths_accountId_fkey";

-- DropTable
DROP TABLE "StaticPaths";

-- DropEnum
DROP TYPE "TypeStaticPath";

-- CreateTable
CREATE TABLE "StoragePaths" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "type" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "StoragePaths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoragePathsOnBusiness" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "storagePathId" INTEGER NOT NULL,

    CONSTRAINT "StoragePathsOnBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoragePaths_name_id_idx" ON "StoragePaths"("name", "id");

-- CreateIndex
CREATE INDEX "StoragePathsOnBusiness_businessId_storagePathId_idx" ON "StoragePathsOnBusiness"("businessId", "storagePathId");

-- AddForeignKey
ALTER TABLE "StoragePaths" ADD CONSTRAINT "StoragePaths_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoragePathsOnBusiness" ADD CONSTRAINT "StoragePathsOnBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoragePathsOnBusiness" ADD CONSTRAINT "StoragePathsOnBusiness_storagePathId_fkey" FOREIGN KEY ("storagePathId") REFERENCES "StoragePaths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
