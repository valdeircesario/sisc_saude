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
      include: {
    funcionario: { select: { crm: true } }
  },
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

// ==================== FUNCIONALIDADES DE INTERNAÇÃO ====================

// Listar solicitações de internação do paciente
router.get('/solicitacoes-internacao/:id', async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = { pacienteId: req.user.id };
    if (status) where.status = status;

    const solicitacoes = await prisma.solicitacaoInternacao.findMany({
      where,
      include: {
        hospital: {
          select: {
            nome: true,
            endereco: true,
            telefone: true
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
            endereco: true,
            telefone: true
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

// Obter detalhes de uma solicitação específica
router.get('/solicitacoes-internacao/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const solicitacao = await prisma.solicitacaoInternacao.findUnique({
      where: { 
        id,
        pacienteId: req.user.id
      },
      include: {
        hospital: {
          select: {
            nome: true,
            endereco: true,
            telefone: true,
            email: true
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
            endereco: true,
            telefone: true
          }
        },
        procedimentos: {
          include: {
            medicoRealizou: {
              select: {
                nome: true,
                funcao: true,
                crm: true
              }
            }
          },
          orderBy: { dataRealizacao: 'desc' }
        },
        agendamento: {
          include: {
            medico: {
              select: {
                nome: true,
                funcao: true,
                crm: true
              }
            }
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

// Confirmar agendamento de internação
router.put('/solicitacoes-internacao/:id/confirmar-agendamento', async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    // Verificar se a solicitação existe e pertence ao paciente
    const solicitacao = await prisma.solicitacaoInternacao.findUnique({
      where: { id, pacienteId: req.user.id }
    });

    if (!solicitacao) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }

    // Atualizar status e observações
    const solicitacaoAtualizada = await prisma.solicitacaoInternacao.update({
      where: { id },
      data: {
        status: 'confirmado',
        observacoes: observacoes
          ? `${solicitacao.observacoes || ''}\n[PACIENTE CONFIRMOU]: ${observacoes}`
          : solicitacao.observacoes
      },
      include: {
        hospital: {
          select: { nome: true }
        }
      }
    });

    res.json({
      message: 'Agendamento confirmado com sucesso',
      solicitacao: solicitacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar internações do paciente
router.get('/internacoes/:id', async (req, res) => {
  try {
    const internacoes = await prisma.internacao.findMany({
      where: { pacienteId: req.user.id },
      include: {
        hospital: {
          select: {
            nome: true,
            endereco: true,
            telefone: true
          }
        },
        medicoResponsavel: {
          select: {
            nome: true,
            funcao: true,
            crm: true
          }
        },
        medicacoesAdministradas: {
          include: {
            administrador: {
              select: {
                nome: true,
                funcao: true
              }
            }
          },
          orderBy: { dataHoraAdministracao: 'desc' }
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

// Obter detalhes de uma internação específica
router.get('/internacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const internacao = await prisma.internacao.findUnique({
      where: { 
        id,
        pacienteId: req.user.id
      },
      include: {
        hospital: {
          select: {
            nome: true,
            endereco: true,
            telefone: true,
            email: true
          }
        },
        medicoResponsavel: {
          select: {
            nome: true,
            funcao: true,
            crm: true
          }
        },
        medicacoesAdministradas: {
          include: {
            administrador: {
              select: {
                nome: true,
                funcao: true
              }
            }
          },
          orderBy: { dataHoraAdministracao: 'desc' }
        }
      }
    });

    if (!internacao) {
      return res.status(404).json({ message: 'Internação não encontrada' });
    }

    res.json(internacao);
  } catch (error) {
    console.error('Erro ao obter internação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar procedimentos hospitalares do paciente
router.get('/procedimentos-hospitalares', async (req, res) => {
  try {
    const procedimentos = await prisma.procedimentoHospitalar.findMany({
      where: { pacienteId: req.user.id },
      include: {
        hospital: {
          select: {
            nome: true
          }
        },
        medicoRealizou: {
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
        },
        examesRelacionados: {
          include: {
            laboratorio: {
              select: {
                nome: true
              }
            }
          }
        },
        medicacoesAdministradas: {
          include: {
            administrador: {
              select: {
                nome: true,
                funcao: true
              }
            }
          }
        }
      },
      orderBy: { dataRealizacao: 'desc' }
    });

    res.json(procedimentos);
  } catch (error) {
    console.error('Erro ao listar procedimentos hospitalares:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar medicações administradas no hospital
router.get('/medicacoes-hospitalares', async (req, res) => {
  try {
    const { internacaoId, procedimentoId } = req.query;
    
    const where = { pacienteId: req.user.id };
    if (internacaoId) where.internacaoId = internacaoId;
    if (procedimentoId) where.procedimentoHospitalarId = procedimentoId;

    const medicacoes = await prisma.medicacaoAdministrada.findMany({
      where,
      include: {
        administrador: {
          select: {
            nome: true,
            funcao: true
          }
        },
        internacao: {
          select: {
            hospital: {
              select: {
                nome: true
              }
            }
          }
        },
        procedimentoHospitalar: {
          select: {
            tipo: true,
            descricao: true,
            hospital: {
              select: {
                nome: true
              }
            }
          }
        }
      },
      orderBy: { dataHoraAdministracao: 'desc' }
    });

    res.json(medicacoes);
  } catch (error) {
    console.error('Erro ao listar medicações hospitalares:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar agendamentos hospitalares do paciente
router.get('/agendamentos-hospitalares', async (req, res) => {
  try {
    const agendamentos = await prisma.agendamentoHospitalar.findMany({
      where: { pacienteId: req.user.id },
      include: {
        hospital: {
          select: {
            nome: true,
            endereco: true,
            telefone: true
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
            motivo: true,
            prioridade: true
          }
        }
      },
      orderBy: { dataAgendamento: 'asc' }
    });

    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos hospitalares:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Confirmar agendamento hospitalar
router.put('/agendamentos-hospitalares/:id/confirmar', async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    const agendamento = await prisma.agendamentoHospitalar.findUnique({
      where: { 
        id,
        pacienteId: req.user.id,
        status: 'agendado'
      }
    });

    if (!agendamento) {
      return res.status(404).json({ 
        message: 'Agendamento não encontrado ou não pode ser confirmado' 
      });
    }

    const agendamentoAtualizado = await prisma.agendamentoHospitalar.update({
      where: { id },
      data: {
        observacoes: observacoes ? `${agendamento.observacoes || ''}\n[PACIENTE CONFIRMOU]: ${observacoes}` : agendamento.observacoes
      },
      include: {
        hospital: {
          select: { nome: true }
        }
      }
    });

    res.json({
      message: 'Agendamento confirmado com sucesso',
      agendamento: agendamentoAtualizado
    });
  } catch (error) {
    console.error('Erro ao confirmar agendamento hospitalar:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter histórico completo hospitalar do paciente
router.get('/historico-hospitalar', async (req, res) => {
  try {
    // Buscar todas as informações relacionadas ao hospital
    const [solicitacoes, internacoes, procedimentos, medicacoes, agendamentos] = await Promise.all([
      // Solicitações de internação
      prisma.solicitacaoInternacao.findMany({
        where: { pacienteId: req.user.id },
        include: {
          hospital: { select: { nome: true } },
          funcionario: { select: { nome: true, funcao: true } },
          ubs: { select: { nome: true } }
        }
      }),
      
      // Internações
      prisma.internacao.findMany({
        where: { pacienteId: req.user.id },
        include: {
          hospital: { select: { nome: true } },
          medicoResponsavel: { select: { nome: true, funcao: true } }
        }
      }),
      
      // Procedimentos
      prisma.procedimentoHospitalar.findMany({
        where: { pacienteId: req.user.id },
        include: {
          hospital: { select: { nome: true } },
          medicoRealizou: { select: { nome: true, funcao: true } }
        }
      }),
      
      // Medicações
      prisma.medicacaoAdministrada.findMany({
        where: { 
          pacienteId: req.user.id,
          OR: [
            { internacaoId: { not: null } },
            { procedimentoHospitalarId: { not: null } }
          ]
        },
        include: {
          administrador: { select: { nome: true, funcao: true } },
          internacao: { 
            select: { 
              hospital: { select: { nome: true } } 
            } 
          },
          procedimentoHospitalar: { 
            select: { 
              hospital: { select: { nome: true } } 
            } 
          }
        }
      }),
      
      // Agendamentos
      prisma.agendamentoHospitalar.findMany({
        where: { pacienteId: req.user.id },
        include: {
          hospital: { select: { nome: true } },
          medico: { select: { nome: true, funcao: true } }
        }
      })
    ]);

    // Organizar cronologicamente
    const historico = [
      ...solicitacoes.map(item => ({ ...item, tipo: 'solicitacao', data: item.createdAt })),
      ...internacoes.map(item => ({ ...item, tipo: 'internacao', data: item.dataEntrada })),
      ...procedimentos.map(item => ({ ...item, tipo: 'procedimento', data: item.dataRealizacao })),
      ...medicacoes.map(item => ({ ...item, tipo: 'medicacao', data: item.dataHoraAdministracao })),
      ...agendamentos.map(item => ({ ...item, tipo: 'agendamento', data: item.dataAgendamento }))
    ].sort((a, b) => new Date(b.data) - new Date(a.data));

    res.json({
      historico,
      resumo: {
        totalSolicitacoes: solicitacoes.length,
        totalInternacoes: internacoes.length,
        totalProcedimentos: procedimentos.length,
        totalMedicacoes: medicacoes.length,
        totalAgendamentos: agendamentos.length
      }
    });
  } catch (error) {
    console.error('Erro ao obter histórico hospitalar:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;

