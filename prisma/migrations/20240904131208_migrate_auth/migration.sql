/*
  Warnings:

  - You are about to drop the column `avt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avt",
ADD COLUMN     "avatarUrl" TEXT;
