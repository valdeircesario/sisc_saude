import express from "express";
import { prisma } from "../config/database.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

// Middleware para funcionário
router.use(authenticateToken);
router.use(authorizeRole(["funcionario"]));

// Registrar informações do paciente no histórico médico
router.post("/historico-medico", async (req, res) => {
  try {
    const {
      pacienteId,
      consultaId,
      laudo,
      doenca,
      diagnostico,
      medicacao,
      observacoes,
      dataConsulta,
    } = req.body;

    if (!pacienteId || !laudo || !diagnostico || !dataConsulta) {
      return res.status(400).json({
        message:
          "Campos obrigatórios: pacienteId, laudo, diagnostico e dataConsulta.",
      });
    }

    if (consultaId) {
      const historicoExistente = await prisma.historicoMedico.findUnique({
        where: { consultaId },
      });

      if (historicoExistente) {
        return res.status(409).json({
          message: "Esta consulta já possui um histórico médico registrado.",
        });
      }
    }

    const novoHistorico = await prisma.historicoMedico.create({
      data: {
        pacienteId,
        funcionarioId: req.user.id,
        consultaId,
        laudo,
        doenca,
        diagnostico,
        medicacao,
        observacoes,
        dataConsulta: new Date(dataConsulta),
      },
    });

    // Se a consulta estiver vinculada, atualiza seu status para 'realizado'
    if (consultaId) {
      try {
        await prisma.consulta.update({
          where: { id: consultaId },
          data: { status: "realizado" },
        });
      } catch (err) {
        console.error("Erro ao atualizar status da consulta:", err);
        // Não falha a criação do histórico se a atualização da consulta falhar
      }
    }

    res.status(201).json(novoHistorico);
  } catch (error) {
    console.error("Erro ao registrar histórico médico:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Registrar vacina
router.post("/vacinas", async (req, res) => {
  try {
    const { pacienteId, nome, lote, dataApl, proximaDose } = req.body;

    const novaVacina = await prisma.vacina.create({
      data: {
        pacienteId,
        funcionarioId: req.user.id,
        nome,
        lote,
        dataApl: new Date(dataApl),
        proximaDose: proximaDose ? new Date(proximaDose) : null,
      },
    });

    res.status(201).json(novaVacina);
  } catch (error) {
    console.error("Erro ao registrar vacina:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// registrar receita
router.post("/receitas", async (req, res) => {
  try {
    const {
      pacienteId,
      descricao,
      cid,

      // Compatibilidade com modelo antigo
      medicamento,
      dosagem,

      // Novo modelo
      medicamentos = [],

      status = "ativo",
      observacoes,
      dataEmissao,
    } = req.body;

    if (!pacienteId || !descricao || !cid) {
      return res.status(400).json({
        message: "Campos obrigatórios: pacienteId, descricao e cid.",
      });
    }

    const possuiListaMedicamentos =
      Array.isArray(medicamentos) && medicamentos.length > 0;

    if (!possuiListaMedicamentos && (!medicamento || !dosagem)) {
      return res.status(400).json({
        message: "Informe medicamento/dosagem ou uma lista de medicamentos.",
      });
    }

    const funcionario = await prisma.funcionario.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        nome: true,
        crm: true,
        funcao: true,
        ubsId: true,
      },
    });

    if (!funcionario) {
      return res.status(404).json({
        message: "Funcionário não encontrado.",
      });
    }

    // Cria a receita principal
    const receita = await prisma.receitaMedica.create({
      data: {
        pacienteId,
        funcionarioId: req.user.id,
        ubsId: funcionario.ubsId,

        descricao,
        cid,

        // Mantém compatibilidade com o modelo atual
        medicamento:
          medicamento || medicamentos?.[0]?.medicamento || "MULTIPLOS",

        dosagem: dosagem || medicamentos?.[0]?.dosagem || "",

        quantidade: medicamentos?.[0]?.quantidade?.toString() || "1",

        status,
        observacoes,

        dataEmissao: dataEmissao ? new Date(dataEmissao) : undefined,
      },
    });

    // NOVA IMPLEMENTAÇÃO
    // Cria os itens da receita
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
      // Compatibilidade com receitas antigas
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

    // Busca a receita completa já com os itens
    const receitaCompleta = await prisma.receitaMedica.findUnique({
      where: {
        id: receita.id,
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
            funcao: true,
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

    return res.status(201).json(receitaCompleta);
  } catch (error) {
    console.error("Erro ao salvar receita médica:", error);

    return res.status(500).json({
      message: "Erro ao salvar receita médica.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/atestados", async (req, res) => {
  try {
    const {
      pacienteId,
      descricao,
      cid,
      diasRepouso,
      observacoes,
      dataEmissao,
    } = req.body;

    if (!pacienteId || !descricao || !cid || !diasRepouso) {
      return res.status(400).json({
        message:
          "Campos obrigatórios: pacienteId, descricao, cid e diasRepouso.",
      });
    }

    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.user.id },
      select: { ubsId: true },
    });

    if (!funcionario) {
      return res.status(404).json({ message: "Funcionário não encontrado." });
    }

    const atestado = await prisma.atestadoMedico.create({
      data: {
        pacienteId,
        funcionarioId: req.user.id,
        ubsId: funcionario.ubsId,
        descricao,
        cid,
        diasRepouso: Number(diasRepouso),
        observacoes,
        dataEmissao: dataEmissao ? new Date(dataEmissao) : undefined,
      },
      include: {
        paciente: { select: { id: true, nome: true, cpf: true, cns: true } },
        funcionario: {
          select: { id: true, nome: true, funcao: true, crm: true },
        },
        ubs: { select: { id: true, nome: true, endereco: true } },
      },
    });

    res.status(201).json(atestado);
  } catch (error) {
    console.error("Erro ao salvar atestado médico:", error);
    res.status(500).json({ message: "Erro ao salvar atestado médico." });
  }
});

router.patch("/receitas/:id/assinatura", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      assinaturaTexto,
      assinaturaPosX,
      assinaturaPosY,
      registroAssinatura,
    } = req.body;

    if (!assinaturaTexto || assinaturaPosX == null || assinaturaPosY == null) {
      return res.status(400).json({
        message:
          "Campos obrigatórios: assinaturaTexto, assinaturaPosX e assinaturaPosY.",
      });
    }

    const receita = await prisma.receitaMedica.update({
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
        funcionario: {
          select: { id: true, nome: true, funcao: true, crm: true },
        },
        ubs: { select: { id: true, nome: true, endereco: true } },
        itens: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    res.json(receita);
  } catch (error) {
    console.error("Erro ao assinar receita médica:", error);
    res.status(500).json({ message: "Erro ao assinar receita médica." });
  }
});

router.patch("/atestados/:id/assinatura", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      assinaturaTexto,
      assinaturaPosX,
      assinaturaPosY,
      registroAssinatura,
    } = req.body;

    if (!assinaturaTexto || assinaturaPosX == null || assinaturaPosY == null) {
      return res.status(400).json({
        message:
          "Campos obrigatórios: assinaturaTexto, assinaturaPosX e assinaturaPosY.",
      });
    }

    const atestado = await prisma.atestadoMedico.update({
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
        funcionario: {
          select: { id: true, nome: true, funcao: true, crm: true },
        },
        ubs: { select: { id: true, nome: true, endereco: true } },
      },
    });

    res.json(atestado);
  } catch (error) {
    console.error("Erro ao assinar atestado médico:", error);
    res.status(500).json({ message: "Erro ao assinar atestado médico." });
  }
});

router.get("/ubs", async (req, res) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.user.id },
      select: { ubsId: true },
    });

    if (!funcionario?.ubsId) {
      return res.status(404).json({ message: "UBS do médico não encontrada." });
    }

    const ubs = await prisma.uBS.findUnique({
      where: { id: funcionario.ubsId },
      select: { id: true, nome: true, endereco: true, telefone: true },
    });

    if (!ubs) {
      return res.status(404).json({ message: "UBS não encontrada." });
    }

    res.json(ubs);
  } catch (error) {
    console.error("Erro ao buscar UBS do médico:", error);
    res.status(500).json({ message: "Erro ao buscar UBS do médico." });
  }
});

router.get("/me", async (req, res) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nome: true,
        funcao: true,
        crm: true,
        ubsId: true,
        ubs: {
          select: {
            id: true,
            nome: true,
            endereco: true,
            telefone: true,
          },
        },
      },
    });

    if (!funcionario) {
      return res.status(404).json({ message: "Funcionário não encontrado." });
    }

    res.json(funcionario);
  } catch (error) {
    console.error("Erro ao buscar perfil do médico:", error);
    res.status(500).json({ message: "Erro ao buscar perfil do médico." });
  }
});

router.get("/receitas", async (req, res) => {
  try {
    const receitas = await prisma.receitaMedica.findMany({
      where: { funcionarioId: req.user.id },
      include: {
        paciente: { select: { id: true, nome: true, cpf: true, cns: true } },
        funcionario: {
          select: { id: true, nome: true, funcao: true, crm: true },
        },
        ubs: { select: { id: true, nome: true, endereco: true } },
        itens: {
          orderBy: { createdAt: "asc" },
        },
        dispensacoes: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(receitas);
  } catch (error) {
    console.error("Erro ao listar receitas:", error);
    res.status(500).json({ message: "Erro ao listar receitas." });
  }
});

router.get("/atestados", async (req, res) => {
  try {
    const atestados = await prisma.atestadoMedico.findMany({
      where: { funcionarioId: req.user.id },
      include: {
        paciente: { select: { id: true, nome: true, cpf: true, cns: true } },
        funcionario: {
          select: { id: true, nome: true, funcao: true, crm: true },
        },
        ubs: { select: { id: true, nome: true, endereco: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(atestados);
  } catch (error) {
    console.error("Erro ao listar atestados:", error);
    res.status(500).json({ message: "Erro ao listar atestados." });
  }
});

router.post("/solicitar-exame", async (req, res) => {
  try {
    const { pacienteId, laboratorioId, tipoExame, observacoes } = req.body;

    const solicitacao = await prisma.solicitacaoExame.create({
      data: {
        pacienteId,
        funcionarioId: req.user.id,
        laboratorioId,
        tipoExame,
        observacoes,
      },
    });

    res.status(201).json(solicitacao);
  } catch (error) {
    console.error("Erro ao solicitar exame:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Solicitar internação - FUNCIONALIDADE CORRIGIDA
router.post("/solicitacoes-internacao", async (req, res) => {
  try {
    const {
      pacienteId,
      hospitalId,
      tipo,
      motivo,
      detalhes,
      laudoMedico,
      prioridade = "medio",
      observacoes,
    } = req.body;

    // Validar campos obrigatórios
    if (
      !pacienteId ||
      !hospitalId ||
      !tipo ||
      !motivo ||
      !detalhes ||
      !laudoMedico
    ) {
      return res.status(400).json({
        message:
          "Campos obrigatórios: pacienteId, hospitalId, tipo, motivo, detalhes, laudoMedico",
      });
    }

    // Verificar se o funcionário existe e obter sua UBS
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.user.id },
      select: { ubsId: true, nome: true, funcao: true },
    });

    if (!funcionario) {
      return res.status(404).json({ message: "Funcionário não encontrado" });
    }

    // Verificar se o paciente existe
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: { id: true, nome: true, cpf: true, telefone: true, email: true },
    });

    if (!paciente) {
      return res.status(404).json({ message: "Paciente não encontrado" });
    }

    // Verificar se o hospital existe
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { id: true, nome: true, telefone: true, endereco: true },
    });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital não encontrado" });
    }

    // Criar solicitação de internação
    const solicitacao = await prisma.solicitacaoInternacao.create({
      data: {
        pacienteId,
        ubsId: funcionario.ubsId,
        hospitalId,
        funcionarioId: req.user.id,
        tipo,
        motivo,
        detalhes,
        laudoMedico,
        prioridade,
        observacoes,
        status: "pendente",
      },
      include: {
        paciente: {
          select: {
            nome: true,
            cpf: true,
            telefone: true,
            email: true,
          },
        },
        hospital: {
          select: {
            nome: true,
            telefone: true,
            endereco: true,
          },
        },
        ubs: {
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
    });

    res.status(201).json({
      message: "Solicitação de internação criada com sucesso",
      solicitacao,
    });
  } catch (error) {
    console.error("Erro ao solicitar internação:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Listar minhas solicitações de internação
router.get("/minhas-solicitacoes-internacao", async (req, res) => {
  try {
    const { status, prioridade } = req.query;

    const where = { funcionarioId: req.user.id };
    if (status) where.status = status;
    if (prioridade) where.prioridade = prioridade;

    const solicitacoes = await prisma.solicitacaoInternacao.findMany({
      where,
      include: {
        paciente: {
          select: {
            nome: true,
            cpf: true,
            telefone: true,
            email: true,
          },
        },
        hospital: {
          select: {
            nome: true,
            telefone: true,
            endereco: true,
          },
        },
        ubs: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(solicitacoes);
  } catch (error) {
    console.error("Erro ao listar solicitações de internação:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Listar todas as minhas solicitações (internações e exames)
router.get("/minhas-solicitacoes", async (req, res) => {
  try {
    const { status, prioridade } = req.query;

    const whereInternacao = { funcionarioId: req.user.id };
    if (status) whereInternacao.status = status;
    if (prioridade) whereInternacao.prioridade = prioridade;

    const whereExame = { funcionarioId: req.user.id };
    if (status) whereExame.status = status;

    const [solicitacoesInternacao, solicitacoesExame] = await Promise.all([
      prisma.solicitacaoInternacao.findMany({
        where: whereInternacao,
        include: {
          paciente: {
            select: {
              nome: true,
              cpf: true,
              telefone: true,
              email: true,
            },
          },
          hospital: {
            select: {
              nome: true,
              telefone: true,
              endereco: true,
            },
          },
          ubs: {
            select: {
              nome: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.solicitacaoExame.findMany({
        where: whereExame,
        include: {
          paciente: {
            select: {
              nome: true,
              cpf: true,
              telefone: true,
              email: true,
            },
          },
          laboratorio: {
            select: {
              nome: true,
              telefone: true,
              endereco: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const solicitacoes = [
      ...solicitacoesInternacao.map((item) => ({
        ...item,
        solicitacaoTipo: "internacao",
      })),
      ...solicitacoesExame.map((item) => ({
        ...item,
        solicitacaoTipo: "exame",
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    res.json(solicitacoes);
  } catch (error) {
    console.error("Erro ao listar todas as solicitações:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Atualizar observações da solicitação (apenas o funcionário que criou pode atualizar)
router.put("/solicitacoes-internacao/:id/observacoes", async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    const solicitacaoAtualizada = await prisma.solicitacaoInternacao.update({
      where: {
        id,
        funcionarioId: req.user.id, // Garantir que apenas o funcionário que criou pode atualizar
      },
      data: {
        observacoes,
      },
      include: {
        paciente: {
          select: { nome: true },
        },
        hospital: {
          select: { nome: true },
        },
      },
    });

    res.json({
      message: "Observações atualizadas com sucesso",
      solicitacao: solicitacaoAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar solicitação:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        message:
          "Solicitação não encontrada ou você não tem permissão para editá-la",
      });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Buscar pacientes
router.get("/pacientes", async (req, res) => {
  try {
    const { busca } = req.query;

    const where = busca
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" } },
            { cpf: { contains: busca } },
            { cns: { contains: busca } },
          ],
        }
      : {};

    const pacientes = await prisma.paciente.findMany({
      where,
      select: {
        id: true,
        nome: true,
        cpf: true,
        cns: true,
        telefone: true,
        email: true,
        nascimento: true,
      },
      take: 50,
    });

    res.json(pacientes);
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Obter histórico médico do paciente
router.get("/pacientes/:id/historico", async (req, res) => {
  try {
    const { id } = req.params;

    const historico = await prisma.historicoMedico.findMany({
      where: { pacienteId: id },
      include: {
        funcionario: {
          select: {
            nome: true,
            funcao: true,
            crm: true,
          },
        },
      },
      orderBy: { dataConsulta: "desc" },
    });

    res.json(historico);
  } catch (error) {
    console.error("Erro ao obter histórico:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Buscar histórico completo do paciente por CPF (consultas, exames, encaminhamentos, vacinas e medicações)
router.get("/historico-paciente/cpf", async (req, res) => {
  try {
    const cpf = String(req.query.cpf || "").trim();

    if (!cpf) {
      return res.status(400).json({ message: "Informe o CPF do paciente." });
    }

    const funcao = String(req.user?.funcao || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (!["medico", "medico clinico geral", "medico geral"].includes(funcao)) {
      return res
        .status(403)
        .json({ message: "Acesso restrito apenas para médicos." });
    }

    const paciente = await prisma.paciente.findFirst({
      where: { cpf: { equals: cpf, mode: "insensitive" } },
      select: {
        id: true,
        nome: true,
        cpf: true,
        cns: true,
        telefone: true,
        email: true,
        nascimento: true,
      },
    });

    if (!paciente) {
      return res
        .status(404)
        .json({ message: "Paciente não encontrado para o CPF informado." });
    }

    const [
      historico,
      consultas,
      exames,
      solicitacoesExame,
      solicitacoesInternacao,
      vacinas,
      medicacoes,
    ] = await Promise.all([
      prisma.historicoMedico.findMany({
        where: { pacienteId: paciente.id },
        include: {
          funcionario: { select: { nome: true, funcao: true, crm: true } },
        },
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
        include: {
          funcionario: { select: { nome: true, funcao: true, crm: true } },
        },
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
        id: item.id,
        tipo: "historico",
        categoria: "Registro médico",
        dataRegistro: item.dataConsulta || item.createdAt,
        titulo: item.diagnostico || "Registro médico",
        resumo:
          item.laudo || item.observacoes || "Registro do atendimento médico.",
        detalhes: item,
      })),
      ...consultas.map((item) => ({
        id: item.id,
        tipo: "consulta",
        categoria: "Consulta",
        dataRegistro: item.dataAgendada || item.createdAt,
        titulo: item.motivo || "Consulta",
        resumo: `${item.especialidade || "Consulta"} • ${item.status || "status não informado"}`,
        detalhes: item,
      })),
      ...exames.map((item) => ({
        id: item.id,
        tipo: "exame",
        categoria: "Exame",
        dataRegistro: item.dataRealizado || item.dataAgendada || item.createdAt,
        titulo: item.tipo || "Exame",
        resumo: item.resultado || item.status || "Exame registrado no sistema.",
        detalhes: item,
      })),
      ...solicitacoesExame.map((item) => ({
        id: item.id,
        tipo: "solicitacao_exame",
        categoria: "Solicitação de exame",
        dataRegistro: item.createdAt,
        titulo: item.tipoExame || "Solicitação de exame",
        resumo: item.observacoes || "Solicitação enviada para laboratório.",
        detalhes: item,
      })),
      ...solicitacoesInternacao.map((item) => ({
        id: item.id,
        tipo: "encaminhamento",
        categoria: "Encaminhamento / internação",
        dataRegistro: item.createdAt,
        titulo: `${item.tipo || "Encaminhamento"} • ${item.motivo || "Motivo não informado"}`,
        resumo:
          item.detalhes ||
          item.laudoMedico ||
          "Encaminhamento registrado no sistema.",
        detalhes: item,
      })),
      ...vacinas.map((item) => ({
        id: item.id,
        tipo: "vacina",
        categoria: "Vacina",
        dataRegistro: item.dataApl || item.createdAt,
        titulo: item.nome || "Vacina",
        resumo: `Lote ${item.lote || "—"}${item.proximaDose ? ` • Próxima dose: ${new Date(item.proximaDose).toLocaleDateString("pt-BR")}` : ""}`,
        detalhes: item,
      })),
      ...medicacoes.map((item) => ({
        id: item.id,
        tipo: "medicacao",
        categoria: "Medicação",
        dataRegistro: item.dataRetirada || item.createdAt,
        titulo: item.medicamento?.nome || "Medicação ministrada",
        resumo: `${item.quantidade || 0} unidade(s) • ${item.observacoes || "Sem observações adicionais."}`,
        detalhes: item,
      })),
    ].sort(
      (a, b) =>
        new Date(b.dataRegistro).getTime() - new Date(a.dataRegistro).getTime(),
    );

    res.json({ paciente, registros });
  } catch (error) {
    console.error(
      "Erro ao buscar histórico completo do paciente por CPF:",
      error,
    );
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Listar laboratórios disponíveis
router.get("/laboratorios", async (req, res) => {
  try {
    const laboratorios = await prisma.laboratorio.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
      },
    });

    res.json(laboratorios);
  } catch (error) {
    console.error("Erro ao listar laboratórios:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Listar hospitais disponíveis
router.get("/hospitais", async (req, res) => {
  try {
    const hospitais = await prisma.hospital.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
        email: true,
      },
      orderBy: { nome: "asc" },
    });

    res.json(hospitais);
  } catch (error) {
    console.error("Erro ao listar hospitais:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Listar consultas do funcionário
router.get("/consultas", async (req, res) => {
  try {
    const consultas = await prisma.consulta.findMany({
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
            telefone: true,
            email: true,
          },
        },
        ubs: {
          select: {
            id: true,
            nome: true,
            endereco: true,
          },
        },
        historicoMedico: {
          select: {
            id: true,
            diagnostico: true,
            doenca: true,
            laudo: true,
            medicacao: true,
            observacoes: true,
            dataConsulta: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(consultas);
  } catch (error) {
    console.error("Erro ao listar consultas:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Listar exames realizados para médicos
router.get("/exames", async (req, res) => {
  try {
    const exames = await prisma.exame.findMany({
      where: {
        OR: [{ status: "realizado" }, { dataRealizado: { not: null } }],
      },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            telefone: true,
            email: true,
          },
        },
        laboratorio: {
          select: {
            id: true,
            nome: true,
            endereco: true,
            telefone: true,
          },
        },
      },
      orderBy: [{ dataRealizado: "desc" }, { createdAt: "desc" }],
    });

    res.json(exames);
  } catch (error) {
    console.error("Erro ao listar exames realizados:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Verifica se o funcionário pode trabalhar com medicamentos (enfermeiro ou farmacêutico)
const funcionarioPodeTratarMedicamentos = async (req, res, next) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.user.id },
      select: { ubsId: true, funcao: true, nome: true },
    });

    if (!funcionario) {
      return res.status(404).json({ message: "Funcionário não encontrado" });
    }

    const funcao = funcionario.funcao?.toLowerCase();
    const podeListar = ["enfermeiro", "farmaceutico", "farmacêutico"].includes(
      funcao,
    );
    const podeAdministrar = [
      "enfermeiro",
      "farmaceutico",
      "farmacêutico",
    ].includes(funcao);

    req.funcionario = funcionario;

    if (req.method === "GET") {
      if (!podeListar) {
        return res.status(403).json({
          message:
            "Acesso negado: função não autorizada para listar medicamentos",
        });
      }
      return next();
    }

    if (!podeAdministrar) {
      return res.status(403).json({
        message: "Acesso negado: função não autorizada para esta ação",
      });
    }

    next();
  } catch (error) {
    console.error("Erro ao verificar permissão de medicamento:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Listar medicamentos da UBS do funcionário (enfermeiro/farmacêutico)
router.get(
  "/medicamentos",
  funcionarioPodeTratarMedicamentos,
  async (req, res) => {
    try {
      const { busca } = req.query;
      const where = {
        ubsId: req.funcionario.ubsId,
        ...(busca
          ? {
              OR: [
                { nome: { contains: busca, mode: "insensitive" } },
                { lote: { contains: busca, mode: "insensitive" } },
              ],
            }
          : {}),
      };

      const medicamentos = await prisma.medicamento.findMany({
        where,
        include: {
          ubs: {
            select: { nome: true },
          },
        },
        orderBy: { nome: "asc" },
      });

      res.json(medicamentos);
    } catch (error) {
      console.error("Erro ao listar medicamentos do funcionário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },
);

// Atualizar medicamento da UBS do funcionário
router.put(
  "/medicamentos/:id",
  funcionarioPodeTratarMedicamentos,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nome,
        descricao,
        observacoes,
        lote,
        quantidade,
        dataValidade,
        vencido,
      } = req.body;

      const medicamentoExistente = await prisma.medicamento.findUnique({
        where: { id },
      });
      if (!medicamentoExistente) {
        return res.status(404).json({ message: "Medicamento não encontrado" });
      }

      if (medicamentoExistente.ubsId !== req.funcionario.ubsId) {
        return res
          .status(403)
          .json({ message: "Acesso negado a este medicamento" });
      }

      const updateData = {};
      if (nome !== undefined) updateData.nome = nome;
      if (descricao !== undefined) updateData.descricao = descricao;
      if (observacoes !== undefined) updateData.observacoes = observacoes;
      if (lote !== undefined) updateData.lote = lote;
      if (quantidade !== undefined) {
        const quantidadeInt = Number(quantidade);
        if (Number.isNaN(quantidadeInt) || quantidadeInt < 0) {
          return res.status(400).json({ message: "Quantidade inválida" });
        }
        updateData.quantidade = quantidadeInt;
      }
      if (dataValidade !== undefined) {
        const validade = new Date(dataValidade);
        if (Number.isNaN(validade.getTime())) {
          return res.status(400).json({ message: "Data de validade inválida" });
        }
        updateData.dataValidade = validade;
        if (vencido === undefined) {
          updateData.vencido = validade < new Date();
        }
      }
      if (vencido !== undefined) updateData.vencido = Boolean(vencido);

      const medicamentoAtualizado = await prisma.medicamento.update({
        where: { id },
        data: updateData,
      });

      res.json(medicamentoAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar medicamento do funcionário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },
);

// Administrar medicação ao paciente
router.post(
  "/medicamentos/:id/administrar",
  funcionarioPodeTratarMedicamentos,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { pacienteId, pacienteCns, quantidade, dataRetirada, observacoes } =
        req.body;

      if ((!pacienteId && !pacienteCns) || quantidade === undefined) {
        return res.status(400).json({
          message: "Paciente (ID ou CNS) e quantidade são obrigatórios",
        });
      }

      const quantidadeInt = Number(quantidade);
      if (Number.isNaN(quantidadeInt) || quantidadeInt <= 0) {
        return res.status(400).json({ message: "Quantidade inválida" });
      }

      const medicamentoExistente = await prisma.medicamento.findUnique({
        where: { id },
      });
      if (!medicamentoExistente) {
        return res.status(404).json({ message: "Medicamento não encontrado" });
      }

      if (medicamentoExistente.ubsId !== req.funcionario.ubsId) {
        return res
          .status(403)
          .json({ message: "Acesso negado a este medicamento" });
      }

      if (quantidadeInt > medicamentoExistente.quantidade) {
        return res.status(400).json({
          message: "Quantidade solicitada maior do que o estoque disponível",
        });
      }

      const paciente = pacienteId
        ? await prisma.paciente.findUnique({
            where: { id: pacienteId },
            select: { id: true },
          })
        : await prisma.paciente.findUnique({
            where: { cns: pacienteCns },
            select: { id: true },
          });
      if (!paciente) {
        return res
          .status(404)
          .json({ message: "Paciente não encontrado com o CNS informado" });
      }

      const pacienteIdParaSalvar = paciente.id;

      const retirada = dataRetirada ? new Date(dataRetirada) : new Date();
      if (Number.isNaN(retirada.getTime())) {
        return res.status(400).json({ message: "Data de retirada inválida" });
      }

      const [medicamentoAtualizado, medicacao] = await prisma.$transaction([
        prisma.medicamento.update({
          where: { id },
          data: {
            quantidade: medicamentoExistente.quantidade - quantidadeInt,
          },
        }),
        prisma.medicacaoPaciente.create({
          data: {
            medicamentoId: id,
            pacienteId: pacienteIdParaSalvar,
            funcionarioId: req.user.id,
            ubsId: req.funcionario.ubsId,
            quantidade: quantidadeInt,
            dataRetirada: retirada,
            fornecidoPor: req.funcionario.nome || "Funcionário",
            observacoes: observacoes ?? null,
          },
        }),
      ]);

      res.json({
        medicamento: medicamentoAtualizado,
        administracao: medicacao,
      });
    } catch (error) {
      console.error("Erro ao administrar medicamento:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },
);

// Middleware para verificar se o funcionário pode consultar receitas (enfermeiro ou farmacêutico)
const funcionarioPodeConsultarReceita = async (req, res, next) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.user.id },
      select: { funcao: true },
    });

    if (!funcionario) {
      return res.status(404).json({ message: "Funcionário não encontrado" });
    }

    const funcao = funcionario.funcao?.toLowerCase();
    const pode = ["enfermeiro", "farmaceutico", "farmacêutico"].includes(
      funcao,
    );

    if (!pode) {
      return res.status(403).json({
        message:
          "Acesso negado: apenas enfermeiros e farmacêuticos podem consultar receitas",
      });
    }

    next();
  } catch (error) {
    console.error("Erro ao verificar acesso:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Rota para consultar receita pelo registro de assinatura
router.get(
  "/consultar-receita/:registro",
  funcionarioPodeConsultarReceita,
  async (req, res) => {
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
          itens: {
            orderBy: {
              createdAt: "asc",
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
      });

      if (!receita) {
        return res.status(404).json({ message: "Receita não encontrada" });
      }

      res.json(receita);
    } catch (error) {
      console.error("Erro ao buscar receita:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },
);

// Rota para validar se a UBS pode dispensar uma receita
router.get(
  "/validar-dispensacao/:receitaId",
  funcionarioPodeConsultarReceita,
  async (req, res) => {
    try {
      const { receitaId } = req.params;
      const funcionarioId = req.user.id;

      if (!receitaId) {
        return res.status(400).json({ message: "ID da receita é obrigatório" });
      }

      // Buscar receita com itens (medicamentos) e dispensacoes
      const receita = await prisma.receitaMedica.findUnique({
        where: { id: receitaId },
        include: {
          ubs: true,
          itens: true,
          dispensacoes: {
            include: {
              farmacia: true,
              ubs: true,
            },
          },
        },
      });

      if (!receita) {
        return res.status(404).json({ message: "Receita não encontrada" });
      }

      // Buscar funcionário
      const funcionario = await prisma.funcionario.findUnique({
        where: { id: funcionarioId },
        select: { ubsId: true },
      });

      if (!funcionario) {
        return res.status(404).json({ message: "Funcionário não encontrado" });
      }

      // Validar se a receita foi emitida pela mesma UBS do funcionário
      if (receita.ubsId !== funcionario.ubsId) {
        return res.status(403).json({
          message: "Você só pode dispensar receitas emitidas pela sua UBS",
        });
      }

      // Verificar se há dispensação pela farmácia
      const dispensacaoFarmacia = receita.dispensacoes.find(
        (d) => d.farmaciaId !== null,
      );
      if (dispensacaoFarmacia) {
        return res.status(409).json({
          message:
            "Receita já está em dispensação por uma farmácia. UBS não pode dispensar a mesma receita.",
          dispensacaoExistente: dispensacaoFarmacia,
        });
      }

      // Contar medicamentos pendentes
      const medicamentosPendentes = receita.itens.filter(
        (item) => item.status === "pendente",
      ).length;
      const medicamentosDispensados = receita.itens.filter(
        (item) => item.status === "dispensado",
      ).length;
      const receitaCompleta = medicamentosDispensados === receita.itens.length;

      // Se receita está 100% dispensada, bloquear
      if (receitaCompleta) {
        return res.status(409).json({
          message:
            "Receita já foi completamente dispensada. Nenhum medicamento pode ser dispensado novamente.",
          receita,
          podeDispensar: false,
        });
      }

      res.json({
        podeDispensar: true,
        message: "Receita pode receber dispensações",
        receita,
        medicamentosPendentes,
        medicamentosDispensados,
        receitaCompleta,
      });
    } catch (error) {
      console.error("Erro ao validar dispensação:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },
);

// Rota para dispensar receita pela UBS
router.post(
  "/dispensar-receita",
  funcionarioPodeConsultarReceita,
  async (req, res) => {
    try {
      const {
        receitaId,
        statusDispensacao,
        observacoesDispensacao,
        medicamentoFornecido,
        quantidadeDispensada,
      } = req.body;
      const funcionarioId = req.user.id;

      if (!receitaId) {
        return res.status(400).json({ message: "ID da receita é obrigatório" });
      }

      if (
        !statusDispensacao ||
        !["completa", "parcial"].includes(statusDispensacao)
      ) {
        return res.status(400).json({
          message: "Status de dispensação deve ser 'completa' ou 'parcial'",
        });
      }

      // Buscar receita
      const receita = await prisma.receitaMedica.findUnique({
        where: { id: receitaId },
        include: {
          ubs: true,
          dispensacoes: {
            include: {
              farmacia: true,
              ubs: true,
            },
          },
        },
      });

      if (!receita) {
        return res.status(404).json({ message: "Receita não encontrada" });
      }

      // Buscar funcionário com UBS
      const funcionario = await prisma.funcionario.findUnique({
        where: { id: funcionarioId },
        include: { ubs: true },
      });

      if (!funcionario) {
        return res.status(404).json({ message: "Funcionário não encontrado" });
      }

      // Validar se a receita foi emitida pela mesma UBS do funcionário
      if (receita.ubsId !== funcionario.ubsId) {
        return res.status(403).json({
          message: "Você só pode dispensar receitas emitidas pela sua UBS",
        });
      }

      // Verificar se há dispensações da receita
      if (receita.dispensacoes.length > 0) {
        // Verificar se há dispensação pela farmácia
        const dispensacaoFarmacia = receita.dispensacoes.find(
          (d) => d.farmaciaId !== null,
        );
        if (dispensacaoFarmacia) {
          return res.status(409).json({
            message:
              "Receita já está em dispensação por uma farmácia. UBS não pode dispensar a mesma receita.",
            dispensacaoExistente: dispensacaoFarmacia,
          });
        }

        // Verificar se há dispensação anterior pela UBS
        const dispensacaoUbsAnterior = receita.dispensacoes.find(
          (d) => d.ubsId === funcionario.ubsId,
        );
        if (dispensacaoUbsAnterior) {
          return res.status(409).json({
            message: "Receita já foi dispensada por sua UBS",
            dispensacaoExistente: dispensacaoUbsAnterior,
          });
        }
      }

      // Criar dispensação
      const novaDispensacao = await prisma.dispensacaoReceita.create({
        data: {
          receitaId,
          ubsId: funcionario.nome || "UBS",
          funcionarioId,
          statusDispensacao,
          observacoesDispensacao,
          medicamentoFornecido: medicamentoFornecido || receita.medicamento,
          quantidadeDispensada:
            quantidadeDispensada || parseInt(receita.quantidade),
          ubsResponsavel: funcionario.nome,
        },
        include: {
          receita: true,
          ubs: true,
          funcionario: true,
        },
      });

      // Atualizar status da receita se for completa
      if (statusDispensacao === "completa") {
        await prisma.receitaMedica.update({
          where: { id: receitaId },
          data: { status: "dispensada" },
        });
      } else if (statusDispensacao === "parcial") {
        await prisma.receitaMedica.update({
          where: { id: receitaId },
          data: { status: "parcialmente_dispensada" },
        });
      }

      res.status(201).json({
        message: "Dispensação criada com sucesso",
        dispensacao: novaDispensacao,
      });
    } catch (error) {
      console.error("Erro ao dispensar receita:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },
);

// Rota para dispensar medicamentos individuais de uma receita
router.post(
  "/dispensar-medicamentos",
  funcionarioPodeConsultarReceita,
  async (req, res) => {
    try {
      const {
        receitaId,
        medicamentos, // array de { receitaMedicamentoId, medicamentoFornecido, quantidadeDispensada, observacoes }
      } = req.body;
      const funcionarioId = req.user.id;

      if (
        !receitaId ||
        !Array.isArray(medicamentos) ||
        medicamentos.length === 0
      ) {
        return res.status(400).json({
          message: "receitaId e array de medicamentos são obrigatórios",
        });
      }

      // Buscar receita completa com itens
      const receita = await prisma.receitaMedica.findUnique({
        where: { id: receitaId },
        include: {
          itens: true,
          ubs: true,
          dispensacoes: true,
        },
      });

      if (!receita) {
        return res.status(404).json({ message: "Receita não encontrada" });
      }

      // Buscar funcionário com UBS e nome
      const funcionario = await prisma.funcionario.findUnique({
        where: { id: funcionarioId },
        select: { ubsId: true, nome: true, funcao: true },
      });

      if (!funcionario) {
        return res.status(404).json({ message: "Funcionário não encontrado" });
      }

      // Validar se a receita foi emitida pela mesma UBS do funcionário
      if (receita.ubsId !== funcionario.ubsId) {
        return res.status(403).json({
          message: "Você só pode dispensar receitas emitidas pela sua UBS",
        });
      }

      // Validar cada medicamento a dispensar
      const dispensacoesCriadas = [];
      const atualizacoesMedicamentos = [];

      for (const med of medicamentos) {
        const {
          receitaMedicamentoId,
          medicamentoFornecido,
          quantidadeDispensada,
          observacoes,
        } = med;

        if (!receitaMedicamentoId) {
          return res.status(400).json({
            message: "receitaMedicamentoId é obrigatório para cada medicamento",
          });
        }

        // Buscar o medicamento da receita
        const receitaMedicamento = receita.itens.find(
          (item) => item.id === receitaMedicamentoId,
        );

        if (!receitaMedicamento) {
          return res.status(404).json({
            message: `Medicamento com ID ${receitaMedicamentoId} não encontrado na receita`,
          });
        }

        // Validar status - só pode dispensar se estiver pendente
        if (receitaMedicamento.status === "dispensado") {
          return res.status(409).json({
            message: `Medicamento "${receitaMedicamento.medicamento}" já foi dispensado`,
          });
        }

        // Criar dispensação para este medicamento
        dispensacoesCriadas.push({
          receitaId,
          receitaMedicamentoId,
          ubsId: funcionario.ubsId,
          funcionarioId,
          statusDispensacao: "completa", // Individual, então sempre completa
          medicamentoFornecido:
            medicamentoFornecido || receitaMedicamento.medicamento,
          quantidadeDispensada:
            quantidadeDispensada || receitaMedicamento.quantidade,
          ubsResponsavel: funcionario.nome,
          observacoesDispensacao: observacoes || null,
        });

        // Marcar medicamento como dispensado
        atualizacoesMedicamentos.push({
          id: receitaMedicamentoId,
          status: "dispensado",
        });
      }

      // Executar operações em transação
      const resultado = await prisma.$transaction(async (tx) => {
        // Criar todas as dispensações
        const dispensacoes = await Promise.all(
          dispensacoesCriadas.map((disp) =>
            tx.dispensacaoReceita.create({
              data: disp,
              include: { receita: true },
            }),
          ),
        );

        // Atualizar status dos medicamentos
        const medicamentosAtualizados = await Promise.all(
          atualizacoesMedicamentos.map((med) =>
            tx.receitaMedicamento.update({
              where: { id: med.id },
              data: { status: med.status },
            }),
          ),
        );

        // Verificar se todos os medicamentos foram dispensados
        const receitaAtualizada = await tx.receitaMedica.findUnique({
          where: { id: receitaId },
          include: { itens: true },
        });

        const todosMedicamentoDispensados = receitaAtualizada.itens.every(
          (item) => item.status === "dispensado",
        );

        // Atualizar status da receita se todos forem dispensados
        if (todosMedicamentoDispensados) {
          await tx.receitaMedica.update({
            where: { id: receitaId },
            data: { status: "dispensada" },
          });
        } else {
          await tx.receitaMedica.update({
            where: { id: receitaId },
            data: { status: "parcialmente_dispensada" },
          });
        }

        return { dispensacoes, medicamentosAtualizados };
      });

      res.status(201).json({
        message: "Medicamentos dispensados com sucesso",
        dispensacoes: resultado.dispensacoes,
        medicamentosAtualizados: resultado.medicamentosAtualizados,
      });
    } catch (error) {
      console.error("Erro ao dispensar medicamentos:", error);
      res.status(500).json({
        message: "Erro ao dispensar medicamentos",
        details: error.message,
      });
    }
  },
);

export default router;
