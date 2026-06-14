import { prisma } from "../config/database.js";

export const listarSolicitacoes = async (laboratorioId) => {
  return await prisma.solicitacaoExame.findMany({
    where: { laboratorioId },
    include: {
      paciente: {
        select: {
          id: true,
          nome: true,
          cpf: true,
          telefone: true,
          email: true,
          nascimento: true
        }
      },
      funcionario: {
        select: {
          nome: true,
          funcao: true,
          ubs: {
            select: { nome: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const agendarExame = async (solicitacaoId, laboratorioId, dataAgendada) => {
  const solicitacaoAtualizada = await prisma.solicitacaoExame.update({
    where: { 
      id: solicitacaoId,
      laboratorioId
    },
    data: { status: 'agendado' }
  });

  const novoExame = await prisma.exame.create({
    data: {
      pacienteId: solicitacaoAtualizada.pacienteId,
      laboratorioId,
      tipo: solicitacaoAtualizada.tipoExame,
      dataAgendada: new Date(dataAgendada),
      status: 'agendado'
    }
  });

  return { solicitacao: solicitacaoAtualizada, exame: novoExame };
};

export const registrarResultado = async (exameId, laboratorioId, resultado, arquivoPdf) => {
  const exameAtual = await prisma.exame.findUnique({
    where: { id: exameId }
  });

  const data = {
    resultado,
    status: 'realizado'
  };

  if (arquivoPdf) {
    data.arquivoPdf = arquivoPdf;
  }

  if (!exameAtual.dataRealizado) {
    data.dataRealizado = new Date();
  }

  const exameAtualizado = await prisma.exame.update({
    where: { 
      id: exameId,
      laboratorioId
    },
    data
  });

  await prisma.solicitacaoExame.updateMany({
    where: {
      pacienteId: exameAtualizado.pacienteId,
      laboratorioId,
      tipoExame: exameAtualizado.tipo,
      status: 'agendado'
    },
    data: { status: 'realizado' }
  });

  return exameAtualizado;
};

export const listarExames = async (laboratorioId) => {
  return await prisma.exame.findMany({
    where: { laboratorioId },
    include: {
      paciente: {
        select: {
          nome: true,
          cpf: true,
          telefone: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};
