-- CreateTable
CREATE TABLE "FbPixel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pixel_id" TEXT NOT NULL,
    "access_token" VARCHAR(240) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "businessId" INTEGER,

    CONSTRAINT "FbPixel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FbPixel_pixel_id_key" ON "FbPixel"("pixel_id");

-- CreateIndex
CREATE INDEX "FbPixel_id_name_pixel_id_businessId_accountId_idx" ON "FbPixel"("id", "name", "pixel_id", "businessId", "accountId");

-- AddForeignKey
ALTER TABLE "FbPixel" ADD CONSTRAINT "FbPixel_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FbPixel" ADD CONSTRAINT "FbPixel_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
