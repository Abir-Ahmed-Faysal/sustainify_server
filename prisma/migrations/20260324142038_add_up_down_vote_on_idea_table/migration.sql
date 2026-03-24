/*
  Warnings:

  - You are about to drop the column `totalVotes` on the `ideas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ideas" DROP COLUMN "totalVotes",
ADD COLUMN     "positiveRatio" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDownVotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalUpVotes" INTEGER NOT NULL DEFAULT 0;
