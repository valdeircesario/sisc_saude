import { prisma } from "../config/database.js";
import bcrypt from "bcryptjs";
import {
  notificarConsultaAgendada,
  notificarConsultaCancelada,
  notificarCampanhaAgendada,
  notificarInternacaoStatus,
  buscarPacienteIdPorCpf,
} from "./notificacaoService.js";

export const getFuncionarioById = async (id) => {
  return await prisma.funcionario.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      funcao: true,
      ubsId: true,
    },
  });
};

export const listarHospitais = async () => {
  return await prisma.hospital.findMany({
    select: {
      id: true,
      nome: true,
      endereco: true,
      telefone: true,
      email: true,
      cnpj: true,
      createdAt: true,
    },
    orderBy: { nome: "asc" },
  });
};

export const obterHospital = async (id) => {
  const hospital = await prisma.hospital.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      endereco: true,
      telefone: true,
      email: true,
      cnpj: true,
      createdAt: true,
    },
  });

  if (!hospital) {
    throw { status: 404, data: { message: "Hospital não encontrado" } };
  }
  return hospital;
};

export const listarMedicamentos = async (ubsId, busca) => {
  const where = {
    ubsId,
    ...(busca
      ? {
          OR: [
            { nome: { contains: String(busca), mode: "insensitive" } },
            { descricao: { contains: String(busca), mode: "insensitive" } },
            { lote: { contains: String(busca), mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return await prisma.medicamento.findMany({
    where,
    select: {
      id: true,
      nome: true,
      descricao: true,
      lote: true,
      quantidade: true,
      observacoes: true,
      dataValidade: true,
      vencido: true,
      ubsId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ nome: "asc" }],
  });
};

export const listarPacientes = async (busca) => {
  const where = busca
    ? {
        OR: [
          { nome: { contains: busca, mode: "insensitive" } },
          { cpf: { contains: busca } },
          { cns: { contains: busca } },
          { email: { contains: busca, mode: "insensitive" } },
        ],
      }
    : {};

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
      createdAt: true,
    },
    orderBy: { nome: "asc" },
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
      createdAt: true,
    },
  });

  if (!paciente) {
    throw { status: 404, data: { message: "Paciente não encontrado" } };
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
            select: {
              nome: true,
            },
          },
        },
      },
    },
    orderBy: { dataConsulta: "desc" },
  });
};

export const obterConsultasPaciente = async (pacienteId) => {
  return await prisma.consulta.findMany({
    where: { pacienteId },
    include: {
      funcionario: {
        select: {
          nome: true,
          funcao: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const agendarConsultaPaciente = async (pacienteId, ubsId, data) => {
  const { especialidade, motivo, dataAgendada, funcionarioId, observacoes } =
    data;

  return await prisma.consulta
    .create({
      data: {
        pacienteId,
        ubsId,
        especialidade,
        motivo,
        dataAgendada: new Date(dataAgendada),
        funcionarioId,
        observacoes,
        status: "agendada",
      },
      include: {
        paciente: {
          select: { nome: true, email: true },
        },
        funcionario: {
          select: { nome: true, funcao: true },
        },
      },
    })
    .then(async (consulta) => {
      await notificarConsultaAgendada(consulta);
      return consulta;
    });
};

export const editarPaciente = async (pacienteId, data) => {
  const { endereco, telefone } = data;

  return await prisma.paciente.update({
    where: { id: pacienteId },
    data: { endereco, telefone },
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

export const listarFuncionarios = async (ubsId) => {
  return await prisma.funcionario.findMany({
    where: { ubsId },
    select: {
      id: true,
      nome: true,
      funcao: true,
      crm: true,
      cpf: true,
      telefone: true,
      email: true,
      createdAt: true,
    },
  });
};

export const cadastrarFuncionario = async (ubsId, data) => {
  const { nome, funcao, crm, cpf, telefone, email, senha } = data;

  const funcExistente = await prisma.funcionario.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { cpf }],
    },
  });

  if (funcExistente) {
    throw {
      status: 400,
      data: { message: "Funcionário já cadastrado com estes dados" },
    };
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const novoFunc = await prisma.funcionario.create({
    data: {
      nome,
      funcao,
      crm,
      cpf,
      telefone,
      email: email.toLowerCase(),
      senha: senhaHash,
      ubsId,
    },
  });

  return {
    id: novoFunc.id,
    nome: novoFunc.nome,
    funcao: novoFunc.funcao,
    crm: novoFunc.crm,
    cpf: novoFunc.cpf,
    telefone: novoFunc.telefone,
    email: novoFunc.email,
  };
};

export const editarFuncionario = async (id, ubsId, data) => {
  const { nome, funcao, crm, cpf, telefone, email, senha } = data;

  const dados = {
    nome,
    funcao,
    crm,
    cpf,
    telefone,
    email: email.toLowerCase(),
  };

  if (senha) {
    dados.senha = await bcrypt.hash(senha, 12);
  }

  const funcAtualizado = await prisma.funcionario.update({
    where: {
      id,
      ubsId,
    },
    data: dados,
  });

  return {
    id: funcAtualizado.id,
    nome: funcAtualizado.nome,
    funcao: funcAtualizado.funcao,
    crm: funcAtualizado.crm,
    cpf: funcAtualizado.cpf,
    telefone: funcAtualizado.telefone,
    email: funcAtualizado.email,
  };
};

export const deletarFuncionario = async (id, ubsId) => {
  await prisma.funcionario.delete({
    where: {
      id,
      ubsId,
    },
  });
};

export const criarCampanha = async (ubsId, data) => {
  const { titulo, descricao, tipo, dataIni, dataFim } = data;

  return await prisma.campanha.create({
    data: {
      titulo,
      descricao,
      tipo,
      dataIni: new Date(dataIni),
      dataFim: dataFim ? new Date(dataFim) : null,
      ubsId,
    },
  });
};

export const listarCampanhas = async (ubsId) => {
  return await prisma.campanha.findMany({
    where: { ubsId },
    include: {
      _count: {
        select: {
          inscricoes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const editarCampanha = async (id, ubsId, data) => {
  const { titulo, descricao, tipo, dataIni, dataFim } = data;

  return await prisma.campanha.update({
    where: {
      id,
      ubsId,
    },
    data: {
      titulo,
      descricao,
      tipo,
      dataIni: new Date(dataIni),
      dataFim: dataFim ? new Date(dataFim) : null,
    },
  });
};

export const deletarCampanha = async (id, ubsId) => {
  const inscricoes = await prisma.inscricaoCampanha.count({
    where: { campanhaId: id },
  });

  if (inscricoes > 0) {
    throw {
      status: 400,
      data: { message: "Não é possível excluir campanha com inscrições" },
    };
  }

  await prisma.campanha.delete({
    where: {
      id,
      ubsId,
    },
  });
};

export const listarInscricoesCampanha = async (campanhaId, ubsId) => {
  const campanha = await prisma.campanha.findFirst({
    where: { id: campanhaId, ubsId },
  });

  if (!campanha) {
    throw { status: 404, data: { message: "Campanha não encontrada" } };
  }

  return await prisma.inscricaoCampanha.findMany({
    where: { campanhaId },
    include: { agendamento: true },
    orderBy: [{ pontuacao: "desc" }, { createdAt: "asc" }],
  });
};

export const agendarInscricaoCampanha = async (
  campanhaId,
  inscricaoId,
  ubsId,
  data,
) => {
  const { dataAgendada, horaAgendada, localAtendimento, observacoes } = data;

  const campanha = await prisma.campanha.findFirst({
    where: { id: campanhaId, ubsId },
  });

  if (!campanha) {
    throw { status: 404, data: { message: "Campanha não encontrada" } };
  }

  const agendamento = await prisma.agendamentoCampanha.upsert({
    where: { inscricaoId: inscricaoId },
    create: {
      campanhaId,
      ubsId,
      inscricaoId,
      dataAgendada: new Date(dataAgendada),
      horaAgendada,
      localAtendimento,
      observacoes,
      status: "agendado",
    },
    update: {
      dataAgendada: new Date(dataAgendada),
      horaAgendada,
      localAtendimento,
      observacoes,
      status: "agendado",
    },
  });

  await prisma.inscricaoCampanha.update({
    where: { id: inscricaoId },
    data: {
      status: "agendado",
      dataAgendada: new Date(dataAgendada),
      horaAgendada,
      localAtendimento,
      observacoes,
      tipoAgendamento: "campanha",
    },
  });

  const inscricao = await prisma.inscricaoCampanha.findUnique({
    where: { id: inscricaoId },
    select: { cpf: true },
  });

  if (inscricao?.cpf) {
    const pacienteId = await buscarPacienteIdPorCpf(inscricao.cpf);
    if (pacienteId) {
      await notificarCampanhaAgendada(pacienteId, agendamento, campanha.titulo);
    }
  }

  return agendamento;
};

export const cancelarAgendamentoCampanha = async (id, ubsId, justificativa) => {
  if (!justificativa?.trim()) {
    throw {
      status: 400,
      data: {
        message: "Justificativa é obrigatória para cancelar o agendamento.",
      },
    };
  }

  const agendamento = await prisma.agendamentoCampanha.findFirst({
    where: { id, ubsId },
  });

  if (!agendamento) {
    throw { status: 404, data: { message: "Agendamento não encontrado" } };
  }

  const updatedAgendamento = await prisma.agendamentoCampanha.update({
    where: { id },
    data: {
      status: "cancelada",
      justificativa,
    },
  });

  await prisma.inscricaoCampanha.update({
    where: { id: agendamento.inscricaoId },
    data: { status: "cancelada", observacoes: justificativa },
  });

  return updatedAgendamento;
};

export const realizarAgendamentoCampanha = async (id, ubsId, observacoes) => {
  if (!observacoes?.trim()) {
    throw {
      status: 400,
      data: {
        message: "Observações são obrigatórias para registrar o atendimento.",
      },
    };
  }

  const agendamento = await prisma.agendamentoCampanha.findFirst({
    where: { id, ubsId },
  });

  if (!agendamento) {
    throw { status: 404, data: { message: "Agendamento não encontrado" } };
  }

  const updatedAgendamento = await prisma.agendamentoCampanha.update({
    where: { id },
    data: {
      status: "realizada",
      observacoes: observacoes
        ? `${agendamento.observacoes ? agendamento.observacoes + "\n" : ""}Realizado: ${observacoes}`
        : agendamento.observacoes,
    },
  });

  await prisma.inscricaoCampanha.update({
    where: { id: agendamento.inscricaoId },
    data: {
      status: "realizada",
      observacoes: observacoes
        ? `${agendamento.observacoes ? agendamento.observacoes + "\n" : ""}Realizado: ${observacoes}`
        : agendamento.observacoes,
    },
  });

  return updatedAgendamento;
};

export const listarAgendamentosCampanha = async (ubsId) => {
  const agendamentos = await prisma.agendamentoCampanha.findMany({
    where: { ubsId },
    include: {
      campanha: true,
      inscricao: true,
    },
    orderBy: { dataAgendada: "asc" },
  });
  return agendamentos;
};

export const listarConsultas = async (ubsId) => {
  return await prisma.consulta.findMany({
    where: { ubsId },
    include: {
      paciente: {
        select: {
          nome: true,
          cpf: true,
          telefone: true,
        },
      },
      funcionario: {
        select: {
          nome: true,
          funcao: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const obterEstatisticas = async (ubsId) => {
  const consultasSolicitadas = await prisma.consulta.count({
    where: {
      ubsId,
      status: { in: ["solicitada", "agendada"] },
    },
  });

  const consultasRealizadas = await prisma.consulta.count({
    where: {
      ubsId,
      status: "realizada",
    },
  });

  const consultasCanceladas = await prisma.consulta.count({
    where: {
      ubsId,
      status: "cancelada",
    },
  });

  const medicamentosDispensados = await prisma.medicacaoPaciente.count({
    where: { ubsId },
  });

  const vacinasRegistradas = await prisma.vacina.count({
    where: {
      funcionario: {
        ubsId,
      },
    },
  });

  const campanhasAtivas = await prisma.campanha.count({
    where: { ubsId, ativa: true },
  });

  const campanhasRealizadas = await prisma.campanha.count({
    where: {
      ubsId,
      agendamentos: {
        some: { status: "realizada" },
      },
    },
  });

  const totalFuncionarios = await prisma.funcionario.count({
    where: { ubsId },
  });

  const pacientesAtendidosRaw = await prisma.consulta.findMany({
    where: { ubsId },
    select: { pacienteId: true },
  });
  const pacientesAtendidos = new Set(
    pacientesAtendidosRaw.map((consulta) => consulta.pacienteId),
  ).size;

  const campanhas = await prisma.campanha.findMany({
    where: { ubsId },
    select: {
      id: true,
      titulo: true,
      tipo: true,
      dataIni: true,
      dataFim: true,
      _count: {
        select: {
          inscricoes: true,
        },
      },
    },
    orderBy: { dataIni: "desc" },
  });

  return {
    consultasSolicitadas,
    consultasRealizadas,
    consultasCanceladas,
    medicamentosDispensados,
    vacinasRegistradas,
    campanhasAtivas,
    campanhasRealizadas,
    totalFuncionarios,
    pacientesAtendidos,
    campanhas,
  };
};

export const obterRelatorio = async (ubsId, tipo, dataInicio, dataFim) => {
  const buildDateRange = (start, end) => {
    const range = {};

    if (start) {
      const startDate = new Date(`${start}T00:00:00.000`);
      if (!Number.isNaN(startDate.getTime())) {
        range.gte = startDate;
      }
    }

    if (end) {
      const endDate = new Date(`${end}T23:59:59.999`);
      if (!Number.isNaN(endDate.getTime())) {
        range.lte = endDate;
      }
    }

    return range;
  };

  const dateRange = buildDateRange(dataInicio, dataFim);
  const hasDateRange = Object.keys(dateRange).length > 0;

  switch (tipo) {
    case "estoque": {
      const where = { ubsId };
      if (hasDateRange) {
        where.createdAt = dateRange;
      }
      const estoque = await prisma.medicamento.findMany({
        where,
        select: {
          id: true,
          nome: true,
          descricao: true,
          lote: true,
          quantidade: true,
          dataValidade: true,
          vencido: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { nome: "asc" },
      });

      return {
        tipo,
        resultado: estoque,
      };
    }
    case "dispensacoes": {
      const where = { ubsId };
      if (hasDateRange) {
        where.dataRetirada = dateRange;
      }

      const dispensacoes = await prisma.medicacaoPaciente.findMany({
        where,
        include: {
          paciente: {
            select: { nome: true },
          },
          medicamento: {
            select: { nome: true },
          },
          funcionario: {
            select: { nome: true },
          },
        },
        orderBy: { dataRetirada: "desc" },
      });

      return {
        tipo,
        resultado: dispensacoes.map((item) => ({
          id: item.id,
          medicamento: item.medicamento?.nome,
          pacienteNome: item.paciente?.nome,
          quantidade: item.quantidade,
          dataRetirada: item.dataRetirada,
          funcionarioNome: item.funcionario?.nome,
          observacoes: item.observacoes,
        })),
      };
    }
    case "consultas": {
      const where = { ubsId };
      if (hasDateRange) {
        where.dataAgendada = dateRange;
      }

      const consultas = await prisma.consulta.findMany({
        where,
        include: {
          paciente: {
            select: { nome: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        tipo,
        resultado: consultas.map((item) => ({
          id: item.id,
          pacienteNome: item.paciente?.nome,
          especialidade: item.especialidade,
          dataAgendada: item.dataAgendada,
          status: item.status,
          createdAt: item.createdAt,
        })),
      };
    }
    case "vacinas": {
      const where = {
        funcionario: {
          ubsId,
        },
      };
      if (hasDateRange) {
        where.dataApl = dateRange;
      }

      const vacinas = await prisma.vacina.findMany({
        where,
        include: {
          paciente: {
            select: { nome: true },
          },
        },
        orderBy: { dataApl: "desc" },
      });

      return {
        tipo,
        resultado: vacinas.map((item) => ({
          id: item.id,
          pacienteNome: item.paciente?.nome,
          vacinaNome: item.nome,
          lote: item.lote,
          dataApl: item.dataApl,
          proximaDose: item.proximaDose,
        })),
      };
    }
    default:
      throw {
        status: 400,
        data: { message: "Tipo de relatório inválido" },
      };
  }
};

export const agendarConsulta = async (id, ubsId, data) => {
  const { dataAgendada, funcionarioId, observacoes } = data;

  const consultaExistente = await prisma.consulta.findFirst({
    where: { id, ubsId },
  });

  if (!consultaExistente) {
    throw { status: 404, data: { message: "Consulta não encontrada" } };
  }

  const funcionario = await prisma.funcionario.findFirst({
    where: { id: funcionarioId, ubsId },
  });

  if (!funcionario) {
    throw {
      status: 400,
      data: {
        message: "Funcionário não encontrado ou não pertence a esta UBS",
      },
    };
  }

  const consulta = await prisma.consulta.update({
    where: { id },
    data: {
      dataAgendada: new Date(dataAgendada),
      funcionarioId,
      observacoes,
      status: "agendada",
    },
    include: {
      paciente: {
        select: { nome: true, email: true },
      },
      funcionario: {
        select: { nome: true, funcao: true },
      },
    },
  });

  await notificarConsultaAgendada(consulta);
  return consulta;
};

export const cancelarConsulta = async (id, ubsId, observacoes) => {
  const consultaExistente = await prisma.consulta.findFirst({
    where: { id, ubsId },
  });

  if (!consultaExistente) {
    throw { status: 404, data: { message: "Consulta não encontrada" } };
  }

  if (consultaExistente.status === "cancelada") {
    throw { status: 400, data: { message: "Consulta já está cancelada" } };
  }

  if (consultaExistente.status === "realizada") {
    throw {
      status: 400,
      data: { message: "Não é possível cancelar uma consulta já realizada" },
    };
  }

  const consulta = await prisma.consulta.update({
    where: { id },
    data: {
      status: "cancelada",
      dataCancelamento: new Date(),
      observacoes: observacoes || "Consulta cancelada",
    },
    include: {
      paciente: {
        select: { nome: true, email: true },
      },
      funcionario: {
        select: { nome: true, funcao: true },
      },
    },
  });

  await notificarConsultaCancelada(consulta, observacoes);
  return consulta;
};

export const solicitarInternacao = async (ubsId, data) => {
  const {
    pacienteId,
    hospitalId,
    funcionarioId,
    tipo,
    motivo,
    detalhes,
    laudoMedico,
    prioridade,
  } = data;

  if (
    !pacienteId ||
    !hospitalId ||
    !funcionarioId ||
    !tipo ||
    !motivo ||
    !detalhes ||
    !laudoMedico
  ) {
    throw {
      status: 400,
      data: { message: "Todos os campos obrigatórios devem ser preenchidos" },
    };
  }

  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId },
    select: { id: true, nome: true, cpf: true, cns: true },
  });

  if (!paciente) {
    throw { status: 404, data: { message: "Paciente não encontrado" } };
  }

  // Corrigido typo no prisma model 'hospitais' -> 'hospital'
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
    select: { id: true, nome: true, email: true },
  });

  if (!hospital) {
    throw { status: 404, data: { message: "Hospital não encontrado" } };
  }

  const funcionario = await prisma.funcionario.findFirst({
    where: {
      id: funcionarioId,
      ubsId,
    },
    select: { id: true, nome: true, funcao: true, crm: true },
  });

  if (!funcionario) {
    throw {
      status: 400,
      data: {
        message: "Funcionário não encontrado ou não pertence a esta UBS",
      },
    };
  }

  const ubs = await prisma.uBS.findUnique({
    where: { id: ubsId },
    select: { id: true, nome: true, email: true, telefone: true },
  });

  const solicitacaoInternacao = await prisma.solicitacaoInternacao.create({
    data: {
      pacienteId,
      hospitalId,
      ubsId,
      funcionarioId,
      tipo,
      motivo,
      detalhes,
      laudoMedico,
      prioridade: prioridade || "medio",
      status: "pendente",
    },
    include: {
      paciente: {
        select: {
          nome: true,
          cpf: true,
          cns: true,
          nascimento: true,
          telefone: true,
          endereco: true,
        },
      },
      hospital: {
        select: {
          nome: true,
          email: true,
        },
      },
      ubs: {
        select: {
          nome: true,
          email: true,
          telefone: true,
        },
      },
      funcionario: {
        select: {
          nome: true,
          funcao: true,
          crm: true,
        },
      },
    },
  });

  console.log(`Nova solicitação de internação criada:`, {
    id: solicitacaoInternacao.id,
    paciente: paciente.nome,
    hospital: hospital.nome,
    ubs: ubs.nome,
    tipo,
    prioridade,
  });

  await notificarInternacaoStatus(solicitacaoInternacao, "pendente");
  return solicitacaoInternacao;
};

export const listarSolicitacoesInternacao = async (ubsId, status) => {
  const where = { ubsId };
  if (status) {
    where.status = status;
  }

  return await prisma.solicitacaoInternacao.findMany({
    where,
    include: {
      paciente: {
        select: {
          nome: true,
          cpf: true,
          cns: true,
        },
      },
      hospital: {
        select: {
          nome: true,
        },
      },
      funcionario: {
        select: {
          nome: true,
          funcao: true,
        },
      },
    },
    orderBy: [{ prioridade: "desc" }, { createdAt: "desc" }],
  });
};

export const obterSolicitacaoInternacao = async (id, ubsId) => {
  const solicitacao = await prisma.solicitacaoInternacao.findFirst({
    where: {
      id,
      ubsId,
    },
    include: {
      paciente: {
        select: {
          nome: true,
          cpf: true,
          cns: true,
          nascimento: true,
          telefone: true,
          endereco: true,
          email: true,
        },
      },
      hospital: {
        select: {
          nome: true,
          email: true,
          telefone: true,
          endereco: true,
        },
      },
      ubs: {
        select: {
          nome: true,
          email: true,
          telefone: true,
        },
      },
      funcionario: {
        select: {
          nome: true,
          funcao: true,
          crm: true,
          email: true,
        },
      },
    },
  });

  if (!solicitacao) {
    throw {
      status: 404,
      data: { message: "Solicitação de internação não encontrada" },
    };
  }
  return solicitacao;
};

export const cancelarSolicitacaoInternacao = async (
  id,
  ubsId,
  motivoCancelamento,
) => {
  const solicitacao = await prisma.solicitacaoInternacao.findFirst({
    where: {
      id,
      ubsId,
      status: "pendente",
    },
  });

  if (!solicitacao) {
    throw {
      status: 404,
      data: { message: "Solicitação não encontrada ou não pode ser cancelada" },
    };
  }

  return await prisma.solicitacaoInternacao.update({
    where: { id },
    data: {
      status: "cancelada",
      observacoes: motivoCancelamento,
    },
  });
};
