import express from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/exames/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'exame-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Middleware para laboratório
router.use(authenticateToken);
router.use(authorizeRole(['laboratorio']));

// Obter dados do hospital
    const hospital = await prisma.uBS.findUnique({
      where: { id: req.user.id },
      select: { id: true, nome: true, email: true, telefone: true }
    });

// Listar solicitações de exame
router.get('/solicitacoes', async (req, res) => {
  try {
    const solicitacoes = await prisma.solicitacaoExame.findMany({
      where: { laboratorioId: req.user.id },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            telefone: true,
            email: true,
            nascimento: true
          }
        },
        funcionario: {
          select: {
            nome: true,
            funcao: true,
            ubs: {
              select: {
                nome: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(solicitacoes);
  } catch (error) {
    console.error('Erro ao listar solicitações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Agendar exame
router.put('/solicitacoes/:id/agendar', async (req, res) => {
  try {
    const { id } = req.params;
    const { dataAgendada } = req.body;

    // Atualizar solicitação
    const solicitacaoAtualizada = await prisma.solicitacaoExame.update({
      where: { 
        id,
        laboratorioId: req.user.id
      },
      data: {
        status: 'agendado'
      }
    });

    // Criar registro de exame
    const novoExame = await prisma.exame.create({
      data: {
        pacienteId: solicitacaoAtualizada.pacienteId,
        laboratorioId: req.user.id,
        tipo: solicitacaoAtualizada.tipoExame,
        dataAgendada: new Date(dataAgendada),
        status: 'agendado'
      }
    });

    res.json({ solicitacao: solicitacaoAtualizada, exame: novoExame });
  } catch (error) {
    console.error('Erro ao agendar exame:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Registrar resultado do exame
router.put('/exames/:id/resultado', upload.single('arquivo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { resultado } = req.body;
    const arquivoPdf = req.file ? req.file.filename : null;

    const exameAtualizado = await prisma.exame.update({
      where: { 
        id,
        laboratorioId: req.user.id
      },
      data: {
        resultado,
        arquivoPdf,
        dataRealizado: new Date(),
        status: 'realizado'
      }
    });

    // Atualizar solicitação correspondente
    await prisma.solicitacaoExame.updateMany({
      where: {
        pacienteId: exameAtualizado.pacienteId,
        laboratorioId: req.user.id,
        tipoExame: exameAtualizado.tipo,
        status: 'agendado'
      },
      data: {
        status: 'realizado'
      }
    });

    res.json(exameAtualizado);
  } catch (error) {
    console.error('Erro ao registrar resultado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar exames do laboratório
router.get('/exames', async (req, res) => {
  try {
    const exames = await prisma.exame.findMany({
      where: { laboratorioId: req.user.id },
      include: {
        paciente: {
          select: {
            nome: true,
            cpf: true,
            telefone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(exames);
  } catch (error) {
    console.error('Erro ao listar exames:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;