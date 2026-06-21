import { prisma } from "../config/database.js";

export const formatarDataPt = (date) => {
  if (!date) return "data a confirmar";
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const criarNotificacao = async ({
  pacienteId,
  titulo,
  mensagem,
  tipo,
  acao = null,
  referenciaId = null,
}) => {
  if (!pacienteId || !titulo || !mensagem || !tipo) {
    throw new Error("Campos obrigatórios: pacienteId, titulo, mensagem, tipo");
  }

  return prisma.notificacao.create({
    data: {
      pacienteId,
      titulo,
      mensagem,
      tipo,
      acao,
      referenciaId,
    },
  });
};

/** Side effect seguro: nunca interrompe a operação principal. */
export const criarNotificacaoSegura = async (data) => {
  try {
    return await criarNotificacao(data);
  } catch (err) {
    console.error("[Notificacao] Falha ao criar notificação:", err.message);
    return null;
  }
};

export const listarNotificacoes = async (pacienteId, { lida, limit = 20, page = 1 } = {}) => {
  const where = { pacienteId };
  if (lida !== undefined && lida !== null && lida !== "") {
    where.lida = lida === "true" || lida === true;
  }

  const take = Math.min(Number(limit) || 20, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [notificacoes, total] = await Promise.all([
    prisma.notificacao.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.notificacao.count({ where }),
  ]);

  return { notificacoes, total, page: Number(page) || 1, limit: take };
};

export const contarNaoLidas = async (pacienteId) => {
  return prisma.notificacao.count({
    where: { pacienteId, lida: false },
  });
};

export const marcarComoLida = async (id, pacienteId) => {
  const notificacao = await prisma.notificacao.findFirst({
    where: { id, pacienteId },
  });

  if (!notificacao) {
    throw { status: 404, data: { message: "Notificação não encontrada" } };
  }

  return prisma.notificacao.update({
    where: { id },
    data: { lida: true },
  });
};

export const marcarTodasComoLidas = async (pacienteId) => {
  const result = await prisma.notificacao.updateMany({
    where: { pacienteId, lida: false },
    data: { lida: true },
  });
  return { atualizadas: result.count };
};

// ── Helpers de notificação por domínio ─────────────────────────────

export const notificarConsultaAgendada = async (consulta) => {
  await criarNotificacaoSegura({
    pacienteId: consulta.pacienteId,
    titulo: "Consulta agendada",
    mensagem: `Sua consulta de ${consulta.especialidade} foi agendada para ${formatarDataPt(consulta.dataAgendada)}.`,
    tipo: "CONSULTA",
    acao: "AGENDADA",
    referenciaId: consulta.id,
  });
};

export const notificarConsultaCancelada = async (consulta, motivo) => {
  await criarNotificacaoSegura({
    pacienteId: consulta.pacienteId,
    titulo: "Consulta cancelada",
    mensagem: `Sua consulta de ${consulta.especialidade} foi cancelada.${motivo ? ` Motivo: ${motivo}` : ""}`,
    tipo: "CONSULTA",
    acao: "CANCELADA",
    referenciaId: consulta.id,
  });
};

export const notificarConsultaRealizada = async (consulta) => {
  await criarNotificacaoSegura({
    pacienteId: consulta.pacienteId,
    titulo: "Consulta realizada",
    mensagem: `Sua consulta de ${consulta.especialidade || "saúde"} foi registrada como realizada.`,
    tipo: "CONSULTA",
    acao: "REALIZADA",
    referenciaId: consulta.id,
  });
};

export const notificarRetornoAgendado = async (retorno) => {
  await criarNotificacaoSegura({
    pacienteId: retorno.pacienteId,
    titulo: "Retorno agendado",
    mensagem: `Foi agendado um retorno médico para ${formatarDataPt(retorno.dataRetorno)}.`,
    tipo: "CONSULTA",
    acao: "RETORNO_AGENDADO",
    referenciaId: retorno.id,
  });
};

export const notificarHistoricoRegistrado = async (historico) => {
  await criarNotificacaoSegura({
    pacienteId: historico.pacienteId,
    titulo: "Novo registro no prontuário",
    mensagem: "Um novo registro foi adicionado ao seu histórico médico.",
    tipo: "HISTORICO",
    acao: "REGISTRADO",
    referenciaId: historico.id,
  });
};

export const notificarReceitaEmitida = async (receita) => {
  await criarNotificacaoSegura({
    pacienteId: receita.pacienteId,
    titulo: "Nova receita médica",
    mensagem: "Uma nova receita médica foi emitida para você.",
    tipo: "RECEITA",
    acao: "EMITIDA",
    referenciaId: receita.id,
  });
};

export const notificarAtestadoEmitido = async (atestado) => {
  await criarNotificacaoSegura({
    pacienteId: atestado.pacienteId,
    titulo: "Novo atestado médico",
    mensagem: "Um atestado médico foi emitido para você.",
    tipo: "RECEITA",
    acao: "ATESTADO_EMITIDO",
    referenciaId: atestado.id,
  });
};

export const notificarVacinaRegistrada = async (vacina) => {
  await criarNotificacaoSegura({
    pacienteId: vacina.pacienteId,
    titulo: "Vacina registrada",
    mensagem: `A vacina ${vacina.nome} foi registrada no seu cartão de vacinação.`,
    tipo: "VACINA",
    acao: "REGISTRADA",
    referenciaId: vacina.id,
  });
};

export const notificarExameSolicitado = async (solicitacao) => {
  await criarNotificacaoSegura({
    pacienteId: solicitacao.pacienteId,
    titulo: "Exame solicitado",
    mensagem: `Foi solicitado o exame: ${solicitacao.tipoExame}.`,
    tipo: "EXAME",
    acao: "SOLICITADO",
    referenciaId: solicitacao.id,
  });
};

export const notificarExameAgendado = async (exame) => {
  await criarNotificacaoSegura({
    pacienteId: exame.pacienteId,
    titulo: "Exame agendado",
    mensagem: `Seu exame ${exame.tipo} foi agendado para ${formatarDataPt(exame.dataAgendada)}.`,
    tipo: "EXAME",
    acao: "AGENDADO",
    referenciaId: exame.id,
  });
};

export const notificarExameResultado = async (exame) => {
  await criarNotificacaoSegura({
    pacienteId: exame.pacienteId,
    titulo: "Resultado de exame disponível",
    mensagem: `O resultado do exame ${exame.tipo} está disponível no seu prontuário.`,
    tipo: "EXAME",
    acao: "RESULTADO_DISPONIVEL",
    referenciaId: exame.id,
  });
};

export const notificarCampanhaAgendada = async (pacienteId, agendamento, campanhaTitulo) => {
  await criarNotificacaoSegura({
    pacienteId,
    titulo: "Campanha agendada",
    mensagem: `Seu agendamento na campanha "${campanhaTitulo}" foi confirmado para ${formatarDataPt(agendamento.dataAgendada)}.`,
    tipo: "CAMPANHA",
    acao: "AGENDADA",
    referenciaId: agendamento.id,
  });
};

export const notificarInternacaoStatus = async (solicitacao, statusLabel) => {
  await criarNotificacaoSegura({
    pacienteId: solicitacao.pacienteId,
    titulo: "Atualização de internação",
    mensagem: `Sua solicitação de internação teve o status alterado para: ${statusLabel}.`,
    tipo: "INTERNACAO",
    acao: "STATUS_ALTERADO",
    referenciaId: solicitacao.id,
  });
};

export const notificarInternacaoIniciada = async (internacao) => {
  await criarNotificacaoSegura({
    pacienteId: internacao.pacienteId,
    titulo: "Internação iniciada",
    mensagem: "Sua internação hospitalar foi registrada.",
    tipo: "INTERNACAO",
    acao: "INTERNACAO_INICIADA",
    referenciaId: internacao.id,
  });
};

export const notificarAltaHospitalar = async (alta) => {
  await criarNotificacaoSegura({
    pacienteId: alta.pacienteId,
    titulo: "Alta hospitalar registrada",
    mensagem: "Sua alta hospitalar foi registrada no sistema.",
    tipo: "INTERNACAO",
    acao: "ALTA_REGISTRADA",
    referenciaId: alta.internacaoId,
  });
};

export const notificarDispensacao = async (receita, statusDispensacao) => {
  await criarNotificacaoSegura({
    pacienteId: receita.pacienteId,
    titulo: "Medicamento dispensado",
    mensagem: `Sua receita teve uma dispensação ${statusDispensacao === "completa" ? "completa" : "parcial"} registrada na farmácia.`,
    tipo: "DISPENSACAO",
    acao: statusDispensacao === "completa" ? "COMPLETA" : "PARCIAL",
    referenciaId: receita.id,
  });
};

export const buscarPacienteIdPorCpf = async (cpf) => {
  const paciente = await prisma.paciente.findUnique({
    where: { cpf },
    select: { id: true },
  });
  return paciente?.id || null;
};
