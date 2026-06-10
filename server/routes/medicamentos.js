import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import * as medicamentosController from "../controllers/medicamentosController.js";

const router = express.Router();

// Public: listar todos os medicamentos
router.get("/medicamentos", medicamentosController.listarMedicamentos);

// Public: consultar medicamento pelo id
router.get("/medicamentos/:id", medicamentosController.consultarMedicamento);

// UBS: cadastrar medicamento
router.post(
  "/medicamentos",
  authenticateToken,
  authorizeRole(["ubs"]),
  medicamentosController.cadastrarMedicamento
);

// UBS: atualizar medicamento (informações completas)
router.put(
  "/medicamentos/:id",
  authenticateToken,
  authorizeRole(["ubs"]),
  medicamentosController.atualizarMedicamento
);

// Funcionario: fornecer medicamento a paciente e ajustar apenas quantidade/descricao
router.patch(
  "/medicamentos/:id/estoque",
  authenticateToken,
  authorizeRole(["funcionario"]),
  medicamentosController.atualizarEstoque
);

// Funcionario: marcar medicamento vencido (na rota antiga o comentário dizia marcar medicamento vencido, mas a url e código eram de fornecer. Eu mantive a URL /fornecer conforme o original)
router.post(
  "/medicamentos/:id/fornecer",
  authenticateToken,
  authorizeRole(["funcionario"]),
  medicamentosController.fornecerMedicamento
);

// Funcionario: marcar medicamento vencido
router.patch(
  "/medicamentos/:id/vencido",
  authenticateToken,
  authorizeRole(["funcionario"]),
  medicamentosController.marcarVencido
);

export default router;