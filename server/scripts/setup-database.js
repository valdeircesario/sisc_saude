import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔄 Configurando banco de dados...');

    // Verificar se o admin já existe
    const adminExistente = await prisma.admin.findUnique({
      where: { email: 'admin@sistema.saude' }
    });

    if (!adminExistente) {
      // Criar admin padrão
      const adminSenha = await bcrypt.hash('admin123', 12);
      
      await prisma.admin.create({
        data: {
          nome: 'Administrador do Sistema',
          telefone: '(11) 99999-9999',
          cpf: '00000000000',
          email: 'admin@sistema.saude',
          senha: adminSenha
        }
      });

      console.log('✅ Admin padrão criado');
    } else {
      console.log('ℹ️ Admin já existe');
    }

    console.log('✅ Banco de dados configurado com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('Admin: admin@sistema.saude / admin123');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();