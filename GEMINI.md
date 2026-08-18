# Projeto Sisc Saúde

## 🎯 Objetivo
O Sisc Saúde é uma plataforma de gestão e integração para o ecossistema de saúde, centralizando prontuários, atendimentos, agendamentos e estoques entre diversas entidades (UBS, Hospitais, UPAs, Farmácias, Laboratórios).

## 🛠️ Tecnologias Principais
- **Frontend:** React, TypeScript, Vite, TailwindCSS, React Query.
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL.
- **Segurança:** JWT, bcryptjs, Helmet, Express Rate Limit.

## 🏛️ Arquitetura
O sistema segue uma arquitetura desacoplada (SPA + API REST).

### Estrutura do Backend (Camadas)
1. **Routes:** Definição de endpoints e aplicação de middlewares.
2. **Controllers:** Validação de payload e orquestração de resposta.
3. **Services:** Lógica de negócio e acesso a dados (Prisma).
4. **Middleware:** Segurança, autenticação e controle de acesso.

### Estrutura do Frontend
- Modular e atômica, utilizando `hooks` para isolamento de lógica e `contexts` para estado global (autenticação).

## 💡 Convenções e Padrões de Código
- **TypeScript:** Uso obrigatório de tipagem estrita em todo o código.
- **Assincronia:** Uso de `async/await` com tratamento de erros centralizado.
- **Componentização:** Preferência por componentes funcionais modulares.
- **Padronização:** Manter a separação clara entre lógica de negócio (services) e camada de transporte (controllers).

## 🛡️ Regras de Negócio e Boas Práticas
- **Segurança:** Nunca expor arquivos sensíveis diretamente via Express. Usar rotas autenticadas (`authenticateToken`) e sanitizar entradas (`path.basename`) para prevenir Path Traversal.
- **Autenticação:** O acesso é baseado em papéis (`roles`). Middleware de autorização deve ser aplicado em todas as rotas protegidas.
- **Banco de Dados:** Transações devem ser realizadas via Prisma para garantir atomicidade. Operações críticas de estoque/ dispensação exigem transações seguras.
- **Ambiente:** Variáveis de ambiente críticas (ex: `JWT_SECRET`) devem ser validadas no boot do servidor. O servidor deve abortar se faltarem configurações críticas.

## 🤖 Instruções para Futuros Agentes
- **Priorize a manutenibilidade:** Não introduza hacks; utilize transações Prisma ou middleware adequado para lógica complexa.
- **Segurança em primeiro lugar:** Antes de criar novas rotas de acesso a arquivos ou dados sensíveis, certifique-se de que a autenticação e autorização foram aplicadas.
- **Conformidade:** Toda nova funcionalidade deve respeitar a estrutura de 3 camadas no backend.
- **Resiliência:** Ao adicionar novos limitadores de taxa (Rate Limiters), diferencie logicamente entre ambientes de desenvolvimento e produção para evitar instabilidade.
