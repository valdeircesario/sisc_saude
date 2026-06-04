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



// Criar campanha
router.post('/campanhas', async (req, res) => {
  try {
    const { titulo, descricao, tipo, dataIni, dataFim } = req.body;

    const novaCampanha = await prisma.campanha.create({
      data: {
        titulo,
        descricao,
        tipo,
        dataIni: new Date(dataIni),
        dataFim: dataFim ? new Date(dataFim) : null,
        ubsId: req.user.id
      }
    });

    res.status(201).json(novaCampanha);
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar campanhas da UBS
router.get('/campanhas', async (req, res) => {
  try {
    const campanhas = await prisma.campanha.findMany({
      where: { ubsId: req.user.id },
      include: {
        _count: {
          select: {
            inscricoes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campanhas);
  } catch (error) {
    console.error('Erro ao listar campanhas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Editar campanha
router.put('/campanhas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, tipo, dataIni, dataFim } = req.body;

    const campanhaAtualizada = await prisma.campanha.update({
      where: { 
        id,
        ubsId: req.user.id // Só pode editar campanhas da própria UBS
      },
      data: {
        titulo,
        descricao,
        tipo,
        dataIni: new Date(dataIni),
        dataFim: dataFim ? new Date(dataFim) : null
      }
    });

    res.json(campanhaAtualizada);
  } catch (error) {
    console.error('Erro ao editar campanha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar campanha
router.delete('/campanhas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se há inscrições na campanha
    const inscricoes = await prisma.inscricaoCampanha.count({
      where: { campanhaId: id }
    });

    if (inscricoes > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir campanha com inscrições' 
      });
    }

    await prisma.campanha.delete({
      where: { 
        id,
        ubsId: req.user.id // Só pode deletar campanhas da própria UBS
      }
    });

    res.json({ message: 'Campanha excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar campanha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar inscrições de uma campanha
router.get('/campanhas/:id/inscricoes', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a campanha pertence à UBS
    const campanha = await prisma.campanha.findFirst({
      where: { id, ubsId: req.user.id }
    });

    if (!campanha) {
      return res.status(404).json({ message: 'Campanha não encontrada' });
    }

    const inscricoes = await prisma.inscricaoCampanha.findMany({
      where: { campanhaId: id },
      orderBy: [
        { pontuacao: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    res.json(inscricoes);
  } catch (error) {
    console.error('Erro ao listar inscrições:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Agendar atendimento para inscrito na campanha
router.put('/campanhas/:campanhaId/inscricoes/:inscricaoId/agendar', async (req, res) => {
  try {
    const { campanhaId, inscricaoId } = req.params;
    const { dataAgendada, horaAgendada, localAtendimento, observacoes } = req.body;

    // Verificar se a campanha pertence à UBS
    const campanha = await prisma.campanha.findFirst({
      where: { id: campanhaId, ubsId: req.user.id }
    });

    if (!campanha) {
      return res.status(404).json({ message: 'Campanha não encontrada' });
    }

    const inscricaoAtualizada = await prisma.inscricaoCampanha.update({
      where: { id: inscricaoId },
      data: {
        dataAgendada: dataAgendada ? new Date(dataAgendada) : null,
        horaAgendada,
        localAtendimento,
        observacoes,
        tipoAgendamento: 'campanha',
        status: 'agendado'
      }
    });

    res.json(inscricaoAtualizada);
  } catch (error) {
    console.error('Erro ao agendar atendimento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});
// Listar solicitações de consulta
router.get('/consultas', async (req, res) => {
  try {
    const consultas = await prisma.consulta.findMany({
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
    res.json(consultas);
  } catch (error) {
    console.error('Erro ao listar consultas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Agendar consulta
router.put('/consultas/:id/agendar', async (req, res) => {
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