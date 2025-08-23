-- CreateTable
CREATE TABLE "inscricoes_campanhas" (
    "id" TEXT NOT NULL,
    "campanhaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "endereco" TEXT,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inscrito',
    "dataAgendada" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscricoes_campanhas_pkey" PRIMARY KEY ("id")
);

-- Unique constraint para CPF
CREATE UNIQUE INDEX "inscricoes_campanhas_cpf_key" ON "inscricoes_campanhas"("cpf");

-- Unique constraint para EMAIL
CREATE UNIQUE INDEX "inscricoes_campanhas_email_key" ON "inscricoes_campanhas"("email");

-- AddForeignKey
ALTER TABLE "inscricoes_campanhas" 
ADD CONSTRAINT "inscricoes_campanhas_campanhaId_fkey" 
FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;
