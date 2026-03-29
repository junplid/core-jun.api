-- AlterTable
ALTER TABLE "MenuInfo" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MenusOnline" ADD COLUMN     "geocoding" TEXT[];

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "geocoding" TEXT[],
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION;
