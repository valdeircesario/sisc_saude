import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { receitasAtestadoController } from "../controllers/receitasAtestadoController.js";

const router = express.Router();

// Middleware
router.use(authenticateToken);

// GET receitas do funcionário autenticado
router.get("/receitas", authorizeRole(["funcionario"]), receitasAtestadoController.getReceitas);

// GET atestados do funcionário autenticado
router.get("/atestados", authorizeRole(["funcionario"]), receitasAtestadoController.getAtestados);

// PATCH assinar receita
router.patch(
  "/receitas/:id/assinatura",
  authorizeRole(["funcionario"]),
  receitasAtestadoController.assinarReceita
);

// PATCH assinar atestado
router.patch(
  "/atestados/:id/assinatura",
  authorizeRole(["funcionario"]),
  receitasAtestadoController.assinarAtestado
);

// GET receita específica por ID
router.get(
  "/receitas/:id",
  authorizeRole(["funcionario"]),
  receitasAtestadoController.getReceitaById
);

// GET atestado específico por ID
router.get(
  "/atestados/:id",
  authorizeRole(["funcionario"]),
  receitasAtestadoController.getAtestadoById
);

export default router;
