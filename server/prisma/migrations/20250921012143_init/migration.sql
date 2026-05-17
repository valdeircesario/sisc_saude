/*
  Warnings:

  - You are about to drop the column `funcionarioId` on the `vacinas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "vacinas" DROP CONSTRAINT "vacinas_funcionarioId_fkey";

-- AlterTable
ALTER TABLE "vacinas" DROP COLUMN "funcionarioId";
