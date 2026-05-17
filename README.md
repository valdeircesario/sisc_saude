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
# SISC — Sistema Integrado de Saúde

Documentação técnica e de usuário do SISC (Sistema Integrado de Saúde). Este README descreve a arquitetura, funcionalidades, regras de negócio, estrutura do projeto, requisitos de execução e instruções de desenvolvimento.

Visão geral
---------
O SISC é uma plataforma de gestão de saúde voltada para a administração de unidades (UBS, UPA, Hospitais, Laboratórios) e o acompanhamento do fluxo de atendimento de pacientes. O sistema centraliza informações de consultas, exames, laudos, vacinas, histórico médico e atendimentos emergenciais, permitindo que:

- Profissionais (médicos, enfermeiros) registrem e consultem atendimentos, prescribe medicações, solicitem exames e gerem encaminhamentos.
- Pacientes realizem solicitações, agendamentos e acompanhem seu histórico online.
- Administradores gerenciem unidades, funcionários, laboratórios e campanhas.

O objetivo é oferecer um único repositório de informação clínica por paciente, melhorar a coordenação entre serviços (UPA, UBS, hospitais, laboratórios) e oferecer rastreabilidade dos atos clínicos.

Principais funcionalidades (resumo)
---------------------------------
- Gestão de pacientes: cadastro, pesquisa (CNS/CPF/nome), visualização do histórico médico.
- Triagem e atendimentos (UPA): criação de triagens, transformação em atendimentos, fluxo de status (pendente, em_atendimento, finalizado, ausente, encaminhado, atendido).
- Registro de medicações administradas na UPA, com vínculo opcional ao atendimento.
- Solicitação e gerenciamento de exames (inclui integração com laboratório e upload de resultados/laudos).
- Registro de vacinas e controle de doses.
- Encaminhamentos para hospitais com status e motivo.
- Painéis por perfil (Admin, Funcionário/UBS, UPA, Hospital, Laboratório, Paciente).
- Autenticação e autorização baseada em JWT e roles.

Usuários e perfis
-----------------
- Admin: configura unidades (UBS, UPA, Hospital), cria usuários, gerencia o sistema.
- Funcionário (médico/enfermeiro): acessa lista de pacientes, registra históricos, solicita exames, aplica vacinas.
- UPA (profissional): faz triagens, cria atendimentos, prescreve medicamentos, solicita exames e encaminha para hospital.
- Hospital: recebe encaminhamentos e gerencia internações/exames hospitalares.
- Laboratório: recebe solicitações de exame, processa e envia resultados/laudos.
- Paciente: faz login, agenda/solicita serviços, visualiza seu histórico e resultados.

Regras de negócio importantes (implementadas)
-------------------------------------------
- Triagens:
	- Ao criar uma triagem ela é registrada com `status = 'em_andamento'`.
	- A área de triagens mostra apenas triagens com `status = 'em_andamento'`.

- Atendimentos (UPA):
	- Atendimentos gerenciam o ciclo do paciente na UPA (são a entidade central para ações clínicas).
	- Status possíveis: `pendente`, `em_atendimento`, `atendido`, `encaminhado`, `finalizado`, `ausente`.
	- Regras de alteração de status:
		- O status só pode ser alterado na aba de Atendimentos, dentro do modal de atendimento, e somente quando o usuário clicar em `Salvar alterações` — alterações staged não são persistidas até que o usuário confirme.
		- Quando o status for `finalizado` ou `ausente`, o atendimento fica imutável (cliente e servidor rejeitam alterações subsequentes).
		- Quando o atendimento está em `em_atendimento`, é permitido registrar medicamentos, laudos, notas, solicitar exames e criar encaminhamentos; esses registros só são persistidos quando o usuário salvar as alterações do atendimento.

- Criação de registros filhos (medicações, exames, vacinas, encaminhamentos):
	- Se vinculados a um atendimento, o servidor valida que o atendimento existe e que seu status é `em_atendimento` antes de aceitar a criação (proteção adicional caso o frontend falhe em validar).

Arquitetura e stack tecnológico
-------------------------------
- Frontend
	- React + TypeScript
	- Vite como bundler/development server
	- Tailwind CSS para estilos
	- react-query para gerenciamento de dados (cache/invalidação)
	- react-router-dom para navegação

- Backend
	- Node.js + Express
	- Prisma ORM + PostgreSQL (datasource configurada via `.env`)
	- Autenticação JWT
	- Middleware de autorização por role

- Banco de dados
	- PostgreSQL com modelos Prisma para entidades principais: Paciente, Triagem, Atendimento, UpaMedicacao, UpaSolicitacaoExame, UpaVacina, Encaminhamento, Upa, UBS, Hospital, Laboratório, Funcionario, Admin, etc.

Estrutura do repositório (principal)
------------------------------------
- `src/` — frontend React
	- `pages/` — páginas (Login, Dashboards por perfil, UpaDashboard, etc.)
	- `components/` — componentes reutilizáveis (Navbar, Loading, ProtectedRoute)
	- `contexts/` — AuthContext e hooks
	- `services/api.ts` — configuração axios/react-query

- `server/` — backend Express + Prisma
	- `routes/` — módulos de rota por área (auth, upa, ubs, hospital, laboratorio, paciente)
	- `prisma/` — `schema.prisma` e migrations
	- `middleware/` — autenticação/autorização
	- `scripts/` — seed / setup db

APIs — visão geral
------------------
O backend expõe endpoints REST organizados por área. Alguns dos endpoints mais relevantes:

- Auth
	- `POST /api/auth/login` — autenticar usuários (retorna JWT)

- Pacientes
	- `GET /api/upa/pacientes?busca=` — busca por CNS/nome/CPF

- Triagens (UPA)
	- `POST /api/upa/triagens` — criar triagem (status = em_andamento)
	- `GET /api/upa/triagens` — listar triagens em andamento

- Atendimentos (UPA)
	- `POST /api/upa/atendimentos` — criar atendimento (vinculado a triagem opcionalmente)
	- `GET /api/upa/atendimentos` — listar atendimentos
	- `GET /api/upa/atendimentos/candidates` — triagens sem atendimento (candidatos)
	- `PUT /api/upa/atendimentos/:id` — atualizar atendimento (server-side bloqueia updates se `finalizado` ou `ausente`)

- Registros vinculados (UPA)
	- `POST /api/upa/medicacoes` — criar medicação (valida atendimento.status == 'em_atendimento' se atendimentoId fornecido)
	- `POST /api/upa/solicitar-exame` — solicitar exame (mesma validação)
	- `POST /api/upa/vacinas` — registrar vacina
	- `POST /api/upa/encaminhamentos` — criar encaminhamento

Observações de implementação e limitações atuais
-----------------------------------------------
- Tipagem e lint: o frontend contém alguns usos genéricos de `any` que geram avisos de TypeScript/ESLint — é recomendado um esforço de refactor para tipos mais restritos.
- Geração do Prisma Client em Windows: já foram observados erros EPERM ao renomear o binário do query engine (arquivo `query_engine-windows.dll.node.tmp` → `query_engine-windows.dll.node`). No Windows, se ocorrer esse erro, pare os processos Node/VSCode que possam travar o arquivo, pause o OneDrive (se estiver sincronizando o workspace), remova arquivos temporários e execute `npx prisma generate` novamente.
- Transações: hoje a criação de atendimento + criação de registros filhos é realizada sequencialmente pelo frontend ao clicar em Salvar; considerar usar transações no servidor (Prisma transaction API) para garantir atomicidade em caso de falhas parciais.

Instalação e execução (desenvolvimento)
--------------------------------------
Pré-requisitos:

- Node.js v18+
- PostgreSQL

Passos rápidos:

1. Copie e edite variáveis de ambiente (no diretório `server/`):

```powershell
cd server
copy .env.example .env
# Edite .env, configure DATABASE_URL e JWT_SECRET
```

2. Instale dependências e gere Prisma Client:

```powershell
# Backend
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:setup   # opcional: seeds
npm run dev

# Frontend (na raiz)
cd ..
npm install
npm run dev
```

Comandos úteis (scripts)
------------------------
- `npm run dev` — inicia o servidor (backend) em modo desenvolvimento
- `npm run db:generate` / `npx prisma generate` — gera Prisma Client
- `npm run db:push` — sincroniza schema com o banco (dev)
- `npm run db:setup` — scripts de seed/initial setup (caso exista)

Testes e verificação manual (smoke tests)
---------------------------------------
Após iniciar backend e frontend, teste os fluxos principais:

1. Login como Admin (usar credenciais de seed ou criar um admin via seed).
2. Criar ou localizar um paciente.
3. Na aba Triagens (UPA): criar triagem; verificar que aparece em `Triagens em andamento`.
4. Ir para `Atendimentos` — criar atendimento a partir de um candidato; no modal alterar status para `em_atendimento`, adicionar medicações/exames/encaminhamentos e clicar em `Salvar alterações`.
5. Confirmar que os registros pendentes foram persistidos e que, ao mudar o status para `finalizado` e salvar, o atendimento torna-se imutável.

Contribuindo
------------
- Fork e crie branch: `feature/descricao` ou `fix/descricao`.
- Abra PR com descrição da mudança e testes/demonstrações.
- Mantenha o padrão de linting e formatação (prettier/eslint) do projeto.

Contato e Suporte
-----------------
Se precisar de ajuda com a configuração local, geração do Prisma Client ou bugs de runtime, envie os logs do backend (console) e o output do comando que falhou. Para problemas de geração do Prisma em Windows inclua o erro completo (EPERM). 

Licença
-------
Indique aqui a licença do projeto (ex.: MIT) se desejar. Se não houver, recomendo adicionar uma licença permissiva como MIT.

Notas finais
------------
Este README documenta o estado atual do projeto com base na leitura do código-fonte. Recomendo complementar com: roteiro de release, especificação de API (OpenAPI/Swagger), documentação de deploy (Docker/Kubernetes), e testes automatizados (unitários + integração/end-to-end) para garantir qualidade em produção.
