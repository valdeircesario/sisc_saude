import * as campanhaService from '../services/campanhaService.js';

const handleError = (res, error, customMessage = "Erro interno do servidor") => {
  if (error.status && error.data) {
    return res.status(error.status).json(error.data);
  }
  console.error(customMessage, error);
  return res.status(500).json({ message: customMessage, details: error.message });
};

export const listarCampanhasAtivas = async (req, res) => {
  try {
    const campanhas = await campanhaService.listarCampanhasAtivas();
    res.json(campanhas);
  } catch (error) {
    handleError(res, error, 'Erro ao listar campanhas:');
  }
};

export const inscreverCampanha = async (req, res) => {
  try {
    const inscricao = await campanhaService.inscreverCampanha(req.params.id, req.body);
    res.status(201).json({
      message: 'Inscrição realizada com sucesso!',
      inscricao
    });
  } catch (error) {
    handleError(res, error, 'Erro ao inscrever na campanha:');
  }
};

export const obterDetalhesCampanha = async (req, res) => {
  try {
    const campanha = await campanhaService.obterDetalhesCampanha(req.params.id);
    res.json(campanha);
  } catch (error) {
    handleError(res, error, 'Erro ao obter campanha:');
  }
};