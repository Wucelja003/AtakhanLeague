/*
  Warnings:

  - Added the required column `username` to the `IndividualRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `captainUsername` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IndividualRegistration" ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "captainUsername" TEXT NOT NULL;
