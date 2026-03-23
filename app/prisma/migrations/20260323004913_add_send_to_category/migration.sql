-- AlterTable
ALTER TABLE "MenusOnlineItems" ADD COLUMN     "send_to_categoryId" INTEGER;

-- AddForeignKey
ALTER TABLE "MenusOnlineItems" ADD CONSTRAINT "MenusOnlineItems_send_to_categoryId_fkey" FOREIGN KEY ("send_to_categoryId") REFERENCES "MenuOnlineCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
