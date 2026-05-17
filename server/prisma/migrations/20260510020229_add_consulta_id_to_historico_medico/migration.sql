/*
  Warnings:

  - A unique constraint covering the columns `[consultaId]` on the table `historico_medico` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "consultas" ADD COLUMN     "dataCancelamento" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "historico_medico" ADD COLUMN     "consultaId" TEXT;

-- CreateTable
CREATE TABLE "upas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cnpj" TEXT,
    "email" TEXT,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "triagens" (
    "id" TEXT NOT NULL,
    "upaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "sintomas" TEXT,
    "sinais" TEXT,
    "prioridade" TEXT NOT NULL DEFAULT 'medio',
    "status" TEXT NOT NULL DEFAULT 'em_andamento',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "triagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimentos_upa" (
    "id" TEXT NOT NULL,
    "upaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "triagemId" TEXT,
    "descricao" TEXT,
    "profissional" TEXT,
    "dataAtendimento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "laudo" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atendimentos_upa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upa_medicacoes" (
    "id" TEXT NOT NULL,
    "upaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "atendimentoId" TEXT,
    "nomeMedicacao" TEXT NOT NULL,
    "dosagem" TEXT,
    "viaAdministracao" TEXT,
    "dataHoraAdministracao" TIMESTAMP(3) NOT NULL,
    "administradorNome" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upa_medicacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upa_solicitacoes_exame" (
    "id" TEXT NOT NULL,
    "upaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "atendimentoId" TEXT,
    "laboratorioId" TEXT,
    "tipoExame" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "resultado" TEXT,
    "arquivoPdf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upa_solicitacoes_exame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upa_vacinas" (
    "id" TEXT NOT NULL,
    "upaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "atendimentoId" TEXT,
    "nome" TEXT NOT NULL,
    "lote" TEXT,
    "dataApl" TIMESTAMP(3) NOT NULL,
    "proximaDose" TIMESTAMP(3),
    "aplicadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upa_vacinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upa_encaminhamentos" (
    "id" TEXT NOT NULL,
    "upaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "atendimentoId" TEXT,
    "motivo" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upa_encaminhamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upas_cnpj_key" ON "upas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "upas_email_key" ON "upas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "historico_medico_consultaId_key" ON "historico_medico"("consultaId");

-- AddForeignKey
ALTER TABLE "triagens" ADD CONSTRAINT "triagens_upaId_fkey" FOREIGN KEY ("upaId") REFERENCES "upas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triagens" ADD CONSTRAINT "triagens_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos_upa" ADD CONSTRAINT "atendimentos_upa_upaId_fkey" FOREIGN KEY ("upaId") REFERENCES "upas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos_upa" ADD CONSTRAINT "atendimentos_upa_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos_upa" ADD CONSTRAINT "atendimentos_upa_triagemId_fkey" FOREIGN KEY ("triagemId") REFERENCES "triagens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_medicacoes" ADD CONSTRAINT "upa_medicacoes_upaId_fkey" FOREIGN KEY ("upaId") REFERENCES "upas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_medicacoes" ADD CONSTRAINT "upa_medicacoes_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_medicacoes" ADD CONSTRAINT "upa_medicacoes_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "atendimentos_upa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_solicitacoes_exame" ADD CONSTRAINT "upa_solicitacoes_exame_upaId_fkey" FOREIGN KEY ("upaId") REFERENCES "upas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_solicitacoes_exame" ADD CONSTRAINT "upa_solicitacoes_exame_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_solicitacoes_exame" ADD CONSTRAINT "upa_solicitacoes_exame_laboratorioId_fkey" FOREIGN KEY ("laboratorioId") REFERENCES "laboratorios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_solicitacoes_exame" ADD CONSTRAINT "upa_solicitacoes_exame_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "atendimentos_upa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_vacinas" ADD CONSTRAINT "upa_vacinas_upaId_fkey" FOREIGN KEY ("upaId") REFERENCES "upas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_vacinas" ADD CONSTRAINT "upa_vacinas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_vacinas" ADD CONSTRAINT "upa_vacinas_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "atendimentos_upa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_encaminhamentos" ADD CONSTRAINT "upa_encaminhamentos_upaId_fkey" FOREIGN KEY ("upaId") REFERENCES "upas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_encaminhamentos" ADD CONSTRAINT "upa_encaminhamentos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_encaminhamentos" ADD CONSTRAINT "upa_encaminhamentos_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upa_encaminhamentos" ADD CONSTRAINT "upa_encaminhamentos_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "atendimentos_upa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_medico" ADD CONSTRAINT "historico_medico_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
