import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import * as farmaciaController from "../controllers/farmaciaController.js";

const router = express.Router();

// Protege todas as rotas para farmácia
router.use(authenticateToken);
router.use(authorizeRole(["farmacia"]));

// --- Rotas de Farmácia refatoradas com Controller ---

// Buscar receita por registroAssinatura
router.get("/receita/:registro", farmaciaController.buscarReceita);

// Registrar dispensação de receita (legado - um medicamento por vez)
router.post("/dispensar", farmaciaController.dispensarReceita);

// Dispensar múltiplos medicamentos de uma receita
router.post("/dispensar-medicamentos", farmaciaController.dispensarMedicamentos);

// Atualizar dispensação parcial
router.put("/dispensacoes/:dispensacaoId", farmaciaController.atualizarDispensacao);

// Deletar dispensação
router.delete("/dispensacoes/:dispensacaoId", farmaciaController.deletarDispensacao);

// Listar todas as dispensações agrupadas por receita
router.get("/dispensacoes/listar/todas", farmaciaController.listarTodas);

// Obter estatísticas do dashboard
router.get("/dashboard/estatisticas", farmaciaController.obterEstatisticas);

export default router;
