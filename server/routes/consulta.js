import express from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware de autenticação
router.use(authenticateToken);

// Estatísticas gerais (para dashboards)
router.get('/estatisticas', async (req, res) => {
  try {
    const stats = await prisma.consulta.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;