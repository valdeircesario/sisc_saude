import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import * as funcController from "../controllers/funcionarioController.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole(["funcionario"]));

// Criações Médicas
router.post("/historico-medico", funcController.registrarHistoricoMedico);
router.post("/vacinas", funcController.registrarVacina);
router.post("/receitas", funcController.registrarReceita);
router.post("/atestados", funcController.registrarAtestado);
router.post("/agendar-retorno", funcController.agendarRetorno);
router.post("/registrar-evolucao-retorno", funcController.registrarEvolucaoRetorno);
router.put("/retorno/:id", funcController.atualizarRetorno);
router.patch("/receitas/:id/assinatura", funcController.assinarReceita);
router.patch("/atestados/:id/assinatura", funcController.assinarAtestado);

// Consultas / Perfil
router.get("/ubs", funcController.obterUbs);
router.get("/me", funcController.obterMeuPerfil);
router.get("/receitas", funcController.listarMinhasReceitas);
router.get("/atestados", funcController.listarMeusAtestados);
router.get("/consultas", funcController.listarMinhasConsultas);
router.get("/exames", funcController.listarExamesRealizados);

// Solicitações
router.post("/solicitar-exame", funcController.solicitarExame);
router.post("/solicitacoes-internacao", funcController.solicitarInternacao);
router.get("/minhas-solicitacoes-internacao", funcController.listarMinhasSolicitacoesInternacao);
router.get("/minhas-solicitacoes", funcController.listarTodasMinhasSolicitacoes);
router.put("/solicitacoes-internacao/:id/observacoes", funcController.atualizarObservacoesSolicitacaoInternacao);

// Pacientes
router.get("/pacientes", funcController.buscarPacientes);
router.get("/pacientes/:id/historico", funcController.obterHistoricoMedicoPaciente);
router.get("/historico-paciente/cpf", funcController.buscarHistoricoCompletoCpf);

// Diversos
router.get("/laboratorios", funcController.listarLaboratorios);
router.get("/hospitais", funcController.listarHospitais);

// Módulo de Farmácia / Enfermaria
router.get("/medicamentos", funcController.middlewareCheckPermissaoMedicamento, funcController.listarMedicamentosUbs);
router.put("/medicamentos/:id", funcController.middlewareCheckPermissaoMedicamento, funcController.atualizarMedicamentoUbs);
router.post("/medicamentos/:id/administrar", funcController.middlewareCheckPermissaoMedicamento, funcController.administrarMedicamento);

// Dispensação de Receitas
router.get("/consultar-receita/:registro", funcController.middlewareCheckPermissaoReceita, funcController.consultarReceitaParaDispensar);
router.get("/validar-dispensacao/:receitaId", funcController.middlewareCheckPermissaoReceita, funcController.validarDispensacaoDaReceita);
router.post("/dispensar-receita", funcController.middlewareCheckPermissaoReceita, funcController.dispensarReceitaLegado);
router.post("/dispensar-medicamentos", funcController.middlewareCheckPermissaoReceita, funcController.dispensarMedicamentosEmMassa);

export default router;
