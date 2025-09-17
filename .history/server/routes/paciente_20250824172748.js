import express from 'express';
import { prisma } from '../config/database.js';
import { authorizePaciente } from '../middleware/auth.js';

const router = express.Router();

// Middleware para paciente
router.use(authorizePaciente);

// Obter dados do paciente
router.get('/perfil', async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({
      where: { id: req.user.id },
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

    res.json(paciente);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar dados do paciente
router.put('/perfil', async (req, res) => {
  try {
    const { endereco, telefone, email } = req.body;

    const pacienteAtualizado = await prisma.paciente.update({
      where: { id: req.user.id },
      data: { endereco, telefone, email },
      select: {
        id: true,
        nome: true,
        cpf: true,
        cns: true,
        endereco: true,
        cep: true,
        nascimento: true,
        telefone: true,
        email: true
      }
    });

    res.json(pacienteAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter histórico médico
router.get('/historico-medico', async (req, res) => {
  try {
    const historico = await prisma.historicoMedico.findMany({
      where: { pacienteId: req.user.id },
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

// Obter cartão de vacinas
router.get('/vacinas', async (req, res) => {
  try {
    const vacinas = await prisma.vacina.findMany({
      where: { pacienteId: req.user.id },
      orderBy: { dataApl: 'desc' }
    });

    res.json(vacinas);
  } catch (error) {
    console.error('Erro ao obter vacinas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter exames
router.get('/exames', async (req, res) => {
  try {
    const exames = await prisma.exame.findMany({
      where: { pacienteId: req.user.id },
      include: {
        laboratorio: {
          select: {
            nome: true,
            telefone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(exames);
  } catch (error) {
    console.error('Erro ao obter exames:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Solicitar consulta
router.post('/solicitar-consulta', async (req, res) => {
  try {
    const { ubsId, motivo, especialidade } = req.body;

    const novaConsulta = await prisma.consulta.create({
      data: {
        pacienteId: req.user.id,
        ubsId,
        motivo,
        especialidade,
        status: 'solicitada'
      }
    });

    res.status(201).json(novaConsulta);
  } catch (error) {
    console.error('Erro ao solicitar consulta:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar consultas do paciente
router.get('/consultas', async (req, res) => {
  try {
    const consultas = await prisma.consulta.findMany({
      where: { pacienteId: req.user.id },
      include: {
        ubs: {
          select: {
            nome: true,
            endereco: true,
            telefone: true
          }
        },
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
    console.error('Erro ao obter consultas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Confirmar consulta
router.put('/consultas/:id/confirmar', async (req, res) => {
  try {
    const { id } = req.params;

    const consultaAtualizada = await prisma.consulta.update({
      where: { 
        id,
        pacienteId: req.user.id
      },
      data: {
        status: 'confirmada'
      }
    });

    res.json(consultaAtualizada);
  } catch (error) {
    console.error('Erro ao confirmar consulta:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar UBS disponíveis
router.get('/ubs', async (req, res) => {
  try {
    const ubsList = await prisma.uBS.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true
      }
    });

    res.json(ubsList);
  } catch (error) {
    console.error('Erro ao listar UBS:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;