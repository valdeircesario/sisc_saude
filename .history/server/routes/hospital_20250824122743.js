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
})

;



// Listar agendamentos hospitalares
router.get('/agendamentos', async (req, res) => {
  try {
    const agendamentos = await prisma.agendamentoHospitalar.findMany({
      where: { hospitalId: req.user.id },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            telefone: true,
            email: true
          }
        },
        medico: {
          select: {
            nome: true,
            funcao: true,
            crm: true
          }
        },
        solicitacaoInternacao: {
          select: {
            tipo: true,
            motivo: true
          }
        }
      },
      orderBy: { dataAgendamento: 'asc' }
    });
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar agendamento hospitalar
router.post('/agendamentos', async (req, res) => {
  try {
    const { pacienteId, medicoId, solicitacaoInternacaoId, dataAgendamento, horaAgendamento, tipo, observacoes } = req.body;

    const novoAgendamento = await prisma.agendamentoHospitalar.create({
      data: {
        pacienteId,
        hospitalId: req.user.id,
        medicoId,
        solicitacaoInternacaoId,
        dataAgendamento: new Date(dataAgendamento),
        horaAgendamento,
        tipo,
        observacoes,
        status: 'agendado'
      },
      include: {
        paciente: {
          select: { nome: true, email: true }
        },
        medico: {
          select: { nome: true, funcao: true }
        }
      }
    });

    res.status(201).json(novoAgendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar status do agendamento
router.put('/agendamentos/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacoes } = req.body;

    const agendamentoAtualizado = await prisma.agendamentoHospitalar.update({
      where: { 
        id,
        hospitalId: req.user.id
      },
      data: {
        status,
        observacoes
      }
    });

    res.json(agendamentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar procedimentos hospitalares


// Registrar procedimento hospitalar
router.post('/solicitar-internacao', async (req, res) => {
  try {
    const { solicitacaoInternacaoId, pacienteId, medicoRealizouId, tipo, descricao, laudoPos, instrucoes, dataRealizacao, observacoes } = req.body;

    const novoProcedimento = await prisma.procedimentoHospitalar.create({
      data: {
        solicitacaoInternacaoId,
        pacienteId,
        hospitalId: req.user.id,
        medicoRealizouId,
        tipo,
        descricao,
        laudoPos,
        instrucoes,
        dataRealizacao: new Date(dataRealizacao),
        observacoes,
        status: 'realizado'
      },
      include: {
        paciente: {
          select: { nome: true }
        },
        medicoRealizou: {
          select: { nome: true, funcao: true }
        }
      }
    });

    res.status(201).json(novoProcedimento);
  } catch (error) {
    console.error('Erro ao registrar procedimento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar internações
router.get('/internacoes', async (req, res) => {
  try {
    const internacoes = await prisma.internacao.findMany({
      where: { hospitalId: req.user.id },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            telefone: true
          }
        },
        medicoResponsavel: {
          select: {
            nome: true,
            funcao: true,
            crm: true
          }
        }
      },
      orderBy: { dataEntrada: 'desc' }
    });
    res.json(internacoes);
  } catch (error) {
    console.error('Erro ao listar internações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Registrar internação
router.post('/internacoes', async (req, res) => {
  try {
    const { pacienteId, medicoResponsavelId, dataEntrada, motivo, diagnostico, observacoes } = req.body;

    const novaInternacao = await prisma.internacao.create({
      data: {
        pacienteId,
        hospitalId: req.user.id,
        medicoResponsavelId,
        dataEntrada: new Date(dataEntrada),
        motivo,
        diagnostico,
        observacoes
      },
      include: {
        paciente: {
          select: { nome: true }
        },
        medicoResponsavel: {
          select: { nome: true, funcao: true }
        }
      }
    });

    res.status(201).json(novaInternacao);
  } catch (error) {
    console.error('Erro ao registrar internação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Dar alta na internação
router.put('/internacoes/:id/alta', async (req, res) => {
  try {
    const { id } = req.params;
    const { dataSaida, diagnostico, observacoes } = req.body;

    const internacaoAtualizada = await prisma.internacao.update({
      where: { 
        id,
        hospitalId: req.user.id
      },
      data: {
        dataSaida: new Date(dataSaida),
        diagnostico,
        observacoes
      }
    });

    res.json(internacaoAtualizada);
  } catch (error) {
    console.error('Erro ao dar alta:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar solicitações de exames do hospital
router.get('/solicitacoes-exames', async (req, res) => {
  try {
    const solicitacoes = await prisma.solicitacaoExameHospital.findMany({
      where: { hospitalId: req.user.id },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            telefone: true
          }
        },
        laboratorio: {
          select: {
            nome: true,
            telefone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(solicitacoes);
  } catch (error) {
    console.error('Erro ao listar solicitações de exames:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Solicitar exame para laboratório
router.post('/solicitacoes-exames', async (req, res) => {
  try {
    const { laboratorioId, pacienteId, tipoExame, observacoes } = req.body;

    const novaSolicitacao = await prisma.solicitacaoExameHospital.create({
      data: {
        hospitalId: req.user.id,
        laboratorioId,
        pacienteId,
        tipoExame,
        observacoes,
        status: 'pendente'
      },
      include: {
        paciente: {
          select: { nome: true, email: true }
        },
        laboratorio: {
          select: { nome: true }
        }
      }
    });

    res.status(201).json(novaSolicitacao);
  } catch (error) {
    console.error('Erro ao solicitar exame:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar medicações administradas
router.get('/medicacoes', async (req, res) => {
  try {
    const { pacienteId } = req.query;
    
    const where = pacienteId ? { pacienteId } : {};

    const medicacoes = await prisma.medicacaoAdministrada.findMany({
      where,
      include: {
        paciente: {
          select: {
            nome: true,
            cpf: true
          }
        }
      },
      orderBy: { dataHoraAdministracao: 'desc' }
    });

    res.json(medicacoes);
  } catch (error) {
    console.error('Erro ao listar medicações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Registrar medicação administrada
router.post('/medicacoes', async (req, res) => {
  try {
    const { pacienteId, internacaoId, procedimentoHospitalarId, nomeMedicacao, dosagem, viaAdministracao, dataHoraAdministracao, administradorId, observacoes } = req.body;

    const novaMedicacao = await prisma.medicacaoAdministrada.create({
      data: {
        pacienteId,
        internacaoId,
        procedimentoHospitalarId,
        nomeMedicacao,
        dosagem,
        viaAdministracao,
        dataHoraAdministracao: new Date(dataHoraAdministracao),
        administradorId,
        observacoes
      },
      include: {
        paciente: {
          select: { nome: true }
        }
      }
    });

    res.status(201).json(novaMedicacao);
  } catch (error) {
    console.error('Erro ao registrar medicação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;

