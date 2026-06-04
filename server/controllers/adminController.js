import * as adminService from '../services/adminService.js';

const handleError = (res, error, customMessage = "Erro interno do servidor") => {
  if (error.status && error.data) {
    return res.status(error.status).json(error.data);
  }
  console.error(customMessage, error);
  return res.status(500).json({ message: customMessage, details: error.message });
};

// UBS
export const listarUbs = async (req, res) => {
  try {
    const data = await adminService.listarUbs();
    res.json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao listar UBS:');
  }
};

export const cadastrarUbs = async (req, res) => {
  try {
    const data = await adminService.cadastrarUbs(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao cadastrar UBS:');
  }
};

export const editarUbs = async (req, res) => {
  try {
    const data = await adminService.editarUbs(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao editar UBS:');
  }
};

export const deletarUbs = async (req, res) => {
  try {
    await adminService.deletarUbs(req.params.id);
    res.json({ message: 'UBS deletada com sucesso' });
  } catch (error) {
    handleError(res, error, 'Erro ao deletar UBS:');
  }
};

// Hospitais
export const listarHospitaisPublico = async (req, res) => {
  try {
    const data = await adminService.listarHospitaisPublico();
    res.json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao listar hospitais:');
  }
};

export const listarHospitais = async (req, res) => {
  try {
    const data = await adminService.listarHospitais();
    res.json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao listar hospitais:');
  }
};

export const cadastrarHospital = async (req, res) => {
  try {
    const data = await adminService.cadastrarHospital(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao cadastrar hospital:');
  }
};

export const editarHospital = async (req, res) => {
  try {
    const data = await adminService.editarHospital(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao editar hospital:');
  }
};

export const deletarHospital = async (req, res) => {
  try {
    await adminService.deletarHospital(req.params.id);
    res.json({ message: 'Hospital deletado com sucesso' });
  } catch (error) {
    handleError(res, error, 'Erro ao deletar hospital:');
  }
};

// Laboratórios
export const listarLaboratorios = async (req, res) => {
  try {
    const data = await adminService.listarLaboratorios();
    res.json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao listar laboratórios:');
  }
};

export const cadastrarLaboratorio = async (req, res) => {
  try {
    const data = await adminService.cadastrarLaboratorio(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao cadastrar laboratório:');
  }
};

export const editarLaboratorio = async (req, res) => {
  try {
    const data = await adminService.editarLaboratorio(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao editar laboratório:');
  }
};

export const deletarLaboratorio = async (req, res) => {
  try {
    await adminService.deletarLaboratorio(req.params.id);
    res.json({ message: 'Laboratório deletado com sucesso' });
  } catch (error) {
    handleError(res, error, 'Erro ao deletar laboratório:');
  }
};

// UPAs
export const listarUpas = async (req, res) => {
  try {
    const data = await adminService.listarUpas();
    res.json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao listar UPAs:');
  }
};

export const cadastrarUpa = async (req, res) => {
  try {
    const data = await adminService.cadastrarUpa(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao cadastrar UPA:');
  }
};

export const editarUpa = async (req, res) => {
  try {
    const data = await adminService.editarUpa(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao editar UPA:');
  }
};

export const deletarUpa = async (req, res) => {
  try {
    await adminService.deletarUpa(req.params.id);
    res.json({ message: 'UPA deletada com sucesso' });
  } catch (error) {
    handleError(res, error, 'Erro ao deletar UPA:');
  }
};

// Farmácias
export const listarFarmacias = async (req, res) => {
  try {
    const data = await adminService.listarFarmacias();
    res.json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao listar farmácias:');
  }
};

export const cadastrarFarmacia = async (req, res) => {
  try {
    const data = await adminService.cadastrarFarmacia(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao cadastrar farmácia:');
  }
};

export const editarFarmacia = async (req, res) => {
  try {
    const data = await adminService.editarFarmacia(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error, 'Erro ao editar farmácia:');
  }
};

export const deletarFarmacia = async (req, res) => {
  try {
    await adminService.deletarFarmacia(req.params.id);
    res.json({ message: 'Farmácia deletada com sucesso' });
  } catch (error) {
    handleError(res, error, 'Erro ao deletar farmácia:');
  }
};
