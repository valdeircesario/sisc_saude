-- CreateTable
CREATE TABLE "medicamentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT DEFAULT '',
    "lote" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "dataValidade" TIMESTAMP(3) NOT NULL,
    "vencido" BOOLEAN NOT NULL DEFAULT false,
    "ubsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicacoes_paciente" (
    "id" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "ubsId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "dataRetirada" TIMESTAMP(3) NOT NULL,
    "fornecidoPor" TEXT NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicacoes_paciente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_ubsId_fkey" FOREIGN KEY ("ubsId") REFERENCES "ubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicacoes_paciente" ADD CONSTRAINT "medicacoes_paciente_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "medicamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicacoes_paciente" ADD CONSTRAINT "medicacoes_paciente_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicacoes_paciente" ADD CONSTRAINT "medicacoes_paciente_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicacoes_paciente" ADD CONSTRAINT "medicacoes_paciente_ubsId_fkey" FOREIGN KEY ("ubsId") REFERENCES "ubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
