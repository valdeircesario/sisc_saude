import * as medicamentosService from "../services/medicamentosService.js";

const handleError = (res, error, customMessage = "Erro interno do servidor") => {
  if (error.status && error.data) {
    return res.status(error.status).json(error.data);
  }
  console.error(customMessage, error);
  return res.status(500).json({ message: customMessage, details: error.message });
};

export const listarMedicamentos = async (req, res) => {
  try {
    const medicamentos = await medicamentosService.listarMedicamentos();
    res.json(medicamentos);
  } catch (error) {
    handleError(res, error, "Erro ao listar medicamentos:");
  }
};

export const consultarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const medicamento = await medicamentosService.consultarMedicamento(id);
    res.json(medicamento);
  } catch (error) {
    handleError(res, error, "Erro ao consultar medicamento:");
  }
};

export const cadastrarMedicamento = async (req, res) => {
  try {
    const ubsId = req.user.id;
    const medicamento = await medicamentosService.cadastrarMedicamento(req.body, ubsId);
    res.status(201).json(medicamento);
  } catch (error) {
    handleError(res, error, "Erro ao cadastrar medicamento:");
  }
};

export const atualizarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const ubsId = req.user.id;
    const medicamento = await medicamentosService.atualizarMedicamento(id, req.body, ubsId);
    res.json(medicamento);
  } catch (error) {
    handleError(res, error, "Erro ao atualizar medicamento:");
  }
};

export const atualizarEstoque = async (req, res) => {
  try {
    const { id } = req.params;
    const ubsId = req.user.ubsId || req.user.id;
    const medicamento = await medicamentosService.atualizarEstoque(id, req.body, ubsId);
    res.json(medicamento);
  } catch (error) {
    handleError(res, error, "Erro ao atualizar estoque do medicamento:");
  }
};

export const fornecerMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await medicamentosService.fornecerMedicamento(id, req.body, req.user);
    res.status(201).json(resultado);
  } catch (error) {
    handleError(res, error, "Erro ao fornecer medicamento:");
  }
};

export const marcarVencido = async (req, res) => {
  try {
    const { id } = req.params;
    const ubsId = req.user.ubsId || req.user.id;
    const medicamento = await medicamentosService.marcarVencido(id, ubsId);
    res.json(medicamento);
  } catch (error) {
    handleError(res, error, "Erro ao marcar medicamento vencido:");
  }
};