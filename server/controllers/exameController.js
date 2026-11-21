import * as exameService from "../services/exameService.js";

export const downloadExame = async (req, res) => {
  try {
    const { filename } = req.params;

    const filePath = await exameService.obterExameParaDownload(
      filename,
      req.user,
    );

    res.download(filePath, (err) => {
      if (err) {
        console.error("Erro ao fazer download:", err);
        if (!res.headersSent) {
          res.status(404).json({ message: "Arquivo não encontrado" });
        }
      }
    });
  } catch (error) {
    console.error("Erro no processamento do download:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Erro interno do servidor" });
  }
};
