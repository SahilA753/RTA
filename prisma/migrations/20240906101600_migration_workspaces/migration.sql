/*
  Warnings:

  - You are about to drop the column `workspaceOwner` on the `workspaces` table. All the data in the column will be lost.
  - Added the required column `userId` to the `workspaces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workspaces" DROP COLUMN "workspaceOwner",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
