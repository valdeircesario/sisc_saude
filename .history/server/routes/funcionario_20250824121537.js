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

// Obter dados do hospital
    const hospital = await prisma.hospital.findUnique({
      where: { id: req.user.id },
      select: { id: true, nome: true,  }
    });

// Solicitar internação
router.post('/solicitacoes-internacao', async (req, res) => {
  try {
    const { pacienteId, observacoes } = req.body;

    const solicitacao = await prisma.solicitacaoExame.create({
      data: {
        pacienteId,
        funcionarioId: req.user.id,
        hospitalId,
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

export default router;