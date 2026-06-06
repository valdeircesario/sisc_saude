import * as farmaciaService from "../services/farmaciaService.js";

// Função auxiliar para padronizar o envio de erros do Service para o Express
const handleError = (res, error) => {
  // Se o erro possuir status e data (lançado propositalmente no service)
  if (error.status && error.data) {
    return res.status(error.status).json(error.data);
  }
  // Erro não previsto (ex: banco de dados fora do ar, syntax error)
  console.error("Erro interno:", error);
  return res.status(500).json({ 
    message: "Erro interno do servidor", 
    details: error.message 
  });
};

export const buscarReceita = async (req, res) => {
  try {
    const { registro } = req.params;
    const data = await farmaciaService.buscarReceitaPorRegistro(registro);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const dispensarReceita = async (req, res) => {
  try {
    const farmaciaId = req.user.id;
    const userNome = req.user.nome;
    const data = await farmaciaService.registrarDispensacao(req.body, farmaciaId, userNome);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const dispensarMedicamentos = async (req, res) => {
  try {
    const farmacia = {
      id: req.user.id,
      nome: req.user.nome,
    };
    const result = await farmaciaService.dispensarMedicamentosFarmacia(farmacia, req.body);
    res.status(201).json({ message: "Medicamentos dispensados com sucesso", ...result });
  } catch (error) {
    handleError(res, error);
  }
};

export const atualizarDispensacao = async (req, res) => {
  try {
    const { dispensacaoId } = req.params;
    const data = await farmaciaService.atualizarDispensacaoParcial(dispensacaoId, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deletarDispensacao = async (req, res) => {
  try {
    const { dispensacaoId } = req.params;
    const data = await farmaciaService.deletarDispensacaoParcial(dispensacaoId);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const listarTodas = async (req, res) => {
  try {
    const data = await farmaciaService.listarTodasDispensacoes(req.user.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const obterEstatisticas = async (req, res) => {
  try {
    const data = await farmaciaService.obterEstatisticas(req.user.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};
