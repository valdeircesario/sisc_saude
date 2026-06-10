import * as upaService from '../services/upaService.js';

const handleError = (res, error, customMessage = "Erro interno do servidor") => {
  if (error.status && error.data) {
    return res.status(error.status).json(error.data);
  }
  console.error(customMessage, error);
  return res.status(500).json({ message: customMessage, details: error.message });
};

// Triagem
export const criarTriagem = async (req, res) => {
  try {
    const triagem = await upaService.criarTriagem(req.user.id, req.body);
    res.status(201).json(triagem);
  } catch (error) {
    handleError(res, error, 'Erro ao criar triagem:');
  }
};

export const listarTriagens = async (req, res) => {
  try {
    const triagens = await upaService.listarTriagens(req.user.id);
    res.json(triagens);
  } catch (error) {
    handleError(res, error, 'Erro ao listar triagens:');
  }
};

// Pacientes
export const listarPacientes = async (req, res) => {
  try {
    const pacientes = await upaService.listarPacientes(req.query.busca);
    res.json(pacientes);
  } catch (error) {
    handleError(res, error, 'Erro ao listar pacientes UPA:');
  }
};

// Atendimentos
export const listarCandidatosAtendimento = async (req, res) => {
  try {
    const candidates = await upaService.listarCandidatosAtendimento(req.user.id);
    res.json(candidates);
  } catch (error) {
    handleError(res, error, 'Erro ao listar candidatos a atendimento:');
  }
};

export const criarAtendimento = async (req, res) => {
  try {
    const atendimento = await upaService.criarAtendimento(req.user.id, req.body);
    res.status(201).json(atendimento);
  } catch (error) {
    handleError(res, error, 'Erro ao criar atendimento:');
  }
};

export const listarAtendimentos = async (req, res) => {
  try {
    const atendimentos = await upaService.listarAtendimentos(req.user.id);
    res.json(atendimentos);
  } catch (error) {
    handleError(res, error, 'Erro ao listar atendimentos:');
  }
};

export const atualizarAtendimento = async (req, res) => {
  try {
    const atendimento = await upaService.atualizarAtendimento(req.params.id, req.body);
    res.json(atendimento);
  } catch (error) {
    handleError(res, error, 'Erro ao atualizar atendimento:');
  }
};

// Medicações
export const registrarMedicacao = async (req, res) => {
  try {
    const med = await upaService.registrarMedicacao(req.user.id, req.body);
    res.status(201).json(med);
  } catch (error) {
    handleError(res, error, 'Erro ao registrar medicação UPA:');
  }
};

export const listarMedicacoes = async (req, res) => {
  try {
    const meds = await upaService.listarMedicacoes(req.user.id);
    res.json(meds);
  } catch (error) {
    handleError(res, error, 'Erro ao listar medicações UPA:');
  }
};

// Exames
export const solicitarExame = async (req, res) => {
  try {
    const solicitacao = await upaService.solicitarExame(req.user.id, req.body);
    res.status(201).json(solicitacao);
  } catch (error) {
    handleError(res, error, 'Erro ao solicitar exame UPA:');
  }
};

export const listarSolicitacoesExame = async (req, res) => {
  try {
    const solicitacoes = await upaService.listarSolicitacoesExame(req.user.id);
    res.json(solicitacoes);
  } catch (error) {
    handleError(res, error, 'Erro ao listar solicitações de exame UPA:');
  }
};

export const atualizarSolicitacaoExame = async (req, res) => {
  try {
    const updated = await upaService.atualizarSolicitacaoExame(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    handleError(res, error, 'Erro ao atualizar solicitação de exame:');
  }
};

// Vacinas
export const registrarVacina = async (req, res) => {
  try {
    const vacina = await upaService.registrarVacina(req.user.id, req.body);
    res.status(201).json(vacina);
  } catch (error) {
    handleError(res, error, 'Erro ao registrar vacina UPA:');
  }
};

export const listarVacinas = async (req, res) => {
  try {
    const vacinas = await upaService.listarVacinas(req.user.id);
    res.json(vacinas);
  } catch (error) {
    handleError(res, error, 'Erro ao listar vacinas UPA:');
  }
};

// Encaminhamentos
export const criarEncaminhamento = async (req, res) => {
  try {
    const encaminhamento = await upaService.criarEncaminhamento(req.user.id, req.body);
    res.status(201).json(encaminhamento);
  } catch (error) {
    handleError(res, error, 'Erro ao criar encaminhamento UPA:');
  }
};

export const listarEncaminhamentos = async (req, res) => {
  try {
    const items = await upaService.listarEncaminhamentos(req.user.id);
    res.json(items);
  } catch (error) {
    handleError(res, error, 'Erro ao listar encaminhamentos UPA:');
  }
};

// Utilitários
export const listarHospitais = async (req, res) => {
  try {
    const hospitais = await upaService.listarHospitais();
    res.json(hospitais);
  } catch (error) {
    handleError(res, error, 'Erro ao listar hospitais:');
  }
};

export const listarLaboratorios = async (req, res) => {
  try {
    const labs = await upaService.listarLaboratorios();
    res.json(labs);
  } catch (error) {
    handleError(res, error, 'Erro ao listar laboratorios:');
  }
};
