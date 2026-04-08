/*
  Warnings:

  - You are about to drop the `favourites` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "favourites" DROP CONSTRAINT "favourites_ideaId_fkey";

-- DropForeignKey
ALTER TABLE "favourites" DROP CONSTRAINT "favourites_userId_fkey";

-- DropTable
DROP TABLE "favourites";

-- CreateTable
CREATE TABLE "favourite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,

    CONSTRAINT "favourite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_favourite_userId" ON "favourite"("userId");

-- CreateIndex
CREATE INDEX "idx_favourite_ideaId" ON "favourite"("ideaId");

-- CreateIndex
CREATE UNIQUE INDEX "favourite_userId_ideaId_key" ON "favourite"("userId", "ideaId");

-- AddForeignKey
ALTER TABLE "favourite" ADD CONSTRAINT "favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite" ADD CONSTRAINT "favourite_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
