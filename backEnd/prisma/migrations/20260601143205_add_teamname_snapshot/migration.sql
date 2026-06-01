/*
  Warnings:

  - Added the required column `teamName` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "teamName" TEXT NOT NULL;
