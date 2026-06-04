import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware para UBS
router.use(authenticateToken);
router.use(authorizeRole(['ubs']));

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

// Editar dados do paciente
router.put('/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { endereco, telefone } = req.body;

    const pacienteAtualizado = await prisma.paciente.update({
      where: { id },
      data: { endereco, telefone },
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
    console.error('Erro ao editar paciente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar funcionários da UBS
router.get('/funcionarios', async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      where: { ubsId: req.user.id },
      select: {
        id: true,
        nome: true,
        funcao: true,
        crm: true,
        cpf: true,
        telefone: true,
        email: true,
        createdAt: true
      }
    });
    res.json(funcionarios);
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cadastrar funcionário
router.post('/funcionarios', async (req, res) => {
  try {
    const { nome, funcao, crm, cpf, telefone, email, senha } = req.body;

    const funcExistente = await prisma.funcionario.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { cpf }
        ]
      }
    });

    if (funcExistente) {
      return res.status(400).json({ message: 'Funcionário já cadastrado com estes dados' });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const novoFunc = await prisma.funcionario.create({
      data: {
        nome,
        funcao,
        crm,
        cpf,
        telefone,
        email: email.toLowerCase(),
        senha: senhaHash,
        ubsId: req.user.id
      }
    });

    res.status(201).json({
      id: novoFunc.id,
      nome: novoFunc.nome,
      funcao: novoFunc.funcao,
      crm: novoFunc.crm,
      cpf: novoFunc.cpf,
      telefone: novoFunc.telefone,
      email: novoFunc.email
    });
  } catch (error) {
    console.error('Erro ao cadastrar funcionário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Editar funcionário
router.put('/funcionarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, funcao, crm, cpf, telefone, email, senha } = req.body;

    const dados = {
      nome,
      funcao,
      crm,
      cpf,
      telefone,
      email: email.toLowerCase()
    };

    if (senha) {
      dados.senha = await bcrypt.hash(senha, 12);
    }

    const funcAtualizado = await prisma.funcionario.update({
      where: { 
        id,
        ubsId: req.user.id // Só pode editar funcionários da própria UBS
      },
      data: dados
    });

    res.json({
      id: funcAtualizado.id,
      nome: funcAtualizado.nome,
      funcao: funcAtualizado.funcao,
      crm: funcAtualizado.crm,
      cpf: funcAtualizado.cpf,
      telefone: funcAtualizado.telefone,
      email: funcAtualizado.email
    });
  } catch (error) {
    console.error('Erro ao editar funcionário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar funcionário
router.delete('/funcionarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.funcionario.delete({
      where: { 
        id,
        ubsId: req.user.id
      }
    });

    res.json({ message: 'Funcionário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
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
            nome: true,
            cpf: true,
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
    console.error('Erro ao listar consultas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Agendar consulta
router.put('/consultas/:id/agendar', async (req, res) => {
  try {
    const { id } = req.params;
    const { dataAgendada, funcionarioId, observacoes } = req.body;

    // Verificar se a consulta pertence à UBS
    const consulta = await prisma.consulta.findFirst({
      where: { id, ubsId: req.user.id }
    });

    if (!consulta) {
      return res.status(404).json({ message: 'Consulta não encontrada' });
    }

    // Verificar se o funcionário pertence à UBS
    const funcionario = await prisma.funcionario.findFirst({
      where: { id: funcionarioId, ubsId: req.user.id }
    });

    if (!funcionario) {
      return res.status(400).json({ message: 'Funcionário não encontrado ou não pertence a esta UBS' });
    }

    const consultaAtualizada = await prisma.consulta.update({
      where: { id },
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

// NOVA FUNCIONALIDADE: Solicitar internação ao hospital
router.post('/solicitar-internacao', async (req, res) => {
  try {
    const { 
      pacienteId, 
      hospitalId, 
      funcionarioId, 
      tipo, 
      motivo, 
      detalhes, 
      laudoMedico, 
      prioridade 
    } = req.body;

    // Validações
    if (!pacienteId || !hospitalId || !funcionarioId || !tipo || !motivo || !detalhes || !laudoMedico) {
      return res.status(400).json({ 
        message: 'Todos os campos obrigatórios devem ser preenchidos' 
      });
    }

    // Verificar se o paciente existe
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: { id: true, nome: true, cpf: true, cns: true }
    });

    if (!paciente) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    // Verificar se o hospital existe
    const hospitais = await prisma.hospitais.findUnique({
      where: { id: hospitaisId },
      select: { id: true, nome: true, email: true }
    });

    if (!hospitais) {
      return res.status(404).json({ message: 'Hospital não encontrado' });
    }

    // Verificar se o funcionário pertence à UBS
    const funcionario = await prisma.funcionario.findFirst({
      where: { 
        id: funcionarioId, 
        ubsId: req.user.id 
      },
      select: { id: true, nome: true, funcao: true, crm: true }
    });

    if (!funcionario) {
      return res.status(400).json({ 
        message: 'Funcionário não encontrado ou não pertence a esta UBS' 
      });
    }

    // Obter dados da UBS
    const ubs = await prisma.uBS.findUnique({
      where: { id: req.user.id },
      select: { id: true, nome: true, email: true, telefone: true }
    });

    // Criar solicitação de internação
    const solicitacaoInternacao = await prisma.solicitacaoInternacao.create({
      data: {
        pacienteId,
        hospitalId,
        ubsId: req.user.id,
        funcionarioId,
        tipo,
        motivo,
        detalhes,
        laudoMedico,
        prioridade: prioridade || 'media',
        status: 'pendente',
        dataSolicitacao: new Date()
      },
      include: {
        paciente: {
          select: {
            nome: true,
            cpf: true,
            cns: true,
            nascimento: true,
            telefone: true,
            endereco: true
          }
        },
        hospital: {
          select: {
            nome: true,
            email: true
          }
        },
        ubs: {
          select: {
            nome: true,
            email: true,
            telefone: true
          }
        },
        funcionario: {
          select: {
            nome: true,
            funcao: true,
            crm: true
          }
        }
      }
    });

    // Log da solicitação
    console.log(`Nova solicitação de internação criada:`, {
      id: solicitacaoInternacao.id,
      paciente: paciente.nome,
      hospital: hospital.nome,
      ubs: ubs.nome,
      tipo,
      prioridade
    });

    res.status(201).json({
      message: 'Solicitação de internação enviada com sucesso',
      solicitacao: solicitacaoInternacao
    });

  } catch (error) {
    console.error('Erro ao solicitar internação:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Listar solicitações de internação da UBS
router.get('/solicitacoes-internacao', async (req, res) => {
  try {
    const { status } = req.query;

    const where = {
      ubsId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const solicitacoes = await prisma.solicitacaoInternacao.findMany({
      where,
      include: {
        paciente: {
          select: {
            nome: true,
            cpf: true,
            cns: true
          }
        },
        hospital: {
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
      },
      orderBy: [
        { prioridade: 'desc' },
        { dataSolicitacao: 'desc' }
      ]
    });

    res.json(solicitacoes);
  } catch (error) {
    console.error('Erro ao listar solicitações de internação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter detalhes de uma solicitação de internação
router.get('/solicitacoes-internacao/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const solicitacao = await prisma.solicitacaoInternacao.findFirst({
      where: { 
        id, 
        ubsId: req.user.id 
      },
      include: {
        paciente: {
          select: {
            nome: true,
            cpf: true,
            cns: true,
            nascimento: true,
            telefone: true,
            endereco: true,
            email: true
          }
        },
        hospital: {
          select: {
            nome: true,
            email: true,
            telefone: true,
            endereco: true
          }
        },
        ubs: {
          select: {
            nome: true,
            email: true,
            telefone: true
          }
        },
        funcionario: {
          select: {
            nome: true,
            funcao: true,
            crm: true,
            email: true
          }
        }
      }
    });

    if (!solicitacao) {
      return res.status(404).json({ message: 'Solicitação de internação não encontrada' });
    }

    res.json(solicitacao);
  } catch (error) {
    console.error('Erro ao obter solicitação de internação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cancelar solicitação de internação (apenas se estiver pendente)
router.put('/solicitacoes-internacao/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivoCancelamento } = req.body;

    const solicitacao = await prisma.solicitacaoInternacao.findFirst({
      where: { 
        id, 
        ubsId: req.user.id,
        status: 'pendente'
      }
    });

    if (!solicitacao) {
      return res.status(404).json({ 
        message: 'Solicitação não encontrada ou não pode ser cancelada' 
      });
    }

    const solicitacaoAtualizada = await prisma.solicitacaoInternacao.update({
      where: { id },
      data: {
        status: 'cancelada',
        motivoCancelamento,
        dataCancelamento: new Date()
      }
    });

    res.json({
      message: 'Solicitação de internação cancelada com sucesso',
      solicitacao: solicitacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao cancelar solicitação de internação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;

