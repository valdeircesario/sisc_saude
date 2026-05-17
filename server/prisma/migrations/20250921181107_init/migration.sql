/*
  Warnings:

  - You are about to drop the column `diagnostico` on the `internacoes` table. All the data in the column will be lost.
  - You are about to drop the column `medicoResponsavelId` on the `internacoes` table. All the data in the column will be lost.
  - You are about to drop the column `motivo` on the `internacoes` table. All the data in the column will be lost.
  - You are about to drop the column `medicoRealizouId` on the `procedimentos_hospitalares` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[solicitacaoInternacaoId]` on the table `internacoes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `leito` to the `internacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicoResponsavelNome` to the `internacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motivoInternacao` to the `internacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quarto` to the `internacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicoResponsavelNome` to the `procedimentos_hospitalares` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "internacoes" DROP CONSTRAINT "internacoes_medicoResponsavelId_fkey";

-- DropForeignKey
ALTER TABLE "procedimentos_hospitalares" DROP CONSTRAINT "procedimentos_hospitalares_medicoRealizouId_fkey";

-- AlterTable
ALTER TABLE "internacoes" DROP COLUMN "diagnostico",
DROP COLUMN "medicoResponsavelId",
DROP COLUMN "motivo",
ADD COLUMN     "diagnosticoInicial" TEXT,
ADD COLUMN     "leito" TEXT NOT NULL,
ADD COLUMN     "medicoResponsavelNome" TEXT NOT NULL,
ADD COLUMN     "motivoInternacao" TEXT NOT NULL,
ADD COLUMN     "quarto" TEXT NOT NULL,
ADD COLUMN     "solicitacaoInternacaoId" TEXT;

-- AlterTable
ALTER TABLE "procedimentos_hospitalares" DROP COLUMN "medicoRealizouId",
ADD COLUMN     "medicoResponsavelNome" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "internacoes_solicitacaoInternacaoId_key" ON "internacoes"("solicitacaoInternacaoId");

-- AddForeignKey
ALTER TABLE "internacoes" ADD CONSTRAINT "internacoes_solicitacaoInternacaoId_fkey" FOREIGN KEY ("solicitacaoInternacaoId") REFERENCES "solicitacoes_internacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
