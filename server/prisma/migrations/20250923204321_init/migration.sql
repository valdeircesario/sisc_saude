-- CreateTable
CREATE TABLE "solicitacoes_exame_internacao" (
    "id" TEXT NOT NULL,
    "internacaoId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "laboratorioId" TEXT NOT NULL,
    "tipoExame" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataResultado" TIMESTAMP(3),
    "resultado" TEXT,
    "arquivoPdf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_exame_internacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "solicitacoes_exame_internacao" ADD CONSTRAINT "solicitacoes_exame_internacao_internacaoId_fkey" FOREIGN KEY ("internacaoId") REFERENCES "internacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_exame_internacao" ADD CONSTRAINT "solicitacoes_exame_internacao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_exame_internacao" ADD CONSTRAINT "solicitacoes_exame_internacao_laboratorioId_fkey" FOREIGN KEY ("laboratorioId") REFERENCES "laboratorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
