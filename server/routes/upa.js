import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import * as upaController from '../controllers/upaController.js';

const router = express.Router();

// Middleware: somente usuários do tipo 'upa' podem acessar
router.use(authenticateToken);
router.use(authorizeRole(['upa']));

// Triagem
router.post('/triagens', upaController.criarTriagem);
router.get('/triagens', upaController.listarTriagens);

// Pacientes
router.get('/pacientes', upaController.listarPacientes);

// Atendimentos
router.get('/atendimentos/candidates', upaController.listarCandidatosAtendimento);
router.post('/atendimentos', upaController.criarAtendimento);
router.get('/atendimentos', upaController.listarAtendimentos);
router.put('/atendimentos/:id', upaController.atualizarAtendimento);

// Medicações da UPA
router.post('/medicacoes', upaController.registrarMedicacao);
router.get('/medicacoes', upaController.listarMedicacoes);

// Solicitação de exames pela UPA
router.post('/solicitar-exame', upaController.solicitarExame);
router.get('/solicitacoes-exame', upaController.listarSolicitacoesExame);
router.put('/solicitacoes-exame/:id', upaController.atualizarSolicitacaoExame);

// Vacinas
router.post('/vacinas', upaController.registrarVacina);
router.get('/vacinas', upaController.listarVacinas);

// Encaminhamentos para hospital
router.post('/encaminhamentos', upaController.criarEncaminhamento);
router.get('/encaminhamentos', upaController.listarEncaminhamentos);

// Endpoints adicionais (Utilitários para selects/modais)
router.get('/hospitais', upaController.listarHospitais);
router.get('/laboratorios', upaController.listarLaboratorios);

export default router;
