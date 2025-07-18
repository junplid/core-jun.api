-- CreateTable
CREATE TABLE "TrelloIntegration" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "key" VARCHAR(240) NOT NULL,
    "token" VARCHAR(240) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "TrelloIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrelloIntegration_id_name_accountId_status_idx" ON "TrelloIntegration"("id", "name", "accountId", "status");

-- AddForeignKey
ALTER TABLE "TrelloIntegration" ADD CONSTRAINT "TrelloIntegration_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
