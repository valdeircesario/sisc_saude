import * as authService from "../services/authService.js";

const handleError = (res, error, customMessage = "Erro interno do servidor") => {
  if (error.status && error.data) {
    return res.status(error.status).json(error.data);
  }
  console.error(customMessage, error);
  return res.status(500).json({ message: customMessage, details: error.message });
};

export const loginPaciente = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const result = await authService.loginPaciente(email, senha);
    res.json(result);
  } catch (error) {
    handleError(res, error, "Erro no login do paciente:");
  }
};

export const loginSistema = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const result = await authService.loginSistema(email, senha);
    res.json(result);
  } catch (error) {
    handleError(res, error, "Erro no login do sistema:");
  }
};

export const registerPaciente = async (req, res) => {
  try {
    const result = await authService.registerPaciente(req.body);
    res.status(201).json({
      ...result,
      message: "Cadastro realizado com sucesso!",
    });
  } catch (error) {
    handleError(res, error, "Erro no registro do paciente:");
  }
};

export const solicitarResetSenha = async (req, res) => {
  try {
    const result = await authService.solicitarResetSenha({
      ...req.body,
      ipSolicitante: req.ip,
    });
    res.json(result);
  } catch (error) {
    handleError(res, error, "Erro ao solicitar redefinição de senha:");
  }
};

export const redefinirSenha = async (req, res) => {
  try {
    const result = await authService.redefinirSenha(req.body);
    res.json(result);
  } catch (error) {
    handleError(res, error, "Erro ao redefinir senha:");
  }
};

export const alterarSenha = async (req, res) => {
  try {
    const result = await authService.alterarSenha({
      ...req.body,
      tipoUsuario: req.user.tipo,
      usuarioId: req.user.id,
    });
    res.json(result);
  } catch (error) {
    handleError(res, error, "Erro ao alterar senha:");
  }
};