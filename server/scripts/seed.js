import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar admin padrão
  const adminSenha = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@sistema.saude' },
    update: {},
    create: {
      nome: 'Administrador do Sistema',
      telefone: '(11) 99999-9999',
      cpf: '000.000.000-00',
      email: 'admin@sistema.saude',
      senha: adminSenha
    }
  });

  console.log('✅ Admin criado:', admin.email);

  // Criar UBS de exemplo
  const ubsSenha = await bcrypt.hash('ubs123', 10);
  
  const ubs = await prisma.uBS.upsert({
    where: { email: 'ubs@centro.saude' },
    update: {},
    create: {
      nome: 'UBS Centro',
      endereco: 'Rua das Flores, 123 - Centro',
      telefone: '(11) 3333-4444',
      cnpj: '12.345.678/0001-90',
      email: 'ubs@centro.saude',
      senha: ubsSenha
    }
  });

  console.log('✅ UBS criada:', ubs.nome);

  // Criar laboratório de exemplo
  const labSenha = await bcrypt.hash('lab123', 10);
  
  const laboratorio = await prisma.laboratorio.upsert({
    where: { email: 'contato@labcentral.com' },
    update: {},
    create: {
      nome: 'Laboratório Central',
      endereco: 'Av. Paulista, 1000 - Bela Vista',
      telefone: '(11) 2222-3333',
      cnpj: '98.765.432/0001-10',
      email: 'contato@labcentral.com',
      senha: labSenha
    }
  });

  console.log('✅ Laboratório criado:', laboratorio.nome);

  // Criar funcionário de exemplo
  const funcSenha = await bcrypt.hash('func123', 10);
  
  const funcionario = await prisma.funcionario.upsert({
    where: { email: 'dr.silva@ubs.saude' },
    update: {},
    create: {
      nome: 'Dr. João Silva',
      funcao: 'Médico Clínico Geral',
      crm: 'CRM/SP 123456',
      cpf: '111.222.333-44',
      telefone: '(11) 91111-2222',
      email: 'dr.silva@ubs.saude',
      senha: funcSenha,
      ubsId: ubs.id
    }
  });

  console.log('✅ Funcionário criado:', funcionario.nome);

  // Criar paciente de exemplo
  const pacienteSenha = await bcrypt.hash('paciente123', 10);
  
  const paciente = await prisma.paciente.upsert({
    where: { email: 'joao@email.com' },
    update: {},
    create: {
      nome: 'João dos Santos',
      cpf: '555.666.777-88',
      cns: '123456789012345',
      endereco: 'Rua das Palmeiras, 456 - Vila Nova',
      cep: '01234-567',
      nascimento: new Date('1985-06-15'),
      telefone: '(11) 95555-6666',
      email: 'joao@email.com',
      senha: pacienteSenha
    }
  });

  console.log('✅ Paciente criado:', paciente.nome);

  // Criar campanha de exemplo
  const campanha = await prisma.campanha.create({
    data: {
      titulo: 'Campanha de Vacinação Influenza 2024',
      descricao: 'Vacina contra gripe disponível para todos. Compareça na UBS com documento de identidade.',
      tipo: 'vacinacao',
      dataIni: new Date(),
      dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      ubsId: ubs.id
    }
  });

  console.log('✅ Campanha criada:', campanha.titulo);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Dados de acesso:');
  console.log('Admin: admin@sistema.saude / admin123');
  console.log('UBS: ubs@centro.saude / ubs123');
  console.log('Funcionário: dr.silva@ubs.saude / func123');
  console.log('Laboratório: contato@labcentral.com / lab123');
  console.log('Paciente: joao@email.com / paciente123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });