/*
  Warnings:

  - A unique constraint covering the columns `[riotPuuid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "riotGameName" TEXT,
ADD COLUMN     "riotPuuid" TEXT,
ADD COLUMN     "riotTagLine" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_riotPuuid_key" ON "User"("riotPuuid");
