import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { prisma } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const examesUploadDir = path.join(__dirname, "..", "uploads", "exames");

const erroDownload = (status, message) => ({ status, message });

export const obterCaminhoExame = (filename) => {
  // ✅ SEGURANÇA: Sanitizar o filename com path.basename para prevenir path traversal
  // Isso remove qualquer '../' ou '..\' da URL, impedindo acesso a arquivos fora da pasta de uploads
  const sanitizedFilename = path.basename(filename);

  const caminhoAtual = path.join(examesUploadDir, sanitizedFilename);
  if (fs.existsSync(caminhoAtual)) {
    return caminhoAtual;
  }

  // Compatibilidade com uploads criados quando o destino ainda era relativo ao cwd.
  return path.join(process.cwd(), "uploads", "exames", sanitizedFilename);
};

export const obterExameParaDownload = async (filename, usuario) => {
  const sanitizedFilename = path.basename(filename);
  const exame = await prisma.exame.findFirst({
    where: { arquivoPdf: sanitizedFilename },
  });

  if (!exame) {
    throw erroDownload(404, "Laudo não encontrado");
  }

  let autorizado = false;
  if (usuario.tipo === "laboratorio") {
    autorizado = exame.laboratorioId === usuario.id;
  } else if (usuario.tipo === "paciente") {
    autorizado = exame.pacienteId === usuario.id;
  } else if (usuario.tipo === "funcionario") {
    autorizado = true;
  }

  if (!autorizado) {
    throw erroDownload(403, "Você não tem permissão para baixar este laudo");
  }

  const filePath = obterCaminhoExame(sanitizedFilename);
  if (!fs.existsSync(filePath)) {
    throw erroDownload(404, "Arquivo do laudo não encontrado");
  }

  return filePath;
};
