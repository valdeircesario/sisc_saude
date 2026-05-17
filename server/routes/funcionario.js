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

// Solicitar exame
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
      return res
        .status(404)
        .json({
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

// Verifica se o funcionário pode trabalhar com medicamentos (enfermeiro ou farmacêutico)
const funcionarioPodeTratarMedicamentos = async (req, res, next) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.user.id },
      select: { ubsId: true, funcao: true, nome: true },
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    const funcao = funcionario.funcao?.toLowerCase();
    const podeListar = ['enfermeiro', 'farmaceutico', 'farmacêutico'].includes(funcao);
    const podeAdministrar = ['enfermeiro', 'farmaceutico', 'farmacêutico'].includes(funcao);

    req.funcionario = funcionario;

    if (req.method === 'GET') {
      if (!podeListar) {
        return res.status(403).json({ message: 'Acesso negado: função não autorizada para listar medicamentos' });
      }
      return next();
    }

    if (!podeAdministrar) {
      return res.status(403).json({ message: 'Acesso negado: função não autorizada para esta ação' });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar permissão de medicamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Listar medicamentos da UBS do funcionário (enfermeiro/farmacêutico)
router.get('/medicamentos', funcionarioPodeTratarMedicamentos, async (req, res) => {
  try {
    const { busca } = req.query;
    const where = {
      ubsId: req.funcionario.ubsId,
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: 'insensitive' } },
              { lote: { contains: busca, mode: 'insensitive' } },
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
      orderBy: { nome: 'asc' },
    });

    res.json(medicamentos);
  } catch (error) {
    console.error('Erro ao listar medicamentos do funcionário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar medicamento da UBS do funcionário
router.put('/medicamentos/:id', funcionarioPodeTratarMedicamentos, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, observacoes, lote, quantidade, dataValidade, vencido } = req.body;

    const medicamentoExistente = await prisma.medicamento.findUnique({ where: { id } });
    if (!medicamentoExistente) {
      return res.status(404).json({ message: 'Medicamento não encontrado' });
    }

    if (medicamentoExistente.ubsId !== req.funcionario.ubsId) {
      return res.status(403).json({ message: 'Acesso negado a este medicamento' });
    }

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (observacoes !== undefined) updateData.observacoes = observacoes;
    if (lote !== undefined) updateData.lote = lote;
    if (quantidade !== undefined) {
      const quantidadeInt = Number(quantidade);
      if (Number.isNaN(quantidadeInt) || quantidadeInt < 0) {
        return res.status(400).json({ message: 'Quantidade inválida' });
      }
      updateData.quantidade = quantidadeInt;
    }
    if (dataValidade !== undefined) {
      const validade = new Date(dataValidade);
      if (Number.isNaN(validade.getTime())) {
        return res.status(400).json({ message: 'Data de validade inválida' });
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
    console.error('Erro ao atualizar medicamento do funcionário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Administrar medicação ao paciente
router.post('/medicamentos/:id/administrar', funcionarioPodeTratarMedicamentos, async (req, res) => {
  try {
    const { id } = req.params;
    const { pacienteId, pacienteCns, quantidade, dataRetirada, observacoes } = req.body;

    if ((!pacienteId && !pacienteCns) || quantidade === undefined) {
      return res.status(400).json({ message: 'Paciente (ID ou CNS) e quantidade são obrigatórios' });
    }

    const quantidadeInt = Number(quantidade);
    if (Number.isNaN(quantidadeInt) || quantidadeInt <= 0) {
      return res.status(400).json({ message: 'Quantidade inválida' });
    }

    const medicamentoExistente = await prisma.medicamento.findUnique({ where: { id } });
    if (!medicamentoExistente) {
      return res.status(404).json({ message: 'Medicamento não encontrado' });
    }

    if (medicamentoExistente.ubsId !== req.funcionario.ubsId) {
      return res.status(403).json({ message: 'Acesso negado a este medicamento' });
    }

    if (quantidadeInt > medicamentoExistente.quantidade) {
      return res.status(400).json({ message: 'Quantidade solicitada maior do que o estoque disponível' });
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
      return res.status(404).json({ message: 'Paciente não encontrado com o CNS informado' });
    }

    const pacienteIdParaSalvar = paciente.id;

    const retirada = dataRetirada ? new Date(dataRetirada) : new Date();
    if (Number.isNaN(retirada.getTime())) {
      return res.status(400).json({ message: 'Data de retirada inválida' });
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
          fornecidoPor: req.funcionario.nome || 'Funcionário',
          observacoes: observacoes ?? null,
        },
      }),
    ]);

    res.json({ medicamento: medicamentoAtualizado, administracao: medicacao });
  } catch (error) {
    console.error('Erro ao administrar medicamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
