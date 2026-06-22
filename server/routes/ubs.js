import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import * as ubsController from "../controllers/ubsController.js";

const router = express.Router();

// Middleware para UBS
router.use(authenticateToken);
router.use(authorizeRole(["ubs", "funcionario"]));

// Hospitais
router.get("/hospitais", ubsController.listarHospitais);
router.get("/hospitais/:id", ubsController.obterHospital);

// Medicamentos
router.get("/medicamentos", ubsController.listarMedicamentos);

// Pacientes
router.get("/pacientes", ubsController.listarPacientes);
router.get("/pacientes/:id", ubsController.obterPaciente);
router.put("/pacientes/:id", ubsController.editarPaciente);
router.get("/pacientes/:id/historico", ubsController.obterHistoricoMedico);
router.get("/pacientes/:id/consultas", ubsController.obterConsultasPaciente);
router.post("/pacientes/:id/agendar-consulta", ubsController.agendarConsultaPaciente);

// Funcionários
router.get("/funcionarios", ubsController.listarFuncionarios);
router.post("/funcionarios", ubsController.cadastrarFuncionario);
router.put("/funcionarios/:id", ubsController.editarFuncionario);
router.delete("/funcionarios/:id", ubsController.deletarFuncionario);

// Campanhas
router.post("/campanhas", ubsController.criarCampanha);
router.get("/campanhas", ubsController.listarCampanhas);
router.put("/campanhas/:id", ubsController.editarCampanha);
router.delete("/campanhas/:id", ubsController.deletarCampanha);
router.get("/campanhas/:id/inscricoes", ubsController.listarInscricoesCampanha);
router.get("/agendamentos-campanha", ubsController.listarAgendamentosCampanha);
router.put("/campanhas/:campanhaId/inscricoes/:inscricaoId/agendar", ubsController.agendarInscricaoCampanha);
router.put("/agendamentos-campanha/:id/cancelar", ubsController.cancelarAgendamentoCampanha);
router.put("/agendamentos-campanha/:id/realizar", ubsController.realizarAgendamentoCampanha);

// Consultas da UBS
router.get("/consultas", ubsController.listarConsultas);
router.put("/consultas/:id/agendar", ubsController.agendarConsulta);
router.put("/consultas/:id/cancelamento", ubsController.cancelarConsulta);

// Internação
router.post("/solicitar-internacao", ubsController.solicitarInternacao);
router.get("/solicitacoes-internacao", ubsController.listarSolicitacoesInternacao);
router.get("/solicitacoes-internacao/:id", ubsController.obterSolicitacaoInternacao);
router.put("/solicitacoes-internacao/:id/cancelar", ubsController.cancelarSolicitacaoInternacao);

export default router;
