import * as hospitalService from '../services/hospitalService.js';

const handleError = (res, error, customMessage = "Erro interno do servidor") => {
  if (error.status && error.data) {
    return res.status(error.status).json(error.data);
  }
  console.error(customMessage, error);
  return res.status(500).json({ message: customMessage, details: error.message });
};

export const listarPacientes = async (req, res) => {
  try {
    const pacientes = await hospitalService.listarPacientes(req.query.busca);
    res.json(pacientes);
  } catch (error) {
    handleError(res, error, 'Erro ao listar pacientes:');
  }
};

export const obterPaciente = async (req, res) => {
  try {
    const paciente = await hospitalService.obterPaciente(req.params.id);
    res.json(paciente);
  } catch (error) {
    handleError(res, error, 'Erro ao obter paciente:');
  }
};

export const obterHistoricoMedico = async (req, res) => {
  try {
    const historico = await hospitalService.obterHistoricoMedico(req.params.id);
    res.json(historico);
  } catch (error) {
    handleError(res, error, 'Erro ao obter histórico médico:');
  }
};

export const listarSolicitacoesInternacao = async (req, res) => {
  try {
    const solicitacoes = await hospitalService.listarSolicitacoesInternacao(req.user.id, req.query);
    res.json(solicitacoes);
  } catch (error) {
    handleError(res, error, 'Erro ao listar solicitações de internação:');
  }
};

export const obterSolicitacaoInternacao = async (req, res) => {
  try {
    const solicitacao = await hospitalService.obterSolicitacaoInternacao(req.params.id, req.user.id);
    res.json(solicitacao);
  } catch (error) {
    handleError(res, error, 'Erro ao obter solicitação:');
  }
};

export const atualizarStatusSolicitacao = async (req, res) => {
  try {
    const solicitacao = await hospitalService.atualizarStatusSolicitacao(req.params.id, req.user.id, req.body);
    res.json({ message: 'Status da solicitação atualizado com sucesso', solicitacao });
  } catch (error) {
    handleError(res, error, 'Erro ao atualizar status da solicitação:');
  }
};

export const aceitarSolicitacao = async (req, res) => {
  try {
    const solicitacao = await hospitalService.aceitarSolicitacao(req.params.id, req.user.id, req.body);
    res.json({ message: 'Solicitação aceita e em avaliação', solicitacao });
  } catch (error) {
    handleError(res, error, 'Erro ao aceitar solicitação:');
  }
};

export const agendarInternacao = async (req, res) => {
  try {
    const solicitacao = await hospitalService.agendarInternacao(req.params.id, req.user.id, req.body);
    res.json({ message: 'Internação agendada com sucesso', solicitacao });
  } catch (error) {
    handleError(res, error, 'Erro ao agendar internação:');
  }
};

export const rejeitarSolicitacao = async (req, res) => {
  try {
    const solicitacao = await hospitalService.rejeitarSolicitacao(req.params.id, req.user.id, req.body);
    res.json({ message: 'Solicitação rejeitada', solicitacao });
  } catch (error) {
    handleError(res, error, 'Erro ao rejeitar solicitação:');
  }
};

export const listarInternacoes = async (req, res) => {
  try {
    const internacoes = await hospitalService.listarInternacoes(req.user.id, req.query.busca);
    res.json(internacoes);
  } catch (error) {
    handleError(res, error, 'Erro ao listar internações:');
  }
};

export const obterDetalhesInternacao = async (req, res) => {
  try {
    const internacao = await hospitalService.obterDetalhesInternacao(req.params.id, req.user.id);
    res.json(internacao);
  } catch (error) {
    handleError(res, error, 'Erro ao obter detalhes da internação:');
  }
};

export const criarInternacao = async (req, res) => {
  try {
    const internacao = await hospitalService.criarInternacao(req.user.id, req.body);
    res.status(201).json({ message: 'Internação criada com sucesso!', internacao });
  } catch (error) {
    handleError(res, error, 'Erro ao criar internação:');
  }
};

export const atualizarObservacoesInternacao = async (req, res) => {
  try {
    const internacao = await hospitalService.atualizarObservacoesInternacao(req.params.id, req.user.id, req.body.observacoes);
    res.json({ message: 'Observações da internação atualizadas com sucesso!', internacao });
  } catch (error) {
    handleError(res, error, 'Erro ao atualizar observações da internação:');
  }
};

export const registrarAltaHospitalar = async (req, res) => {
  try {
    const alta = await hospitalService.registrarAltaHospitalar(req.params.internacaoId, req.user.id, req.body);
    res.status(201).json({ message: "Alta hospitalar registrada com sucesso!", alta });
  } catch (error) {
    handleError(res, error, 'Erro ao registrar alta hospitalar:');
  }
};

export const registrarMedicacaoInternacao = async (req, res) => {
  try {
    const medicacao = await hospitalService.registrarMedicacaoInternacao(req.params.internacaoId, req.body);
    res.status(201).json({ message: "Medicação registrada com sucesso!", medicacao });
  } catch (error) {
    handleError(res, error, 'Erro ao registrar medicação:');
  }
};

export const listarMedicacoesInternacao = async (req, res) => {
  try {
    const medicacoes = await hospitalService.listarMedicacoesInternacao(req.params.internacaoId);
    res.json(medicacoes);
  } catch (error) {
    handleError(res, error, 'Erro ao listar medicações da internação:');
  }
};

export const solicitarExameInternacao = async (req, res) => {
  try {
    const solicitacao = await hospitalService.solicitarExameInternacao(req.params.internacaoId, req.user.id, req.body);
    res.status(201).json({ message: "Solicitação de exame para internação registrada com sucesso!", solicitacao });
  } catch (error) {
    handleError(res, error, 'Erro ao solicitar exame para internação:');
  }
};

export const listarSolicitacoesExameInternacao = async (req, res) => {
  try {
    const solicitacoes = await hospitalService.listarSolicitacoesExameInternacao(req.params.internacaoId);
    res.json(solicitacoes);
  } catch (error) {
    handleError(res, error, 'Erro ao listar solicitações de exames da internação:');
  }
};

export const atualizarSolicitacaoExameInternacao = async (req, res) => {
  try {
    const solicitacao = await hospitalService.atualizarSolicitacaoExameInternacao(req.params.id, req.body);
    res.json({ message: "Resultado de exame de internação atualizado com sucesso!", solicitacao });
  } catch (error) {
    handleError(res, error, 'Erro ao atualizar resultado de exame de internação:');
  }
};

export const listarLaboratorios = async (req, res) => {
  try {
    const laboratorios = await hospitalService.listarLaboratorios();
    res.json(laboratorios);
  } catch (error) {
    handleError(res, error, 'Erro ao listar laboratórios:');
  }
};
