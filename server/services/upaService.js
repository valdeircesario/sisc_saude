import { prisma } from '../config/database.js';

export const criarTriagem = async (upaId, data) => {
  const { pacienteId, sintomas, sinais, prioridade, observacoes } = data;
  return await prisma.triagem.create({
    data: {
      upaId,
      pacienteId,
      sintomas,
      sinais,
      prioridade: prioridade || 'medio',
      status: 'em_andamento',
      observacoes
    }
  });
};

export const listarTriagens = async (upaId) => {
  let triagens = await prisma.triagem.findMany({
    where: { upaId, status: 'em_andamento' },
    include: { paciente: { select: { id: true, nome: true, cpf: true, cns: true, nascimento: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const prioridadeOrdem = { alto: 3, medio: 2, baixo: 1 };
  triagens = triagens.sort((a, b) => {
    const pa = prioridadeOrdem[a.prioridade] || 0;
    const pb = prioridadeOrdem[b.prioridade] || 0;
    if (pa !== pb) return pb - pa;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return triagens;
};

export const listarPacientes = async (busca) => {
  const where = busca ? {
    OR: [
      { nome: { contains: String(busca), mode: 'insensitive' } },
      { cpf: { contains: String(busca) } },
      { cns: { contains: String(busca) } },
      { email: { contains: String(busca), mode: 'insensitive' } }
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
      telefone: true,
      email: true,
      createdAt: true
    },
    orderBy: { nome: 'asc' }
  });
};

export const listarCandidatosAtendimento = async (upaId) => {
  return await prisma.triagem.findMany({
    where: {
      upaId,
      status: 'em_andamento',
      atendimentos: { none: {} }
    },
    include: { paciente: { select: { id: true, nome: true, cpf: true, cns: true } } },
    orderBy: { createdAt: 'asc' }
  });
};

export const criarAtendimento = async (upaId, data) => {
  const { pacienteId, triagemId, descricao, profissional, laudo, notas, status } = data;
  return await prisma.atendimento.create({
    data: {
      upaId,
      pacienteId,
      triagemId: triagemId || null,
      descricao,
      profissional,
      laudo: laudo || null,
      notas: notas || null,
      status: status || 'pendente',
      dataAtendimento: new Date()
    }
  });
};

export const listarAtendimentos = async (upaId) => {
  return await prisma.atendimento.findMany({
    where: { upaId },
    include: { paciente: { select: { id: true, nome: true } }, triagem: true },
    orderBy: { dataAtendimento: 'desc' }
  });
};

export const atualizarAtendimento = async (id, data) => {
  const { descricao, profissional, status } = data;

  const atendimentoAtual = await prisma.atendimento.findUnique({ where: { id } });
  if (!atendimentoAtual) {
    throw { status: 404, data: { message: 'Atendimento não encontrado' } };
  }

  if (['finalizado', 'ausente'].includes((atendimentoAtual.status || '').toLowerCase())) {
    throw { status: 400, data: { message: 'Atendimento finalizado/ausente não pode ser alterado' } };
  }

  const dados = {};
  if (descricao !== undefined) dados.descricao = descricao;
  if (profissional !== undefined) dados.profissional = profissional;
  if (status !== undefined) dados.status = status;

  return await prisma.atendimento.update({
    where: { id },
    data: dados,
    include: { paciente: { select: { id: true, nome: true } }, triagem: true }
  });
};

export const registrarMedicacao = async (upaId, data) => {
  const { pacienteId, nomeMedicacao, dosagem, viaAdministracao, dataHoraAdministracao, administradorNome, observacoes, atendimentoId } = data;
  
  if (atendimentoId) {
    const at = await prisma.atendimento.findUnique({ where: { id: atendimentoId } });
    if (!at) {
      throw { status: 400, data: { message: 'Atendimento inválido' } };
    }
    if ((at.status || '').toLowerCase() !== 'em_atendimento') {
      throw { status: 400, data: { message: 'Não é possível registrar medicação a menos que o atendimento esteja em atendimento' } };
    }
  }

  return await prisma.upaMedicacao.create({
    data: {
      upaId,
      pacienteId,
      nomeMedicacao,
      dosagem,
      viaAdministracao,
      dataHoraAdministracao: dataHoraAdministracao ? new Date(dataHoraAdministracao) : new Date(),
      administradorNome: administradorNome || null,
      observacoes,
      atendimentoId: atendimentoId || null
    }
  });
};

export const listarMedicacoes = async (upaId) => {
  return await prisma.upaMedicacao.findMany({
    where: { upaId },
    include: { paciente: { select: { id: true, nome: true } } },
    orderBy: { dataHoraAdministracao: 'desc' }
  });
};

export const solicitarExame = async (upaId, data) => {
  const { pacienteId, laboratorioId, tipoExame, observacoes, atendimentoId } = data;
  
  if (atendimentoId) {
    const at = await prisma.atendimento.findUnique({ where: { id: atendimentoId } });
    if (!at) {
      throw { status: 400, data: { message: 'Atendimento inválido' } };
    }
    if ((at.status || '').toLowerCase() !== 'em_atendimento') {
      throw { status: 400, data: { message: 'Não é possível solicitar exame a menos que o atendimento esteja em atendimento' } };
    }
  }

  return await prisma.upaSolicitacaoExame.create({
    data: {
      upaId,
      pacienteId,
      laboratorioId: laboratorioId || null,
      tipoExame,
      observacoes,
      status: 'pendente',
      atendimentoId: atendimentoId || null
    }
  });
};

export const listarSolicitacoesExame = async (upaId) => {
  return await prisma.upaSolicitacaoExame.findMany({
    where: { upaId },
    include: { paciente: { select: { id: true, nome: true } }, laboratorio: { select: { id: true, nome: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

export const atualizarSolicitacaoExame = async (id, data) => {
  const { status, resultado, arquivoPdf } = data;
  const dados = {};
  if (status !== undefined) dados.status = status;
  if (resultado !== undefined) dados.resultado = resultado;
  if (arquivoPdf !== undefined) dados.arquivoPdf = arquivoPdf;

  return await prisma.upaSolicitacaoExame.update({ where: { id }, data: dados });
};

export const registrarVacina = async (upaId, data) => {
  const { pacienteId, nome, lote, dataApl, proximaDose, aplicadoPor, atendimentoId } = data;
  
  if (atendimentoId) {
    const at = await prisma.atendimento.findUnique({ where: { id: atendimentoId } });
    if (!at) {
      throw { status: 400, data: { message: 'Atendimento inválido' } };
    }
    if ((at.status || '').toLowerCase() !== 'em_atendimento') {
      throw { status: 400, data: { message: 'Não é possível registrar vacina a menos que o atendimento esteja em atendimento' } };
    }
  }

  return await prisma.upaVacina.create({
    data: {
      upaId,
      pacienteId,
      nome,
      lote,
      dataApl: new Date(dataApl),
      proximaDose: proximaDose ? new Date(proximaDose) : null,
      aplicadoPor: aplicadoPor || null,
      atendimentoId: atendimentoId || null
    }
  });
};

export const listarVacinas = async (upaId) => {
  return await prisma.upaVacina.findMany({
    where: { upaId },
    include: { paciente: { select: { id: true, nome: true } } },
    orderBy: { dataApl: 'desc' }
  });
};

export const criarEncaminhamento = async (upaId, data) => {
  const { pacienteId, hospitalId, motivo, observacoes, atendimentoId } = data;
  
  if (atendimentoId) {
    const at = await prisma.atendimento.findUnique({ where: { id: atendimentoId } });
    if (!at) {
      throw { status: 400, data: { message: 'Atendimento inválido' } };
    }
    if ((at.status || '').toLowerCase() !== 'em_atendimento') {
      throw { status: 400, data: { message: 'Não é possível criar encaminhamento a menos que o atendimento esteja em atendimento' } };
    }
  }

  return await prisma.encaminhamento.create({
    data: {
      upaId,
      pacienteId,
      hospitalId,
      motivo,
      observacoes,
      status: 'pendente',
      atendimentoId: atendimentoId || null
    }
  });
};

export const listarEncaminhamentos = async (upaId) => {
  return await prisma.encaminhamento.findMany({
    where: { upaId },
    include: { paciente: { select: { id: true, nome: true } }, hospital: { select: { id: true, nome: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

export const listarHospitais = async () => {
  return await prisma.hospital.findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } });
};

export const listarLaboratorios = async () => {
  return await prisma.laboratorio.findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } });
};
