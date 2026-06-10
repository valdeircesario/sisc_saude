import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const listarUbs = async () => {
  return await prisma.uBS.findMany({
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
};

export const listarHospitaisPublico = async () => {
  return await prisma.hospital.findMany({
    select: {
      id: true,
      nome: true,
      endereco: true,
      telefone: true,
    },
    orderBy: { nome: 'asc' }
  });
};

export const listarHospitais = async () => {
  return await prisma.hospital.findMany({
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
};

export const cadastrarHospital = async (data) => {
  const { nome, endereco, telefone, cnpj, email, senha } = data;

  const hospitalExistente = await prisma.hospital.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { cnpj }
      ]
    }
  });

  if (hospitalExistente) {
    throw { status: 400, data: { message: 'Hospital já cadastrado com estes dados' } };
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

  return {
    id: novoHospital.id,
    nome: novoHospital.nome,
    endereco: novoHospital.endereco,
    telefone: novoHospital.telefone,
    cnpj: novoHospital.cnpj,
    email: novoHospital.email
  };
};

export const editarHospital = async (id, data) => {
  const { nome, endereco, telefone, cnpj, email, senha } = data;

  const dadosUpdate = {
    nome,
    endereco,
    telefone,
    cnpj,
    email: email.toLowerCase()
  };

  if (senha) {
    dadosUpdate.senha = await bcrypt.hash(senha, 12);
  }

  const hospitalAtualizado = await prisma.hospital.update({
    where: { id },
    data: dadosUpdate
  });

  return {
    id: hospitalAtualizado.id,
    nome: hospitalAtualizado.nome,
    endereco: hospitalAtualizado.endereco,
    telefone: hospitalAtualizado.telefone,
    cnpj: hospitalAtualizado.cnpj,
    email: hospitalAtualizado.email
  };
};

export const deletarHospital = async (id) => {
  await prisma.hospital.delete({
    where: { id }
  });
};

export const cadastrarUbs = async (data) => {
  const { nome, endereco, telefone, cnpj, email, senha } = data;

  const ubsExistente = await prisma.uBS.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { cnpj }
      ]
    }
  });

  if (ubsExistente) {
    throw { status: 400, data: { message: 'UBS já cadastrada com estes dados' } };
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

  return {
    id: novaUBS.id,
    nome: novaUBS.nome,
    endereco: novaUBS.endereco,
    telefone: novaUBS.telefone,
    cnpj: novaUBS.cnpj,
    email: novaUBS.email
  };
};

export const editarUbs = async (id, data) => {
  const { nome, endereco, telefone, cnpj, email, senha } = data;

  const dadosUpdate = {
    nome,
    endereco,
    telefone,
    cnpj,
    email: email.toLowerCase()
  };

  if (senha) {
    dadosUpdate.senha = await bcrypt.hash(senha, 12);
  }

  const ubsAtualizada = await prisma.uBS.update({
    where: { id },
    data: dadosUpdate
  });

  return {
    id: ubsAtualizada.id,
    nome: ubsAtualizada.nome,
    endereco: ubsAtualizada.endereco,
    telefone: ubsAtualizada.telefone,
    cnpj: ubsAtualizada.cnpj,
    email: ubsAtualizada.email
  };
};

export const deletarUbs = async (id) => {
  await prisma.uBS.delete({
    where: { id }
  });
};

export const listarLaboratorios = async () => {
  return await prisma.laboratorio.findMany({
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
};

export const cadastrarLaboratorio = async (data) => {
  const { nome, endereco, telefone, cnpj, email, senha } = data;

  const labExistente = await prisma.laboratorio.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { cnpj }
      ]
    }
  });

  if (labExistente) {
    throw { status: 400, data: { message: 'Laboratório já cadastrado com estes dados' } };
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

  return {
    id: novoLab.id,
    nome: novoLab.nome,
    endereco: novoLab.endereco,
    telefone: novoLab.telefone,
    cnpj: novoLab.cnpj,
    email: novoLab.email
  };
};

export const editarLaboratorio = async (id, data) => {
  const { nome, endereco, telefone, cnpj, email, senha } = data;

  const dadosUpdate = {
    nome,
    endereco,
    telefone,
    cnpj,
    email: email.toLowerCase()
  };

  if (senha) {
    dadosUpdate.senha = await bcrypt.hash(senha, 12);
  }

  const labAtualizado = await prisma.laboratorio.update({
    where: { id },
    data: dadosUpdate
  });

  return {
    id: labAtualizado.id,
    nome: labAtualizado.nome,
    endereco: labAtualizado.endereco,
    telefone: labAtualizado.telefone,
    cnpj: labAtualizado.cnpj,
    email: labAtualizado.email
  };
};

export const deletarLaboratorio = async (id) => {
  await prisma.laboratorio.delete({
    where: { id }
  });
};

export const listarUpas = async () => {
  return await prisma.upa.findMany({
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
};

export const cadastrarUpa = async (data) => {
  const { nome, endereco, telefone, cnpj, email, senha } = data;

  const upaExistente = await prisma.upa.findFirst({
    where: {
      OR: [
        { email: email ? email.toLowerCase() : undefined },
        { cnpj }
      ]
    }
  });

  if (upaExistente) {
    throw { status: 400, data: { message: 'UPA já cadastrada com estes dados' } };
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

  return {
    id: novaUpa.id,
    nome: novaUpa.nome,
    endereco: novaUpa.endereco,
    telefone: novaUpa.telefone,
    cnpj: novaUpa.cnpj,
    email: novaUpa.email
  };
};

export const editarUpa = async (id, data) => {
  const { nome, endereco, telefone, cnpj, email, senha } = data;

  const dadosUpdate = {
    nome,
    endereco,
    telefone,
    cnpj,
    email: email ? email.toLowerCase() : null
  };

  if (senha) {
    dadosUpdate.senha = await bcrypt.hash(senha, 12);
  }

  const upaAtualizada = await prisma.upa.update({
    where: { id },
    data: dadosUpdate
  });

  return {
    id: upaAtualizada.id,
    nome: upaAtualizada.nome,
    endereco: upaAtualizada.endereco,
    telefone: upaAtualizada.telefone,
    cnpj: upaAtualizada.cnpj,
    email: upaAtualizada.email
  };
};

export const deletarUpa = async (id) => {
  await prisma.upa.delete({ where: { id } });
};

export const listarFarmacias = async () => {
  return await prisma.farmacia.findMany({
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
};

export const cadastrarFarmacia = async (data) => {
  const { nome, endereco, telefone, cnpj, email, senha } = data;

  const farmaciaExistente = await prisma.farmacia.findFirst({
    where: {
      OR: [
        { email: email ? email.toLowerCase() : undefined },
        { cnpj }
      ]
    }
  });

  if (farmaciaExistente) {
    throw { status: 400, data: { message: 'Farmácia já cadastrada com estes dados' } };
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

  return {
    id: novaFarmacia.id,
    nome: novaFarmacia.nome,
    endereco: novaFarmacia.endereco,
    telefone: novaFarmacia.telefone,
    cnpj: novaFarmacia.cnpj,
    email: novaFarmacia.email
  };
};

export const editarFarmacia = async (id, data) => {
  const { nome, endereco, telefone, cnpj, email, senha } = data;

  const dadosUpdate = {
    nome,
    endereco,
    telefone,
    cnpj,
    email: email ? email.toLowerCase() : null
  };

  if (senha) {
    dadosUpdate.senha = await bcrypt.hash(senha, 12);
  }

  const farmaciaAtualizada = await prisma.farmacia.update({
    where: { id },
    data: dadosUpdate
  });

  return {
    id: farmaciaAtualizada.id,
    nome: farmaciaAtualizada.nome,
    endereco: farmaciaAtualizada.endereco,
    telefone: farmaciaAtualizada.telefone,
    cnpj: farmaciaAtualizada.cnpj,
    email: farmaciaAtualizada.email
  };
};

export const deletarFarmacia = async (id) => {
  await prisma.farmacia.delete({ where: { id } });
};
