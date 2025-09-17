import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

const router = express.Router();

// Função para validar CPF
const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  
  const cpfArray = cpf.split('').map(el => +el);
  const rest = (count) => (cpfArray.slice(0, count-12)
    .reduce((soma, el, index) => (soma + el * (count-index)), 0) * 10) % 11 % 10;
  
  return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
};

// Função para validar CNS
const validarCNS = (cns) => {
  if (!cns || cns.length !== 15) return false;
  return /^\d{15}$/.test(cns);
};

// Login para pacientes
router.post('/login-paciente', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const paciente = await prisma.paciente.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!paciente) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const senhaValida = await bcrypt.compare(senha, paciente.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { 
        id: paciente.id, 
        email: paciente.email, 
        tipo: 'paciente',
        nome: paciente.nome 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: paciente.id,
        nome: paciente.nome,
        email: paciente.email,
        tipo: 'paciente'
      }
    });
  } catch (error) {
    console.error('Erro no login do paciente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login para outros usuários (admin, ubs, funcionario, laboratorio)
router.post('/login-sistema', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar em todas as tabelas de usuários do sistema
    let usuario = null;
    let tipo = '';

    // Verificar Admin
    usuario = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
    if (usuario) tipo = 'admin';

    // Verificar UBS
    if (!usuario) {
      usuario = await prisma.uBS.findUnique({ where: { email: email.toLowerCase() } });
      if (usuario) tipo = 'ubs';
    }
    // Verificar hospital
    if (!usuario) {
      usuario = await prisma.hospital.findUnique({ where: { email: email.toLowerCase() } });
      if (usuario) tipo = 'hospital';
    }

    // Verificar Funcionário
    if (!usuario) {
      usuario = await prisma.funcionario.findUnique({ 
        where: { email: email.toLowerCase() },
        include: { ubs: true }
      });
      if (usuario) tipo = 'funcionario';
    }

    // Verificar Laboratório
    if (!usuario) {
      usuario = await prisma.laboratorio.findUnique({ where: { email: email.toLowerCase() } });
      if (usuario) tipo = 'laboratorio';
    }

    if (!usuario) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        tipo,
        nome: usuario.nome,
        ubsId: tipo === 'funcionario' ? usuario.ubsId : undefined
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo,
        ubsId: tipo === 'funcionario' ? usuario.ubsId : undefined
      }
    });
  } catch (error) {
    console.error('Erro no login do sistema:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Registro de paciente
router.post('/register-paciente', async (req, res) => {
  try {
    const { nome, cpf, cns, endereco, cep, nascimento, telefone, email, senha } = req.body;

    // Validações
    if (!nome || !cpf || !cns || !endereco || !cep || !nascimento || !telefone || !email || !senha) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Validar CPF
    if (!validarCPF(cpf)) {
      return res.status(400).json({ message: 'CPF inválido' });
    }

    // Validar CNS
    if (!validarCNS(cns)) {
      return res.status(400).json({ message: 'CNS deve ter 15 dígitos' });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email inválido' });
    }

    // Validar senha
    if (senha.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar se já existe
    const pacienteExistente = await prisma.paciente.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { cpf: cpf.replace(/[^\d]/g, '') },
          { cns }
        ]
      }
    });

    if (pacienteExistente) {
      if (pacienteExistente.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'Este email já está cadastrado' });
      }
      if (pacienteExistente.cpf === cpf.replace(/[^\d]/g, '')) {
        return res.status(400).json({ message: 'Este CPF já está cadastrado' });
      }
      if (pacienteExistente.cns === cns) {
        return res.status(400).json({ message: 'Este CNS já está cadastrado' });
      }
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Criar paciente
    const novoPaciente = await prisma.paciente.create({
      data: {
        nome: nome.trim(),
        cpf: cpf.replace(/[^\d]/g, ''),
        cns,
        endereco: endereco.trim(),
        cep: cep.replace(/[^\d]/g, ''),
        nascimento: new Date(nascimento),
        telefone: telefone.trim(),
        email: email.toLowerCase().trim(),
        senha: senhaHash
      }
    });

    // Gerar token
    const token = jwt.sign(
      { 
        id: novoPaciente.id, 
        email: novoPaciente.email, 
        tipo: 'paciente',
        nome: novoPaciente.nome 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: novoPaciente.id,
        nome: novoPaciente.nome,
        email: novoPaciente.email,
        tipo: 'paciente'
      },
      message: 'Cadastro realizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro no registro do paciente:', error);
    
    // Verificar se é erro de constraint do Prisma
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      switch (field) {
        case 'email':
          return res.status(400).json({ message: 'Este email já está cadastrado' });
        case 'cpf':
          return res.status(400).json({ message: 'Este CPF já está cadastrado' });
        case 'cns':
          return res.status(400).json({ message: 'Este CNS já está cadastrado' });
        default:
          return res.status(400).json({ message: 'Dados já cadastrados no sistema' });
      }
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;