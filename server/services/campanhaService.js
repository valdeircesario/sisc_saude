import { prisma } from '../config/database.js';

export const listarCampanhasAtivas = async () => {
  return await prisma.campanha.findMany({
    where: {
      ativa: true,
      OR: [
        { dataFim: null },
        { dataFim: { gte: new Date() } }
      ]
    },
    include: {
      ubs: {
        select: {
          nome: true,
          endereco: true,
          telefone: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const inscreverCampanha = async (id, data) => {
  const { nome, cpf, telefone, email, endereco, idade, condicoesSaude, observacoes } = data;

  // Verificar se a campanha existe e está ativa
  const campanha = await prisma.campanha.findFirst({
    where: {
      id,
      ativa: true,
      OR: [
        { dataFim: null },
        { dataFim: { gte: new Date() } }
      ]
    }
  });

  if (!campanha) {
    throw { status: 404, data: { message: 'Campanha não encontrada ou inativa' } };
  }

  // Verificar se já existe inscrição com o mesmo CPF
  const inscricaoExistente = await prisma.inscricaoCampanha.findFirst({
    where: {
      campanhaId: id,
      cpf: cpf.replace(/[^\d]/g, '')
    }
  });

  if (inscricaoExistente) {
    throw { status: 400, data: { message: 'CPF já inscrito nesta campanha' } };
  }

  // Calcular pontuação e classificação de gravidade
  let pontuacao = 0;
  let gravidade = 'leve';
  let prioridade = 'normal';
  
  const idadeNum = parseInt(idade);
  
  // Sistema de pontuação para classificação
  if (idadeNum >= 80) pontuacao += 40;
  else if (idadeNum >= 70) pontuacao += 30;
  else if (idadeNum >= 60) pontuacao += 20;
  else if (idadeNum >= 50) pontuacao += 10;
  else if (idadeNum >= 40) pontuacao += 5;
  
  // Pontuação por condições de saúde
  switch (condicoesSaude) {
    case 'cancer':
    case 'imunossuprimido':
      pontuacao += 50;
      break;
    case 'cardiopatia':
    case 'multiplas':
      pontuacao += 40;
      break;
    case 'diabetes':
    case 'hipertensao':
      pontuacao += 30;
      break;
    case 'gestante':
      pontuacao += 25;
      break;
    case 'asma':
    case 'obesidade':
      pontuacao += 15;
      break;
    case 'outras':
      pontuacao += 10;
      break;
    default:
      pontuacao += 0;
  }
  
  // Classificação de gravidade baseada na pontuação
  if (pontuacao >= 70) {
    gravidade = 'critico';
    prioridade = 'alta';
  } else if (pontuacao >= 50) {
    gravidade = 'grave';
    prioridade = 'alta';
  } else if (pontuacao >= 25) {
    gravidade = 'medio';
    prioridade = 'media';
  } else {
    gravidade = 'leve';
    prioridade = 'normal';
  }
  
  const novaInscricao = await prisma.inscricaoCampanha.create({
    data: {
      campanhaId: id,
      nome: nome.trim(),
      cpf: cpf.replace(/[^\d]/g, ''),
      telefone: telefone.trim(),
      email: email.toLowerCase().trim(),
      endereco: endereco?.trim(),
      idade: parseInt(idade),
      condicoesSaude: condicoesSaude || null,
      pontuacao,
      gravidade,
      prioridade,
      observacoes: observacoes?.trim()
    }
  });

  return novaInscricao;
};

export const obterDetalhesCampanha = async (id) => {
  const campanha = await prisma.campanha.findFirst({
    where: {
      id,
      ativa: true,
      OR: [
        { dataFim: null },
        { dataFim: { gte: new Date() } }
      ]
    },
    include: {
      ubs: {
        select: {
          nome: true,
          endereco: true,
          telefone: true
        }
      }
    }
  });

  if (!campanha) {
    throw { status: 404, data: { message: 'Campanha não encontrada' } };
  }

  return campanha;
};