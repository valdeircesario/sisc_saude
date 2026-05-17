/*
  Warnings:

  - You are about to drop the column `procedimentoHospitalarId` on the `medicacoes_administradas` table. All the data in the column will be lost.
  - You are about to drop the `_ExameToProcedimentoHospitalar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `procedimentos_hospitalares` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `solicitacao_exames_hospital` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `solicitacaoInternacaoId` on table `internacoes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_ExameToProcedimentoHospitalar" DROP CONSTRAINT "_ExameToProcedimentoHospitalar_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExameToProcedimentoHospitalar" DROP CONSTRAINT "_ExameToProcedimentoHospitalar_B_fkey";

-- DropForeignKey
ALTER TABLE "internacoes" DROP CONSTRAINT "internacoes_solicitacaoInternacaoId_fkey";

-- DropForeignKey
ALTER TABLE "medicacoes_administradas" DROP CONSTRAINT "medicacoes_administradas_procedimentoHospitalarId_fkey";

-- DropForeignKey
ALTER TABLE "procedimentos_hospitalares" DROP CONSTRAINT "procedimentos_hospitalares_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "procedimentos_hospitalares" DROP CONSTRAINT "procedimentos_hospitalares_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "procedimentos_hospitalares" DROP CONSTRAINT "procedimentos_hospitalares_solicitacaoInternacaoId_fkey";

-- DropForeignKey
ALTER TABLE "solicitacao_exames_hospital" DROP CONSTRAINT "solicitacao_exames_hospital_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "solicitacao_exames_hospital" DROP CONSTRAINT "solicitacao_exames_hospital_laboratorioId_fkey";

-- DropForeignKey
ALTER TABLE "solicitacao_exames_hospital" DROP CONSTRAINT "solicitacao_exames_hospital_pacienteId_fkey";

-- AlterTable
ALTER TABLE "internacoes" ADD COLUMN     "diagnosticoFinal" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ativa',
ALTER COLUMN "solicitacaoInternacaoId" SET NOT NULL;

-- AlterTable
ALTER TABLE "medicacoes_administradas" DROP COLUMN "procedimentoHospitalarId";

-- DropTable
DROP TABLE "_ExameToProcedimentoHospitalar";

-- DropTable
DROP TABLE "procedimentos_hospitalares";

-- DropTable
DROP TABLE "solicitacao_exames_hospital";

-- CreateTable
CREATE TABLE "exames_hospitalares" (
    "id" TEXT NOT NULL,
    "internacaoId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "tipoExame" TEXT NOT NULL,
    "descricaoExame" TEXT NOT NULL,
    "medicoSolicitante" TEXT NOT NULL,
    "resultado" TEXT,
    "arquivoPdf" TEXT,
    "dataRealizado" TIMESTAMP(3),
    "dataSolicitado" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'solicitado',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exames_hospitalares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cirurgias" (
    "id" TEXT NOT NULL,
    "internacaoId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "medicoCircurgiaoId" TEXT NOT NULL,
    "tipoCirurgia" TEXT NOT NULL,
    "descricaoCirurgia" TEXT NOT NULL,
    "dataRealizacao" TIMESTAMP(3) NOT NULL,
    "duracaoMinutos" INTEGER,
    "anestesiaTipo" TEXT,
    "resultado" TEXT NOT NULL,
    "laudoCircurgico" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'realizada',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cirurgias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "altas_hospitalares" (
    "id" TEXT NOT NULL,
    "internacaoId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "medicoResponsavel" TEXT NOT NULL,
    "dataAlta" TIMESTAMP(3) NOT NULL,
    "tipoAlta" TEXT NOT NULL,
    "condicaoAlta" TEXT NOT NULL,
    "diagnosticoFinal" TEXT NOT NULL,
    "orientacoesAlta" TEXT NOT NULL,
    "medicacoesPrescritas" TEXT,
    "retornoAgendado" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "altas_hospitalares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "altas_hospitalares_internacaoId_key" ON "altas_hospitalares"("internacaoId");

-- AddForeignKey
ALTER TABLE "internacoes" ADD CONSTRAINT "internacoes_solicitacaoInternacaoId_fkey" FOREIGN KEY ("solicitacaoInternacaoId") REFERENCES "solicitacoes_internacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exames_hospitalares" ADD CONSTRAINT "exames_hospitalares_internacaoId_fkey" FOREIGN KEY ("internacaoId") REFERENCES "internacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exames_hospitalares" ADD CONSTRAINT "exames_hospitalares_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exames_hospitalares" ADD CONSTRAINT "exames_hospitalares_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cirurgias" ADD CONSTRAINT "cirurgias_internacaoId_fkey" FOREIGN KEY ("internacaoId") REFERENCES "internacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cirurgias" ADD CONSTRAINT "cirurgias_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cirurgias" ADD CONSTRAINT "cirurgias_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cirurgias" ADD CONSTRAINT "cirurgias_medicoCircurgiaoId_fkey" FOREIGN KEY ("medicoCircurgiaoId") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "altas_hospitalares" ADD CONSTRAINT "altas_hospitalares_internacaoId_fkey" FOREIGN KEY ("internacaoId") REFERENCES "internacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "altas_hospitalares" ADD CONSTRAINT "altas_hospitalares_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
