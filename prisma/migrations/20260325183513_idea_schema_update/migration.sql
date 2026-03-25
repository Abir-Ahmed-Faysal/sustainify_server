-- AlterTable
ALTER TABLE "ideas" ADD COLUMN     "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[];
