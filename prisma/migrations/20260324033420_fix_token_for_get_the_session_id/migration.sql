-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "expiresAt" DROP NOT NULL;
