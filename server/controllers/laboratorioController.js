import * as laboratorioService from "../services/laboratorioService.js";

const handleError = (res, error, customMessage = "Erro interno do servidor") => {
  if (error.status && error.data) {
    return res.status(error.status).json(error.data);
  }
  console.error(customMessage, error);
  return res.status(500).json({ message: customMessage, details: error.message });
};

export const listarSolicitacoes = async (req, res) => {
  try {
    const solicitacoes = await laboratorioService.listarSolicitacoes(req.user.id);
    res.json(solicitacoes);
  } catch (error) {
    handleError(res, error, 'Erro ao listar solicitações:');
  }
};

export const agendarExame = async (req, res) => {
  try {
    const { id } = req.params;
    const { dataAgendada } = req.body;
    const result = await laboratorioService.agendarExame(id, req.user.id, dataAgendada);
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Erro ao agendar exame:');
  }
};

export const registrarResultado = async (req, res) => {
  try {
    const { id } = req.params;
    const { resultado } = req.body;
    const arquivoPdf = req.file ? req.file.filename : null;
    
    const exame = await laboratorioService.registrarResultado(id, req.user.id, resultado, arquivoPdf);
    res.json(exame);
  } catch (error) {
    handleError(res, error, 'Erro ao registrar resultado:');
  }
};

export const listarExames = async (req, res) => {
  try {
    const exames = await laboratorioService.listarExames(req.user.id);
    res.json(exames);
  } catch (error) {
    handleError(res, error, 'Erro ao listar exames:');
  }
};
