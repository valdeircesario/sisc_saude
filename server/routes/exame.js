import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import * as exameController from "../controllers/exameController.js";

const router = express.Router();

// ✅ SEGURANÇA: Download de arquivo de exame com autenticação e sanitização
// Requer token JWT válido e sanitiza o filename para prevenir path traversal
router.get(
	"/download/:filename",
	authenticateToken,
	authorizeRole(["laboratorio", "funcionario", "paciente"]),
	exameController.downloadExame,
);

export default router;
