/*
  Warnings:

  - Added the required column `script_build_agentai_for_test` to the `AgentTemplates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AgentTemplates" ADD COLUMN     "script_build_agentai_for_test" TEXT NOT NULL;
