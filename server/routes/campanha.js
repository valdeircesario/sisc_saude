import express from 'express';
import * as campanhaController from '../controllers/campanhaController.js';

const router = express.Router();

// Listar campanhas ativas (público)
router.get('/ativas', campanhaController.listarCampanhasAtivas);

// Inscrever-se em uma campanha (público)
router.post('/:id/inscrever', campanhaController.inscreverCampanha);

// Obter detalhes de uma campanha específica (público)
router.get('/:id', campanhaController.obterDetalhesCampanha);

export default router;