import { prisma } from "../config/database.js";

export const obterPerfil = async (pacienteId) => {
  return await prisma.paciente.findUnique({
    where: { id: pacienteId },
    select: {
      id: true,
      nome: true,
      cpf: true,
      cns: true,
      endereco: true,
      cep: true,
      nascimento: true,
      telefone: true,
      email: true,
      createdAt: true,
    },
  });
};

export const atualizarPerfil = async (pacienteId, data) => {
  const { endereco, telefone, email } = data;
  return await prisma.paciente.update({
    where: { id: pacienteId },
    data: { endereco, telefone, email },
    select: {
      id: true,
      nome: true,
      cpf: true,
      cns: true,
      endereco: true,
      cep: true,
      nascimento: true,
      telefone: true,
      email: true,
    },
  });
};

export const obterHistoricoMedico = async (pacienteId) => {
  return await prisma.historicoMedico.findMany({
    where: { pacienteId },
    include: {
      funcionario: {
        select: {
          nome: true,
          funcao: true,
          crm: true,
          ubs: {
            select: { nome: true },
          },
        },
      },
    },
    orderBy: { dataConsulta: "desc" },
  });
};

export const obterVacinas = async (pacienteId) => {
  return await prisma.vacina.findMany({
    where: { pacienteId },
    include: {
      funcionario: { select: { crm: true } },
    },
    orderBy: { dataApl: "desc" },
  });
};

export const obterExames = async (pacienteId) => {
  return await prisma.exame.findMany({
    where: { pacienteId },
    include: {
      laboratorio: {
        select: { nome: true, telefone: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const listarSolicitacoesExame = async (pacienteId) => {
  return await prisma.solicitacaoExame.findMany({
    where: { pacienteId },
    include: {
      laboratorio: {
        select: { nome: true, telefone: true },
      },
      funcionario: {
        select: { nome: true, funcao: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const solicitarConsulta = async (pacienteId, data) => {
  const { ubsId, motivo, especialidade } = data;
  return await prisma.consulta.create({
    data: {
      pacienteId,
      ubsId,
      motivo,
      especialidade,
      status: "solicitada",
    },
  });
};

export const listarConsultas = async (pacienteId) => {
  return await prisma.consulta.findMany({
    where: { pacienteId },
    include: {
      ubs: {
        select: { nome: true, endereco: true, telefone: true },
      },
      funcionario: {
        select: { nome: true, funcao: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const confirmarConsulta = async (consultaId, pacienteId) => {
  return await prisma.consulta.update({
    where: { id: consultaId, pacienteId },
    data: { status: "confirmada" },
  });
};

export const cancelarConsulta = async (consultaId, pacienteId, data) => {
  const { motivo, dataCancelamento } = data;

  const consulta = await prisma.consulta.findUnique({
    where: { id: consultaId, pacienteId },
  });

  if (!consulta) {
    throw { status: 404, data: { message: "Consulta não encontrada" } };
  }

  return await prisma.consulta.update({
    where: { id: consultaId },
    data: {
      status: "cancelada",
      dataCancelamento: dataCancelamento ? new Date(dataCancelamento) : new Date(),
      motivo: motivo ? `${consulta.motivo || ""}\n[PACIENTE CANCELOU]: ${motivo}` : consulta.motivo,
    },
  });
};

export const listarUbs = async () => {
  return await prisma.uBS.findMany({
    select: {
      id: true,
      nome: true,
      endereco: true,
      telefone: true,
    },
  });
};

export const listarSolicitacoesInternacao = async (pacienteId, status) => {
  const where = { pacienteId };
  if (status) where.status = status;

  return await prisma.solicitacaoInternacao.findMany({
    where,
    include: {
      hospital: { select: { nome: true, endereco: true, telefone: true } },
      funcionario: { select: { nome: true, funcao: true, crm: true } },
      ubs: { select: { nome: true, endereco: true, telefone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const obterDetalhesSolicitacaoInternacao = async (solicitacaoId, pacienteId) => {
  const solicitacao = await prisma.solicitacaoInternacao.findUnique({
    where: { id: solicitacaoId, pacienteId },
    include: {
      hospital: { select: { nome: true, endereco: true, telefone: true, email: true } },
      funcionario: { select: { nome: true, funcao: true, crm: true } },
      ubs: { select: { nome: true, endereco: true, telefone: true } },
      procedimentos: {
        include: {
          medicoRealizou: { select: { nome: true, funcao: true, crm: true } },
        },
        orderBy: { dataRealizacao: "desc" },
      },
      agendamento: {
        include: {
          medico: { select: { nome: true, funcao: true, crm: true } },
        },
      },
    },
  });

  if (!solicitacao) {
    throw { status: 404, data: { message: "Solicitação não encontrada" } };
  }
  return solicitacao;
};

export const confirmarAgendamentoInternacao = async (solicitacaoId, pacienteId, data) => {
  const { observacoes } = data;

  const solicitacao = await prisma.solicitacaoInternacao.findUnique({
    where: { id: solicitacaoId, pacienteId },
  });

  if (!solicitacao) {
    throw { status: 404, data: { message: "Solicitação não encontrada" } };
  }

  return await prisma.solicitacaoInternacao.update({
    where: { id: solicitacaoId },
    data: {
      status: "confirmado",
      observacoes: observacoes
        ? `${solicitacao.observacoes || ""}\n[PACIENTE CONFIRMOU]: ${observacoes}`
        : solicitacao.observacoes,
    },
    include: {
      hospital: { select: { nome: true } },
    },
  });
};

export const listarInternacoes = async (pacienteId) => {
  return await prisma.internacao.findMany({
    where: { pacienteId },
    include: {
      hospital: { select: { nome: true, endereco: true, telefone: true } },
      medicacoesAdministradas: {
        orderBy: { dataHoraAdministracao: "desc" },
      },
    },
    orderBy: { dataEntrada: "desc" },
  });
};

export const obterDetalhesInternacao = async (internacaoId, pacienteId) => {
  const internacao = await prisma.internacao.findUnique({
    where: { id: internacaoId, pacienteId },
    include: {
      hospital: { select: { nome: true, endereco: true, telefone: true, email: true } },
      medicacoesAdministradas: {
        orderBy: { dataHoraAdministracao: "desc" },
      },
    },
  });

  if (!internacao) {
    throw { status: 404, data: { message: "Internação não encontrada" } };
  }
  return internacao;
};

export const listarProcedimentosHospitalares = async (pacienteId) => {
  return await prisma.procedimentoHospitalar.findMany({
    where: { pacienteId },
    include: {
      hospital: { select: { nome: true } },
      medicoRealizou: { select: { nome: true, funcao: true, crm: true } },
      solicitacaoInternacao: { select: { tipo: true, motivo: true } },
      examesRelacionados: {
        include: {
          laboratorio: { select: { nome: true } },
        },
      },
      medicacoesAdministradas: {
        orderBy: { dataHoraAdministracao: "desc" },
      },
    },
    orderBy: { dataRealizacao: "desc" },
  });
};

export const listarMedicacoesAdministradas = async (pacienteId, internacaoId) => {
  const where = { pacienteId };
  if (internacaoId) where.internacaoId = internacaoId;

  return await prisma.medicacaoAdministrada.findMany({
    where,
    include: {
      internacao: { select: { id: true, hospital: { select: { nome: true } } } },
      historicoMedico: { select: { id: true, laudo: true, dataConsulta: true } },
      paciente: { select: { id: true, nome: true } },
    },
    orderBy: { dataHoraAdministracao: "desc" },
  });
};

export const listarMedicacoesPaciente = async (pacienteId) => {
  return await prisma.medicacaoPaciente.findMany({
    where: { pacienteId },
    include: {
      medicamento: {
        select: { id: true, nome: true, descricao: true, lote: true, dataValidade: true, observacoes: true },
      },
      funcionario: {
        select: { id: true, nome: true, telefone: true, email: true },
      },
      ubs: {
        select: { id: true, nome: true, endereco: true, telefone: true },
      },
    },
    orderBy: { dataRetirada: "desc" },
  });
};

export const listarAgendamentosHospitalares = async (pacienteId) => {
  return await prisma.agendamentoHospitalar.findMany({
    where: { pacienteId },
    include: {
      hospital: { select: { nome: true, endereco: true, telefone: true } },
      medico: { select: { nome: true, funcao: true, crm: true } },
      solicitacaoInternacao: { select: { tipo: true, motivo: true, prioridade: true } },
    },
    orderBy: { dataAgendamento: "asc" },
  });
};

export const confirmarAgendamentoHospitalar = async (agendamentoId, pacienteId, data) => {
  const { observacoes } = data;

  const agendamento = await prisma.agendamentoHospitalar.findUnique({
    where: { id: agendamentoId, pacienteId, status: "agendado" },
  });

  if (!agendamento) {
    throw { status: 404, data: { message: "Agendamento não encontrado ou não pode ser confirmado" } };
  }

  return await prisma.agendamentoHospitalar.update({
    where: { id: agendamentoId },
    data: {
      observacoes: observacoes
        ? `${agendamento.observacoes || ""}\n[PACIENTE CONFIRMOU]: ${observacoes}`
        : agendamento.observacoes,
    },
    include: {
      hospital: { select: { nome: true } },
    },
  });
};

export const obterHistoricoHospitalar = async (pacienteId) => {
  const [solicitacoes, internacoes, procedimentos, medicacoes, agendamentos] = await Promise.all([
    prisma.solicitacaoInternacao.findMany({
      where: { pacienteId },
      include: {
        hospital: { select: { nome: true } },
        funcionario: { select: { nome: true, funcao: true } },
        ubs: { select: { nome: true } },
      },
    }),
    prisma.internacao.findMany({
      where: { pacienteId },
      include: {
        hospital: { select: { nome: true } },
      },
    }),
    prisma.procedimentoHospitalar.findMany({
      where: { pacienteId },
      include: {
        hospital: { select: { nome: true } },
        medicoRealizou: { select: { nome: true, funcao: true } },
      },
    }),
    prisma.medicacaoAdministrada.findMany({
      where: { pacienteId },
      include: {
        internacao: { select: { hospital: { select: { nome: true } } } },
        historicoMedico: { select: { id: true, laudo: true, dataConsulta: true } },
      },
    }),
    prisma.agendamentoHospitalar.findMany({
      where: { pacienteId },
      include: {
        hospital: { select: { nome: true } },
        medico: { select: { nome: true, funcao: true } },
      },
    }),
  ]);

  const historico = [
    ...solicitacoes.map((item) => ({ ...item, tipo: "solicitacao", data: item.createdAt })),
    ...internacoes.map((item) => ({ ...item, tipo: "internacao", data: item.dataEntrada })),
    ...procedimentos.map((item) => ({ ...item, tipo: "procedimento", data: item.dataRealizacao })),
    ...medicacoes.map((item) => ({ ...item, tipo: "medicacao", data: item.dataHoraAdministracao })),
    ...agendamentos.map((item) => ({ ...item, tipo: "agendamento", data: item.dataAgendamento })),
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  return {
    historico,
    resumo: {
      totalSolicitacoes: solicitacoes.length,
      totalInternacoes: internacoes.length,
      totalProcedimentos: procedimentos.length,
      totalMedicacoes: medicacoes.length,
      totalAgendamentos: agendamentos.length,
    },
  };
};

export const obterReceitasEAtestados = async (pacienteId) => {
  const [receitas, atestados] = await Promise.all([
    prisma.receitaMedica.findMany({
      where: { pacienteId },
      include: {
        funcionario: {
          select: { id: true, nome: true, crm: true, funcao: true },
        },
        ubs: {
          select: { id: true, nome: true, endereco: true },
        },
        itens: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { dataEmissao: "desc" },
    }),
    prisma.atestadoMedico.findMany({
      where: { pacienteId },
      include: {
        funcionario: {
          select: { id: true, nome: true, crm: true, funcao: true },
        },
        ubs: {
          select: { id: true, nome: true, endereco: true },
        },
      },
      orderBy: { dataEmissao: "desc" },
    }),
  ]);

  return {
    receitas: receitas.map(r => ({ ...r, tipoDocumento: "receita" })),
    atestados: atestados.map(a => ({ ...a, tipoDocumento: "atestado" }))
  };
};
