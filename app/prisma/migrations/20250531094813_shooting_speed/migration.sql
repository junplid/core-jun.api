-- CreateTable
CREATE TABLE "ShootingSpeed" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "timeBetweenShots" INTEGER NOT NULL,
    "timeRest" INTEGER NOT NULL,
    "amountShorts" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ShootingSpeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShootingSpeed_id_name_status_idx" ON "ShootingSpeed"("id", "name", "status");
