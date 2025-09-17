// routes/shared.js
import express from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Hospitais - acessível por UBS e funcionários para formulários
router.get('/hospitais', authorizeRole(['ubs', 'funcionario']), async (req, res) => {
  try {
    const hospitaisList = await prisma.hospital.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
      },
      orderBy: { nome: 'asc' }
    });
    res.json(hospitaisList);
  } catch (error) {
    console.error('Erro ao listar hospitais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;