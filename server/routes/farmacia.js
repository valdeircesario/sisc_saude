import express from "express";
import { prisma } from "../config/database.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { podeDispensar } from "../utils/dispensacaoUtils.js";

const router = express.Router();

// Protege todas as rotas para farmácia
router.use(authenticateToken);
router.use(authorizeRole(["farmacia"]));

// Buscar receita por registroAssinatura
router.get("/receita/:registro", async (req, res) => {
  try {
    const { registro } = req.params;

    if (!registro) {
      return res
        .status(400)
        .json({ message: "Registro da assinatura é obrigatório" });
    }

    const receita = await prisma.receitaMedica.findFirst({
      where: { registroAssinatura: registro },
      include: {
        paciente: true,
        funcionario: true,
        ubs: true,
        dispensacoes: {
          include: {
            farmacia: true,
          },
          orderBy: {
            dataDispensacao: "desc",
          },
        },
      },
    });

    if (!receita) {
      return res.status(404).json({ message: "Receita não encontrada" });
    }

    // Adiciona informações úteis sobre dispensações
    const temCompleta =
      receita.dispensacoes?.some((d) => d.statusDispensacao === "completa") ||
      false;

    const temParcial =
      receita.dispensacoes?.some((d) => d.statusDispensacao === "parcial") ||
      false;

    const validacao = podeDispensar(receita.dispensacoes || []);

    res.json({
      ...receita,
      dispensacaoInfo: {
        total: receita.dispensacoes?.length || 0,
        temCompleta,
        temParcial,
        podeDispensar: validacao.pode,
        motivoNaoPode: validacao.motivo,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar receita:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Registrar dispensação de receita
router.post("/dispensar", async (req, res) => {
  try {
    const {
      receitaId,
      farmaciaResponsavel,
      medicamentoFornecido,
      observacoesDispensacao,
      quantidadeDispensada,
      statusDispensacao,
    } = req.body;
    const farmaciaId = req.user.id;

    // Validações obrigatórias
    if (!receitaId) {
      return res.status(400).json({ message: "receitaId é obrigatório" });
    }

    if (!farmaciaResponsavel && !req.user.nome) {
      return res
        .status(400)
        .json({ message: "Farmácia responsável é obrigatória" });
    }

    // Valida quantidade dispensada
    const qtdDispensada = Number(quantidadeDispensada) || 1;
    if (qtdDispensada <= 0) {
      return res.status(400).json({
        message: "Quantidade dispensada deve ser maior que 0",
      });
    }

    // Valida o status antes de qualquer operação
    if (
      statusDispensacao &&
      !["completa", "parcial"].includes(statusDispensacao)
    ) {
      return res.status(400).json({
        message: 'Status deve ser "completa" ou "parcial"',
      });
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
      return res.status(404).json({ message: "Receita não encontrada" });
    }

    // Verifica se pode dispensar
    const validacao = podeDispensar(receita.dispensacoes || []);
    if (!validacao.pode) {
      return res.status(400).json({
        message: validacao.motivo,
        dispensacoes: receita.dispensacoes || [],
        totalDispensacoes: receita.dispensacoes?.length || 0,
      });
    }

    // Valida se a quantidade dispensada não excede a quantidade da receita
    const qtdReceita = Number(receita.quantidade) || 1;
    if (qtdDispensada > qtdReceita) {
      return res.status(400).json({
        message: `Quantidade dispensada (${qtdDispensada}) não pode ser maior que a quantidade da receita (${qtdReceita})`,
        quantidadeReceita: qtdReceita,
        quantidadeDispensada: qtdDispensada,
      });
    }

    // Cria a dispensação
    const dispensacao = await prisma.dispensacaoReceita.create({
      data: {
        receitaId,
        farmaciaId,
        statusDispensacao: statusDispensacao || "completa",
        observacoesDispensacao: observacoesDispensacao || null,
        medicamentoFornecido: medicamentoFornecido || null,
        quantidadeDispensada: qtdDispensada,
        farmaciaResponsavel: farmaciaResponsavel || req.user.nome || null,
        dataDispensacao: new Date(),
      },
      include: {
        farmacia: true,
      },
    });

    return res.status(201).json(dispensacao);
  } catch (error) {
    console.error("Erro ao registrar dispensação:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
      details: error.message,
    });
  }
});

// Atualizar dispensação parcial
router.put("/dispensacoes/:dispensacaoId", async (req, res) => {
  try {
    const { dispensacaoId } = req.params;
    const {
      medicamentoFornecido,
      observacoesDispensacao,
      statusDispensacao,
      quantidadeDispensada,
      farmaciaResponsavel,
    } = req.body;

    if (!dispensacaoId) {
      return res
        .status(400)
        .json({ message: "ID da dispensação é obrigatório" });
    }

    // Busca a dispensação atual
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
      return res.status(404).json({ message: "Dispensação não encontrada" });
    }

    // Não pode editar dispensação completa
    if (dispensacao.statusDispensacao === "completa") {
      return res.status(400).json({
        message: "Não é possível editar uma dispensação completa",
      });
    }

    // Valida o novo status
    if (
      statusDispensacao &&
      !["completa", "parcial"].includes(statusDispensacao)
    ) {
      return res.status(400).json({
        message: 'Status deve ser "completa" ou "parcial"',
      });
    }

    // Se está mudando para completa, verifica se pode
    if (statusDispensacao === "completa") {
      const outrasCompletas = dispensacao.receita.dispensacoes.some(
        (d) => d.id !== dispensacaoId && d.statusDispensacao === "completa",
      );

      if (outrasCompletas) {
        return res.status(400).json({
          message: "Já existe uma dispensação completa para esta receita",
        });
      }
    }

    // Atualiza com dados fornecidos, ignorando undefined
    const dataUpdate = {};
    if (medicamentoFornecido !== undefined)
      dataUpdate.medicamentoFornecido = medicamentoFornecido;
    if (observacoesDispensacao !== undefined)
      dataUpdate.observacoesDispensacao = observacoesDispensacao;
    if (statusDispensacao !== undefined)
      dataUpdate.statusDispensacao = statusDispensacao;
    if (quantidadeDispensada !== undefined) {
      const qtdAtualizada = Number(quantidadeDispensada);
      if (qtdAtualizada <= 0) {
        return res.status(400).json({
          message: "Quantidade dispensada deve ser maior que 0",
        });
      }
      const qtdReceita = Number(dispensacao.receita.quantidade) || 1;
      if (qtdAtualizada > qtdReceita) {
        return res.status(400).json({
          message: `Quantidade dispensada (${qtdAtualizada}) não pode ser maior que a quantidade da receita (${qtdReceita})`,
          quantidadeReceita: qtdReceita,
          quantidadeDispensada: qtdAtualizada,
        });
      }
      dataUpdate.quantidadeDispensada = qtdAtualizada;
    }
    if (farmaciaResponsavel !== undefined)
      dataUpdate.farmaciaResponsavel = farmaciaResponsavel;

    dataUpdate.dataAtualizacao = new Date();

    const dispensacaoAtualizada = await prisma.dispensacaoReceita.update({
      where: { id: dispensacaoId },
      data: dataUpdate,
      include: {
        farmacia: true,
      },
    });

    return res.json(dispensacaoAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar dispensação:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
      details: error.message,
    });
  }
});

// Deletar dispensação (apenas parciais que não foram completadas)
router.delete("/dispensacoes/:dispensacaoId", async (req, res) => {
  try {
    const { dispensacaoId } = req.params;

    if (!dispensacaoId) {
      return res
        .status(400)
        .json({ message: "ID da dispensação é obrigatório" });
    }

    const dispensacao = await prisma.dispensacaoReceita.findUnique({
      where: { id: dispensacaoId },
    });

    if (!dispensacao) {
      return res.status(404).json({ message: "Dispensação não encontrada" });
    }

    // Não pode deletar dispensação completa
    if (dispensacao.statusDispensacao === "completa") {
      return res.status(400).json({
        message: "Não é possível deletar uma dispensação completa",
      });
    }

    await prisma.dispensacaoReceita.delete({
      where: { id: dispensacaoId },
    });

    return res.json({
      message: "Dispensação deletada com sucesso",
      dispensacaoId,
    });
  } catch (error) {
    console.error("Erro ao deletar dispensação:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
      details: error.message,
    });
  }
});

// Listar todas as dispensações agrupadas por receita
router.get("/dispensacoes/listar/todas", async (req, res) => {
  try {
    // Busca todas as receitas com dispensações
    const receitas = await prisma.receitaMedica.findMany({
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
          },
        },
        funcionario: {
          select: {
            id: true,
            nome: true,
          },
        },
        ubs: {
          select: {
            id: true,
            nome: true,
          },
        },
        dispensacoes: {
          include: {
            farmacia: true,
          },
          orderBy: {
            dataDispensacao: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filtra apenas receitas que têm dispensações
    const receitasComDispensacoes = receitas.filter(
      (r) => r.dispensacoes && r.dispensacoes.length > 0,
    );

    // Agrupa e formata os dados
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

    // Ordena por data de primeira dispensação (mais recente primeiro)
    dispensacoesAgrupadas.sort((a, b) => {
      const dataA = new Date(a.dataPrimeiraDispensacao).getTime();
      const dataB = new Date(b.dataPrimeiraDispensacao).getTime();
      return dataB - dataA;
    });

    res.json({
      total: dispensacoesAgrupadas.length,
      dispensacoes: dispensacoesAgrupadas,
    });
  } catch (error) {
    console.error("Erro ao listar dispensações:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
      details: error.message,
    });
  }
});

// Obter estatísticas do dashboard
router.get("/dashboard/estatisticas", async (req, res) => {
  try {
    // Receitas disponíveis para dispensar (com status ativo)
    const receitasDisponiveis = await prisma.receitaMedica.count({
      where: { status: "ativo" },
    });

    // Total de dispensações registradas
    const dispensacoesRegistradas = await prisma.dispensacaoReceita.count();

    // Dispensações completas e parciais
    const dispensacoesCompletas = await prisma.dispensacaoReceita.count({
      where: { statusDispensacao: "completa" },
    });

    const dispensacoesParciais = await prisma.dispensacaoReceita.count({
      where: { statusDispensacao: "parcial" },
    });

    // Pacientes únicos atendidos
    const pacientesAtendidosRaw = await prisma.dispensacaoReceita.findMany({
      select: { receita: { select: { pacienteId: true } } },
    });
    const pacientesAtendidos = new Set(
      pacientesAtendidosRaw
        .map((d) => d.receita?.pacienteId)
        .filter((id) => id),
    ).size;

    // Última dispensação registrada
    const ultimaDispensacao = await prisma.dispensacaoReceita.findFirst({
      where: {},
      orderBy: { dataDispensacao: "desc" },
      include: {
        receita: {
          include: {
            paciente: true,
          },
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

    res.json({
      receitasDisponiveis,
      dispensacoesRegistradas,
      pacientesAtendidos: pacientesAtendidos.length,
      dispensacoesCompletas,
      dispensacoesParciais,
      ultimaDispensacao: ultimaDispensacaoFormatada,
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas do dashboard:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
      details: error.message,
    });
  }
});

export default router;
