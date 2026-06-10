import * as exameService from "../services/exameService.js";

export const downloadExame = (req, res) => {
  try {
    const { filename } = req.params;
    
    // O service agora é responsável apenas por montar e sanitizar o caminho do arquivo
    const filePath = exameService.obterCaminhoExame(filename);

    res.download(filePath, (err) => {
      if (err) {
        console.error("Erro ao fazer download:", err);
        // O Express lança um erro se o arquivo não existir
        if (!res.headersSent) {
          res.status(404).json({ message: "Arquivo não encontrado" });
        }
      }
    });
  } catch (error) {
    console.error("Erro no processamento do download:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};
