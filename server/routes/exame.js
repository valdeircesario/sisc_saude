import express from 'express';
import path from 'path';
import { prisma } from '../config/database.js';

const router = express.Router();

// Download de arquivo de exame
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'exames', filename);
    
    res.download(filePath, (err) => {
      if (err) {
        console.error('Erro ao fazer download:', err);
        res.status(404).json({ message: 'Arquivo não encontrado' });
      }
    });
  } catch (error) {
    console.error('Erro ao fazer download:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;