import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { format } from 'date-fns';

const router = express.Router();

// Middleware para hospital
router.use(authenticateToken);
router.use(authorizeRole(['hospital']));

const formatarDataBR = (data) => {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Listar todos os pacientes
router.get('/pacientes', async (req, res) => {
  try {
    const { busca } = req.query;
    
    const where = busca ? {
      OR: [
        { nome: { contains: busca, mode: 'insensitive' } },
        { cpf: { contains: busca } },
        { cns: { contains: busca } },
        { email: { contains: busca, mode: 'insensitive' } }
      ]
    } : {};

    const pacientes = await prisma.paciente.findMany({
      where,
      select: {
        id: true,
        nome: true,
        cpf: true,
        cns: true,
        endereco: true,
        cep: true,
        nascimento: true,
        telefone: true,
        email: true,
        createdAt: true
      },
      orderBy: { nome: 'asc' }
    });

    res.json(pacientes);
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter detalhes de um paciente específico
router.get('/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        cpf: true,
        cns: true,
        endereco: true,
        cep: true,
        nascimento: true,
        telefone: true,
        email: true,
        createdAt: true
      }
    });

    if (!paciente) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    res.json(paciente);
  } catch (error) {
    console.error('Erro ao obter paciente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter histórico médico de um paciente
router.get('/pacientes/:id/historico', async (req, res) => {
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
            ubs: {
              select: {
                nome: true
              }
            }
          }
        }
      },
      orderBy: { dataConsulta: 'desc' }
    });

    res.json(historico);
  } catch (error) {
    console.error('Erro ao obter histórico médico:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// FUNCIONALIDADES DE SOLICITAÇÃO DE INTERNAÇÃO

// Listar solicitações de internação recebidas
router.get('/solicitacoes-internacao', async (req, res) => {
  try {
    const { status, prioridade, tipo } = req.query;
    
    // Construir filtros dinamicamente
    const where = { 
      hospitalId: req.user.id 
    };
    
    if (status) where.status = status;
    if (prioridade) where.prioridade = prioridade;
    if (tipo) where.tipo = tipo;

    const solicitacoes = await prisma.solicitacaoInternacao.findMany({
      where,
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            cns: true,
            telefone: true,
            email: true,
            nascimento: true,
            endereco: true
          }
        },
        funcionario: {
          select: {
            nome: true,
            funcao: true,
            crm: true
          }
        },
        ubs: {
          select: {
            nome: true,
            telefone: true,
            endereco: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Ordenação manual por prioridade
    const prioridadeOrdem = { 
      'gravissimo': 5, 
      'urgente': 4, 
      'grave': 3, 
      'medio': 2, 
      'leve': 1 
    };
    
    solicitacoes.sort((a, b) => {
      const prioridadeA = prioridadeOrdem[a.prioridade] || 0;
      const prioridadeB = prioridadeOrdem[b.prioridade] || 0;
      
      if (prioridadeA !== prioridadeB) {
        return prioridadeB - prioridadeA; // Maior prioridade primeiro
      }
      
      return new Date(a.createdAt) - new Date(b.createdAt); // Mais antigo primeiro
    });

    res.json(solicitacoes);
  } catch (error) {
    console.error('Erro ao listar solicitações de internação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter detalhes de uma solicitação específica
router.get('/solicitacoes-internacao/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const solicitacao = await prisma.solicitacaoInternacao.findUnique({
      where: { 
        id,
        hospitalId: req.user.id
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
            nascimento: true,
            endereco: true
          }
        },
        funcionario: {
          select: {
            nome: true,
            funcao: true,
            crm: true
          }
        },
        ubs: {
          select: {
            nome: true,
            telefone: true,
            endereco: true
          }
        }
      }
    });

    if (!solicitacao) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }

    res.json(solicitacao);
  } catch (error) {
    console.error('Erro ao obter solicitação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar status da solicitação de internação
router.put('/solicitacoes-internacao/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacoes } = req.body;

    // Validar status permitidos
    const statusPermitidos = ['pendente', 'avaliando', 'agendado', 'realizado', 'cancelado'];
    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({ 
        message: 'Status inválido. Permitidos: ' + statusPermitidos.join(', ') 
      });
    }

    const solicitacaoAtualizada = await prisma.solicitacaoInternacao.update({
      where: { 
        id,
        hospitalId: req.user.id
      },
      data: {
        status,
        observacoes
      },
      include: {
        paciente: {
          select: { nome: true, email: true, telefone: true }
        },
        funcionario: {
          select: { nome: true }
        },
        ubs: {
          select: { nome: true }
        }
      }
    });

    res.json({
      message: 'Status da solicitação atualizado com sucesso',
      solicitacao: solicitacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar status da solicitação:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Aceitar solicitação de internação (mudança de status para "avaliando")
router.put('/solicitacoes-internacao/:id/aceitar', async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    const solicitacaoAtualizada = await prisma.solicitacaoInternacao.update({
      where: { 
        id,
        hospitalId: req.user.id,
        status: 'pendente' // Só pode aceitar se estiver pendente
      },
      data: {
        status: 'avaliando',
        observacoes
      },
      include: {
        paciente: {
          select: { nome: true, email: true, telefone: true }
        },
        ubs: {
          select: { nome: true }
        },
        funcionario: {
          select: { nome: true }
        }
      }
    });

    res.json({
      message: 'Solicitação aceita e em avaliação',
      solicitacao: solicitacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao aceitar solicitação:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Solicitação não encontrada ou não está pendente' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Agendar internação
router.put('/solicitacoes-internacao/:id/agendar', async (req, res) => {
  try {
    const { id } = req.params;
    const { dataAgendada, horaAgendada, local, recomendacoes, observacoes } = req.body;

    if (!dataAgendada || !horaAgendada) {
      return res.status(400).json({ 
        message: 'Data e hora do agendamento são obrigatórias' 
      });
    }

    const solicitacaoAtualizada = await prisma.solicitacaoInternacao.update({
      where: { 
        id,
        hospitalId: req.user.id
      },
      data: {
        status: 'agendado',
        dataAgendada: new Date(dataAgendada),
        horaAgendada,
        local,
        recomendacoes,
        observacoes
      },
      include: {
        paciente: {
          select: { nome: true, email: true, telefone: true }
        },
        funcionario: {
          select: { nome: true }
        },
        ubs: {
          select: { nome: true }
        }
      }
    });

    res.json({
      message: 'Internação agendada com sucesso',
      solicitacao: solicitacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao agendar internação:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rejeitar solicitação de internação
router.put('/solicitacoes-internacao/:id/rejeitar', async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    const solicitacaoAtualizada = await prisma.solicitacaoInternacao.update({
      where: { 
        id,
        hospitalId: req.user.id
      },
      data: {
        status: 'cancelado',
        observacoes
      },
      include: {
        paciente: {
          select: { nome: true, email: true }
        },
        funcionario: {
          select: { nome: true }
        },
        ubs: {
          select: { nome: true }
        }
      }
    });

    res.json({
      message: 'Solicitação rejeitada',
      solicitacao: solicitacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota GET para listar pacientes internados
router.get('/internacoes', async (req, res) => {
  try {
    const { busca } = req.query;
    
    const where = {
      hospitalId: req.user.id,
      // Removido status: 'ativa' para listar todas as internações, incluindo as com alta
    };

    // Adicionar filtro de busca pelo nome do paciente
    if (busca) {
      where.paciente = {
        nome: {
          contains: busca,
          mode: 'insensitive'
        }
      };
    }

    const internacoes = await prisma.internacao.findMany({
      where,
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            cns: true,
            telefone: true,
            email: true,
            nascimento: true,
            endereco: true
          },
        },
        solicitacaoInternacao: {
          select: {
            motivo: true,
            tipo: true,
            prioridade: true
          },
        },
        altaHospitalar: true, // Incluir dados de alta
      },
      orderBy: { dataEntrada: 'desc' },
    });

    const internacoesFormatadas = internacoes.map(internacao => ({
      id: internacao.id,
      paciente: internacao.paciente,
      motivoInternacao: internacao.motivoInternacao || internacao.solicitacaoInternacao?.motivo,
      dataEntrada: internacao.dataEntrada,
      dataSaida: internacao.dataSaida, // Incluir dataSaida
      quarto: internacao.quarto,
      leito: internacao.leito,
      medicoResponsavelNome: internacao.medicoResponsavelNome,
      diagnosticoInicial: internacao.diagnosticoInicial,
      diagnosticoFinal: internacao.diagnosticoFinal, // Incluir diagnosticoFinal
      observacoes: internacao.observacoes,
      status: internacao.status,
      solicitacaoInternacao: internacao.solicitacaoInternacao,
      altaHospitalar: internacao.altaHospitalar, // Incluir altaHospitalar
    }));

    res.json(internacoesFormatadas);
  } catch (error) {
    console.error('Erro ao listar internações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota GET para obter detalhes de uma internação específica (incluindo medicações, exames e alta)
router.get('/internacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const internacao = await prisma.internacao.findUnique({
      where: { id, hospitalId: req.user.id },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            cns: true,
            telefone: true,
            email: true,
            nascimento: true,
            endereco: true
          }
        },
        solicitacaoInternacao: {
          select: {
            motivo: true,
            tipo: true,
            prioridade: true
          }
        },
        medicacoesAdministradas: {
          // Removido o include do administrador, agora usa apenas o campo administradorNomeOuCrm
          orderBy: { dataHoraAdministracao: 'desc' }
        },
        solicitacoesExameInternacao: {
          include: {
            laboratorio: {
              select: { nome: true }
            }
          },
          orderBy: { dataSolicitacao: 'desc' }
        },
        altaHospitalar: true,
      },
    });

    if (!internacao) {
      return res.status(404).json({ message: 'Internação não encontrada ou não pertence a este hospital.' });
    }

    res.json(internacao);
  } catch (error) {
    console.error('Erro ao obter detalhes da internação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota POST para criar uma nova internação
router.post('/internacoes', async (req, res) => {
  try {
    const { 
      solicitacaoInternacaoId,
      pacienteId,
      hospitalId,
      dataEntrada,
      motivoInternacao,
      diagnosticoInicial,
      medicoResponsavelNome,
      quarto,
      leito,
      observacoes
    } = req.body;

    if (!solicitacaoInternacaoId || !pacienteId || !hospitalId || !dataEntrada || !motivoInternacao || !diagnosticoInicial || !medicoResponsavelNome || !quarto || !leito) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios para internação devem ser preenchidos.' });
    }

    // Verificar se a solicitação de internação existe e pertence ao hospital logado
    const solicitacao = await prisma.solicitacaoInternacao.findUnique({
      where: { id: solicitacaoInternacaoId, hospitalId: req.user.id },
    });

    if (!solicitacao) {
      return res.status(404).json({ message: 'Solicitação de internação não encontrada ou não pertence a este hospital.' });
    }

    // Criar a internação
    const novaInternacao = await prisma.internacao.create({
      data: {
        solicitacaoInternacaoId,
        pacienteId,
        hospitalId,
        dataEntrada: new Date(dataEntrada),
        motivoInternacao,
        diagnosticoInicial,
        medicoResponsavelNome,
        quarto,
        leito,
        observacoes,
        status: 'ativa',
      },
    });

    // Atualizar o status da solicitação de internação para 'realizado'
    await prisma.solicitacaoInternacao.update({
      where: { id: solicitacaoInternacaoId },
      data: { status: 'realizado' },
    });

    res.status(201).json({ message: 'Internação criada com sucesso!', internacao: novaInternacao });
  } catch (error) {
    console.error('Erro ao criar internação:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Já existe uma internação para esta solicitação.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao criar internação.' });
  }
});

// Rota PUT para atualizar observações de uma internação
router.put('/internacoes/:id/observacao', async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    const internacaoAtualizada = await prisma.internacao.update({
      where: { id, hospitalId: req.user.id },
      data: {
        observacoes,
      },
    });

    res.json({ message: 'Observações da internação atualizadas com sucesso!', internacao: internacaoAtualizada });
  } catch (error) {
    console.error('Erro ao atualizar observações da internação:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Internação não encontrada ou não pertence a este hospital.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar observações.' });
  }
});

// Rota POST para registrar alta de uma internação
router.post("/internacoes/:internacaoId/alta", async (req, res) => {
  try {
    const { internacaoId } = req.params;
    const { 
      pacienteId,
      medicoResponsavel,
      dataAlta,
      tipoAlta,
      condicaoAlta,
      diagnosticoFinal,
      orientacoesAlta,
      medicacoesPrescritas,
      retornoAgendado,
      observacoes,
    } = req.body;

    if (!pacienteId || !medicoResponsavel || !dataAlta || !tipoAlta || !condicaoAlta || !diagnosticoFinal || !orientacoesAlta) {
      return res.status(400).json({ message: "Todos os campos obrigatórios para alta devem ser preenchidos." });
    }

    // Verificar se a internação existe e pertence ao hospital logado
    const internacaoExistente = await prisma.internacao.findUnique({
      where: { id: internacaoId, hospitalId: req.user.id },
    });

    if (!internacaoExistente) {
      return res.status(404).json({ message: "Internação não encontrada ou não pertence a este hospital." });
    }

    if (internacaoExistente.status === "alta") {
      return res.status(400).json({ message: "Esta internação já possui alta registrada." });
    }

    // Criar registro de alta
    const novaAlta = await prisma.altaHospitalar.create({
      data: {
        internacaoId,
        pacienteId,
        medicoResponsavel,
        dataAlta: new Date(dataAlta),
        tipoAlta,
        condicaoAlta,
        diagnosticoFinal,
        orientacoesAlta,
        medicacoesPrescritas,
        retornoAgendado: retornoAgendado ? new Date(retornoAgendado) : null,
        observacoes,
      },
    });

    // Atualizar status da internação para 'alta' e dataSaida
    await prisma.internacao.update({
      where: { id: internacaoId },
      data: {
        status: "alta",
        dataSaida: new Date(dataAlta),
        diagnosticoFinal: diagnosticoFinal, // Atualiza o diagnóstico final na internação
      },
    });

    res.status(201).json({ message: "Alta hospitalar registrada com sucesso!", alta: novaAlta });
  } catch (error) {
    console.error("Erro ao registrar alta hospitalar:", error);
    res.status(500).json({ message: "Erro interno do servidor ao registrar alta." });
  }
});

// ROTA CORRIGIDA: Rota POST para registrar medicação administrada a um paciente internado
router.post("/internacoes/:internacaoId/medicacao", async (req, res) => {
  try {
    const { internacaoId } = req.params;
    const {
      pacienteId,
      nomeMedicacao,
      dosagem,
      viaAdministracao,
      dataHoraAdministracao,
      administradorNomeOuCrm,
      observacoes
    } = req.body;

    // Validação dos campos obrigatórios
    if (!internacaoId || !pacienteId || !nomeMedicacao || !dataHoraAdministracao || !administradorNomeOuCrm) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando: internacaoId, pacienteId, nomeMedicacao, dataHoraAdministracao, administradorNomeOuCrm.' });
    }

    // Verificar se a internação existe e pertence ao hospital logado
    const internacaoExistente = await prisma.internacao.findUnique({
      where: { id: internacaoId, hospitalId: req.user.id },
    });

    if (!internacaoExistente) {
      return res.status(404).json({ message: "Internação não encontrada ou não pertence a este hospital." });
    }

    // Verificar se a internação está ativa (opcional)
    if (internacaoExistente.status !== 'ativa') {
      return res.status(400).json({ message: "Não é possível registrar medicação para uma internação que não está ativa." });
    }

    // Criar o registro de medicação usando apenas campos simples, sem relacionamentos
    const novaMedicacao = await prisma.medicacaoAdministrada.create({
      data: {
        internacaoId,
        pacienteId,
        nomeMedicacao,
        dosagem: dosagem || null,
        viaAdministracao: viaAdministracao || null,
        dataHoraAdministracao: new Date(dataHoraAdministracao),
        administradorNomeOuCrm, // Campo de texto simples, não relacionamento
        observacoes: observacoes || null,
      },
    });

    res.status(201).json({ 
      message: "Medicação registrada com sucesso!", 
      medicacao: novaMedicacao 
    });
  } catch (error) {
    console.error("Erro ao registrar medicação:", error);
    
    // Log mais detalhado do erro para debug
    if (error.code) {
      console.error("Código do erro Prisma:", error.code);
    }
    if (error.meta) {
      console.error("Meta do erro:", error.meta);
    }
    
    res.status(500).json({ 
      message: "Erro interno do servidor ao registrar medicação.",
      erro: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ROTA CORRIGIDA: Rota GET para listar medicações de uma internação
router.get("/internacoes/:internacaoId/medicacoes", async (req, res) => {
  try {
    const { internacaoId } = req.params;

    // Verificar se a internação existe e pertence ao hospital logado
    const internacaoExistente = await prisma.internacao.findUnique({
      where: { id: internacaoId, hospitalId: req.user.id },
    });

    if (!internacaoExistente) {
      return res.status(404).json({ message: "Internação não encontrada ou não pertence a este hospital." });
    }

    // Buscar medicações sem include de administrador (usando apenas o campo administradorNomeOuCrm)
    const medicacoes = await prisma.medicacaoAdministrada.findMany({
      where: { internacaoId },
      orderBy: { dataHoraAdministracao: "desc" }
    });

    res.json(medicacoes);
  } catch (error) {
    console.error("Erro ao listar medicações da internação:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// Rota POST para solicitar exame para uma internação
router.post("/internacoes/:internacaoId/solicitar-exame", async (req, res) => {
  try {
    const { internacaoId } = req.params;
    const { 
      pacienteId,
      laboratorioId,
      tipoExame,
      observacoes,
    } = req.body;

    if (!pacienteId || !laboratorioId || !tipoExame) {
      return res.status(400).json({ message: "Campos obrigatórios para solicitação de exame: pacienteId, laboratorioId, tipoExame." });
    }

    // Verificar se a internação existe e pertence ao hospital logado
    const internacaoExistente = await prisma.internacao.findUnique({
      where: { id: internacaoId, hospitalId: req.user.id },
    });

    if (!internacaoExistente) {
      return res.status(404).json({ message: "Internação não encontrada ou não pertence a este hospital." });
    }

    const novaSolicitacaoExame = await prisma.solicitacaoExameInternacao.create({
      data: {
        internacaoId,
        pacienteId,
        laboratorioId,
        tipoExame,
        observacoes,
        dataSolicitacao: new Date(),
        status: "pendente",
      },
    });

    res.status(201).json({ message: "Solicitação de exame para internação registrada com sucesso!", solicitacao: novaSolicitacaoExame });
  } catch (error) {
    console.error("Erro ao solicitar exame para internação:", error);
    res.status(500).json({ message: "Erro interno do servidor ao solicitar exame." });
  }
});

// Rota GET para listar solicitações de exames de uma internação
router.get("/internacoes/:internacaoId/solicitacoes-exame", async (req, res) => {
  try {
    const { internacaoId } = req.params;

    const solicitacoes = await prisma.solicitacaoExameInternacao.findMany({
      where: { internacaoId },
      include: {
        laboratorio: {
          select: { nome: true }
        }
      },
      orderBy: { dataSolicitacao: "desc" }
    });

    res.json(solicitacoes);
  } catch (error) {
    console.error("Erro ao listar solicitações de exames da internação:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// Rota PUT para atualizar o status e resultado de uma solicitação de exame de internação
router.put("/solicitacoes-exame-internacao/:id/resultado", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, dataResultado, resultado, arquivoPdf } = req.body;

    const solicitacaoAtualizada = await prisma.solicitacaoExameInternacao.update({
      where: { id },
      data: {
        status,
        dataResultado: dataResultado ? new Date(dataResultado) : undefined,
        resultado,
        arquivoPdf,
      },
    });

    res.json({ message: "Resultado de exame de internação atualizado com sucesso!", solicitacao: solicitacaoAtualizada });
  } catch (error) {
    console.error("Erro ao atualizar resultado de exame de internação:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// Rota GET para listar todos os laboratórios
router.get('/laboratorios', async (req, res) => {
  try {
    const laboratorios = await prisma.laboratorio.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' }
    });
    res.json(laboratorios);
  } catch (error) {
    console.error('Erro ao listar laboratórios:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota GET para listar todos os funcionários do hospital logado
router.get('/funcionarios', async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      where: { ubs: { hospital: { id: req.user.id } } }, // Assumindo que funcionários de UBS podem ser associados a hospitais
      select: { id: true, nome: true, funcao: true },
      orderBy: { nome: 'asc' }
    });
    res.json(funcionarios);
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;