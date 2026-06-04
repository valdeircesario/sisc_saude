import * as ubsService from "../services/ubsService.js";

const handleError = (res, error, customMessage = "Erro interno do servidor") => {
  if (error.status && error.data) {
    return res.status(error.status).json(error.data);
  }
  console.error(customMessage, error);
  return res.status(500).json({ message: customMessage, details: error.message });
};

export const listarHospitais = async (req, res) => {
  try {
    const hospitais = await ubsService.listarHospitais();
    res.json(hospitais);
  } catch (error) {
    handleError(res, error, "Erro ao listar hospitais:");
  }
};

export const obterHospital = async (req, res) => {
  try {
    const hospital = await ubsService.obterHospital(req.params.id);
    res.json(hospital);
  } catch (error) {
    handleError(res, error, "Erro ao obter hospital:");
  }
};

export const listarMedicamentos = async (req, res) => {
  try {
    const medicamentos = await ubsService.listarMedicamentos(req.user.id, req.query.busca);
    res.json(medicamentos);
  } catch (error) {
    handleError(res, error, "Erro ao listar medicamentos da UBS:");
  }
};

export const listarPacientes = async (req, res) => {
  try {
    const pacientes = await ubsService.listarPacientes(req.query.busca);
    res.json(pacientes);
  } catch (error) {
    handleError(res, error, "Erro ao listar pacientes:");
  }
};

export const obterPaciente = async (req, res) => {
  try {
    const paciente = await ubsService.obterPaciente(req.params.id);
    res.json(paciente);
  } catch (error) {
    handleError(res, error, "Erro ao obter paciente:");
  }
};

export const obterHistoricoMedico = async (req, res) => {
  try {
    const historico = await ubsService.obterHistoricoMedico(req.params.id);
    res.json(historico);
  } catch (error) {
    handleError(res, error, "Erro ao obter histórico médico:");
  }
};

export const obterConsultasPaciente = async (req, res) => {
  try {
    const consultas = await ubsService.obterConsultasPaciente(req.params.id);
    res.json(consultas);
  } catch (error) {
    handleError(res, error, "Erro ao obter consultas do paciente:");
  }
};

export const agendarConsultaPaciente = async (req, res) => {
  try {
    const consulta = await ubsService.agendarConsultaPaciente(req.params.id, req.user.id, req.body);
    res.status(201).json(consulta);
  } catch (error) {
    handleError(res, error, "Erro ao agendar consulta:");
  }
};

export const editarPaciente = async (req, res) => {
  try {
    const paciente = await ubsService.editarPaciente(req.params.id, req.body);
    res.json(paciente);
  } catch (error) {
    handleError(res, error, "Erro ao editar paciente:");
  }
};

export const listarFuncionarios = async (req, res) => {
  try {
    const funcionarios = await ubsService.listarFuncionarios(req.user.id);
    res.json(funcionarios);
  } catch (error) {
    handleError(res, error, "Erro ao listar funcionários:");
  }
};

export const cadastrarFuncionario = async (req, res) => {
  try {
    const funcionario = await ubsService.cadastrarFuncionario(req.user.id, req.body);
    res.status(201).json(funcionario);
  } catch (error) {
    handleError(res, error, "Erro ao cadastrar funcionário:");
  }
};

export const editarFuncionario = async (req, res) => {
  try {
    const funcionario = await ubsService.editarFuncionario(req.params.id, req.user.id, req.body);
    res.json(funcionario);
  } catch (error) {
    handleError(res, error, "Erro ao editar funcionário:");
  }
};

export const deletarFuncionario = async (req, res) => {
  try {
    await ubsService.deletarFuncionario(req.params.id, req.user.id);
    res.json({ message: "Funcionário deletado com sucesso" });
  } catch (error) {
    handleError(res, error, "Erro ao deletar funcionário:");
  }
};

export const criarCampanha = async (req, res) => {
  try {
    const campanha = await ubsService.criarCampanha(req.user.id, req.body);
    res.status(201).json(campanha);
  } catch (error) {
    handleError(res, error, "Erro ao criar campanha:");
  }
};

export const listarCampanhas = async (req, res) => {
  try {
    const campanhas = await ubsService.listarCampanhas(req.user.id);
    res.json(campanhas);
  } catch (error) {
    handleError(res, error, "Erro ao listar campanhas:");
  }
};

export const editarCampanha = async (req, res) => {
  try {
    const campanha = await ubsService.editarCampanha(req.params.id, req.user.id, req.body);
    res.json(campanha);
  } catch (error) {
    handleError(res, error, "Erro ao editar campanha:");
  }
};

export const deletarCampanha = async (req, res) => {
  try {
    await ubsService.deletarCampanha(req.params.id, req.user.id);
    res.json({ message: "Campanha excluída com sucesso" });
  } catch (error) {
    handleError(res, error, "Erro ao deletar campanha:");
  }
};

export const listarInscricoesCampanha = async (req, res) => {
  try {
    const inscricoes = await ubsService.listarInscricoesCampanha(req.params.id, req.user.id);
    res.json(inscricoes);
  } catch (error) {
    handleError(res, error, "Erro ao listar inscrições:");
  }
};

export const agendarInscricaoCampanha = async (req, res) => {
  try {
    const inscricao = await ubsService.agendarInscricaoCampanha(req.params.campanhaId, req.params.inscricaoId, req.user.id, req.body);
    res.json(inscricao);
  } catch (error) {
    handleError(res, error, "Erro ao agendar atendimento:");
  }
};

export const listarConsultas = async (req, res) => {
  try {
    const consultas = await ubsService.listarConsultas(req.user.id);
    res.json(consultas);
  } catch (error) {
    handleError(res, error, "Erro ao listar consultas:");
  }
};

export const agendarConsulta = async (req, res) => {
  try {
    const consulta = await ubsService.agendarConsulta(req.params.id, req.user.id, req.body);
    res.json(consulta);
  } catch (error) {
    handleError(res, error, "Erro ao agendar consulta:");
  }
};

export const cancelarConsulta = async (req, res) => {
  try {
    const consulta = await ubsService.cancelarConsulta(req.params.id, req.user.id, req.body.observacoes);
    res.json({ message: "Consulta cancelada com sucesso", consulta });
  } catch (error) {
    handleError(res, error, "Erro ao cancelar consulta:");
  }
};

export const solicitarInternacao = async (req, res) => {
  try {
    const solicitacao = await ubsService.solicitarInternacao(req.user.id, req.body);
    res.status(201).json({ message: "Solicitação de internação enviada com sucesso", solicitacao });
  } catch (error) {
    handleError(res, error, "Erro ao solicitar internação:");
  }
};

export const listarSolicitacoesInternacao = async (req, res) => {
  try {
    const solicitacoes = await ubsService.listarSolicitacoesInternacao(req.user.id, req.query.status);
    res.json(solicitacoes);
  } catch (error) {
    handleError(res, error, "Erro ao listar solicitações de internação:");
  }
};

export const obterSolicitacaoInternacao = async (req, res) => {
  try {
    const solicitacao = await ubsService.obterSolicitacaoInternacao(req.params.id, req.user.id);
    res.json(solicitacao);
  } catch (error) {
    handleError(res, error, "Erro ao obter solicitação de internação:");
  }
};

export const cancelarSolicitacaoInternacao = async (req, res) => {
  try {
    const solicitacao = await ubsService.cancelarSolicitacaoInternacao(req.params.id, req.user.id, req.body.motivoCancelamento);
    res.json({ message: "Solicitação de internação cancelada com sucesso", solicitacao });
  } catch (error) {
    handleError(res, error, "Erro ao cancelar solicitação de internação:");
  }
};
