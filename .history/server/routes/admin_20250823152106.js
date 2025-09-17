import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware para admin
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

// Listar todas as UBS
router.get('/ubs', async (req, res) => {
  try {
    const ubsList = await prisma.uBS.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
        cnpj: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            funcionarios: true,
            campanhas: true
          }
        }
      }
    });
    res.json(ubsList);
  } catch (error) {
    console.error('Erro ao listar UBS:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cadastrar UBS
router.post('/ubs', async (req, res) => {
  try {
    const { nome, endereco, telefone, cnpj, email, senha } = req.body;

    const ubsExistente = await prisma.uBS.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { cnpj }
        ]
      }
    });

    if (ubsExistente) {
      return res.status(400).json({ message: 'UBS já cadastrada com estes dados' });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const novaUBS = await prisma.uBS.create({
      data: {
        nome,
        endereco,
        telefone,
        cnpj,
        email: email.toLowerCase(),
        senha: senhaHash
      }
    });

    res.status(201).json({
      id: novaUBS.id,
      nome: novaUBS.nome,
      endereco: novaUBS.endereco,
      telefone: novaUBS.telefone,
      cnpj: novaUBS.cnpj,
      email: novaUBS.email
    });
  } catch (error) {
    console.error('Erro ao cadastrar UBS:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Editar UBS
router.put('/ubs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, endereco, telefone, cnpj, email, senha } = req.body;

    const dados = {
      nome,
      endereco,
      telefone,
      cnpj,
      email: email.toLowerCase()
    };

    if (senha) {
      dados.senha = await bcrypt.hash(senha, 12);
    }

    const ubsAtualizada = await prisma.uBS.update({
      where: { id },
      data: dados
    });

    res.json({
      id: ubsAtualizada.id,
      nome: ubsAtualizada.nome,
      endereco: ubsAtualizada.endereco,
      telefone: ubsAtualizada.telefone,
      cnpj: ubsAtualizada.cnpj,
      email: ubsAtualizada.email
    });
  } catch (error) {
    console.error('Erro ao editar UBS:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar UBS
router.delete('/ubs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.uBS.delete({
      where: { id }
    });

    res.json({ message: 'UBS deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar UBS:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar laboratórios
router.get('/laboratorios', async (req, res) => {
  try {
    const laboratorios = await prisma.laboratorio.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
        cnpj: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            exames: true
          }
        }
      }
    });
    res.json(laboratorios);
  } catch (error) {
    console.error('Erro ao listar laboratórios:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cadastrar laboratório
router.post('/laboratorios', async (req, res) => {
  try {
    const { nome, endereco, telefone, cnpj, email, senha } = req.body;

    const labExistente = await prisma.laboratorio.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { cnpj }
        ]
      }
    });

    if (labExistente) {
      return res.status(400).json({ message: 'Laboratório já cadastrado com estes dados' });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const novoLab = await prisma.laboratorio.create({
      data: {
        nome,
        endereco,
        telefone,
        cnpj,
        email: email.toLowerCase(),
        senha: senhaHash
      }
    });

    res.status(201).json({
      id: novoLab.id,
      nome: novoLab.nome,
      endereco: novoLab.endereco,
      telefone: novoLab.telefone,
      cnpj: novoLab.cnpj,
      email: novoLab.email
    });
  } catch (error) {
    console.error('Erro ao cadastrar laboratório:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Editar laboratório
router.put('/laboratorios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, endereco, telefone, cnpj, email, senha } = req.body;

    const dados = {
      nome,
      endereco,
      telefone,
      cnpj,
      email: email.toLowerCase()
    };

    if (senha) {
      dados.senha = await bcrypt.hash(senha, 12);
    }

    const labAtualizado = await prisma.laboratorio.update({
      where: { id },
      data: dados
    });

    res.json({
      id: labAtualizado.id,
      nome: labAtualizado.nome,
      endereco: labAtualizado.endereco,
      telefone: labAtualizado.telefone,
      cnpj: labAtualizado.cnpj,
      email: labAtualizado.email
    });
  } catch (error) {
    console.error('Erro ao editar laboratório:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar laboratório
router.delete('/laboratorios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.laboratorio.delete({
      where: { id }
    });

    res.json({ message: 'Laboratório deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar laboratório:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar laboratórios
router.get('/hospitais', async (req, res) => {
  try {
    const hospitais = await prisma.hospital.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
        cnpj: true,
        email: true,
        createdAt: true,
      
      }
    });
    res.json(hospitais);
  } catch (error) {
    console.error('Erro ao listar hospitais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cadastrar laboratório
router.post('/hospitais', async (req, res) => {
  try {
    const { nome, endereco, telefone, cnpj, email, senha } = req.body;

    const hospExistente = await prisma.hospital.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { cnpj }
        ]
      }
    });

    if (hospExistente) {
      return res.status(400).json({ message: 'hospital já cadastrado com estes dados' });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const novohosp = await prisma.hospital.create({
      data: {
        nome,
        endereco,
        telefone,
        cnpj,
        email: email.toLowerCase(),
        senha: senhaHash
      }
    });

    res.status(201).json({
      id: novohosp.id,
      nome: novohosp.nome,
      endereco: novohosp.endereco,
      telefone: novoLab.telefone,
      cnpj: novoLab.cnpj,
      email: novoLab.email
    });
  } catch (error) {
    console.error('Erro ao cadastrar laboratório:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Editar laboratório
router.put('/laboratorios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, endereco, telefone, cnpj, email, senha } = req.body;

    const dados = {
      nome,
      endereco,
      telefone,
      cnpj,
      email: email.toLowerCase()
    };

    if (senha) {
      dados.senha = await bcrypt.hash(senha, 12);
    }

    const labAtualizado = await prisma.laboratorio.update({
      where: { id },
      data: dados
    });

    res.json({
      id: labAtualizado.id,
      nome: labAtualizado.nome,
      endereco: labAtualizado.endereco,
      telefone: labAtualizado.telefone,
      cnpj: labAtualizado.cnpj,
      email: labAtualizado.email
    });
  } catch (error) {
    console.error('Erro ao editar laboratório:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar laboratório
router.delete('/laboratorios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.laboratorio.delete({
      where: { id }
    });

    res.json({ message: 'Laboratório deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar laboratório:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;