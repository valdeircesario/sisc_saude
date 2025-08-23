# Sistema Integrado de Saúde

Sistema completo de gestão de saúde com frontend React e backend Node.js.

## 🚀 Configuração do Projeto

### Pré-requisitos
- Node.js (v18 ou superior)
- PostgreSQL
- pgAdmin (opcional, para interface gráfica)

### 1. Configuração do Banco de Dados

1. **Instale o PostgreSQL** se ainda não tiver
2. **Crie um banco de dados** chamado `sistema_saude`
3. **Configure as credenciais** no arquivo `server/.env`

### 2. Configuração do Backend

```bash
# Entre na pasta do servidor
cd server

# Instale as dependências
npm install

# Configure o arquivo .env (copie do .env.example)
cp .env.example .env

# Edite o arquivo .env com suas configurações do PostgreSQL
# DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/sistema_saude?schema=public"

# Gere o cliente Prisma
npm run db:generate

# Sincronize o banco de dados
npm run db:push

# Configure o admin padrão
npm run db:setup

# Inicie o servidor
npm run dev
```

### 3. Configuração do Frontend

```bash
# Na pasta raiz do projeto
npm install

# Inicie o frontend
npm run dev
```

## 🔐 Credenciais de Teste

### Admin
- **Email:** admin@sistema.saude
- **Senha:** admin123

### Para criar outros usuários
Use o painel administrativo após fazer login como admin.

## 📊 Estrutura do Banco

O sistema utiliza PostgreSQL com Prisma ORM. As principais tabelas são:

- `admins` - Administradores do sistema
- `ubs` - Unidades Básicas de Saúde
- `funcionarios` - Médicos e enfermeiros
- `laboratorios` - Laboratórios de exames
- `pacientes` - Pacientes do sistema
- `campanhas` - Campanhas de saúde
- `historico_medico` - Histórico médico dos pacientes
- `vacinas` - Registro de vacinas
- `exames` - Exames realizados
- `consultas` - Consultas agendadas

## 🛠️ Comandos Úteis

```bash
# Backend
cd server
npm run dev          # Iniciar servidor de desenvolvimento
npm run db:studio    # Abrir Prisma Studio
npm run db:reset     # Resetar banco e recriar dados

# Frontend
npm run dev          # Iniciar frontend
npm run build        # Build para produção
```

## 🌐 URLs do Sistema

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **Prisma Studio:** http://localhost:5555 (quando executado)

## 📱 Funcionalidades

### Para Pacientes
- Cadastro e login próprio
- Visualização do histórico médico
- Consulta de vacinas
- Visualização de exames
- Solicitação de consultas
- Acompanhamento de campanhas

### Para UBS
- Gestão de funcionários
- Criação de campanhas
- Agendamento de consultas
- Controle de pacientes

### Para Funcionários (Médicos/Enfermeiros)
- Registro de histórico médico
- Aplicação de vacinas
- Solicitação de exames
- Busca de pacientes

### Para Laboratórios
- Recebimento de solicitações
- Agendamento de exames
- Upload de resultados
- Gestão de laudos

### Para Administradores
- Cadastro de UBS e laboratórios
- Gestão completa do sistema
- Controle de usuários

## 🔧 Troubleshooting

### Erro de conexão com banco
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Teste a conexão: `npm run db:studio`

### Erro de CORS
1. Verifique se o frontend está rodando na porta 5173
2. Confirme a configuração CORS_ORIGIN no `.env`

### Erro de JWT
1. Verifique se JWT_SECRET está definido no `.env`
2. Use uma chave segura em produção