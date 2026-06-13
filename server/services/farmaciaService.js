import { prisma } from "../config/database.js";
import { podeDispensar } from "../utils/dispensacaoUtils.js";

export const buscarReceitaPorRegistro = async (registro) => {
  if (!registro) {
    throw { status: 400, data: { message: "Registro da assinatura é obrigatório" } };
  }

  const receita = await prisma.receitaMedica.findFirst({
    where: { registroAssinatura: registro },
    include: {
      paciente: true,
      funcionario: true,
      ubs: true,
      itens: true,
      dispensacoes: {
        include: {
          farmacia: true,
          receitaMedicamento: true,
        },
        orderBy: {
          dataDispensacao: "desc",
        },
      },
    },
  });

  if (!receita) {
    throw { status: 404, data: { message: "Receita não encontrada" } };
  }

  // Adiciona informações úteis sobre dispensações
  const temCompleta =
    receita.dispensacoes?.some((d) => d.statusDispensacao === "completa") ||
    false;

  const temParcial =
    receita.dispensacoes?.some((d) => d.statusDispensacao === "parcial") ||
    false;

  const validacao = podeDispensar(receita.dispensacoes || []);

  // Calcula o status de cada medicamento
  const medicamentosComStatus = (receita.itens || []).map((item) => ({
    ...item,
    dispensado: receita.dispensacoes?.some((d) => d.receitaMedicamentoId === item.id),
  }));

  return {
    ...receita,
    itens: medicamentosComStatus,
    dispensacaoInfo: {
      total: receita.dispensacoes?.length || 0,
      temCompleta,
      temParcial,
      podeDispensar: validacao.pode,
      motivoNaoPode: validacao.motivo,
    },
  };
};

export const dispensarMedicamentosFarmacia = async (farmacia, data) => {
  const { receitaId, medicamentos } = data;

  if (!receitaId || !Array.isArray(medicamentos) || medicamentos.length === 0) {
    throw { status: 400, data: { message: "receitaId e array de medicamentos são obrigatórios" } };
  }

  const receita = await prisma.receitaMedica.findUnique({
    where: { id: receitaId },
    include: { itens: true, ubs: true, dispensacoes: true },
  });

  if (!receita) throw { status: 404, data: { message: "Receita não encontrada" } };

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
      farmaciaId: farmacia.id,
      statusDispensacao: "completa",
      medicamentoFornecido: medicamentoFornecido || item.medicamento,
      quantidadeDispensada: quantidadeDispensada || item.quantidade,
      farmaciaResponsavel: farmacia.nome,
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

// Função legada para compatibilidade
export const registrarDispensacao = async (data, farmaciaId, userNome) => {
  const {
    receitaId,
    farmaciaResponsavel,
    medicamentoFornecido,
    observacoesDispensacao,
    quantidadeDispensada,
    statusDispensacao,
  } = data;

  // Validações obrigatórias
  if (!receitaId) {
    throw { status: 400, data: { message: "receitaId é obrigatório" } };
  }

  if (!farmaciaResponsavel && !userNome) {
    throw { status: 400, data: { message: "Farmácia responsável é obrigatória" } };
  }

  // Valida quantidade dispensada
  const qtdDispensada = Number(quantidadeDispensada) || 1;
  if (qtdDispensada <= 0) {
    throw { status: 400, data: { message: "Quantidade dispensada deve ser maior que 0" } };
  }

  // Valida o status antes de qualquer operação
  if (statusDispensacao && !["completa", "parcial"].includes(statusDispensacao)) {
    throw { status: 400, data: { message: 'Status deve ser "completa" ou "parcial"' } };
  }

  // Busca a receita com todas as dispensações
  const receita = await prisma.receitaMedica.findUnique({
    where: { id: receitaId },
    include: {
      dispensacoes: {
        include: {
          farmacia: true,
        },
      },
    },
  });

  if (!receita) {
    throw { status: 404, data: { message: "Receita não encontrada" } };
  }

  // Verifica se pode dispensar
  const validacao = podeDispensar(receita.dispensacoes || []);
  if (!validacao.pode) {
    throw {
      status: 400,
      data: {
        message: validacao.motivo,
        dispensacoes: receita.dispensacoes || [],
        totalDispensacoes: receita.dispensacoes?.length || 0,
      },
    };
  }

  // Valida se a quantidade dispensada não excede a quantidade da receita
  const qtdReceita = Number(receita.quantidade) || 1;
  if (qtdDispensada > qtdReceita) {
    throw {
      status: 400,
      data: {
        message: `Quantidade dispensada (${qtdDispensada}) não pode ser maior que a quantidade da receita (${qtdReceita})`,
        quantidadeReceita: qtdReceita,
        quantidadeDispensada: qtdDispensada,
      },
    };
  }

  // Cria a dispensacao
  const dispensacao = await prisma.dispensacaoReceita.create({
    data: {
      receitaId,
      farmaciaId,
      statusDispensacao: statusDispensacao || "completa",
      observacoesDispensacao: observacoesDispensacao || null,
      medicamentoFornecido: medicamentoFornecido || null,
      quantidadeDispensada: qtdDispensada,
      farmaciaResponsavel: farmaciaResponsavel || userNome || null,
      dataDispensacao: new Date(),
    },
    include: {
      farmacia: true,
    },
  });

  return dispensacao;
};

export const atualizarDispensacaoParcial = async (dispensacaoId, data) => {
  const {
    medicamentoFornecido,
    observacoesDispensacao,
    statusDispensacao,
    quantidadeDispensada,
    farmaciaResponsavel,
  } = data;

  if (!dispensacaoId) {
    throw { status: 400, data: { message: "ID da dispensação é obrigatório" } };
  }

  const dispensacao = await prisma.dispensacaoReceita.findUnique({
    where: { id: dispensacaoId },
    include: {
      receita: {
        include: {
          dispensacoes: true,
        },
      },
    },
  });

  if (!dispensacao) {
    throw { status: 404, data: { message: "Dispensação não encontrada" } };
  }

  if (dispensacao.statusDispensacao === "completa") {
    throw { status: 400, data: { message: "Não é possível editar uma dispensação completa" } };
  }

  if (statusDispensacao && !["completa", "parcial"].includes(statusDispensacao)) {
    throw { status: 400, data: { message: 'Status deve ser "completa" ou "parcial"' } };
  }

  if (statusDispensacao === "completa") {
    const outrasCompletas = dispensacao.receita.dispensacoes.some(
      (d) => d.id !== dispensacaoId && d.statusDispensacao === "completa"
    );

    if (outrasCompletas) {
      throw { status: 400, data: { message: "Já existe uma dispensação completa para esta receita" } };
    }
  }

  const dataUpdate = {};
  if (medicamentoFornecido !== undefined) dataUpdate.medicamentoFornecido = medicamentoFornecido;
  if (observacoesDispensacao !== undefined) dataUpdate.observacoesDispensacao = observacoesDispensacao;
  if (statusDispensacao !== undefined) dataUpdate.statusDispensacao = statusDispensacao;
  
  if (quantidadeDispensada !== undefined) {
    const qtdAtualizada = Number(quantidadeDispensada);
    if (qtdAtualizada <= 0) {
      throw { status: 400, data: { message: "Quantidade dispensada deve ser maior que 0" } };
    }
    const qtdReceita = Number(dispensacao.receita.quantidade) || 1;
    if (qtdAtualizada > qtdReceita) {
      throw {
        status: 400,
        data: {
          message: `Quantidade dispensada (${qtdAtualizada}) não pode ser maior que a quantidade da receita (${qtdReceita})`,
          quantidadeReceita: qtdReceita,
          quantidadeDispensada: qtdAtualizada,
        },
      };
    }
    dataUpdate.quantidadeDispensada = qtdAtualizada;
  }
  
  if (farmaciaResponsavel !== undefined) dataUpdate.farmaciaResponsavel = farmaciaResponsavel;
  dataUpdate.dataAtualizacao = new Date();

  const dispensacaoAtualizada = await prisma.dispensacaoReceita.update({
    where: { id: dispensacaoId },
    data: dataUpdate,
    include: {
      farmacia: true,
    },
  });

  return dispensacaoAtualizada;
};

export const deletarDispensacaoParcial = async (dispensacaoId) => {
  if (!dispensacaoId) {
    throw { status: 400, data: { message: "ID da dispensação é obrigatório" } };
  }

  const dispensacao = await prisma.dispensacaoReceita.findUnique({
    where: { id: dispensacaoId },
  });

  if (!dispensacao) {
    throw { status: 404, data: { message: "Dispensação não encontrada" } };
  }

  if (dispensacao.statusDispensacao === "completa") {
    throw { status: 400, data: { message: "Não é possível deletar uma dispensação completa" } };
  }

  await prisma.dispensacaoReceita.delete({
    where: { id: dispensacaoId },
  });

  return { message: "Dispensação deletada com sucesso", dispensacaoId };
};

export const listarTodasDispensacoes = async () => {
  const receitas = await prisma.receitaMedica.findMany({
    include: {
      paciente: { select: { id: true, nome: true } },
      funcionario: { select: { id: true, nome: true } },
      ubs: { select: { id: true, nome: true } },
      dispensacoes: {
        include: { farmacia: true },
        orderBy: { dataDispensacao: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const receitasComDispensacoes = receitas.filter(
    (r) => r.dispensacoes && r.dispensacoes.length > 0
  );

  const dispensacoesAgrupadas = receitasComDispensacoes.map((receita) => {
    const primeiraDispensacao = receita.dispensacoes[0];

    return {
      receitaId: receita.id,
      registroAssinatura: receita.registroAssinatura,
      paciente: receita.paciente?.nome || "N/A",
      medico: receita.funcionario?.nome || "N/A",
      ubs: receita.ubs?.nome || "N/A",
      dataPrimeiraDispensacao: primeiraDispensacao.dataDispensacao,
      totalDispensacoes: receita.dispensacoes.length,
      dispensacoes: receita.dispensacoes.map((disp) => ({
        id: disp.id,
        dataDispensacao: disp.dataDispensacao,
        statusDispensacao: disp.statusDispensacao,
        medicamentoFornecido: disp.medicamentoFornecido,
        farmaciaResponsavel: disp.farmaciaResponsavel,
        observacoesDispensacao: disp.observacoesDispensacao,
        quantidadeDispensada: disp.quantidadeDispensada,
        farmacia: disp.farmacia?.nome || null,
      })),
    };
  });

  dispensacoesAgrupadas.sort((a, b) => {
    const dataA = new Date(a.dataPrimeiraDispensacao).getTime();
    const dataB = new Date(b.dataPrimeiraDispensacao).getTime();
    return dataB - dataA;
  });

  return {
    total: dispensacoesAgrupadas.length,
    dispensacoes: dispensacoesAgrupadas,
  };
};

export const obterEstatisticas = async () => {
  const receitasDisponiveis = await prisma.receitaMedica.count({
    where: { status: "ativo" },
  });

  const dispensacoesRegistradas = await prisma.dispensacaoReceita.count();

  const dispensacoesCompletas = await prisma.dispensacaoReceita.count({
    where: { statusDispensacao: "completa" },
  });

  const dispensacoesParciais = await prisma.dispensacaoReceita.count({
    where: { statusDispensacao: "parcial" },
  });

  const pacientesAtendidosRaw = await prisma.dispensacaoReceita.findMany({
    select: { receita: { select: { pacienteId: true } } },
  });
  const pacientesAtendidos = new Set(
    pacientesAtendidosRaw.map((d) => d.receita?.pacienteId).filter((id) => id)
  ).size;

  const ultimaDispensacao = await prisma.dispensacaoReceita.findFirst({
    where: {},
    orderBy: { dataDispensacao: "desc" },
    include: {
      receita: {
        include: { paciente: true },
      },
    },
  });

  const ultimaDispensacaoFormatada = ultimaDispensacao
    ? {
        data: ultimaDispensacao.dataDispensacao,
        paciente: ultimaDispensacao.receita?.paciente?.nome || "N/A",
        medicamento: ultimaDispensacao.medicamentoFornecido || "N/A",
        status: ultimaDispensacao.statusDispensacao,
        atendente: ultimaDispensacao.farmaciaResponsavel || "N/A",
        quantidadeDispensada: ultimaDispensacao.quantidadeDispensada,
      }
    : null;

  return {
    receitasDisponiveis,
    dispensacoesRegistradas,
    pacientesAtendidos: pacientesAtendidos,
    dispensacoesCompletas,
    dispensacoesParciais,
    ultimaDispensacao: ultimaDispensacaoFormatada,
  };
};
