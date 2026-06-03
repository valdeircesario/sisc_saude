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
// Rota pública para UBS listar hospitais
router.get('/hospitais-publico', authenticateToken, authorizeRole(['ubs']), async (req, res) => {
  try {
    const hospitaisList = await prisma.hospital.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
      },
      orderBy: { nome: 'asc' }
    });
    res.json(hospitaisList);
  } catch (error) {
    console.error('Erro ao listar hospitais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar todos hospitais
router.get('/hospitais', async (req, res) => {
  try {
    const hospitaisList = await prisma.hospital.findMany({
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
    res.json(hospitaisList); // <-- nome igual ao const acima
  } catch (error) {
    console.error('Erro ao listar hospitais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cadastrar hospital
router.post('/hospitais', async (req, res) => {
  try {
    const { nome, endereco, telefone, cnpj, email, senha } = req.body;

    const hospitalExistente = await prisma.hospital.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { cnpj }
        ]
      }
    });

    if (hospitalExistente) {
      return res.status(400).json({ message: 'Hospital já cadastrado com estes dados' });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const novoHospital = await prisma.hospital.create({
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
      id: novoHospital.id,
      nome: novoHospital.nome,
      endereco: novoHospital.endereco,
      telefone: novoHospital.telefone,
      cnpj: novoHospital.cnpj,
      email: novoHospital.email
    });
  } catch (error) {
    console.error('Erro ao cadastrar hospital:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Editar hospital
router.put('/hospitais/:id', async (req, res) => {
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

    const hospitalAtualizado = await prisma.hospital.update({
      where: { id },
      data: dados
    });

    res.json({
      id: hospitalAtualizado.id,
      nome: hospitalAtualizado.nome,
      endereco: hospitalAtualizado.endereco,
      telefone: hospitalAtualizado.telefone,
      cnpj: hospitalAtualizado.cnpj,
      email: hospitalAtualizado.email
    });
  } catch (error) {
    console.error('Erro ao editar hospital:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar hospital
router.delete('/hospitais/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.hospital.delete({
      where: { id }
    });

    res.json({ message: 'Hospital deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar hospital:', error);
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

// --------------------------------------
// CRUD para UPAs (Unidades de Pronto Atendimento)
// Segue o mesmo padrão de criação/edição/deleção dos outros recursos do admin
// --------------------------------------

// Listar UPAs
router.get('/upas', async (req, res) => {
  try {
    const upas = await prisma.upa.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
        cnpj: true,
        email: true,
        createdAt: true
      }
    });
    res.json(upas);
  } catch (error) {
    console.error('Erro ao listar UPAs:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cadastrar UPA
router.post('/upas', async (req, res) => {
  try {
    const { nome, endereco, telefone, cnpj, email, senha } = req.body;

    const upaExistente = await prisma.upa.findFirst({
      where: {
        OR: [
          { email: email ? email.toLowerCase() : undefined },
          { cnpj }
        ]
      }
    });

    if (upaExistente) {
      return res.status(400).json({ message: 'UPA já cadastrada com estes dados' });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const novaUpa = await prisma.upa.create({
      data: {
        nome,
        endereco,
        telefone,
        cnpj,
        email: email ? email.toLowerCase() : null,
        senha: senhaHash
      }
    });

    res.status(201).json({
      id: novaUpa.id,
      nome: novaUpa.nome,
      endereco: novaUpa.endereco,
      telefone: novaUpa.telefone,
      cnpj: novaUpa.cnpj,
      email: novaUpa.email
    });
  } catch (error) {
    console.error('Erro ao cadastrar UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Editar UPA
router.put('/upas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, endereco, telefone, cnpj, email, senha } = req.body;

    const dados = {
      nome,
      endereco,
      telefone,
      cnpj,
      email: email ? email.toLowerCase() : null
    };

    if (senha) {
      dados.senha = await bcrypt.hash(senha, 12);
    }

    const upaAtualizada = await prisma.upa.update({
      where: { id },
      data: dados
    });

    res.json({
      id: upaAtualizada.id,
      nome: upaAtualizada.nome,
      endereco: upaAtualizada.endereco,
      telefone: upaAtualizada.telefone,
      cnpj: upaAtualizada.cnpj,
      email: upaAtualizada.email
    });
  } catch (error) {
    console.error('Erro ao editar UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar UPA
router.delete('/upas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.upa.delete({ where: { id } });

    res.json({ message: 'UPA deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar UPA:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// --------------------------------------
// CRUD para UPAs (Unidades de Pronto Atendimento)
// Segue o mesmo padrão de criação/edição/deleção dos outros recursos do admin
// --------------------------------------

// Listar UPAs
router.get('/farmacias', async (req, res) => {
  try {
    const farmacias = await prisma.farmacia.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
        cnpj: true,
        email: true,
        createdAt: true
      }
    });
    res.json(farmacias);
  } catch (error) {
    console.error('Erro ao listar farmacias:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cadastrar Farmácia
router.post('/farmacias', async (req, res) => {
  try {
    const { nome, endereco, telefone, cnpj, email, senha } = req.body;

    const farmaciaExistente = await prisma.farmacia.findFirst({
      where: {
        OR: [
          { email: email ? email.toLowerCase() : undefined },
          { cnpj }
        ]
      }
    });

    if (farmaciaExistente) {
      return res.status(400).json({ message: 'Farmácia já cadastrada com estes dados' });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const novaFarmacia = await prisma.farmacia.create({
      data: {
        nome,
        endereco,
        telefone,
        cnpj,
        email: email ? email.toLowerCase() : null,
        senha: senhaHash
      }
    });

    res.status(201).json({
      id: novaFarmacia.id,
      nome: novaFarmacia.nome,
      endereco: novaFarmacia.endereco,
      telefone: novaFarmacia.telefone,
      cnpj: novaFarmacia.cnpj,
      email: novaFarmacia.email
    });
  } catch (error) {
    console.error('Erro ao cadastrar Farmácia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Editar Farmácia
router.put('/farmacias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, endereco, telefone, cnpj, email, senha } = req.body;

    const dados = {
      nome,
      endereco,
      telefone,
      cnpj,
      email: email ? email.toLowerCase() : null
    };

    if (senha) {
      dados.senha = await bcrypt.hash(senha, 12);
    }

    const farmaciaAtualizada = await prisma.farmacia.update({
      where: { id },
      data: dados
    });

    res.json({
      id: farmaciaAtualizada.id,
      nome: farmaciaAtualizada.nome,
      endereco: farmaciaAtualizada.endereco,
      telefone: farmaciaAtualizada.telefone,
      cnpj: farmaciaAtualizada.cnpj,
      email: farmaciaAtualizada.email
    });
  } catch (error) {
    console.error('Erro ao editar Farmácia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar Farmácia
router.delete('/farmacias/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.farmacia.delete({ where: { id } });

    res.json({ message: 'Farmácia deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar Farmácia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});


export default router;