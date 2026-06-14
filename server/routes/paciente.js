import express from "express";
import { authorizePaciente } from "../middleware/auth.js";
import * as pacienteController from "../controllers/pacienteController.js";

const router = express.Router();

// Middleware para paciente
router.use(authorizePaciente);

// Obter dados do paciente
router.get("/perfil", pacienteController.obterPerfil);

// Atualizar dados do paciente
router.put("/perfil", pacienteController.atualizarPerfil);

// Obter histórico médico
router.get("/historico-medico", pacienteController.obterHistoricoMedico);

// Obter cartão de vacinas
router.get("/vacinas", pacienteController.obterVacinas);

// Obter exames
router.get("/exames", pacienteController.obterExames);

// Listar solicitações de exame do paciente
router.get("/solicitacoes-exame", pacienteController.listarSolicitacoesExame);

// Solicitar consulta
router.post("/solicitar-consulta", pacienteController.solicitarConsulta);

// Listar consultas do paciente
router.get("/consultas", pacienteController.listarConsultas);

// Confirmar consulta
router.put("/consultas/:id/confirmar", pacienteController.confirmarConsulta);

// Cancelar consulta
router.put("/consultas/:id/cancelar", pacienteController.cancelarConsulta);

// Listar UBS disponíveis
router.get("/ubs", pacienteController.listarUbs);

// ==================== FUNCIONALIDADES DE CAMPANHA ====================

// Listar campanhas em que o paciente está inscrito
router.get("/campanhas", pacienteController.listarCampanhasInscritas);

// Confirmar agendamento de campanha
router.put("/agendamentos-campanha/:id/confirmar", pacienteController.confirmarAgendamentoCampanha);

// Cancelar agendamento de campanha
router.put("/agendamentos-campanha/:id/cancelar", pacienteController.cancelarAgendamentoCampanha);

// ==================== FUNCIONALIDADES DE INTERNAÇÃO ====================

// Listar solicitações de internação do paciente
router.get("/solicitacoes-internacao", pacienteController.listarSolicitacoesInternacao);

// Obter detalhes de uma solicitação específica
router.get("/solicitacoes-internacao/:id", pacienteController.obterDetalhesSolicitacaoInternacao);

// Confirmar agendamento de internação
router.put("/solicitacoes-internacao/:id/confirmar-agendamento", pacienteController.confirmarAgendamentoInternacao);

// Listar internações do paciente
router.get("/internacoes", pacienteController.listarInternacoes);

// Obter detalhes de uma internação específica
router.get("/internacoes/:id", pacienteController.obterDetalhesInternacao);

// Listar procedimentos hospitalares do paciente
router.get("/procedimentos-hospitalares", pacienteController.listarProcedimentosHospitalares);

// Listar medicações administradas no hospital (As duas rotas antigas faziam a mesma coisa, mantemos as duas mapeadas)
router.get("/medicacoes-hospitalares", pacienteController.listarMedicacoesAdministradas);
router.get("/medicacoes-administradas", pacienteController.listarMedicacoesAdministradas);

// Listar medicações do paciente (farmácia/ubs)
router.get("/medicacoes-paciente", pacienteController.listarMedicacoesPaciente);

// Listar agendamentos hospitalares do paciente
router.get("/agendamentos-hospitalares", pacienteController.listarAgendamentosHospitalares);

// Confirmar agendamento hospitalar
router.put("/agendamentos-hospitalares/:id/confirmar", pacienteController.confirmarAgendamentoHospitalar);

// Obter histórico completo hospitalar do paciente
router.get("/historico-hospitalar", pacienteController.obterHistoricoHospitalar);

// Obter receitas e atestados do paciente
router.get("/receitas-atestados", pacienteController.obterReceitasEAtestados);

export default router;
