import express from "express";
import path from "path";
import { prisma } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ SEGURANÇA: Download de arquivo de exame com autenticação e sanitização
// Requer token JWT válido e sanitiza o filename para prevenir path traversal
router.get("/download/:filename", authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;

    // ✅ SEGURANÇA: Sanitizar o filename com path.basename para prevenir path traversal
    // Isso remove qualquer '../' ou '..\' da URL, impedindo acesso a arquivos fora da pasta de uploads
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "exames",
      sanitizedFilename,
    );

    res.download(filePath, (err) => {
      if (err) {
        console.error("Erro ao fazer download:", err);
        res.status(404).json({ message: "Arquivo não encontrado" });
      }
    });
  } catch (error) {
    console.error("Erro ao fazer download:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;
