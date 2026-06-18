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

export const getPacienteTimeline = async (pacienteId) => {
  const [historico, consultas, retornos, exames, solicitacoesExame, solicitacoesInternacao, vacinas, medicacoes] = await Promise.all([
    prisma.historicoMedico.findMany({
      where: { pacienteId },
      include: { funcionario: { select: { id: true, nome: true, funcao: true, crm: true } } },
      orderBy: { dataConsulta: "desc" },
    }),
    prisma.consulta.findMany({
      where: { pacienteId },
      include: {
        funcionario: { select: { id: true, nome: true, funcao: true, crm: true } },
        ubs: { select: { id: true, nome: true } },
        historicoMedico: true,
        receita: { include: { itens: true } },
        atestado: true,
        retornos: {
          include: {
            receita: { include: { itens: true } },
            atestado: true,
            funcionario: { select: { nome: true, crm: true } }
          }
        }
      },
      orderBy: { dataAgendada: "desc" },
    }),
    prisma.retornoConsulta.findMany({
      where: { pacienteId },
      include: {
        funcionario: { select: { id: true, nome: true, funcao: true, crm: true } },
        ubs: { select: { id: true, nome: true } },
        receita: { include: { itens: true } },
        atestado: true,
        consultaOriginal: { select: { especialidade: true } }
      },
      orderBy: { dataRetorno: "desc" },
    }),
    prisma.exame.findMany({
      where: { pacienteId },
      include: { laboratorio: { select: { nome: true, telefone: true } } },
      orderBy: { dataRealizado: "desc" },
    }),
    prisma.solicitacaoExame.findMany({
      where: { pacienteId },
      include: {
        funcionario: { select: { nome: true, funcao: true } },
        laboratorio: { select: { nome: true, telefone: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.solicitacaoInternacao.findMany({
      where: { pacienteId },
      include: {
        funcionario: { select: { nome: true, funcao: true } },
        hospital: { select: { nome: true, telefone: true, endereco: true } },
        ubs: { select: { nome: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vacina.findMany({
      where: { pacienteId },
      include: { funcionario: { select: { nome: true, funcao: true, crm: true } } },
      orderBy: { dataApl: "desc" },
    }),
    prisma.medicacaoPaciente.findMany({
      where: { pacienteId },
      include: {
        medicamento: { select: { nome: true, lote: true, descricao: true } },
        funcionario: { select: { nome: true, funcao: true } },
      },
      orderBy: { dataRetirada: "desc" },
    }),
  ]);

  const registros = [
    ...consultas.map((item) => ({
      id: item.id, 
      tipo: "consulta", 
      categoria: "Consulta Médica",
      dataRegistro: item.dataAgendada || item.createdAt,
      titulo: `${item.especialidade || "Consulta"} - ${item.status}`,
      resumo: item.historicoMedico?.laudo || item.motivo || "Consulta agendada no sistema.",
      detalhes: { ...item, isConsultaPrincipal: true },
    })),
    ...retornos.map((item) => ({
      id: item.id, 
      tipo: "retorno", 
      categoria: "Retorno / Acompanhamento",
      dataRegistro: item.dataRetorno || item.createdAt,
      titulo: `Retorno de ${item.consultaOriginal?.especialidade || "Clínica"} - ${item.status}`,
      resumo: item.laudo || item.motivo || "Retorno agendado no sistema.",
      detalhes: { ...item, isRetornoIndependente: true },
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

  return registros;
};

export const obterHistoricoMedicoPaciente = async (pacienteId) => {
  return await getPacienteTimeline(pacienteId);
};

export const buscarHistoricoCompleteByPacienteId = async (pacienteId) => {
  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId },
    select: { id: true, nome: true, cpf: true, cns: true, telefone: true, email: true, nascimento: true },
  });
  if (!paciente) throw { status: 404, data: { message: "Paciente não encontrado." } };
  const registros = await getPacienteTimeline(pacienteId);
  return { paciente, registros };
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

  const registros = await getPacienteTimeline(paciente.id);
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

export const agendarRetorno = async (funcionarioId, data) => {
  const { consultaId, pacienteId, dataRetorno, motivo, diagnostico, observacao } = data;

  if (!consultaId || !pacienteId || !dataRetorno) {
    throw { status: 400, data: { message: "Campos obrigatórios: consultaId, pacienteId e dataRetorno." } };
  }

  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { ubsId: true },
  });

  if (!funcionario) {
    throw { status: 404, data: { message: "Funcionário não encontrado." } };
  }

  return await prisma.retornoConsulta.create({
    data: {
      consultaId,
      pacienteId,
      funcionarioId,
      ubsId: funcionario.ubsId,
      dataRetorno: new Date(dataRetorno),
      motivo,
      diagnostico,
      observacao,
      status: "agendado",
    },
    include: {
      paciente: { select: { nome: true, cpf: true } },
      consultaOriginal: { select: { especialidade: true } },
    }
  });
};

export const registrarEvolucaoRetorno = async (funcionarioId, data) => {
  const {
    retornoId,
    laudo,
    doenca,
    diagnostico,
    medicacao,
    observacao,
    receita,
    atestado
  } = data;

  if (!retornoId || !laudo || !diagnostico) {
    throw { status: 400, data: { message: "Campos obrigatórios: retornoId, laudo e diagnostico." } };
  }

  // Limpeza robusta do ID
  const cleanedRetornoId = String(retornoId).replace("ret-", "");

  const result = await prisma.$transaction(async (tx) => {
    // 1. Validar existência e estado do retorno
    const retornoOriginal = await tx.retornoConsulta.findUnique({
      where: { id: cleanedRetornoId },
      include: { receita: true, atestado: true }
    });

    if (!retornoOriginal) {
      throw { status: 404, data: { message: "Agendamento de retorno não encontrado." } };
    }

    if (retornoOriginal.status === "realizado") {
      throw { status: 409, data: { message: "Este atendimento já foi finalizado." } };
    }

    // 2. Persistir evolução clínica no retorno
    const retornoFinalizado = await tx.retornoConsulta.update({
      where: { id: cleanedRetornoId },
      data: {
        laudo,
        doenca,
        diagnostico,
        medicacao,
        observacao,
        status: "realizado",
      },
    });

    // 3. Criar Receita se solicitado e não existente
    if (receita && !retornoOriginal.receita) {
      const { descricao, cid, medicamentos = [], observacoes: obsReceita, dataEmissao } = receita;
      const medicamentosValidos = medicamentos.filter(m => m.medicamento && m.medicamento.trim() !== "");

      if (descricao && cid && medicamentosValidos.length > 0) {
        // Data de emissão segura
        let emissao = new Date();
        if (dataEmissao) {
          const parsed = new Date(dataEmissao);
          if (!isNaN(parsed.getTime())) emissao = parsed;
        }

        const novaReceita = await tx.receitaMedica.create({
          data: {
            pacienteId: retornoOriginal.pacienteId,
            funcionarioId,
            ubsId: retornoOriginal.ubsId,
            retornoId: cleanedRetornoId,
            descricao,
            cid,
            medicamento: medicamentosValidos[0].medicamento,
            dosagem: medicamentosValidos[0].dosagem || "Conforme prescrição",
            quantidade: String(medicamentosValidos[0].quantidade || "1"),
            status: "ativo",
            observacoes: obsReceita,
            dataEmissao: emissao,
          },
        });

        await tx.receitaMedicamento.createMany({
          data: medicamentosValidos.map((m) => {
            const qty = parseInt(m.quantidade);
            return {
              receitaId: novaReceita.id,
              medicamento: m.medicamento,
              dosagem: m.dosagem || "N/A",
              quantidade: isNaN(qty) ? 1 : qty,
              posologia: m.posologia || null,
              observacoes: m.observacoes || null,
              status: "pendente",
            };
          }),
        });
      }
    }

    // 4. Criar Atestado se solicitado e não existente
    if (atestado && !retornoOriginal.atestado) {
      const { descricao, cid, diasRepouso, observacoes: obsAtestado, dataEmissao } = atestado;
      if (descricao && cid && diasRepouso) {
        let emissao = new Date();
        if (dataEmissao) {
          const parsed = new Date(dataEmissao);
          if (!isNaN(parsed.getTime())) emissao = parsed;
        }

        const dias = parseInt(diasRepouso);

        await tx.atestadoMedico.create({
          data: {
            pacienteId: retornoOriginal.pacienteId,
            funcionarioId,
            ubsId: retornoOriginal.ubsId,
            retornoId: cleanedRetornoId,
            descricao,
            cid,
            diasRepouso: isNaN(dias) ? 1 : dias,
            observacoes: obsAtestado,
            dataEmissao: emissao,
          },
        });
      }
    }

    return retornoFinalizado;
  });

  return result;
};

export const atualizarRetorno = async (funcionarioId, retornoId, data) => {
  const { dataRetorno, motivo, diagnostico, observacao, status, laudo, doenca, medicacao } = data;

  const retorno = await prisma.retornoConsulta.findUnique({
    where: { id: retornoId }
  });

  if (!retorno) {
    throw { status: 404, data: { message: "Retorno não encontrado." } };
  }

  if (retorno.funcionarioId !== funcionarioId) {
    throw { status: 403, data: { message: "Você não tem permissão para alterar este retorno." } };
  }

  return await prisma.retornoConsulta.update({
    where: { id: retornoId },
    data: {
      dataRetorno: dataRetorno ? new Date(dataRetorno) : undefined,
      motivo,
      diagnostico,
      observacao,
      status,
      laudo,
      doenca,
      medicacao
    }
  });
};

export const listarMinhasConsultas = async (funcionarioId) => {
  const consultas = await prisma.consulta.findMany({
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
      atestado: true,
      retornos: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const retornos = await prisma.retornoConsulta.findMany({
    where: { funcionarioId },
    include: {
      paciente: { select: { id: true, nome: true, cpf: true, cns: true, telefone: true, email: true } },
      ubs: { select: { id: true, nome: true, endereco: true } },
      consultaOriginal: { select: { especialidade: true, motivo: true } },
      receita: {
        include: {
          itens: { orderBy: { createdAt: "asc" } }
        }
      },
      atestado: true,
    },
    orderBy: { dataRetorno: "asc" },
  });

  // Mapear retornos para o formato de consulta para exibir na agenda
  const retornosFormatados = retornos.map(r => ({
    ...r,
    id: `ret-${r.id}`, // prefixo para diferenciar ids
    originalRetornoId: r.id,
    especialidade: r.consultaOriginal?.especialidade || "Retorno",
    motivo: r.motivo || `Retorno: ${r.consultaOriginal?.motivo}`,
    dataAgendada: r.dataRetorno,
    tipo: "retorno" // flag para identificar no frontend
  }));

  return [...consultas, ...retornosFormatados].sort((a, b) => 
    new Date(b.dataAgendada || b.createdAt).getTime() - new Date(a.dataAgendada || a.createdAt).getTime()
  );
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
