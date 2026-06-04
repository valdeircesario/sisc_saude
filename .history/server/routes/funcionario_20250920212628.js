import express from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware para funcionário
router.use(authenticateToken);
router.use(authorizeRole(['funcionario']));

// Registrar informações do paciente no histórico médico
router.post('/historico-medico', async (req, res) => {
  try {
    const { pacienteId, laudo, doenca, diagnostico, medicacao, observacoes, dataConsulta } = req.body;

    const novoHistorico = await prisma.historicoMedico.create({
      data: {
        pacienteId,
        funcionarioId: req.user.id,
        laudo,
        doenca,
        diagnostico,
        medicacao,
        observacoes,
        dataConsulta: new Date(dataConsulta)
      }
    });

    res.status(201).json(novoHistorico);
  } catch (error) {
    console.error('Erro ao registrar histórico médico:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Registrar vacina
router.post('/vacinas', async (req, res) => {
  try {
    const { pacienteId, nome, lote, dataApl, proximaDose } = req.body;

    const novaVacina = await prisma.vacina.create({
      data: {
        pacienteId,
        
        nome,
        lote,
        dataApl: new Date(dataApl),
        proximaDose: proximaDose ? new Date(proximaDose) : null
      }
    });

    res.status(201).json(novaVacina);
  } catch (error) {
    console.error('Erro ao registrar vacina:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Solicitar exame
router.post('/solicitar-exame', async (req, res) => {
  try {
    const { pacienteId, laboratorioId, tipoExame, observacoes } = req.body;

    const solicitacao = await prisma.solicitacaoExame.create({
      data: {
        pacienteId,
        funcionarioId: req.user.id,
        laboratorioId,
        tipoExame,
        observacoes
      }
    });

    res.status(201).json(solicitacao);
  } catch (error) {
    console.error('Erro ao solicitar exame:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Solicitar internação - FUNCIONALIDADE CORRIGIDA
router.post('/solicitacoes-internacao', async (req, res) => {
  try {
    const { 
      pacienteId, 
      hospitalId, 
      tipo, 
      motivo, 
      detalhes, 
      laudoMedico, 
      prioridade = 'medio',
      observacoes 
    } = req.body;

    // Validar campos obrigatórios
    if (!pacienteId || !hospitalId || !tipo || !motivo || !detalhes || !laudoMedico) {
      return res.status(400).json({ 
        message: 'Campos obrigatórios: pacienteId, hospitalId, tipo, motivo, detalhes, laudoMedico' 
      });
    }

    // Verificar se o funcionário existe e obter sua UBS
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.user.id },
      select: { ubsId: true, nome: true, funcao: true }
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    // Verificar se o paciente existe
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: { id: true, nome: true, cpf: true, telefone: true, email: true }
    });

    if (!paciente) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    // Verificar se o hospital existe
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { id: true, nome: true, telefone: true, endereco: true }
    });

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital não encontrado' });
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
        status: 'pendente'
      },
      include: {
        paciente: {
          select: {
            nome: true,
            cpf: true,
            telefone: true,
            email: true
          }
        },
        hospital: {
          select: {
            nome: true,
            telefone: true,
            endereco: true
          }
        },
        ubs: {
          select: {
            nome: true
          }
        },
        funcionario: {
          select: {
            nome: true,
            funcao: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Solicitação de internação criada com sucesso',
      solicitacao
    });
  } catch (error) {
    console.error('Erro ao solicitar internação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar minhas solicitações de internação
router.get('/minhas-solicitacoes-internacao', async (req, res) => {
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
            email: true
          }
        },
        hospital: {
          select: {
            nome: true,
            telefone: true,
            endereco: true
          }
        },
        ubs: {
          select: {
            nome: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(solicitacoes);
  } catch (error) {
    console.error('Erro ao listar solicitações de internação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar observações da solicitação (apenas o funcionário que criou pode atualizar)
router.put('/solicitacoes-internacao/:id/observacoes', async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    const solicitacaoAtualizada = await prisma.solicitacaoInternacao.update({
      where: { 
        id,
        funcionarioId: req.user.id // Garantir que apenas o funcionário que criou pode atualizar
      },
      data: {
        observacoes
      },
      include: {
        paciente: {
          select: { nome: true }
        },
        hospital: {
          select: { nome: true }
        }
      }
    });

    res.json({
      message: 'Observações atualizadas com sucesso',
      solicitacao: solicitacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Solicitação não encontrada ou você não tem permissão para editá-la' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar pacientes
router.get('/pacientes', async (req, res) => {
  try {
    const { busca } = req.query;
    
    const where = busca ? {
      OR: [
        { nome: { contains: busca, mode: 'insensitive' } },
        { cpf: { contains: busca } },
        { cns: { contains: busca } }
      ]
    } : {};

    const pacientes = await prisma.paciente.findMany({
      where,
      select: {
        id: true,
        nome: true,
        cpf: true,
        cns: true,
        telefone: true,
        email: true,
        nascimento: true
      },
      take: 50
    });

    res.json(pacientes);
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter histórico médico do paciente
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
            crm: true
          }
        }
      },
      orderBy: { dataConsulta: 'desc' }
    });

    res.json(historico);
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar laboratórios disponíveis
router.get('/laboratorios', async (req, res) => {
  try {
    const laboratorios = await prisma.laboratorio.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true
      }
    });

    res.json(laboratorios);
  } catch (error) {
    console.error('Erro ao listar laboratórios:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar hospitais disponíveis
router.get('/hospitais', async (req, res) => {
  try {
    const hospitais = await prisma.hospital.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
        email: true
      },
      orderBy: { nome: 'asc' }
    });

    res.json(hospitais);
  } catch (error) {
    console.error('Erro ao listar hospitais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;

