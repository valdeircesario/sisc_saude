import { prisma } from "../config/database.js";

export const listarMedicamentos = async () => {
  return await prisma.medicamento.findMany({
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
      ubs: {
        select: { nome: true },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const consultarMedicamento = async (id) => {
  const medicamento = await prisma.medicamento.findUnique({
    where: { id },
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
      ubs: {
        select: { nome: true },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!medicamento) {
    throw { status: 404, data: { message: "Medicamento não encontrado" } };
  }

  return medicamento;
};

export const cadastrarMedicamento = async (data, ubsId) => {
  const { nome, descricao, observacoes, lote, quantidade, dataValidade } = data;

  if (!nome || !lote || quantidade === undefined || !dataValidade) {
    throw { status: 400, data: { message: "Campos obrigatórios ausentes" } };
  }

  const quantidadeInt = Number(quantidade);
  if (Number.isNaN(quantidadeInt) || quantidadeInt < 0) {
    throw { status: 400, data: { message: "Quantidade inválida" } };
  }

  const validade = new Date(dataValidade);
  if (Number.isNaN(validade.getTime())) {
    throw { status: 400, data: { message: "Data de validade inválida" } };
  }

  return await prisma.medicamento.create({
    data: {
      nome,
      descricao: descricao ?? "",
      lote,
      quantidade: quantidadeInt,
      observacoes: observacoes ?? null,
      dataValidade: validade,
      vencido: validade < new Date(),
      ubsId,
    },
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
  });
};

export const atualizarMedicamento = async (id, data, ubsId) => {
  const { nome, descricao, observacoes, lote, quantidade, dataValidade, vencido } = data;

  const medicamentoExistente = await prisma.medicamento.findUnique({ where: { id } });
  if (!medicamentoExistente) {
    throw { status: 404, data: { message: "Medicamento não encontrado" } };
  }
  if (medicamentoExistente.ubsId !== ubsId) {
    throw { status: 403, data: { message: "Acesso negado a este medicamento" } };
  }

  const updateData = {};
  if (nome !== undefined) updateData.nome = nome;
  if (descricao !== undefined) updateData.descricao = descricao;
  if (observacoes !== undefined) updateData.observacoes = observacoes;
  if (lote !== undefined) updateData.lote = lote;
  if (quantidade !== undefined) {
    const quantidadeInt = Number(quantidade);
    if (Number.isNaN(quantidadeInt) || quantidadeInt < 0) {
      throw { status: 400, data: { message: "Quantidade inválida" } };
    }
    updateData.quantidade = quantidadeInt;
  }
  if (dataValidade !== undefined) {
    const validade = new Date(dataValidade);
    if (Number.isNaN(validade.getTime())) {
      throw { status: 400, data: { message: "Data de validade inválida" } };
    }
    updateData.dataValidade = validade;
    if (vencido === undefined) {
      updateData.vencido = validade < new Date();
    }
  }
  if (vencido !== undefined) updateData.vencido = Boolean(vencido);

  return await prisma.medicamento.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      nome: true,
      descricao: true,
      lote: true,
      quantidade: true,
      dataValidade: true,
      vencido: true,
      ubsId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const atualizarEstoque = async (id, data, ubsId) => {
  const { quantidade, descricao, vencido, observacoes, dataValidade } = data;

  const medicamentoExistente = await prisma.medicamento.findUnique({ where: { id } });
  if (!medicamentoExistente) {
    throw { status: 404, data: { message: "Medicamento não encontrado" } };
  }
  if (medicamentoExistente.ubsId !== ubsId) {
    throw { status: 403, data: { message: "Acesso negado a este medicamento" } };
  }

  const updateData = {};
  if (quantidade !== undefined) {
    const quantidadeInt = Number(quantidade);
    if (Number.isNaN(quantidadeInt) || quantidadeInt < 0) {
      throw { status: 400, data: { message: "Quantidade inválida" } };
    }
    updateData.quantidade = quantidadeInt;
  }
  if (descricao !== undefined) updateData.descricao = descricao;
  if (observacoes !== undefined) updateData.observacoes = observacoes;
  if (dataValidade !== undefined) {
    const validade = new Date(dataValidade);
    if (Number.isNaN(validade.getTime())) {
      throw { status: 400, data: { message: "Data de validade inválida" } };
    }
    updateData.dataValidade = validade;
  }
  if (vencido !== undefined) updateData.vencido = Boolean(vencido);

  if (Object.keys(updateData).length === 0) {
    throw { status: 400, data: { message: "Nenhum campo para atualizar" } };
  }

  return await prisma.medicamento.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      nome: true,
      descricao: true,
      lote: true,
      quantidade: true,
      dataValidade: true,
      vencido: true,
      ubsId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const fornecerMedicamento = async (id, data, user) => {
  const { pacienteId, quantidade, dataRetirada, observacoes, fornecidoPor } = data;
  const ubsId = user.ubsId;
  const funcionarioId = user.id;

  if (!pacienteId || quantidade === undefined) {
    throw { status: 400, data: { message: "Paciente e quantidade são obrigatórios" } };
  }

  const quantidadeInt = Number(quantidade);
  if (Number.isNaN(quantidadeInt) || quantidadeInt <= 0) {
    throw { status: 400, data: { message: "Quantidade inválida" } };
  }

  const medicamentoExistente = await prisma.medicamento.findUnique({ where: { id } });
  if (!medicamentoExistente) {
    throw { status: 404, data: { message: "Medicamento não encontrado" } };
  }
  if (medicamentoExistente.ubsId !== ubsId) {
    throw { status: 403, data: { message: "Acesso negado a este medicamento" } };
  }
  if (quantidadeInt > medicamentoExistente.quantidade) {
    throw { status: 400, data: { message: "Quantidade insuficiente em estoque" } };
  }

  const retirada = dataRetirada ? new Date(dataRetirada) : new Date();
  if (Number.isNaN(retirada.getTime())) {
    throw { status: 400, data: { message: "Data de retirada inválida" } };
  }

  const fornecimento = await prisma.$transaction([
    prisma.medicamento.update({
      where: { id },
      data: {
        quantidade: medicamentoExistente.quantidade - quantidadeInt,
      },
    }),
    prisma.medicacaoPaciente.create({
      data: {
        medicamentoId: id,
        pacienteId,
        funcionarioId,
        ubsId,
        quantidade: quantidadeInt,
        dataRetirada: retirada,
        fornecidoPor: fornecidoPor || user.nome || "Funcionário",
        observacoes: observacoes ?? null,
      },
    }),
  ]);

  return {
    medicamentoAtualizado: fornecimento[0],
    fornecimento: fornecimento[1],
  };
};

export const marcarVencido = async (id, ubsId) => {
  const medicamentoExistente = await prisma.medicamento.findUnique({ where: { id } });
  if (!medicamentoExistente) {
    throw { status: 404, data: { message: "Medicamento não encontrado" } };
  }
  if (medicamentoExistente.ubsId !== ubsId) {
    throw { status: 403, data: { message: "Acesso negado a este medicamento" } };
  }

  return await prisma.medicamento.update({
    where: { id },
    data: { vencido: true },
    select: {
      id: true,
      nome: true,
      descricao: true,
      lote: true,
      quantidade: true,
      dataValidade: true,
      vencido: true,
      ubsId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};