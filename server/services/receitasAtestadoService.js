import { prisma } from "../config/database.js";

export const receitasAtestadoService = {
  async getReceitasByFuncionarioId(funcionarioId) {
    return await prisma.receitaMedica.findMany({
      where: { funcionarioId },
      include: {
        paciente: {
          select: { id: true, nome: true, cpf: true, cns: true, nascimento: true },
        },
        funcionario: {
          select: { id: true, nome: true, crm: true, funcao: true },
        },
        ubs: {
          select: { id: true, nome: true, endereco: true },
        },
        itens: {
          orderBy: { createdAt: "asc" },
        },
        dispensacoes: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getAtestadosByFuncionarioId(funcionarioId) {
    return await prisma.atestadoMedico.findMany({
      where: { funcionarioId },
      include: {
        paciente: {
          select: { id: true, nome: true, cpf: true, cns: true, nascimento: true },
        },
        funcionario: {
          select: { id: true, nome: true, crm: true, funcao: true },
        },
        ubs: {
          select: { id: true, nome: true, endereco: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async assinarReceita(id, funcionarioId, dataAssinatura) {
    const receita = await prisma.receitaMedica.findUnique({
      where: { id },
    });

    if (!receita) {
      const error = new Error("Receita não encontrada");
      error.status = 404;
      throw error;
    }

    if (receita.funcionarioId !== funcionarioId) {
      const error = new Error("Você não tem permissão para assinar esta receita");
      error.status = 403;
      throw error;
    }

    return await prisma.receitaMedica.update({
      where: { id },
      data: {
        ...dataAssinatura,
        assinaturaConcluida: true,
        assinaturaData: new Date(),
      },
      include: {
        paciente: { select: { id: true, nome: true, cpf: true, cns: true } },
        funcionario: { select: { id: true, nome: true, crm: true } },
        ubs: { select: { id: true, nome: true, endereco: true } },
        itens: { orderBy: { createdAt: "asc" } },
      },
    });
  },

  async assinarAtestado(id, funcionarioId, dataAssinatura) {
    const atestado = await prisma.atestadoMedico.findUnique({
      where: { id },
    });

    if (!atestado) {
      const error = new Error("Atestado não encontrado");
      error.status = 404;
      throw error;
    }

    if (atestado.funcionarioId !== funcionarioId) {
      const error = new Error("Você não tem permissão para assinar este atestado");
      error.status = 403;
      throw error;
    }

    return await prisma.atestadoMedico.update({
      where: { id },
      data: {
        ...dataAssinatura,
        assinaturaConcluida: true,
        assinaturaData: new Date(),
      },
      include: {
        paciente: { select: { id: true, nome: true, cpf: true, cns: true } },
        funcionario: { select: { id: true, nome: true, crm: true } },
        ubs: { select: { id: true, nome: true, endereco: true } },
      },
    });
  },

  async getReceitaById(id, funcionarioId) {
    const receita = await prisma.receitaMedica.findUnique({
      where: { id },
      include: {
        paciente: {
          select: { id: true, nome: true, cpf: true, cns: true, nascimento: true },
        },
        funcionario: {
          select: { id: true, nome: true, crm: true, funcao: true },
        },
        ubs: {
          select: { id: true, nome: true, endereco: true },
        },
        itens: {
          orderBy: { createdAt: "asc" },
        },
        dispensacoes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!receita) {
      const error = new Error("Receita não encontrada");
      error.status = 404;
      throw error;
    }

    if (receita.funcionarioId !== funcionarioId) {
      const error = new Error("Você não tem permissão para visualizar esta receita");
      error.status = 403;
      throw error;
    }

    return receita;
  },

  async getAtestadoById(id, funcionarioId) {
    const atestado = await prisma.atestadoMedico.findUnique({
      where: { id },
      include: {
        paciente: {
          select: { id: true, nome: true, cpf: true, cns: true, nascimento: true },
        },
        funcionario: {
          select: { id: true, nome: true, crm: true, funcao: true },
        },
        ubs: {
          select: { id: true, nome: true, endereco: true },
        },
      },
    });

    if (!atestado) {
      const error = new Error("Atestado não encontrado");
      error.status = 404;
      throw error;
    }

    if (atestado.funcionarioId !== funcionarioId) {
      const error = new Error("Você não tem permissão para visualizar este atestado");
      error.status = 403;
      throw error;
    }

    return atestado;
  },
};
