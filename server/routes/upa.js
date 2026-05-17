import express from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// middleware: somente usuários do tipo 'upa' podem acessar
router.use(authenticateToken);
router.use(authorizeRole(['upa']));

// --- Triagem ---
router.post('/triagens', async (req, res) => {
  try {
    const { pacienteId, sintomas, sinais, prioridade, observacoes } = req.body;
    const triagem = await prisma.triagem.create({
      data: {
        upaId: req.user.id,
        pacienteId,
        sintomas,
        sinais,
        prioridade: prioridade || 'medio',
        status: 'em_andamento',
        observacoes
      }
    });
    res.status(201).json(triagem);
  } catch (error) {
    console.error('Erro ao criar triagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

router.get('/triagens', async (req, res) => {
  try {
    // por padrão retornamos apenas triagens em andamento para a área de triagem
    let triagens = await prisma.triagem.findMany({
      where: { upaId: req.user.id, status: 'em_andamento' },
      include: { paciente: { select: { id: true, nome: true, cpf: true, cns: true, nascimento: true } } },
      orderBy: { createdAt: 'desc' }
    });

    // ordenar por prioridade manualmente: alto > medio > baixo
    const prioridadeOrdem = { alto: 3, medio: 2, baixo: 1 };
    triagens = triagens.sort((a, b) => {
      const pa = prioridadeOrdem[a.prioridade] || 0;
      const pb = prioridadeOrdem[b.prioridade] || 0;
      if (pa !== pb) return pb - pa; // maior prioridade primeiro
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.json(triagens);
  } catch (error) {
    console.error('Erro ao listar triagens:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

// Listar pacientes (busca por nome, cpf, cns)
router.get('/pacientes', async (req, res) => {
  try {
    const { busca } = req.query;
    const where = busca ? {
      OR: [
        { nome: { contains: String(busca), mode: 'insensitive' } },
        { cpf: { contains: String(busca) } },
        { cns: { contains: String(busca) } },
        { email: { contains: String(busca), mode: 'insensitive' } }
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
        telefone: true,
        email: true,
        createdAt: true
      },
      orderBy: { nome: 'asc' }
    });

    res.json(pacientes);
  } catch (error) {
    console.error('Erro ao listar pacientes UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

// Retorna triagens que ainda não possuem atendimento (candidatos para criação de atendimento)
router.get('/atendimentos/candidates', async (req, res) => {
  try {
    const candidates = await prisma.triagem.findMany({
      where: {
        upaId: req.user.id,
        status: 'em_andamento',
        atendimentos: { none: {} }
      },
      include: { paciente: { select: { id: true, nome: true, cpf: true, cns: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(candidates);
  } catch (error) {
    console.error('Erro ao listar candidatos a atendimento:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

// --- Atendimentos ---
router.post('/atendimentos', async (req, res) => {
  try {
    const { pacienteId, triagemId, descricao, profissional, laudo, notas, status } = req.body;
    const atendimento = await prisma.atendimento.create({
      data: {
        upaId: req.user.id,
        pacienteId,
        triagemId: triagemId || null,
        descricao,
        profissional,
        laudo: laudo || null,
        notas: notas || null,
        status: status || 'pendente',
        dataAtendimento: new Date()
      }
    });
    res.status(201).json(atendimento);
  } catch (error) {
    console.error('Erro ao criar atendimento:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

router.get('/atendimentos', async (req, res) => {
  try {
    const atendimentos = await prisma.atendimento.findMany({
      where: { upaId: req.user.id },
      include: { paciente: { select: { id: true, nome: true } }, triagem: true },
      orderBy: { dataAtendimento: 'desc' }
    });
    res.json(atendimentos);
  } catch (error) {
    console.error('Erro ao listar atendimentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

// Atualizar atendimento (ex: status, descricao)
router.put('/atendimentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, profissional, status } = req.body;

    // fetch current atendimento to check status
    const atendimentoAtual = await prisma.atendimento.findUnique({ where: { id } });
    if (!atendimentoAtual) return res.status(404).json({ message: 'Atendimento não encontrado' });

    // uma vez finalizado ou marcado como ausente, não deve ser alterado
    if (['finalizado', 'ausente'].includes((atendimentoAtual.status || '').toLowerCase())) {
      return res.status(400).json({ message: 'Atendimento finalizado/ausente não pode ser alterado' });
    }

    const dados = {};
    if (descricao !== undefined) dados.descricao = descricao;
    if (profissional !== undefined) dados.profissional = profissional;
    if (status !== undefined) dados.status = status;

    const atendimentoAtualizado = await prisma.atendimento.update({
      where: { id },
      data: dados,
      include: { paciente: { select: { id: true, nome: true } }, triagem: true }
    });

    res.json(atendimentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar atendimento:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

// --- Medicações da UPA ---
router.post('/medicacoes', async (req, res) => {
  try {
    const { pacienteId, nomeMedicacao, dosagem, viaAdministracao, dataHoraAdministracao, administradorNome, observacoes, atendimentoId } = req.body;
    // se foi passado atendimentoId, validar que atendimento está em atendimento
    if (atendimentoId) {
      const at = await prisma.atendimento.findUnique({ where: { id: atendimentoId } });
      if (!at) return res.status(400).json({ message: 'Atendimento inválido' });
      if ((at.status || '').toLowerCase() !== 'em_atendimento') return res.status(400).json({ message: 'Não é possível registrar medicação a menos que o atendimento esteja em atendimento' });
    }
    const med = await prisma.upaMedicacao.create({
      data: {
        upaId: req.user.id,
        pacienteId,
        nomeMedicacao,
        dosagem,
        viaAdministracao,
        dataHoraAdministracao: dataHoraAdministracao ? new Date(dataHoraAdministracao) : new Date(),
        administradorNome: administradorNome || null,
        observacoes,
        atendimentoId: atendimentoId || null
      }
    });
    res.status(201).json(med);
  } catch (error) {
    console.error('Erro ao registrar medicação UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

router.get('/medicacoes', async (req, res) => {
  try {
    const meds = await prisma.upaMedicacao.findMany({
      where: { upaId: req.user.id },
      include: { paciente: { select: { id: true, nome: true } } },
      orderBy: { dataHoraAdministracao: 'desc' }
    });
    res.json(meds);
  } catch (error) {
    console.error('Erro ao listar medicações UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

// --- Solicitação de exames pela UPA ---
router.post('/solicitar-exame', async (req, res) => {
  try {
    const { pacienteId, laboratorioId, tipoExame, observacoes, atendimentoId } = req.body;
    if (atendimentoId) {
      const at = await prisma.atendimento.findUnique({ where: { id: atendimentoId } });
      if (!at) return res.status(400).json({ message: 'Atendimento inválido' });
      if ((at.status || '').toLowerCase() !== 'em_atendimento') return res.status(400).json({ message: 'Não é possível solicitar exame a menos que o atendimento esteja em atendimento' });
    }
    const solicitacao = await prisma.upaSolicitacaoExame.create({
      data: {
        upaId: req.user.id,
        pacienteId,
        laboratorioId: laboratorioId || null,
        tipoExame,
        observacoes,
        status: 'pendente',
        atendimentoId: atendimentoId || null
      }
    });
    res.status(201).json(solicitacao);
  } catch (error) {
    console.error('Erro ao solicitar exame UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

router.get('/solicitacoes-exame', async (req, res) => {
  try {
    const solicitacoes = await prisma.upaSolicitacaoExame.findMany({
      where: { upaId: req.user.id },
      include: { paciente: { select: { id: true, nome: true } }, laboratorio: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(solicitacoes);
  } catch (error) {
    console.error('Erro ao listar solicitações de exame UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

// --- Vacinas ---
router.post('/vacinas', async (req, res) => {
  try {
    const { pacienteId, nome, lote, dataApl, proximaDose, aplicadoPor, atendimentoId } = req.body;
    if (atendimentoId) {
      const at = await prisma.atendimento.findUnique({ where: { id: atendimentoId } });
      if (!at) return res.status(400).json({ message: 'Atendimento inválido' });
      if ((at.status || '').toLowerCase() !== 'em_atendimento') return res.status(400).json({ message: 'Não é possível registrar vacina a menos que o atendimento esteja em atendimento' });
    }
    const vacina = await prisma.upaVacina.create({
      data: {
        upaId: req.user.id,
        pacienteId,
        nome,
        lote,
        dataApl: new Date(dataApl),
        proximaDose: proximaDose ? new Date(proximaDose) : null,
        aplicadoPor: aplicadoPor || null,
        atendimentoId: atendimentoId || null
      }
    });
    res.status(201).json(vacina);
  } catch (error) {
    console.error('Erro ao registrar vacina UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

router.get('/vacinas', async (req, res) => {
  try {
    const vacinas = await prisma.upaVacina.findMany({
      where: { upaId: req.user.id },
      include: { paciente: { select: { id: true, nome: true } } },
      orderBy: { dataApl: 'desc' }
    });
    res.json(vacinas);
  } catch (error) {
    console.error('Erro ao listar vacinas UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

// --- Encaminhamentos para hospital ---
router.post('/encaminhamentos', async (req, res) => {
  try {
    const { pacienteId, hospitalId, motivo, observacoes, atendimentoId } = req.body;
    if (atendimentoId) {
      const at = await prisma.atendimento.findUnique({ where: { id: atendimentoId } });
      if (!at) return res.status(400).json({ message: 'Atendimento inválido' });
      if ((at.status || '').toLowerCase() !== 'em_atendimento') return res.status(400).json({ message: 'Não é possível criar encaminhamento a menos que o atendimento esteja em atendimento' });
    }
    const encaminhamento = await prisma.encaminhamento.create({
      data: {
        upaId: req.user.id,
        pacienteId,
        hospitalId,
        motivo,
        observacoes,
        status: 'pendente',
        atendimentoId: atendimentoId || null
      }
    });
    res.status(201).json(encaminhamento);
  } catch (error) {
    console.error('Erro ao criar encaminhamento UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

router.get('/encaminhamentos', async (req, res) => {
  try {
    const items = await prisma.encaminhamento.findMany({
      where: { upaId: req.user.id },
      include: { paciente: { select: { id: true, nome: true } }, hospital: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    console.error('Erro ao listar encaminhamentos UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor', details: error?.message });
  }
});

export default router;

// Endpoints adicionais: listar hospitais e laboratorios para seleção no modal
router.get('/hospitais', async (req, res) => {
  try {
    const hospitais = await prisma.hospital.findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } });
    res.json(hospitais);
  } catch (error) {
    console.error('Erro ao listar hospitais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/laboratorios', async (req, res) => {
  try {
    const labs = await prisma.laboratorio.findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } });
    res.json(labs);
  } catch (error) {
    console.error('Erro ao listar laboratorios:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar solicitação de exame (resultado / status)
router.put('/solicitacoes-exame/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resultado, arquivoPdf } = req.body;
  const dados = {};
    if (status !== undefined) dados.status = status;
    if (resultado !== undefined) dados.resultado = resultado;
    if (arquivoPdf !== undefined) dados.arquivoPdf = arquivoPdf;

    const updated = await prisma.upaSolicitacaoExame.update({ where: { id }, data: dados });
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar solicitação de exame:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});
