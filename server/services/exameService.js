import path from "path";

export const obterCaminhoExame = (filename) => {
  // ✅ SEGURANÇA: Sanitizar o filename com path.basename para prevenir path traversal
  // Isso remove qualquer '../' ou '..\' da URL, impedindo acesso a arquivos fora da pasta de uploads
  const sanitizedFilename = path.basename(filename);
  
  return path.join(
    process.cwd(),
    "uploads",
    "exames",
    sanitizedFilename
  );
};
