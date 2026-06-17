import { prisma } from "../config/database.js";

export const registrarHistoricoMedico = async (funcionarioId, data) => {
  const { 
    pacienteId, 
    consultaId, 
    laudo, 
    doenca, 
    diagnostico, 
    medicacao, 
    observacoes, 
    dataConsulta,
    receita,
    atestado
  } = data;

  if (!pacienteId || !laudo || !diagnostico || !dataConsulta) {
    throw { status: 400, data: { message: "Campos obrigatórios: pacienteId, laudo, diagnostico e dataConsulta." } };
  }

  const result = await prisma.$transaction(async (tx) => {
    if (consultaId) {
      const historicoExistente = await tx.historicoMedico.findUnique({
        where: { consultaId },
      });

      if (historicoExistente) {
        throw { status: 409, data: { message: "Esta consulta já possui um histórico médico registrado." } };
      }
    }

    const novoHistorico = await tx.historicoMedico.create({
      data: {
        pacienteId,
        funcionarioId,
        consultaId,
        laudo,
        doenca,
        diagnostico,
        medicacao,
        observacoes,
        dataConsulta: new Date(dataConsulta),
      },
    });

    const funcionario = await tx.funcionario.findUnique({
      where: { id: funcionarioId },
      select: { ubsId: true },
    });

    if (!funcionario) {
      throw { status: 404, data: { message: "Funcionário não encontrado." } };
    }

    // Registrar Receita se fornecida
    if (receita && consultaId) {
      const { descricao, cid, medicamentos = [], observacoes: obsReceita, dataEmissao } = receita;
      if (descricao && cid && medicamentos.length > 0) {
        const novaReceita = await tx.receitaMedica.create({
          data: {
            pacienteId,
            funcionarioId,
            ubsId: funcionario.ubsId,
            consultaId,
            descricao,
            cid,
            medicamento: medicamentos[0].medicamento || "MULTIPLOS",
            dosagem: medicamentos[0].dosagem || "",
            quantidade: medicamentos[0].quantidade?.toString() || "1",
            status: "ativo",
            observacoes: obsReceita,
            dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
          },
        });

        await tx.receitaMedicamento.createMany({
          data: medicamentos.map((item) => ({
            receitaId: novaReceita.id,
            medicamento: item.medicamento,
            dosagem: item.dosagem,
            quantidade: Number(item.quantidade || 1),
            posologia: item.posologia || null,
            observacoes: item.observacoes || null,
            status: "pendente",
          })),
        });
      }
    }

    // Registrar Atestado se fornecido
    if (atestado && consultaId) {
      const { descricao, cid, diasRepouso, observacoes: obsAtestado, dataEmissao } = atestado;
      if (descricao && cid && diasRepouso) {
        await tx.atestadoMedico.create({
          data: {
            pacienteId,
            funcionarioId,
            ubsId: funcionario.ubsId,
            consultaId,
            descricao,
            cid,
            diasRepouso: Number(diasRepouso),
            observacoes: obsAtestado,
            dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
          },
        });
      }
    }

    if (consultaId) {
      try {
        await tx.consulta.update({
          where: { id: consultaId },
          data: { status: "realizado" },
        });
      } catch (err) {
        console.error("Erro ao atualizar status da consulta:", err);
      }
    }

    return novoHistorico;
  });

  return result;
};

export const registrarVacina = async (funcionarioId, data) => {
  const { pacienteId, nome, lote, dataApl, proximaDose } = data;

  return await prisma.vacina.create({
    data: {
      pacienteId,
      funcionarioId,
      nome,
      lote,
      dataApl: new Date(dataApl),
      proximaDose: proximaDose ? new Date(proximaDose) : null,
    },
  });
};

export const registrarReceita = async (funcionarioId, data) => {
  const {
    pacienteId, descricao, cid, medicamento, dosagem, medicamentos = [],
    status = "ativo", observacoes, dataEmissao,
  } = data;

  if (!pacienteId || !descricao || !cid) {
    throw { status: 400, data: { message: "Campos obrigatórios: pacienteId, descricao e cid." } };
  }

  const possuiListaMedicamentos = Array.isArray(medicamentos) && medicamentos.length > 0;

  if (!possuiListaMedicamentos && (!medicamento || !dosagem)) {
    throw { status: 400, data: { message: "Informe medicamento/dosagem ou uma lista de medicamentos." } };
  }

  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { id: true, nome: true, crm: true, funcao: true, ubsId: true },
  });

  if (!funcionario) {
    throw { status: 404, data: { message: "Funcionário não encontrado." } };
  }

  const receita = await prisma.receitaMedica.create({
    data: {
      pacienteId,
      funcionarioId,
      ubsId: funcionario.ubsId,
      descricao,
      cid,
      medicamento: medicamento || medicamentos?.[0]?.medicamento || "MULTIPLOS",
      dosagem: dosagem || medicamentos?.[0]?.dosagem || "",
      quantidade: medicamentos?.[0]?.quantidade?.toString() || "1",
      status,
      observacoes,
      dataEmissao: dataEmissao ? new Date(dataEmissao) : undefined,
    },
  });

  if (possuiListaMedicamentos) {
    await prisma.receitaMedicamento.createMany({
      data: medicamentos.map((item) => ({
        receitaId: receita.id,
        medicamento: item.medicamento,
        dosagem: item.dosagem,
        quantidade: Number(item.quantidade || 1),
        posologia: item.posologia || null,
        observacoes: item.observacoes || null,
        status: "pendente",
      })),
    });
  } else {
    await prisma.receitaMedicamento.create({
      data: {
        receitaId: receita.id,
        medicamento,
        dosagem,
        quantidade: 1,
        status: "pendente",
      },
    });
  }

  return await prisma.receitaMedica.findUnique({
    where: { id: receita.id },
    include: {
      paciente: { select: { id: true, nome: true, cpf: true, cns: true } },
      funcionario: { select: { id: true, nome: true, funcao: true, crm: true } },
      ubs: { select: { id: true, nome: true, endereco: true } },
      itens: { orderBy: { createdAt: "asc" } },
    },
  });
};

export const registrarAtestado = async (funcionarioId, data) => {
  const { pacienteId, descricao, cid, diasRepouso, observacoes, dataEmissao } = data;

  if (!pacienteId || !descricao || !cid || !diasRepouso) {
    throw { status: 400, data: { message: "Campos obrigatórios: pacienteId, descricao, cid e diasRepouso." } };
  }

  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { ubsId: true },
  });

  if (!funcionario) {
    throw { status: 404, data: { message: "Funcionário não encontrado." } };
  }

  return await prisma.atestadoMedico.create({
    data: {
      pacienteId,
      funcionarioId,
      ubsId: funcionario.ubsId,
      descricao,
      cid,
      diasRepouso: Number(diasRepouso),
      observacoes,
      dataEmissao: dataEmissao ? new Date(dataEmissao) : undefined,
    },
    include: {
      paciente: { select: { id: true, nome: true, cpf: true, cns: true } },
      funcionario: { select: { id: true, nome: true, funcao: true, crm: true } },
      ubs: { select: { id: true, nome: true, endereco: true } },
    },
  });
};

export const assinarReceita = async (id, data) => {
  const { assinaturaTexto, assinaturaPosX, assinaturaPosY, registroAssinatura } = data;

  if (!assinaturaTexto || assinaturaPosX == null || assinaturaPosY == null) {
    throw { status: 400, data: { message: "Campos obrigatórios: assinaturaTexto, assinaturaPosX e assinaturaPosY." } };
  }

  return await prisma.receitaMedica.update({
    where: { id },
    data: {
      assinaturaTexto,
      assinaturaPosX,
      assinaturaPosY,
      assinaturaConcluida: true,
      registroAssinatura,
      assinaturaData: new Date(),
    },
    include: {
      paciente: { select: { id: true, nome: true, cpf: true, cns: true } },
      funcionario: { select: { id: true, nome: true, funcao: true, crm: true } },
      ubs: { select: { id: true, nome: true, endereco: true } },
      itens: { orderBy: { createdAt: "asc" } },
    },
  });
};

export const assinarAtestado = async (id, data) => {
  const { assinaturaTexto, assinaturaPosX, assinaturaPosY, registroAssinatura } = data;

  if (!assinaturaTexto || assinaturaPosX == null || assinaturaPosY == null) {
    throw { status: 400, data: { message: "Campos obrigatórios: assinaturaTexto, assinaturaPosX e assinaturaPosY." } };
  }

  return await prisma.atestadoMedico.update({
    where: { id },
    data: {
      assinaturaTexto,
      assinaturaPosX,
      assinaturaPosY,
      assinaturaConcluida: true,
      registroAssinatura,
      assinaturaData: new Date(),
    },
    include: {
      paciente: { select: { id: true, nome: true, cpf: true, cns: true } },
      funcionario: { select: { id: true, nome: true, funcao: true, crm: true } },
      ubs: { select: { id: true, nome: true, endereco: true } },
    },
  });
};

export const obterUbsDoFuncionario = async (funcionarioId) => {
  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { ubsId: true },
  });

  if (!funcionario?.ubsId) {
    throw { status: 404, data: { message: "UBS do médico não encontrada." } };
  }

  const ubs = await prisma.uBS.findUnique({
    where: { id: funcionario.ubsId },
    select: { id: true, nome: true, endereco: true, telefone: true },
  });

  if (!ubs) {
    throw { status: 404, data: { message: "UBS não encontrada." } };
  }

  return ubs;
};

export const obterMeuPerfil = async (funcionarioId) => {
  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: {
      id: true,
      nome: true,
      funcao: true,
      crm: true,
      ubsId: true,
      ubs: {
        select: { id: true, nome: true, endereco: true, telefone: true },
      },
    },
  });

  if (!funcionario) {
    throw { status: 404, data: { message: "Funcionário não encontrado." } };
  }

  return funcionario;
};

export const listarMinhasReceitas = async (funcionarioId) => {
  return await prisma.receitaMedica.findMany({
    where: { funcionarioId },
    include: {
      paciente: { select: { id: true, nome: true, cpf: true, cns: true } },
      funcionario: { select: { id: true, nome: true, funcao: true, crm: true } },
      ubs: { select: { id: true, nome: true, endereco: true } },
      itens: { orderBy: { createdAt: "asc" } },
      dispensacoes: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const listarMeusAtestados = async (funcionarioId) => {
  return await prisma.atestadoMedico.findMany({
    where: { funcionarioId },
    include: {
      paciente: { select: { id: true, nome: true, cpf: true, cns: true } },
      funcionario: { select: { id: true, nome: true, funcao: true, crm: true } },
      ubs: { select: { id: true, nome: true, endereco: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const solicitarExame = async (funcionarioId, data) => {
  const { pacienteId, laboratorioId, tipoExame, observacoes } = data;

  return await prisma.solicitacaoExame.create({
    data: {
      pacienteId,
      funcionarioId,
      laboratorioId,
      tipoExame,
      observacoes,
    },
  });
};

export const solicitarInternacao = async (funcionarioId, data) => {
  const { pacienteId, hospitalId, tipo, motivo, detalhes, laudoMedico, prioridade = "medio", observacoes } = data;

  if (!pacienteId || !hospitalId || !tipo || !motivo || !detalhes || !laudoMedico) {
    throw { status: 400, data: { message: "Campos obrigatórios: pacienteId, hospitalId, tipo, motivo, detalhes, laudoMedico" } };
  }

  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { ubsId: true, nome: true, funcao: true },
  });

  if (!funcionario) {
    throw { status: 404, data: { message: "Funcionário não encontrado" } };
  }

  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId },
    select: { id: true, nome: true, cpf: true, telefone: true, email: true },
  });

  if (!paciente) {
    throw { status: 404, data: { message: "Paciente não encontrado" } };
  }

  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
    select: { id: true, nome: true, telefone: true, endereco: true },
  });

  if (!hospital) {
    throw { status: 404, data: { message: "Hospital não encontrado" } };
  }

  return await prisma.solicitacaoInternacao.create({
    data: {
      pacienteId,
      ubsId: funcionario.ubsId,
      hospitalId,
      funcionarioId,
      tipo,
      motivo,
      detalhes,
      laudoMedico,
      prioridade,
      observacoes,
      status: "pendente",
    },
    include: {
      paciente: { select: { nome: true, cpf: true, telefone: true, email: true } },
      hospital: { select: { nome: true, telefone: true, endereco: true } },
      ubs: { select: { nome: true } },
      funcionario: { select: { nome: true, funcao: true } },
    },
  });
};

export const listarMinhasSolicitacoesInternacao = async (funcionarioId, query) => {
  const { status, prioridade } = query;
  const where = { funcionarioId };
  if (status) where.status = status;
  if (prioridade) where.prioridade = prioridade;

  return await prisma.solicitacaoInternacao.findMany({
    where,
    include: {
      paciente: { select: { nome: true, cpf: true, telefone: true, email: true } },
      hospital: { select: { nome: true, telefone: true, endereco: true } },
      ubs: { select: { nome: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const listarTodasMinhasSolicitacoes = async (funcionarioId, query) => {
  const { status, prioridade } = query;

  const whereInternacao = { funcionarioId };
  if (status) whereInternacao.status = status;
  if (prioridade) whereInternacao.prioridade = prioridade;

  const whereExame = { funcionarioId };
  if (status) whereExame.status = status;

  const [solicitacoesInternacao, solicitacoesExame] = await Promise.all([
    prisma.solicitacaoInternacao.findMany({
      where: whereInternacao,
      include: {
        paciente: { select: { nome: true, cpf: true, telefone: true, email: true } },
        hospital: { select: { nome: true, telefone: true, endereco: true } },
        ubs: { select: { nome: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.solicitacaoExame.findMany({
      where: whereExame,
      include: {
        paciente: { select: { nome: true, cpf: true, telefone: true, email: true } },
        laboratorio: { select: { nome: true, telefone: true, endereco: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return [
    ...solicitacoesInternacao.map((item) => ({ ...item, solicitacaoTipo: "internacao" })),
    ...solicitacoesExame.map((item) => ({ ...item, solicitacaoTipo: "exame" })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const atualizarObservacoesSolicitacaoInternacao = async (id, funcionarioId, observacoes) => {
  try {
    return await prisma.solicitacaoInternacao.update({
      where: { id, funcionarioId },
      data: { observacoes },
      include: {
        paciente: { select: { nome: true } },
        hospital: { select: { nome: true } },
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw { status: 404, data: { message: "Solicitação não encontrada ou você não tem permissão para editá-la" } };
    }
    throw error;
  }
};

export const buscarPacientes = async (busca) => {
  const where = busca
    ? {
        OR: [
          { nome: { contains: busca, mode: "insensitive" } },
          { cpf: { contains: busca } },
          { cns: { contains: busca } },
        ],
      }
    : {};

  return await prisma.paciente.findMany({
    where,
    select: { id: true, nome: true, cpf: true, cns: true, telefone: true, email: true, nascimento: true },
    take: 50,
  });
};

export const obterHistoricoMedicoPaciente = async (pacienteId) => {
  return await prisma.historicoMedico.findMany({
    where: { pacienteId },
    include: {
      funcionario: { select: { nome: true, funcao: true, crm: true } },
    },
    orderBy: { dataConsulta: "desc" },
  });
};

export const buscarHistoricoCompletoCpf = async (cpf, userFuncao) => {
  const funcaoNormalizada = String(userFuncao || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (!["medico", "medico clinico geral", "medico geral"].includes(funcaoNormalizada)) {
    throw { status: 403, data: { message: "Acesso restrito apenas para médicos." } };
  }

  const paciente = await prisma.paciente.findFirst({
    where: { cpf: { equals: cpf, mode: "insensitive" } },
    select: { id: true, nome: true, cpf: true, cns: true, telefone: true, email: true, nascimento: true },
  });

  if (!paciente) {
    throw { status: 404, data: { message: "Paciente não encontrado para o CPF informado." } };
  }

  const [historico, consultas, exames, solicitacoesExame, solicitacoesInternacao, vacinas, medicacoes] = await Promise.all([
    prisma.historicoMedico.findMany({
      where: { pacienteId: paciente.id },
      include: { funcionario: { select: { nome: true, funcao: true, crm: true } } },
      orderBy: { dataConsulta: "desc" },
    }),
    prisma.consulta.findMany({
      where: { pacienteId: paciente.id },
      include: {
        funcionario: { select: { nome: true, funcao: true, crm: true } },
        ubs: { select: { nome: true } },
      },
      orderBy: { dataAgendada: "desc" },
    }),
    prisma.exame.findMany({
      where: { pacienteId: paciente.id },
      include: { laboratorio: { select: { nome: true, telefone: true } } },
      orderBy: { dataRealizado: "desc" },
    }),
    prisma.solicitacaoExame.findMany({
      where: { pacienteId: paciente.id },
      include: {
        funcionario: { select: { nome: true, funcao: true } },
        laboratorio: { select: { nome: true, telefone: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.solicitacaoInternacao.findMany({
      where: { pacienteId: paciente.id },
      include: {
        funcionario: { select: { nome: true, funcao: true } },
        hospital: { select: { nome: true, telefone: true, endereco: true } },
        ubs: { select: { nome: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vacina.findMany({
      where: { pacienteId: paciente.id },
      include: { funcionario: { select: { nome: true, funcao: true, crm: true } } },
      orderBy: { dataApl: "desc" },
    }),
    prisma.medicacaoPaciente.findMany({
      where: { pacienteId: paciente.id },
      include: {
        medicamento: { select: { nome: true, lote: true, descricao: true } },
        funcionario: { select: { nome: true, funcao: true } },
      },
      orderBy: { dataRetirada: "desc" },
    }),
  ]);

  const registros = [
    ...historico.map((item) => ({
      id: item.id, tipo: "historico", categoria: "Registro médico",
      dataRegistro: item.dataConsulta || item.createdAt,
      titulo: item.diagnostico || "Registro médico",
      resumo: item.laudo || item.observacoes || "Registro do atendimento médico.", detalhes: item,
    })),
    ...consultas.map((item) => ({
      id: item.id, tipo: "consulta", categoria: "Consulta",
      dataRegistro: item.dataAgendada || item.createdAt,
      titulo: item.motivo || "Consulta",
      resumo: `${item.especialidade || "Consulta"} • ${item.status || "status não informado"}`, detalhes: item,
    })),
    ...exames.map((item) => ({
      id: item.id, tipo: "exame", categoria: "Exame",
      dataRegistro: item.dataRealizado || item.dataAgendada || item.createdAt,
      titulo: item.tipo || "Exame",
      resumo: item.resultado || item.status || "Exame registrado no sistema.", detalhes: item,
    })),
    ...solicitacoesExame.map((item) => ({
      id: item.id, tipo: "solicitacao_exame", categoria: "Solicitação de exame",
      dataRegistro: item.createdAt, titulo: item.tipoExame || "Solicitação de exame",
      resumo: item.observacoes || "Solicitação enviada para laboratório.", detalhes: item,
    })),
    ...solicitacoesInternacao.map((item) => ({
      id: item.id, tipo: "encaminhamento", categoria: "Encaminhamento / internação",
      dataRegistro: item.createdAt,
      titulo: `${item.tipo || "Encaminhamento"} • ${item.motivo || "Motivo não informado"}`,
      resumo: item.detalhes || item.laudoMedico || "Encaminhamento registrado no sistema.", detalhes: item,
    })),
    ...vacinas.map((item) => ({
      id: item.id, tipo: "vacina", categoria: "Vacina",
      dataRegistro: item.dataApl || item.createdAt, titulo: item.nome || "Vacina",
      resumo: `Lote ${item.lote || "—"}${item.proximaDose ? ` • Próxima dose: ${new Date(item.proximaDose).toLocaleDateString("pt-BR")}` : ""}`, detalhes: item,
    })),
    ...medicacoes.map((item) => ({
      id: item.id, tipo: "medicacao", categoria: "Medicação",
      dataRegistro: item.dataRetirada || item.createdAt,
      titulo: item.medicamento?.nome || "Medicação ministrada",
      resumo: `${item.quantidade || 0} unidade(s) • ${item.observacoes || "Sem observações adicionais."}`, detalhes: item,
    })),
  ].sort((a, b) => new Date(b.dataRegistro).getTime() - new Date(a.dataRegistro).getTime());

  return { paciente, registros };
};

export const listarLaboratorios = async () => {
  return await prisma.laboratorio.findMany({
    select: { id: true, nome: true, endereco: true, telefone: true },
  });
};

export const listarHospitais = async () => {
  return await prisma.hospital.findMany({
    select: { id: true, nome: true, endereco: true, telefone: true, email: true },
    orderBy: { nome: "asc" },
  });
};

export const listarMinhasConsultas = async (funcionarioId) => {
  return await prisma.consulta.findMany({
    where: { funcionarioId },
    include: {
      paciente: { select: { id: true, nome: true, cpf: true, cns: true, telefone: true, email: true } },
      ubs: { select: { id: true, nome: true, endereco: true } },
      historicoMedico: { select: { id: true, diagnostico: true, doenca: true, laudo: true, medicacao: true, observacoes: true, dataConsulta: true } },
      receita: {
        include: {
          itens: { orderBy: { createdAt: "asc" } }
        }
      },
      atestado: true
    },
    orderBy: { createdAt: "desc" },
  });
};

export const listarExamesRealizados = async () => {
  return await prisma.exame.findMany({
    where: {
      OR: [{ status: "realizado" }, { dataRealizado: { not: null } }],
    },
    include: {
      paciente: { select: { id: true, nome: true, cpf: true, telefone: true, email: true } },
      laboratorio: { select: { id: true, nome: true, endereco: true, telefone: true } },
    },
    orderBy: [{ dataRealizado: "desc" }, { createdAt: "desc" }],
  });
};

// --- Funções de Medicamentos (Enfermeiro/Farmacêutico) ---

export const checarPermissaoMedicamento = async (funcionarioId, method) => {
  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { id: true, ubsId: true, funcao: true, nome: true },
  });

  if (!funcionario) throw { status: 404, data: { message: "Funcionário não encontrado" } };

  const funcao = funcionario.funcao?.toLowerCase();
  const podeListar = ["enfermeiro", "farmaceutico", "farmacêutico"].includes(funcao);
  const podeAdministrar = ["enfermeiro", "farmaceutico", "farmacêutico"].includes(funcao);

  if (method === "GET" && !podeListar) {
    throw { status: 403, data: { message: "Acesso negado: função não autorizada para listar medicamentos" } };
  }

  if (method !== "GET" && !podeAdministrar) {
    throw { status: 403, data: { message: "Acesso negado: função não autorizada para esta ação" } };
  }

  return funcionario;
};

export const listarMedicamentosUbs = async (ubsId, busca) => {
  const where = {
    ubsId,
    ...(busca ? { OR: [{ nome: { contains: busca, mode: "insensitive" } }, { lote: { contains: busca, mode: "insensitive" } }] } : {}),
  };

  return await prisma.medicamento.findMany({
    where,
    include: { ubs: { select: { nome: true } } },
    orderBy: { nome: "asc" },
  });
};

export const atualizarMedicamentoUbs = async (id, ubsId, data) => {
  const { nome, descricao, observacoes, lote, quantidade, dataValidade, vencido } = data;

  const medicamentoExistente = await prisma.medicamento.findUnique({ where: { id } });
  if (!medicamentoExistente) throw { status: 404, data: { message: "Medicamento não encontrado" } };
  if (medicamentoExistente.ubsId !== ubsId) throw { status: 403, data: { message: "Acesso negado a este medicamento" } };

  const updateData = {};
  if (nome !== undefined) updateData.nome = nome;
  if (descricao !== undefined) updateData.descricao = descricao;
  if (observacoes !== undefined) updateData.observacoes = observacoes;
  if (lote !== undefined) updateData.lote = lote;
  
  if (quantidade !== undefined) {
    const qt = Number(quantidade);
    if (Number.isNaN(qt) || qt < 0) throw { status: 400, data: { message: "Quantidade inválida" } };
    updateData.quantidade = qt;
  }
  
  if (dataValidade !== undefined) {
    const validade = new Date(dataValidade);
    if (Number.isNaN(validade.getTime())) throw { status: 400, data: { message: "Data de validade inválida" } };
    updateData.dataValidade = validade;
    if (vencido === undefined) updateData.vencido = validade < new Date();
  }
  if (vencido !== undefined) updateData.vencido = Boolean(vencido);

  return await prisma.medicamento.update({ where: { id }, data: updateData });
};

export const administrarMedicamento = async (id, funcionario, data) => {
  const { pacienteId, pacienteCns, quantidade, dataRetirada, observacoes } = data;

  if ((!pacienteId && !pacienteCns) || quantidade === undefined) {
    throw { status: 400, data: { message: "Paciente (ID ou CNS) e quantidade são obrigatórios" } };
  }

  const qt = Number(quantidade);
  if (Number.isNaN(qt) || qt <= 0) throw { status: 400, data: { message: "Quantidade inválida" } };

  const med = await prisma.medicamento.findUnique({ where: { id } });
  if (!med) throw { status: 404, data: { message: "Medicamento não encontrado" } };
  if (med.ubsId !== funcionario.ubsId) throw { status: 403, data: { message: "Acesso negado a este medicamento" } };
  if (qt > med.quantidade) throw { status: 400, data: { message: "Quantidade solicitada maior do que o estoque disponível" } };

  const paciente = pacienteId 
    ? await prisma.paciente.findUnique({ where: { id: pacienteId }, select: { id: true } })
    : await prisma.paciente.findUnique({ where: { cns: pacienteCns }, select: { id: true } });
    
  if (!paciente) throw { status: 404, data: { message: "Paciente não encontrado com o CNS informado" } };

  const retirada = dataRetirada ? new Date(dataRetirada) : new Date();
  if (Number.isNaN(retirada.getTime())) throw { status: 400, data: { message: "Data de retirada inválida" } };

  const [medicamentoAtualizado, medicacao] = await prisma.$transaction([
    prisma.medicamento.update({ where: { id }, data: { quantidade: med.quantidade - qt } }),
    prisma.medicacaoPaciente.create({
      data: {
        medicamentoId: id,
        pacienteId: paciente.id,
        funcionarioId: funcionario.id, // peguei o id do objeto
        ubsId: funcionario.ubsId,
        quantidade: qt,
        dataRetirada: retirada,
        fornecidoPor: funcionario.nome || "Funcionário",
        observacoes: observacoes ?? null,
      },
    }),
  ]);

  return { medicamento: medicamentoAtualizado, administracao: medicacao };
};

// --- Funções de Dispensação de Receitas (Enfermeiro/Farmacêutico) ---

export const checarPermissaoReceita = async (funcionarioId) => {
  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { ubsId: true, funcao: true, nome: true },
  });

  if (!funcionario) throw { status: 404, data: { message: "Funcionário não encontrado" } };

  const funcao = funcionario.funcao?.toLowerCase();
  const pode = ["enfermeiro", "farmaceutico", "farmacêutico"].includes(funcao);

  if (!pode) throw { status: 403, data: { message: "Acesso negado: apenas enfermeiros e farmacêuticos podem consultar/dispensar receitas" } };

  return funcionario;
};

export const consultarReceita = async (registro) => {
  if (!registro) throw { status: 400, data: { message: "Registro da assinatura é obrigatório" } };

  const receita = await prisma.receitaMedica.findFirst({
    where: { registroAssinatura: registro },
    include: {
      paciente: true, funcionario: true, ubs: true,
      itens: { orderBy: { createdAt: "asc" } },
      dispensacoes: { include: { farmacia: true }, orderBy: { dataDispensacao: "desc" } },
    },
  });

  if (!receita) throw { status: 404, data: { message: "Receita não encontrada" } };
  return receita;
};

export const validarDispensacaoReceita = async (receitaId, funcionario) => {
  if (!receitaId) throw { status: 400, data: { message: "ID da receita é obrigatório" } };

  const receita = await prisma.receitaMedica.findUnique({
    where: { id: receitaId },
    include: { ubs: true, itens: true, dispensacoes: { include: { farmacia: true, ubs: true } } },
  });

  if (!receita) throw { status: 404, data: { message: "Receita não encontrada" } };
  if (receita.ubsId !== funcionario.ubsId) throw { status: 403, data: { message: "Você só pode dispensar receitas emitidas pela sua UBS" } };

  const dispFarmacia = receita.dispensacoes.find((d) => d.farmaciaId !== null);
  if (dispFarmacia) {
    throw { status: 409, data: { message: "Receita já está em dispensação por uma farmácia. UBS não pode dispensar a mesma receita.", dispensacaoExistente: dispFarmacia } };
  }

  const pendentes = receita.itens.filter((i) => i.status === "pendente").length;
  const dispensados = receita.itens.filter((i) => i.status === "dispensado").length;
  const completa = dispensados === receita.itens.length;

  if (completa) {
    throw { status: 409, data: { message: "Receita já foi completamente dispensada. Nenhum medicamento pode ser dispensado novamente.", receita, podeDispensar: false } };
  }

  return { podeDispensar: true, message: "Receita pode receber dispensações", receita, medicamentosPendentes: pendentes, medicamentosDispensados: dispensados, receitaCompleta: completa };
};

export const dispensarReceitaLegado = async (funcionarioId, data) => {
  const { receitaId, statusDispensacao, observacoesDispensacao, medicamentoFornecido, quantidadeDispensada } = data;

  if (!receitaId) throw { status: 400, data: { message: "ID da receita é obrigatório" } };
  if (!statusDispensacao || !["completa", "parcial"].includes(statusDispensacao)) {
    throw { status: 400, data: { message: "Status de dispensação deve ser 'completa' ou 'parcial'" } };
  }

  const receita = await prisma.receitaMedica.findUnique({
    where: { id: receitaId },
    include: { ubs: true, dispensacoes: { include: { farmacia: true, ubs: true } } },
  });

  if (!receita) throw { status: 404, data: { message: "Receita não encontrada" } };

  const funcionario = await prisma.funcionario.findUnique({ where: { id: funcionarioId }, include: { ubs: true } });
  if (receita.ubsId !== funcionario.ubsId) throw { status: 403, data: { message: "Você só pode dispensar receitas emitidas pela sua UBS" } };

  if (receita.dispensacoes.length > 0) {
    const dispFarmacia = receita.dispensacoes.find((d) => d.farmaciaId !== null);
    if (dispFarmacia) throw { status: 409, data: { message: "Receita já está em dispensação por uma farmácia.", dispensacaoExistente: dispFarmacia } };

    const dispUbs = receita.dispensacoes.find((d) => d.ubsId === funcionario.ubsId);
    if (dispUbs) throw { status: 409, data: { message: "Receita já foi dispensada por sua UBS", dispensacaoExistente: dispUbs } };
  }

  const novaDispensacao = await prisma.dispensacaoReceita.create({
    data: {
      receitaId,
      ubsId: funcionario.ubs.id, // <-- CORRIGIDO BUG DO LEGADO QUE PASSAVA NOME COMO ID AQUI
      funcionarioId,
      statusDispensacao,
      observacoesDispensacao,
      medicamentoFornecido: medicamentoFornecido || receita.medicamento,
      quantidadeDispensada: quantidadeDispensada || parseInt(receita.quantidade),
      ubsResponsavel: funcionario.nome,
    },
    include: { receita: true, ubs: true, funcionario: true },
  });

  if (statusDispensacao === "completa") await prisma.receitaMedica.update({ where: { id: receitaId }, data: { status: "dispensada" } });
  else if (statusDispensacao === "parcial") await prisma.receitaMedica.update({ where: { id: receitaId }, data: { status: "parcialmente_dispensada" } });

  return novaDispensacao;
};

export const dispensarMedicamentosReceita = async (funcionario, data) => {
  const { receitaId, medicamentos } = data;

  if (!receitaId || !Array.isArray(medicamentos) || medicamentos.length === 0) {
    throw { status: 400, data: { message: "receitaId e array de medicamentos são obrigatórios" } };
  }

  const receita = await prisma.receitaMedica.findUnique({
    where: { id: receitaId },
    include: { itens: true, ubs: true, dispensacoes: true },
  });

  if (!receita) throw { status: 404, data: { message: "Receita não encontrada" } };
  if (receita.ubsId !== funcionario.ubsId) throw { status: 403, data: { message: "Você só pode dispensar receitas emitidas pela sua UBS" } };

  const dispensacoesCriadas = [];
  const atualizacoesMedicamentos = [];

  for (const med of medicamentos) {
    const { receitaMedicamentoId, medicamentoFornecido, quantidadeDispensada, observacoes } = med;
    if (!receitaMedicamentoId) throw { status: 400, data: { message: "receitaMedicamentoId é obrigatório para cada medicamento" } };

    const item = receita.itens.find((i) => i.id === receitaMedicamentoId);
    if (!item) throw { status: 404, data: { message: `Medicamento com ID ${receitaMedicamentoId} não encontrado na receita` } };
    if (item.status === "dispensado") throw { status: 409, data: { message: `Medicamento "${item.medicamento}" já foi dispensado` } };

    dispensacoesCriadas.push({
      receitaId,
      receitaMedicamentoId,
      ubsId: funcionario.ubsId,
      funcionarioId: funcionario.id,
      statusDispensacao: "completa",
      medicamentoFornecido: medicamentoFornecido || item.medicamento,
      quantidadeDispensada: quantidadeDispensada || item.quantidade,
      ubsResponsavel: funcionario.nome,
      observacoesDispensacao: observacoes || null,
    });

    atualizacoesMedicamentos.push({ id: receitaMedicamentoId, status: "dispensado" });
  }

  return await prisma.$transaction(async (tx) => {
    const dispensacoes = await Promise.all(
      dispensacoesCriadas.map((disp) => tx.dispensacaoReceita.create({ data: disp, include: { receita: true } }))
    );

    const medicamentosAtualizados = await Promise.all(
      atualizacoesMedicamentos.map((med) => tx.receitaMedicamento.update({ where: { id: med.id }, data: { status: med.status } }))
    );

    const receitaAtualizada = await tx.receitaMedica.findUnique({ where: { id: receitaId }, include: { itens: true } });
    const todosDispensados = receitaAtualizada.itens.every((i) => i.status === "dispensado");

    await tx.receitaMedica.update({
      where: { id: receitaId },
      data: { status: todosDispensados ? "dispensada" : "parcialmente_dispensada" },
    });

    return { dispensacoes, medicamentosAtualizados };
  });
};
