import express from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Public: listar todos os medicamentos
router.get('/medicamentos', async (req, res) => {
  try {
    const medicamentos = await prisma.medicamento.findMany({
      select: {
        id: true,
        nome: true,
        descricao: true,
        lote: true,
        quantidade: true,
        observacoes: true,
        dataValidade: true,
        vencido: true,
        ubsId: true,
        ubs: {
          select: { nome: true }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(medicamentos);
  } catch (error) {
    console.error('Erro ao listar medicamentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Public: consultar medicamento pelo id
router.get('/medicamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const medicamento = await prisma.medicamento.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        descricao: true,
        lote: true,
        quantidade: true,
        observacoes: true,
        dataValidade: true,
        vencido: true,
        ubsId: true,
        ubs: {
          select: { nome: true }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    if (!medicamento) {
      return res.status(404).json({ message: 'Medicamento não encontrado' });
    }

    res.json(medicamento);
  } catch (error) {
    console.error('Erro ao consultar medicamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// UBS: cadastrar medicamento
router.post('/medicamentos', authenticateToken, authorizeRole(['ubs']), async (req, res) => {
  try {
    const { nome, descricao, observacoes, lote, quantidade, dataValidade } = req.body;
    const ubsId = req.user.id;

    if (!nome || !lote || quantidade === undefined || !dataValidade) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }

    const quantidadeInt = Number(quantidade);
    if (Number.isNaN(quantidadeInt) || quantidadeInt < 0) {
      return res.status(400).json({ message: 'Quantidade inválida' });
    }

    const validade = new Date(dataValidade);
    if (Number.isNaN(validade.getTime())) {
      return res.status(400).json({ message: 'Data de validade inválida' });
    }

    const medicamentoCriado = await prisma.medicamento.create({
      data: {
        nome,
        descricao: descricao ?? '',
        lote,
        quantidade: quantidadeInt,
        observacoes: observacoes ?? null,
        dataValidade: validade,
        vencido: validade < new Date(),
        ubsId
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        lote: true,
        quantidade: true,
        observacoes: true,
        dataValidade: true,
        vencido: true,
        ubsId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json(medicamentoCriado);
  } catch (error) {
    console.error('Erro ao cadastrar medicamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// UBS: atualizar medicamento (informações completas)
router.put('/medicamentos/:id', authenticateToken, authorizeRole(['ubs']), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, observacoes, lote, quantidade, dataValidade, vencido } = req.body;
    const ubsId = req.user.id;

    const medicamentoExistente = await prisma.medicamento.findUnique({ where: { id } });
    if (!medicamentoExistente) {
      return res.status(404).json({ message: 'Medicamento não encontrado' });
    }
    if (medicamentoExistente.ubsId !== ubsId) {
      return res.status(403).json({ message: 'Acesso negado a este medicamento' });
    }

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (observacoes !== undefined) updateData.observacoes = observacoes;
    if (lote !== undefined) updateData.lote = lote;
    if (quantidade !== undefined) {
      const quantidadeInt = Number(quantidade);
      if (Number.isNaN(quantidadeInt) || quantidadeInt < 0) {
        return res.status(400).json({ message: 'Quantidade inválida' });
      }
      updateData.quantidade = quantidadeInt;
    }
    if (dataValidade !== undefined) {
      const validade = new Date(dataValidade);
      if (Number.isNaN(validade.getTime())) {
        return res.status(400).json({ message: 'Data de validade inválida' });
      }
      updateData.dataValidade = validade;
      if (vencido === undefined) {
        updateData.vencido = validade < new Date();
      }
    }
    if (vencido !== undefined) updateData.vencido = Boolean(vencido);

    const medicamentoAtualizado = await prisma.medicamento.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        descricao: true,
        lote: true,
        quantidade: true,
        dataValidade: true,
        vencido: true,
        ubsId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(medicamentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar medicamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Funcionario: fornecer medicamento a paciente e ajustar apenas quantidade/descricao
router.patch('/medicamentos/:id/estoque', authenticateToken, authorizeRole(['funcionario']), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade, descricao, vencido, observacoes, dataValidade } = req.body;
    const ubsId = req.user.ubsId || req.user.id;

    const medicamentoExistente = await prisma.medicamento.findUnique({ where: { id } });
    if (!medicamentoExistente) {
      return res.status(404).json({ message: 'Medicamento não encontrado' });
    }
    if (medicamentoExistente.ubsId !== ubsId) {
      return res.status(403).json({ message: 'Acesso negado a este medicamento' });
    }

    const updateData = {};
    if (quantidade !== undefined) {
      const quantidadeInt = Number(quantidade);
      if (Number.isNaN(quantidadeInt) || quantidadeInt < 0) {
        return res.status(400).json({ message: 'Quantidade inválida' });
      }
      updateData.quantidade = quantidadeInt;
    }
    if (descricao !== undefined) updateData.descricao = descricao;
    if (observacoes !== undefined) updateData.observacoes = observacoes;
    if (dataValidade !== undefined) {
      const validade = new Date(dataValidade);
      if (Number.isNaN(validade.getTime())) {
        return res.status(400).json({ message: 'Data de validade inválida' });
      }
      updateData.dataValidade = validade;
    }
    if (vencido !== undefined) updateData.vencido = Boolean(vencido);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    const medicamentoAtualizado = await prisma.medicamento.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        descricao: true,
        lote: true,
        quantidade: true,
        dataValidade: true,
        vencido: true,
        ubsId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(medicamentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar estoque do medicamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Funcionario: marcar medicamento vencido
router.post('/medicamentos/:id/fornecer', authenticateToken, authorizeRole(['funcionario']), async (req, res) => {
  try {
    const { id } = req.params;
    const { pacienteId, quantidade, dataRetirada, observacoes, fornecidoPor } = req.body;
    const ubsId = req.user.ubsId;
    const funcionarioId = req.user.id;

    if (!pacienteId || quantidade === undefined) {
      return res.status(400).json({ message: 'Paciente e quantidade são obrigatórios' });
    }

    const quantidadeInt = Number(quantidade);
    if (Number.isNaN(quantidadeInt) || quantidadeInt <= 0) {
      return res.status(400).json({ message: 'Quantidade inválida' });
    }

    const medicamentoExistente = await prisma.medicamento.findUnique({ where: { id } });
    if (!medicamentoExistente) {
      return res.status(404).json({ message: 'Medicamento não encontrado' });
    }
    if (medicamentoExistente.ubsId !== ubsId) {
      return res.status(403).json({ message: 'Acesso negado a este medicamento' });
    }
    if (quantidadeInt > medicamentoExistente.quantidade) {
      return res.status(400).json({ message: 'Quantidade insuficiente em estoque' });
    }

    const retirada = dataRetirada ? new Date(dataRetirada) : new Date();
    if (Number.isNaN(retirada.getTime())) {
      return res.status(400).json({ message: 'Data de retirada inválida' });
    }

    const fornecimento = await prisma.$transaction([
      prisma.medicamento.update({
        where: { id },
        data: {
          quantidade: medicamentoExistente.quantidade - quantidadeInt
        }
      }),
      prisma.medicacaoPaciente.create({
        data: {
          medicamentoId: id,
          pacienteId,
          funcionarioId,
          ubsId,
          quantidade: quantidadeInt,
          dataRetirada: retirada,
          fornecidoPor: fornecidoPor || req.user.nome || 'Funcionário',
          observacoes: observacoes ?? null
        }
      })
    ]);

    res.status(201).json({
      medicamentoAtualizado: fornecimento[0],
      fornecimento: fornecimento[1]
    });
  } catch (error) {
    console.error('Erro ao fornecer medicamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.patch('/medicamentos/:id/vencido', authenticateToken, authorizeRole(['funcionario']), async (req, res) => {
  try {
    const { id } = req.params;
    const ubsId = req.user.ubsId || req.user.id;

    const medicamentoExistente = await prisma.medicamento.findUnique({ where: { id } });
    if (!medicamentoExistente) {
      return res.status(404).json({ message: 'Medicamento não encontrado' });
    }
    if (medicamentoExistente.ubsId !== ubsId) {
      return res.status(403).json({ message: 'Acesso negado a este medicamento' });
    }

    const medicamentoAtualizado = await prisma.medicamento.update({
      where: { id },
      data: { vencido: true },
      select: {
        id: true,
        nome: true,
        descricao: true,
        lote: true,
        quantidade: true,
        dataValidade: true,
        vencido: true,
        ubsId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(medicamentoAtualizado);
  } catch (error) {
    console.error('Erro ao marcar medicamento vencido:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
