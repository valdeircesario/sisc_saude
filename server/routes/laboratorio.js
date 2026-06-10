import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import * as laboratorioController from '../controllers/laboratorioController.js';

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

// Listar solicitações de exame
router.get('/solicitacoes', laboratorioController.listarSolicitacoes);

// Agendar exame
router.put('/solicitacoes/:id/agendar', laboratorioController.agendarExame);

// Registrar resultado do exame
router.put('/exames/:id/resultado', upload.single('arquivo'), laboratorioController.registrarResultado);

// Listar exames do laboratório
router.get('/exames', laboratorioController.listarExames);

export default router;
