import express from "express";
import { authenticateToken, authLimiter } from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// ✅ SEGURANÇA: Login para pacientes com rate limiting de força bruta
router.post("/login-paciente", authLimiter, authController.loginPaciente);

// ✅ SEGURANÇA: Login para sistema com rate limiting de força bruta
router.post("/login-sistema", authLimiter, authController.loginSistema);

// Registro de paciente
router.post("/register-paciente", authController.registerPaciente);

router.post("/solicitar-reset-senha", authLimiter, authController.solicitarResetSenha);
router.post("/redefinir-senha", authLimiter, authController.redefinirSenha);
router.post("/alterar-senha", authenticateToken, authController.alterarSenha);

export default router;