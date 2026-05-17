/*
  Warnings:

  - You are about to drop the column `administradorId` on the `medicacoes_administradas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "medicacoes_administradas" DROP CONSTRAINT "medicacoes_administradas_administradorId_fkey";

-- AlterTable
ALTER TABLE "medicacoes_administradas" DROP COLUMN "administradorId",
ADD COLUMN     "administradorNomeOuCrm" TEXT;
