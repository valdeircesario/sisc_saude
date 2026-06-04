import * as funcionarioService from "../services/funcionarioService.js";

const handleError = (res, error, customMessage = "Erro interno do servidor") => {
  if (error.status && error.data) {
    return res.status(error.status).json(error.data);
  }
  console.error(customMessage, error);
  return res.status(500).json({ message: customMessage, details: error.message });
};

export const registrarHistoricoMedico = async (req, res) => {
  try {
    const historico = await funcionarioService.registrarHistoricoMedico(req.user.id, req.body);
    res.status(201).json(historico);
  } catch (error) {
    handleError(res, error, "Erro ao registrar histórico médico:");
  }
};

export const registrarVacina = async (req, res) => {
  try {
    const vacina = await funcionarioService.registrarVacina(req.user.id, req.body);
    res.status(201).json(vacina);
  } catch (error) {
    handleError(res, error, "Erro ao registrar vacina:");
  }
};

export const registrarReceita = async (req, res) => {
  try {
    const receita = await funcionarioService.registrarReceita(req.user.id, req.body);
    res.status(201).json(receita);
  } catch (error) {
    handleError(res, error, "Erro ao salvar receita médica:");
  }
};

export const registrarAtestado = async (req, res) => {
  try {
    const atestado = await funcionarioService.registrarAtestado(req.user.id, req.body);
    res.status(201).json(atestado);
  } catch (error) {
    handleError(res, error, "Erro ao salvar atestado médico:");
  }
};

export const assinarReceita = async (req, res) => {
  try {
    const receita = await funcionarioService.assinarReceita(req.params.id, req.body);
    res.json(receita);
  } catch (error) {
    handleError(res, error, "Erro ao assinar receita médica:");
  }
};

export const assinarAtestado = async (req, res) => {
  try {
    const atestado = await funcionarioService.assinarAtestado(req.params.id, req.body);
    res.json(atestado);
  } catch (error) {
    handleError(res, error, "Erro ao assinar atestado médico:");
  }
};

export const obterUbs = async (req, res) => {
  try {
    const ubs = await funcionarioService.obterUbsDoFuncionario(req.user.id);
    res.json(ubs);
  } catch (error) {
    handleError(res, error, "Erro ao buscar UBS do médico:");
  }
};

export const obterMeuPerfil = async (req, res) => {
  try {
    const perfil = await funcionarioService.obterMeuPerfil(req.user.id);
    res.json(perfil);
  } catch (error) {
    handleError(res, error, "Erro ao buscar perfil do médico:");
  }
};

export const listarMinhasReceitas = async (req, res) => {
  try {
    const receitas = await funcionarioService.listarMinhasReceitas(req.user.id);
    res.json(receitas);
  } catch (error) {
    handleError(res, error, "Erro ao listar receitas:");
  }
};

export const listarMeusAtestados = async (req, res) => {
  try {
    const atestados = await funcionarioService.listarMeusAtestados(req.user.id);
    res.json(atestados);
  } catch (error) {
    handleError(res, error, "Erro ao listar atestados:");
  }
};

export const solicitarExame = async (req, res) => {
  try {
    const solicitacao = await funcionarioService.solicitarExame(req.user.id, req.body);
    res.status(201).json(solicitacao);
  } catch (error) {
    handleError(res, error, "Erro ao solicitar exame:");
  }
};

export const solicitarInternacao = async (req, res) => {
  try {
    const solicitacao = await funcionarioService.solicitarInternacao(req.user.id, req.body);
    res.status(201).json({ message: "Solicitação de internação criada com sucesso", solicitacao });
  } catch (error) {
    handleError(res, error, "Erro ao solicitar internação:");
  }
};

export const listarMinhasSolicitacoesInternacao = async (req, res) => {
  try {
    const solicitacoes = await funcionarioService.listarMinhasSolicitacoesInternacao(req.user.id, req.query);
    res.json(solicitacoes);
  } catch (error) {
    handleError(res, error, "Erro ao listar solicitações de internação:");
  }
};

export const listarTodasMinhasSolicitacoes = async (req, res) => {
  try {
    const solicitacoes = await funcionarioService.listarTodasMinhasSolicitacoes(req.user.id, req.query);
    res.json(solicitacoes);
  } catch (error) {
    handleError(res, error, "Erro ao listar todas as solicitações:");
  }
};

export const atualizarObservacoesSolicitacaoInternacao = async (req, res) => {
  try {
    const solicitacao = await funcionarioService.atualizarObservacoesSolicitacaoInternacao(req.params.id, req.user.id, req.body.observacoes);
    res.json({ message: "Observações atualizadas com sucesso", solicitacao });
  } catch (error) {
    handleError(res, error, "Erro ao atualizar solicitação:");
  }
};

export const buscarPacientes = async (req, res) => {
  try {
    const pacientes = await funcionarioService.buscarPacientes(req.query.busca);
    res.json(pacientes);
  } catch (error) {
    handleError(res, error, "Erro ao buscar pacientes:");
  }
};

export const obterHistoricoMedicoPaciente = async (req, res) => {
  try {
    const historico = await funcionarioService.obterHistoricoMedicoPaciente(req.params.id);
    res.json(historico);
  } catch (error) {
    handleError(res, error, "Erro ao obter histórico:");
  }
};

export const buscarHistoricoCompletoCpf = async (req, res) => {
  try {
    const cpf = String(req.query.cpf || "").trim();
    if (!cpf) return res.status(400).json({ message: "Informe o CPF do paciente." });
    
    const result = await funcionarioService.buscarHistoricoCompletoCpf(cpf, req.user?.funcao);
    res.json(result);
  } catch (error) {
    handleError(res, error, "Erro ao buscar histórico completo do paciente por CPF:");
  }
};

export const listarLaboratorios = async (req, res) => {
  try {
    const laboratorios = await funcionarioService.listarLaboratorios();
    res.json(laboratorios);
  } catch (error) {
    handleError(res, error, "Erro ao listar laboratórios:");
  }
};

export const listarHospitais = async (req, res) => {
  try {
    const hospitais = await funcionarioService.listarHospitais();
    res.json(hospitais);
  } catch (error) {
    handleError(res, error, "Erro ao listar hospitais:");
  }
};

export const listarMinhasConsultas = async (req, res) => {
  try {
    const consultas = await funcionarioService.listarMinhasConsultas(req.user.id);
    res.json(consultas);
  } catch (error) {
    handleError(res, error, "Erro ao listar consultas:");
  }
};

export const listarExamesRealizados = async (req, res) => {
  try {
    const exames = await funcionarioService.listarExamesRealizados();
    res.json(exames);
  } catch (error) {
    handleError(res, error, "Erro ao listar exames realizados:");
  }
};

// --- Controllers com verificação especial de Enfermeiro/Farmacêutico ---

export const middlewareCheckPermissaoMedicamento = async (req, res, next) => {
  try {
    req.funcionario = await funcionarioService.checarPermissaoMedicamento(req.user.id, req.method);
    next();
  } catch (error) {
    handleError(res, error, "Erro ao verificar permissão de medicamento:");
  }
};

export const listarMedicamentosUbs = async (req, res) => {
  try {
    const meds = await funcionarioService.listarMedicamentosUbs(req.funcionario.ubsId, req.query.busca);
    res.json(meds);
  } catch (error) {
    handleError(res, error, "Erro ao listar medicamentos do funcionário:");
  }
};

export const atualizarMedicamentoUbs = async (req, res) => {
  try {
    const med = await funcionarioService.atualizarMedicamentoUbs(req.params.id, req.funcionario.ubsId, req.body);
    res.json(med);
  } catch (error) {
    handleError(res, error, "Erro ao atualizar medicamento do funcionário:");
  }
};

export const administrarMedicamento = async (req, res) => {
  try {
    const result = await funcionarioService.administrarMedicamento(req.params.id, req.funcionario, req.body);
    res.json(result);
  } catch (error) {
    handleError(res, error, "Erro ao administrar medicamento:");
  }
};

export const middlewareCheckPermissaoReceita = async (req, res, next) => {
  try {
    req.funcionario = await funcionarioService.checarPermissaoReceita(req.user.id);
    next();
  } catch (error) {
    handleError(res, error, "Erro ao verificar permissão de dispensação:");
  }
};

export const consultarReceitaParaDispensar = async (req, res) => {
  try {
    const receita = await funcionarioService.consultarReceita(req.params.registro);
    res.json(receita);
  } catch (error) {
    handleError(res, error, "Erro ao buscar receita:");
  }
};

export const validarDispensacaoDaReceita = async (req, res) => {
  try {
    const result = await funcionarioService.validarDispensacaoReceita(req.params.receitaId, req.funcionario);
    res.json(result);
  } catch (error) {
    handleError(res, error, "Erro ao validar dispensação:");
  }
};

export const dispensarReceitaLegado = async (req, res) => {
  try {
    const disp = await funcionarioService.dispensarReceitaLegado(req.user.id, req.body);
    res.status(201).json({ message: "Dispensação criada com sucesso", dispensacao: disp });
  } catch (error) {
    handleError(res, error, "Erro ao dispensar receita:");
  }
};

export const dispensarMedicamentosEmMassa = async (req, res) => {
  try {
    const result = await funcionarioService.dispensarMedicamentosReceita(req.funcionario, req.body);
    res.status(201).json({ message: "Medicamentos dispensados com sucesso", ...result });
  } catch (error) {
    handleError(res, error, "Erro ao dispensar medicamentos:");
  }
};
