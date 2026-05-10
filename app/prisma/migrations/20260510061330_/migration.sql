/*
  Warnings:

  - You are about to drop the column `config_flow` on the `Templates` table. All the data in the column will be lost.
  - You are about to drop the column `script_build_agentai_for_test` on the `Templates` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Templates` table. All the data in the column will be lost.
  - You are about to drop the column `variables` on the `Templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Templates" DROP COLUMN "config_flow",
DROP COLUMN "script_build_agentai_for_test",
DROP COLUMN "tags",
DROP COLUMN "variables";
