import { prisma } from '../config/database.js';

export const listarPacientes = async (busca) => {
  const where = busca ? {
    OR: [
      { nome: { contains: busca, mode: 'insensitive' } },
      { cpf: { contains: busca } },
      { cns: { contains: busca } },
      { email: { contains: busca, mode: 'insensitive' } }
    ]
  } : {};

  return await prisma.paciente.findMany({
    where,
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
      createdAt: true
    },
    orderBy: { nome: 'asc' }
  });
};

export const obterPaciente = async (id) => {
  const paciente = await prisma.paciente.findUnique({
    where: { id },
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
      createdAt: true
    }
  });

  if (!paciente) {
    throw { status: 404, data: { message: 'Paciente não encontrado' } };
  }
  return paciente;
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
            select: { nome: true }
          }
        }
      }
    },
    orderBy: { dataConsulta: 'desc' }
  });
};

export const listarSolicitacoesInternacao = async (hospitalId, query) => {
  const { status, prioridade, tipo } = query;
  
  const where = { hospitalId };
  if (status) where.status = status;
  if (prioridade) where.prioridade = prioridade;
  if (tipo) where.tipo = tipo;

  const solicitacoes = await prisma.solicitacaoInternacao.findMany({
    where,
    include: {
      paciente: {
        select: {
          id: true,
          nome: true,
          cpf: true,
          cns: true,
          telefone: true,
          email: true,
          nascimento: true,
          endereco: true
        }
      },
      funcionario: {
        select: { nome: true, funcao: true, crm: true }
      },
      ubs: {
        select: { nome: true, telefone: true, endereco: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const prioridadeOrdem = { 'gravissimo': 5, 'urgente': 4, 'grave': 3, 'medio': 2, 'leve': 1 };
  
  return solicitacoes.sort((a, b) => {
    const prioridadeA = prioridadeOrdem[a.prioridade] || 0;
    const prioridadeB = prioridadeOrdem[b.prioridade] || 0;
    
    if (prioridadeA !== prioridadeB) {
      return prioridadeB - prioridadeA;
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
};

export const obterSolicitacaoInternacao = async (id, hospitalId) => {
  const solicitacao = await prisma.solicitacaoInternacao.findUnique({
    where: { id, hospitalId },
    include: {
      paciente: {
        select: { id: true, nome: true, cpf: true, cns: true, telefone: true, email: true, nascimento: true, endereco: true }
      },
      funcionario: {
        select: { nome: true, funcao: true, crm: true }
      },
      ubs: {
        select: { nome: true, telefone: true, endereco: true }
      }
    }
  });

  if (!solicitacao) {
    throw { status: 404, data: { message: 'Solicitação não encontrada' } };
  }
  return solicitacao;
};

export const atualizarStatusSolicitacao = async (id, hospitalId, data) => {
  const { status, observacoes } = data;
  const statusPermitidos = ['pendente', 'avaliando', 'agendado', 'realizado', 'cancelado'];
  
  if (!statusPermitidos.includes(status)) {
    throw { status: 400, data: { message: 'Status inválido. Permitidos: ' + statusPermitidos.join(', ') } };
  }

  try {
    return await prisma.solicitacaoInternacao.update({
      where: { id, hospitalId },
      data: { status, observacoes },
      include: {
        paciente: { select: { nome: true, email: true, telefone: true } },
        funcionario: { select: { nome: true } },
        ubs: { select: { nome: true } }
      }
    });
  } catch (error) {
    if (error.code === 'P2025') throw { status: 404, data: { message: 'Solicitação não encontrada' } };
    throw error;
  }
};

export const aceitarSolicitacao = async (id, hospitalId, data) => {
  const { observacoes } = data;
  try {
    return await prisma.solicitacaoInternacao.update({
      where: { id, hospitalId, status: 'pendente' },
      data: { status: 'avaliando', observacoes },
      include: {
        paciente: { select: { nome: true, email: true, telefone: true } },
        ubs: { select: { nome: true } },
        funcionario: { select: { nome: true } }
      }
    });
  } catch (error) {
    if (error.code === 'P2025') throw { status: 404, data: { message: 'Solicitação não encontrada ou não está pendente' } };
    throw error;
  }
};

export const agendarInternacao = async (id, hospitalId, data) => {
  const { dataAgendada, horaAgendada, local, recomendacoes, observacoes } = data;

  if (!dataAgendada || !horaAgendada) {
    throw { status: 400, data: { message: 'Data e hora do agendamento são obrigatórias' } };
  }

  try {
    return await prisma.solicitacaoInternacao.update({
      where: { id, hospitalId },
      data: {
        status: 'agendado',
        dataAgendada: new Date(dataAgendada),
        horaAgendada,
        local,
        recomendacoes,
        observacoes
      },
      include: {
        paciente: { select: { nome: true, email: true, telefone: true } },
        funcionario: { select: { nome: true } },
        ubs: { select: { nome: true } }
      }
    });
  } catch (error) {
    if (error.code === 'P2025') throw { status: 404, data: { message: 'Solicitação não encontrada' } };
    throw error;
  }
};

export const rejeitarSolicitacao = async (id, hospitalId, data) => {
  const { observacoes } = data;
  try {
    return await prisma.solicitacaoInternacao.update({
      where: { id, hospitalId },
      data: { status: 'cancelado', observacoes },
      include: {
        paciente: { select: { nome: true, email: true } },
        funcionario: { select: { nome: true } },
        ubs: { select: { nome: true } }
      }
    });
  } catch (error) {
    if (error.code === 'P2025') throw { status: 404, data: { message: 'Solicitação não encontrada' } };
    throw error;
  }
};

export const listarInternacoes = async (hospitalId, busca) => {
  const where = { hospitalId };

  if (busca) {
    where.paciente = {
      nome: { contains: busca, mode: 'insensitive' }
    };
  }

  const internacoes = await prisma.internacao.findMany({
    where,
    include: {
      paciente: {
        select: { id: true, nome: true, cpf: true, cns: true, telefone: true, email: true, nascimento: true, endereco: true }
      },
      solicitacaoInternacao: {
        select: { motivo: true, tipo: true, prioridade: true }
      },
      altaHospitalar: true,
    },
    orderBy: { dataEntrada: 'desc' },
  });

  return internacoes.map(internacao => ({
    id: internacao.id,
    paciente: internacao.paciente,
    motivoInternacao: internacao.motivoInternacao || internacao.solicitacaoInternacao?.motivo,
    dataEntrada: internacao.dataEntrada,
    dataSaida: internacao.dataSaida,
    quarto: internacao.quarto,
    leito: internacao.leito,
    medicoResponsavelNome: internacao.medicoResponsavelNome,
    diagnosticoInicial: internacao.diagnosticoInicial,
    diagnosticoFinal: internacao.diagnosticoFinal,
    observacoes: internacao.observacoes,
    status: internacao.status,
    solicitacaoInternacao: internacao.solicitacaoInternacao,
    altaHospitalar: internacao.altaHospitalar,
  }));
};

export const obterDetalhesInternacao = async (id, hospitalId) => {
  const internacao = await prisma.internacao.findUnique({
    where: { id, hospitalId },
    include: {
      paciente: {
        select: { id: true, nome: true, cpf: true, cns: true, telefone: true, email: true, nascimento: true, endereco: true }
      },
      solicitacaoInternacao: {
        select: { motivo: true, tipo: true, prioridade: true }
      },
      medicacoesAdministradas: {
        include: {},
        orderBy: { dataHoraAdministracao: 'desc' }
      },
      solicitacoesExameInternacao: {
        include: { laboratorio: { select: { nome: true } } },
        orderBy: { dataSolicitacao: 'desc' }
      },
      altaHospitalar: true,
    },
  });

  if (!internacao) {
    throw { status: 404, data: { message: 'Internação não encontrada ou não pertence a este hospital.' } };
  }
  return internacao;
};

export const criarInternacao = async (hospitalId, data) => {
  const { 
    solicitacaoInternacaoId, pacienteId, dataEntrada, 
    motivoInternacao, diagnosticoInicial, medicoResponsavelNome, 
    quarto, leito, observacoes
  } = data;

  if (!solicitacaoInternacaoId || !pacienteId || !dataEntrada || !motivoInternacao || !diagnosticoInicial || !medicoResponsavelNome || !quarto || !leito) {
    throw { status: 400, data: { message: 'Todos os campos obrigatórios para internação devem ser preenchidos.' } };
  }

  const solicitacao = await prisma.solicitacaoInternacao.findUnique({
    where: { id: solicitacaoInternacaoId, hospitalId },
  });

  if (!solicitacao) {
    throw { status: 404, data: { message: 'Solicitação de internação não encontrada ou não pertence a este hospital.' } };
  }

  try {
    const novaInternacao = await prisma.internacao.create({
      data: {
        solicitacaoInternacaoId,
        pacienteId,
        hospitalId,
        dataEntrada: new Date(dataEntrada),
        motivoInternacao,
        diagnosticoInicial,
        medicoResponsavelNome,
        quarto,
        leito,
        observacoes,
        status: 'ativa',
      },
    });

    await prisma.solicitacaoInternacao.update({
      where: { id: solicitacaoInternacaoId },
      data: { status: 'realizado' },
    });

    return novaInternacao;
  } catch (error) {
    if (error.code === 'P2002') throw { status: 400, data: { message: 'Já existe uma internação para esta solicitação.' } };
    throw error;
  }
};

export const atualizarObservacoesInternacao = async (id, hospitalId, observacoes) => {
  try {
    return await prisma.internacao.update({
      where: { id, hospitalId },
      data: { observacoes },
    });
  } catch (error) {
    if (error.code === 'P2025') throw { status: 404, data: { message: 'Internação não encontrada ou não pertence a este hospital.' } };
    throw error;
  }
};

export const registrarAltaHospitalar = async (internacaoId, hospitalId, data) => {
  const { 
    pacienteId, medicoResponsavel, dataAlta, tipoAlta, 
    condicaoAlta, diagnosticoFinal, orientacoesAlta, 
    medicacoesPrescritas, retornoAgendado, observacoes,
  } = data;

  if (!pacienteId || !medicoResponsavel || !dataAlta || !tipoAlta || !condicaoAlta || !diagnosticoFinal || !orientacoesAlta) {
    throw { status: 400, data: { message: "Todos os campos obrigatórios para alta devem ser preenchidos." } };
  }

  const internacaoExistente = await prisma.internacao.findUnique({
    where: { id: internacaoId, hospitalId },
  });

  if (!internacaoExistente) {
    throw { status: 404, data: { message: "Internação não encontrada ou não pertence a este hospital." } };
  }

  if (internacaoExistente.status === "alta") {
    throw { status: 400, data: { message: "Esta internação já possui alta registrada." } };
  }

  const novaAlta = await prisma.altaHospitalar.create({
    data: {
      internacaoId,
      pacienteId,
      medicoResponsavel,
      dataAlta: new Date(dataAlta),
      tipoAlta,
      condicaoAlta,
      diagnosticoFinal,
      orientacoesAlta,
      medicacoesPrescritas,
      retornoAgendado: retornoAgendado ? new Date(retornoAgendado) : null,
      observacoes,
    },
  });

  await prisma.internacao.update({
    where: { id: internacaoId },
    data: {
      status: "alta",
      dataSaida: new Date(dataAlta),
      diagnosticoFinal: diagnosticoFinal,
    },
  });

  return novaAlta;
};

export const registrarMedicacaoInternacao = async (internacaoId, data) => {
  const {
    pacienteId, nomeMedicacao, dosagem, viaAdministracao, 
    dataHoraAdministracao, administradorNomeOuCrm, observacoes
  } = data;

  if (!internacaoId || !pacienteId || !nomeMedicacao || !dataHoraAdministracao || !administradorNomeOuCrm) {
    throw { status: 400, data: { message: 'Campos obrigatórios faltando.' } };
  }

  return await prisma.medicacaoAdministrada.create({
    data: {
      internacaoId,
      pacienteId,
      nomeMedicacao,
      dosagem,
      viaAdministracao,
      dataHoraAdministracao: new Date(dataHoraAdministracao),
      administradorNomeOuCrm,
      observacoes,
    },
  });
};

export const listarMedicacoesInternacao = async (internacaoId) => {
  return await prisma.medicacaoAdministrada.findMany({
    where: { internacaoId },
    orderBy: { dataHoraAdministracao: "desc" }
  });
};

export const solicitarExameInternacao = async (internacaoId, hospitalId, data) => {
  const { pacienteId, laboratorioId, tipoExame, observacoes } = data;

  if (!pacienteId || !laboratorioId || !tipoExame) {
    throw { status: 400, data: { message: "Campos obrigatórios para solicitação de exame: pacienteId, laboratorioId, tipoExame." } };
  }

  const internacaoExistente = await prisma.internacao.findUnique({
    where: { id: internacaoId, hospitalId },
  });

  if (!internacaoExistente) {
    throw { status: 404, data: { message: "Internação não encontrada ou não pertence a este hospital." } };
  }

  return await prisma.solicitacaoExameInternacao.create({
    data: {
      internacaoId,
      pacienteId,
      laboratorioId,
      tipoExame,
      observacoes,
      dataSolicitacao: new Date(),
      status: "pendente",
    },
  });
};

export const listarSolicitacoesExameInternacao = async (internacaoId) => {
  return await prisma.solicitacaoExameInternacao.findMany({
    where: { internacaoId },
    include: {
      laboratorio: { select: { nome: true } }
    },
    orderBy: { dataSolicitacao: "desc" }
  });
};

export const atualizarSolicitacaoExameInternacao = async (id, data) => {
  const { status, dataResultado, resultado, arquivoPdf } = data;

  return await prisma.solicitacaoExameInternacao.update({
    where: { id },
    data: {
      status,
      dataResultado: dataResultado ? new Date(dataResultado) : undefined,
      resultado,
      arquivoPdf,
    },
  });
};

export const listarLaboratorios = async () => {
  return await prisma.laboratorio.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' }
  });
};
