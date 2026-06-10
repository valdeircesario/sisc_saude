import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";

// Função para validar CPF
const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  const cpfArray = cpf.split("").map((el) => +el);
  const rest = (count) =>
    ((cpfArray
      .slice(0, count - 12)
      .reduce((soma, el, index) => soma + el * (count - index), 0) *
      10) %
      11) %
    10;

  return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
};

// Função para validar CNS
const validarCNS = (cns) => {
  if (!cns || cns.length !== 15) return false;
  return /^\d{15}$/.test(cns);
};

export const loginPaciente = async (email, senha) => {
  if (!email || !senha) {
    throw { status: 400, data: { message: "Email e senha são obrigatórios" } };
  }

  const paciente = await prisma.paciente.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!paciente) {
    throw { status: 401, data: { message: "Email ou senha inválidos" } };
  }

  const senhaValida = await bcrypt.compare(senha, paciente.senha);
  if (!senhaValida) {
    throw { status: 401, data: { message: "Email ou senha inválidos" } };
  }

  const token = jwt.sign(
    {
      id: paciente.id,
      email: paciente.email,
      tipo: "paciente",
      nome: paciente.nome,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    token,
    user: {
      id: paciente.id,
      nome: paciente.nome,
      email: paciente.email,
      tipo: "paciente",
    },
  };
};

export const loginSistema = async (email, senha) => {
  if (!email || !senha) {
    throw { status: 400, data: { message: "Email e senha são obrigatórios" } };
  }

  // Buscar em todas as tabelas de usuários do sistema
  let usuario = null;
  let tipo = "";

  // Verificar Admin
  usuario = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (usuario) tipo = "admin";

  // Verificar UBS
  if (!usuario) {
    usuario = await prisma.uBS.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (usuario) tipo = "ubs";
  }
  // Verificar hospital
  if (!usuario) {
    usuario = await prisma.hospital.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (usuario) tipo = "hospital";
  }

  // verificar farmacia
  if (!usuario) {
    usuario = await prisma.farmacia.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (usuario) tipo = "farmacia";
  }

  // Verificar Funcionário
  if (!usuario) {
    usuario = await prisma.funcionario.findUnique({
      where: { email: email.toLowerCase() },
      include: { ubs: true },
    });
    if (usuario) tipo = "funcionario";
  }

  // Verificar Laboratório
  if (!usuario) {
    usuario = await prisma.laboratorio.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (usuario) tipo = "laboratorio";
  }

  // Verificar UPA
  if (!usuario) {
    usuario = await prisma.upa.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (usuario) tipo = "upa";
  }

  if (!usuario) {
    throw { status: 401, data: { message: "Email ou senha inválidos" } };
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    throw { status: 401, data: { message: "Email ou senha inválidos" } };
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tipo,
      nome: usuario.nome,
      funcao: tipo === "funcionario" ? usuario.funcao : undefined,
      ubsId: tipo === "funcionario" ? usuario.ubsId : undefined,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    token,
    user: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo,
      funcao: tipo === "funcionario" ? usuario.funcao : undefined,
      ubsId: tipo === "funcionario" ? usuario.ubsId : undefined,
    },
  };
};

export const registerPaciente = async (data) => {
  const {
    nome,
    cpf,
    cns,
    endereco,
    cep,
    nascimento,
    telefone,
    email,
    senha,
  } = data;

  // Validações
  if (
    !nome ||
    !cpf ||
    !cns ||
    !endereco ||
    !cep ||
    !nascimento ||
    !telefone ||
    !email ||
    !senha
  ) {
    throw { status: 400, data: { message: "Todos os campos são obrigatórios" } };
  }

  // Validar CPF
  if (!validarCPF(cpf)) {
    throw { status: 400, data: { message: "CPF inválido" } };
  }

  // Validar CNS
  if (!validarCNS(cns)) {
    throw { status: 400, data: { message: "CNS deve ter 15 dígitos" } };
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw { status: 400, data: { message: "Email inválido" } };
  }

  // Validar senha com critérios fortes
  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!senhaRegex.test(senha)) {
    throw {
      status: 400,
      data: {
        message: "Senha deve ter: mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula e um número",
      },
    };
  }

  // Verificar se já existe
  const pacienteExistente = await prisma.paciente.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { cpf: cpf.replace(/[^\d]/g, "") },
        { cns },
      ],
    },
  });

  if (pacienteExistente) {
    if (pacienteExistente.email === email.toLowerCase()) {
      throw { status: 400, data: { message: "Este email já está cadastrado" } };
    }
    if (pacienteExistente.cpf === cpf.replace(/[^\d]/g, "")) {
      throw { status: 400, data: { message: "Este CPF já está cadastrado" } };
    }
    if (pacienteExistente.cns === cns) {
      throw { status: 400, data: { message: "Este CNS já está cadastrado" } };
    }
  }

  // Criptografar senha
  const senhaHash = await bcrypt.hash(senha, 12);

  try {
    // Criar paciente
    const novoPaciente = await prisma.paciente.create({
      data: {
        nome: nome.trim(),
        cpf: cpf.replace(/[^\d]/g, ""),
        cns,
        endereco: endereco.trim(),
        cep: cep.replace(/[^\d]/g, ""),
        nascimento: new Date(nascimento),
        telefone: telefone.trim(),
        email: email.toLowerCase().trim(),
        senha: senhaHash,
      },
    });

    // Gerar token
    const token = jwt.sign(
      {
        id: novoPaciente.id,
        email: novoPaciente.email,
        tipo: "paciente",
        nome: novoPaciente.nome,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: novoPaciente.id,
        nome: novoPaciente.nome,
        email: novoPaciente.email,
        tipo: "paciente",
      },
    };
  } catch (error) {
    // Verificar se é erro de constraint do Prisma (fallback, apesar do findFirst acima)
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      switch (field) {
        case "email":
          throw { status: 400, data: { message: "Este email já está cadastrado" } };
        case "cpf":
          throw { status: 400, data: { message: "Este CPF já está cadastrado" } };
        case "cns":
          throw { status: 400, data: { message: "Este CNS já está cadastrado" } };
        default:
          throw { status: 400, data: { message: "Dados já cadastrados no sistema" } };
      }
    }
    throw error;
  }
};