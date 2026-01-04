-- CreateEnum
CREATE TYPE "TypeChannelsNotification" AS ENUM ('websocket', 'push', 'email', 'wa');

-- CreateEnum
CREATE TYPE "TypeStatusChannelsNotification" AS ENUM ('unread', 'read');

-- CreateTable
CREATE TABLE "Notifications" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "title_txt" TEXT NOT NULL,
    "body_txt" TEXT NOT NULL,
    "title_html" TEXT,
    "body_html" TEXT,
    "channels" "TypeChannelsNotification"[],
    "toast_position" TEXT,
    "toast_duration" INTEGER,
    "status" "TypeStatusChannelsNotification" NOT NULL DEFAULT 'unread',
    "url_redirect" TEXT,
    "readAt" TIMESTAMP(3) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushTokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "PushTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushTokens_token_key" ON "PushTokens"("token");

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushTokens" ADD CONSTRAINT "PushTokens_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
