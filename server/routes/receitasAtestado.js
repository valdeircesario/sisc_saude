import express from "express";
import { prisma } from "../config/database.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

// Middleware
router.use(authenticateToken);

// GET receitas do funcionário autenticado
router.get("/receitas", authorizeRole(["funcionario"]), async (req, res) => {
  try {
    const receitas = await prisma.receitaMedica.findMany({
      where: {
        funcionarioId: req.user.id,
      },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            cns: true,
            nascimento: true,
          },
        },
        funcionario: {
          select: {
            id: true,
            nome: true,
            crm: true,
            funcao: true,
          },
        },
        ubs: {
          select: {
            id: true,
            nome: true,
            endereco: true,
          },
        },
        itens: {
          orderBy: {
            createdAt: "asc",
          },
        },
        dispensacoes: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(receitas);
  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    res.status(500).json({ message: "Erro ao buscar receitas" });
  }
});

// GET atestados do funcionário autenticado
router.get("/atestados", authorizeRole(["funcionario"]), async (req, res) => {
  try {
    const atestados = await prisma.atestadoMedico.findMany({
      where: {
        funcionarioId: req.user.id,
      },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            cns: true,
            nascimento: true,
          },
        },
        funcionario: {
          select: {
            id: true,
            nome: true,
            crm: true,
            funcao: true,
          },
        },
        ubs: {
          select: {
            id: true,
            nome: true,
            endereco: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(atestados);
  } catch (error) {
    console.error("Erro ao buscar atestados:", error);
    res.status(500).json({ message: "Erro ao buscar atestados" });
  }
});

// PATCH assinar receita
router.patch(
  "/receitas/:id/assinatura",
  authorizeRole(["funcionario"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        assinaturaTexto,
        assinaturaPosX,
        assinaturaPosY,
        registroAssinatura,
      } = req.body;

      if (!assinaturaTexto || assinaturaPosX === undefined || assinaturaPosY === undefined) {
        return res.status(400).json({
          message:
            "Campos obrigatórios: assinaturaTexto, assinaturaPosX, assinaturaPosY",
        });
      }

      const receita = await prisma.receitaMedica.findUnique({
        where: { id },
      });

      if (!receita) {
        return res.status(404).json({ message: "Receita não encontrada" });
      }

      if (receita.funcionarioId !== req.user.id) {
        return res.status(403).json({
          message: "Você não tem permissão para assinar esta receita",
        });
      }

      const receitaAssinada = await prisma.receitaMedica.update({
        where: { id },
        data: {
          assinaturaTexto,
          assinaturaPosX,
          assinaturaPosY,
          registroAssinatura,
          assinaturaConcluida: true,
          assinaturaData: new Date(),
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              cns: true,
            },
          },
          funcionario: {
            select: {
              id: true,
              nome: true,
              crm: true,
            },
          },
          ubs: {
            select: {
              id: true,
              nome: true,
              endereco: true,
            },
          },
          itens: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      res.json(receitaAssinada);
    } catch (error) {
      console.error("Erro ao assinar receita:", error);
      res.status(500).json({ message: "Erro ao assinar receita" });
    }
  },
);

// PATCH assinar atestado
router.patch(
  "/atestados/:id/assinatura",
  authorizeRole(["funcionario"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        assinaturaTexto,
        assinaturaPosX,
        assinaturaPosY,
        registroAssinatura,
      } = req.body;

      if (!assinaturaTexto || assinaturaPosX === undefined || assinaturaPosY === undefined) {
        return res.status(400).json({
          message:
            "Campos obrigatórios: assinaturaTexto, assinaturaPosX, assinaturaPosY",
        });
      }

      const atestado = await prisma.atestadoMedico.findUnique({
        where: { id },
      });

      if (!atestado) {
        return res.status(404).json({ message: "Atestado não encontrado" });
      }

      if (atestado.funcionarioId !== req.user.id) {
        return res.status(403).json({
          message: "Você não tem permissão para assinar este atestado",
        });
      }

      const atestadoAssinado = await prisma.atestadoMedico.update({
        where: { id },
        data: {
          assinaturaTexto,
          assinaturaPosX,
          assinaturaPosY,
          registroAssinatura,
          assinaturaConcluida: true,
          assinaturaData: new Date(),
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              cns: true,
            },
          },
          funcionario: {
            select: {
              id: true,
              nome: true,
              crm: true,
            },
          },
          ubs: {
            select: {
              id: true,
              nome: true,
              endereco: true,
            },
          },
        },
      });

      res.json(atestadoAssinado);
    } catch (error) {
      console.error("Erro ao assinar atestado:", error);
      res.status(500).json({ message: "Erro ao assinar atestado" });
    }
  },
);

// GET receita específica por ID (com todos os medicamentos)
router.get(
  "/receitas/:id",
  authorizeRole(["funcionario"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const receita = await prisma.receitaMedica.findUnique({
        where: { id },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              cns: true,
              nascimento: true,
            },
          },
          funcionario: {
            select: {
              id: true,
              nome: true,
              crm: true,
              funcao: true,
            },
          },
          ubs: {
            select: {
              id: true,
              nome: true,
              endereco: true,
            },
          },
          itens: {
            orderBy: {
              createdAt: "asc",
            },
          },
          dispensacoes: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!receita) {
        return res.status(404).json({ message: "Receita não encontrada" });
      }

      if (receita.funcionarioId !== req.user.id) {
        return res.status(403).json({
          message: "Você não tem permissão para visualizar esta receita",
        });
      }

      res.json(receita);
    } catch (error) {
      console.error("Erro ao buscar receita:", error);
      res.status(500).json({ message: "Erro ao buscar receita" });
    }
  },
);

// GET atestado específico por ID
router.get(
  "/atestados/:id",
  authorizeRole(["funcionario"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const atestado = await prisma.atestadoMedico.findUnique({
        where: { id },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              cns: true,
              nascimento: true,
            },
          },
          funcionario: {
            select: {
              id: true,
              nome: true,
              crm: true,
              funcao: true,
            },
          },
          ubs: {
            select: {
              id: true,
              nome: true,
              endereco: true,
            },
          },
        },
      });

      if (!atestado) {
        return res.status(404).json({ message: "Atestado não encontrado" });
      }

      if (atestado.funcionarioId !== req.user.id) {
        return res.status(403).json({
          message: "Você não tem permissão para visualizar este atestado",
        });
      }

      res.json(atestado);
    } catch (error) {
      console.error("Erro ao buscar atestado:", error);
      res.status(500).json({ message: "Erro ao buscar atestado" });
    }
  },
);

export default router;
