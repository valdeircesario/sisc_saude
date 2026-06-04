import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import * as hospitalController from '../controllers/hospitalController.js';

const router = express.Router();

// Middleware para hospital
router.use(authenticateToken);
router.use(authorizeRole(['hospital']));

// Pacientes
router.get('/pacientes', hospitalController.listarPacientes);
router.get('/pacientes/:id', hospitalController.obterPaciente);
router.get('/pacientes/:id/historico', hospitalController.obterHistoricoMedico);

// Solicitações de Internação
router.get('/solicitacoes-internacao', hospitalController.listarSolicitacoesInternacao);
router.get('/solicitacoes-internacao/:id', hospitalController.obterSolicitacaoInternacao);
router.put('/solicitacoes-internacao/:id/status', hospitalController.atualizarStatusSolicitacao);
router.put('/solicitacoes-internacao/:id/aceitar', hospitalController.aceitarSolicitacao);
router.put('/solicitacoes-internacao/:id/agendar', hospitalController.agendarInternacao);
router.put('/solicitacoes-internacao/:id/rejeitar', hospitalController.rejeitarSolicitacao);

// Internações
router.get('/internacoes', hospitalController.listarInternacoes);
router.post('/internacoes', hospitalController.criarInternacao);
router.get('/internacoes/:id', hospitalController.obterDetalhesInternacao);
router.put('/internacoes/:id/observacao', hospitalController.atualizarObservacoesInternacao);
router.post("/internacoes/:internacaoId/alta", hospitalController.registrarAltaHospitalar);

// Medicações da Internação
router.post("/internacoes/:internacaoId/medicacao", hospitalController.registrarMedicacaoInternacao);
router.get("/internacoes/:internacaoId/medicacoes", hospitalController.listarMedicacoesInternacao);

// Exames da Internação
router.post("/internacoes/:internacaoId/solicitar-exame", hospitalController.solicitarExameInternacao);
router.get("/internacoes/:internacaoId/solicitacoes-exame", hospitalController.listarSolicitacoesExameInternacao);
router.put("/solicitacoes-exame-internacao/:id/resultado", hospitalController.atualizarSolicitacaoExameInternacao);

// Outros
router.get('/laboratorios', hospitalController.listarLaboratorios);

export default router;
