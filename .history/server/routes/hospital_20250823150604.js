import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware para hospital
router.use(authenticateToken);
router.use(authorizeRole(['hospital']));

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

// Obter consultas de um paciente
router.get('/pacientes/:id/consultas', async (req, res) => {
  try {
    const { id } = req.params;

    const consultas = await prisma.consulta.findMany({
      where: { pacienteId: id },
      include: {
        funcionario: {
          select: {
            nome: true,
            funcao: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(consultas);
  } catch (error) {
    console.error('Erro ao obter consultas do paciente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Agendar consulta para um paciente específico
router.post('/pacientes/:id/agendar-consulta', async (req, res) => {
  try {
    const { id } = req.params;
    const { especialidade, motivo, dataAgendada, funcionarioId, observacoes } = req.body;

    const novaConsulta = await prisma.consulta.create({
      data: {
        pacienteId: id,
        ubsId: req.user.id,
        especialidade,
        motivo,
        dataAgendada: new Date(dataAgendada),
        funcionarioId,
        observacoes,
        status: 'agendada'
      },
      include: {
        paciente: {
          select: { nome: true, email: true }
        },
        funcionario: {
          select: { nome: true, funcao: true }
        }
      }
    });

    res.status(201).json(novaConsulta);
  } catch (error) {
    console.error('Erro ao agendar consulta:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});



// Listar solicitações de consulta
router.get('/cirugias', async (req, res) => {
  try {
    const cirugias = await prisma.cirugias.findMany({
      where: { ubsId: req.user.id },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            telefone: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(cirugias);
  } catch (error) {
    console.error('Erro ao listar cirugias:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Agendar consulta
router.put('/cir/:id/agendar', async (req, res) => {
  try {
    const { id } = req.params;
    const { dataAgendada, funcionarioId, observacoes } = req.body;

    const consultaAtualizada = await prisma.consulta.update({
      where: { 
        id,
        ubsId: req.user.id
      },
      data: {
        dataAgendada: new Date(dataAgendada),
        funcionarioId,
        observacoes,
        status: 'agendada'
      },
      include: {
        paciente: {
          select: { nome: true, email: true }
        },
        funcionario: {
          select: { nome: true, funcao: true }
        }
      }
    });

    res.json(consultaAtualizada);
  } catch (error) {
    console.error('Erro ao agendar consulta:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;