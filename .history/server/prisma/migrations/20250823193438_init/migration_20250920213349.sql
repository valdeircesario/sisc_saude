-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubs" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "crm" TEXT,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "ubsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laboratorios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laboratorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cns" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "nascimento" TIMESTAMP(3) NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_internacao" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "ubsId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "detalhes" TEXT NOT NULL,
    "laudoMedico" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL DEFAULT 'medio',
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataAgendada" TIMESTAMP(3),
    "horaAgendada" TEXT,
    "local" TEXT,
    "recomendacoes" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_internacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos_hospitalares" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "medicoId" TEXT,
    "solicitacaoInternacaoId" TEXT,
    "dataAgendamento" TIMESTAMP(3) NOT NULL,
    "horaAgendamento" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_hospitalares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedimentos_hospitalares" (
    "id" TEXT NOT NULL,
    "solicitacaoInternacaoId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "medicoRealizouId" TEXT,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "laudoPos" TEXT,
    "instrucoes" TEXT,
    "dataRealizacao" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'realizado',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedimentos_hospitalares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacao_exames_hospital" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "laboratorioId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "tipoExame" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacao_exames_hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanhas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataIni" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "ubsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campanhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscricoes_campanhas" (
    "id" TEXT NOT NULL,
    "campanhaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "endereco" TEXT,
    "idade" INTEGER,
    "condicoesSaude" TEXT,
    "prioridade" TEXT NOT NULL DEFAULT 'normal',
    "gravidade" TEXT NOT NULL DEFAULT 'leve',
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inscrito',
    "dataAgendada" TIMESTAMP(3),
    "horaAgendada" TEXT,
    "localAtendimento" TEXT,
    "tipoAgendamento" TEXT NOT NULL DEFAULT 'campanha',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscricoes_campanhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_medico" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "laudo" TEXT NOT NULL,
    "doenca" TEXT,
    "diagnostico" TEXT NOT NULL,
    "medicacao" TEXT,
    "observacoes" TEXT,
    "dataConsulta" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historico_medico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacinas" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "dataApl" TIMESTAMP(3) NOT NULL,
    "proximaDose" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exames" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "laboratorioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "resultado" TEXT,
    "arquivoPdf" TEXT,
    "dataRealizado" TIMESTAMP(3),
    "dataAgendada" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacao_exames" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "laboratorioId" TEXT NOT NULL,
    "tipoExame" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacao_exames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "ubsId" TEXT NOT NULL,
    "funcionarioId" TEXT,
    "motivo" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "dataAgendada" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'solicitada',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internacoes" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "medicoResponsavelId" TEXT,
    "dataEntrada" TIMESTAMP(3) NOT NULL,
    "dataSaida" TIMESTAMP(3),
    "motivo" TEXT NOT NULL,
    "diagnostico" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicacoes_administradas" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "historicoMedicoId" TEXT,
    "procedimentoHospitalarId" TEXT,
    "internacaoId" TEXT,
    "nomeMedicacao" TEXT NOT NULL,
    "dosagem" TEXT,
    "viaAdministracao" TEXT,
    "dataHoraAdministracao" TIMESTAMP(3) NOT NULL,
    "administradorId" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicacoes_administradas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExameToProcedimentoHospitalar" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_cpf_key" ON "admins"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ubs_cnpj_key" ON "ubs"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "ubs_email_key" ON "ubs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hospitais_cnpj_key" ON "hospitais"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "hospitais_email_key" ON "hospitais"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_cpf_key" ON "funcionarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_email_key" ON "funcionarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "laboratorios_cnpj_key" ON "laboratorios"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "laboratorios_email_key" ON "laboratorios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_cpf_key" ON "pacientes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_cns_key" ON "pacientes"("cns");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_email_key" ON "pacientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_ExameToProcedimentoHospitalar_AB_unique" ON "_ExameToProcedimentoHospitalar"("A", "B");

-- CreateIndex
CREATE INDEX "_ExameToProcedimentoHospitalar_B_index" ON "_ExameToProcedimentoHospitalar"("B");

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_ubsId_fkey" FOREIGN KEY ("ubsId") REFERENCES "ubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_internacao" ADD CONSTRAINT "solicitacoes_internacao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_internacao" ADD CONSTRAINT "solicitacoes_internacao_ubsId_fkey" FOREIGN KEY ("ubsId") REFERENCES "ubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_internacao" ADD CONSTRAINT "solicitacoes_internacao_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_internacao" ADD CONSTRAINT "solicitacoes_internacao_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos_hospitalares" ADD CONSTRAINT "agendamentos_hospitalares_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos_hospitalares" ADD CONSTRAINT "agendamentos_hospitalares_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos_hospitalares" ADD CONSTRAINT "agendamentos_hospitalares_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "funcionarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos_hospitalares" ADD CONSTRAINT "agendamentos_hospitalares_solicitacaoInternacaoId_fkey" FOREIGN KEY ("solicitacaoInternacaoId") REFERENCES "solicitacoes_internacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedimentos_hospitalares" ADD CONSTRAINT "procedimentos_hospitalares_solicitacaoInternacaoId_fkey" FOREIGN KEY ("solicitacaoInternacaoId") REFERENCES "solicitacoes_internacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedimentos_hospitalares" ADD CONSTRAINT "procedimentos_hospitalares_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedimentos_hospitalares" ADD CONSTRAINT "procedimentos_hospitalares_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedimentos_hospitalares" ADD CONSTRAINT "procedimentos_hospitalares_medicoRealizouId_fkey" FOREIGN KEY ("medicoRealizouId") REFERENCES "funcionarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacao_exames_hospital" ADD CONSTRAINT "solicitacao_exames_hospital_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacao_exames_hospital" ADD CONSTRAINT "solicitacao_exames_hospital_laboratorioId_fkey" FOREIGN KEY ("laboratorioId") REFERENCES "laboratorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacao_exames_hospital" ADD CONSTRAINT "solicitacao_exames_hospital_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas" ADD CONSTRAINT "campanhas_ubsId_fkey" FOREIGN KEY ("ubsId") REFERENCES "ubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricoes_campanhas" ADD CONSTRAINT "inscricoes_campanhas_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_medico" ADD CONSTRAINT "historico_medico_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_medico" ADD CONSTRAINT "historico_medico_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacinas" ADD CONSTRAINT "vacinas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacinas" ADD CONSTRAINT "vacinas_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES ""("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exames" ADD CONSTRAINT "exames_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exames" ADD CONSTRAINT "exames_laboratorioId_fkey" FOREIGN KEY ("laboratorioId") REFERENCES "laboratorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacao_exames" ADD CONSTRAINT "solicitacao_exames_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacao_exames" ADD CONSTRAINT "solicitacao_exames_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacao_exames" ADD CONSTRAINT "solicitacao_exames_laboratorioId_fkey" FOREIGN KEY ("laboratorioId") REFERENCES "laboratorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_ubsId_fkey" FOREIGN KEY ("ubsId") REFERENCES "ubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internacoes" ADD CONSTRAINT "internacoes_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internacoes" ADD CONSTRAINT "internacoes_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internacoes" ADD CONSTRAINT "internacoes_medicoResponsavelId_fkey" FOREIGN KEY ("medicoResponsavelId") REFERENCES "funcionarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicacoes_administradas" ADD CONSTRAINT "medicacoes_administradas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicacoes_administradas" ADD CONSTRAINT "medicacoes_administradas_historicoMedicoId_fkey" FOREIGN KEY ("historicoMedicoId") REFERENCES "historico_medico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicacoes_administradas" ADD CONSTRAINT "medicacoes_administradas_procedimentoHospitalarId_fkey" FOREIGN KEY ("procedimentoHospitalarId") REFERENCES "procedimentos_hospitalares"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicacoes_administradas" ADD CONSTRAINT "medicacoes_administradas_internacaoId_fkey" FOREIGN KEY ("internacaoId") REFERENCES "internacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicacoes_administradas" ADD CONSTRAINT "medicacoes_administradas_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "funcionarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExameToProcedimentoHospitalar" ADD CONSTRAINT "_ExameToProcedimentoHospitalar_A_fkey" FOREIGN KEY ("A") REFERENCES "exames"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExameToProcedimentoHospitalar" ADD CONSTRAINT "_ExameToProcedimentoHospitalar_B_fkey" FOREIGN KEY ("B") REFERENCES "procedimentos_hospitalares"("id") ON DELETE CASCADE ON UPDATE CASCADE;
