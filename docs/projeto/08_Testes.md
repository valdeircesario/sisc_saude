# Estratégia de Testes - Sisc Saúde

Este documento define a estratégia de testes automatizados e manuais para garantir a estabilidade e qualidade do Sisc Saúde, elevando a confiabilidade do sistema.

## 🎯 Objetivo
Eliminar a ausência de testes e assegurar que novas funcionalidades ou refatorações não introduzam regressões em fluxos críticos (dispensação, autenticação, prontuários).

## 🧪 Categorias de Testes

### 1. Testes Unitários
*   **Foco:** Funções puras, utilitários (`dispensacaoUtils.ts`) e lógica de negócio isolada.
*   **Ferramentas:** Vitest (Frontend), Jest (Backend).
*   **Aplicação:** Validar cálculos de estoque, validações de senha, formatação de datas e regras de dispensa.

### 2. Testes de API
*   **Foco:** Endpoints REST, middlewares de autenticação, validação de inputs e status HTTP.
*   **Ferramentas:** Supertest + Jest.
*   **Aplicação:** Simular chamadas autenticadas e não autenticadas para garantir que rotas protegidas (`/api/farmacia`, `/api/paciente`) funcionem conforme esperado.

### 3. Testes de Integração
*   **Foco:** Interação entre `Services` e Banco de Dados (Prisma).
*   **Ferramentas:** Jest + Prisma (DB de teste dedicado).
*   **Aplicação:** Validar transações atômicas (ex: dispensar medicamento e baixar estoque simultaneamente), garantindo integridade de dados.

### 4. Testes E2E (End-to-End)
*   **Foco:** Fluxos completos de usuário.
*   **Ferramentas:** Playwright.
*   **Principais Cenários:**
    *   Fluxo de Login (Paciente e Sistema).
    *   Fluxo completo de Dispensação de Receita (consulta -> dispensa parcial -> dispensa completa).
    *   Cadastro de novo Paciente.

### 5. Testes de Regressão
*   **Foco:** Garantir que correções anteriores não voltem a ocorrer (ex: bug da dispensação, path traversal).
*   **Aplicação:** A cada nova versão, rodar suíte completa de testes. Caso um bug seja reportado, *antes* de corrigir, criar um teste automatizado que falha para aquele bug.

### 6. Testes Exploratórios
*   **Foco:** Casos de uso complexos e UX.
*   **Aplicação:** Sessões manuais focadas em testar edge cases (ex: conexões lentas, expiração de tokens inesperada, manuseio de arquivos PDF grandes).

---

## 🛠️ Stack Tecnológica Recomendada

| Tipo | Ferramenta |
| :--- | :--- |
| **Frontend Unit/Int** | Vitest + React Testing Library |
| **Backend Unit/API** | Jest + Supertest |
| **E2E** | Playwright |

## 🚀 Próximos Passos (Roadmap de Implementação)
1.  **Ambiente:** Configurar banco de dados de teste (Docker ou container separado).
2.  **Infra:** Instalar e configurar Vitest/Jest/Playwright.
3.  **POC:** Implementar testes para o módulo de `Dispensação` (serviço e API), que é o mais crítico e já possui regras claras.
4.  **Pipeline:** Integrar os testes ao CI/CD para rodar em cada *push*.
