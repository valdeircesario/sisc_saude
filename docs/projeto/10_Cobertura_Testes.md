# Análise de Cobertura de Testes - Sisc Saúde

Este documento apresenta a análise atual da cobertura de testes automatizados do sistema Sisc Saúde.

## 📊 Resumo da Cobertura

*   **Cobertura Estimada:** 0%
*   **Testes Automatizados Identificados:** Nenhum.

---

## 🔍 Funcionalidades Identificadas

### 1. Funcionalidades Não Cobertas (100% do sistema)
Atualmente, não existem testes automatizados para nenhuma funcionalidade do sistema. Isso inclui:

*   **Autenticação e Autorização:** Fluxos de login, geração de tokens JWT, middlewares de restrição por cargo.
*   **Módulos de Saúde:** Lógica de negócio de UBS, UPA, Hospital, Laboratório.
*   **Dispensação de Receitas:** O módulo mais crítico, que envolve validações complexas, transações de banco de dados (Prisma) e regras de negócio de estoque.
*   **Notificações In-app:** Gatilhos e persistência de notificações.
*   **Manipulação de Arquivos:** Sanitização e download seguro de laudos/exames.

---

## 🚨 Lacunas Críticas

A ausência total de testes coloca o projeto em uma posição de alto risco técnico:

1.  **Riscos de Regressão:** Qualquer alteração na lógica de negócio (especialmente em `services/`) pode quebrar funcionalidades existentes sem aviso prévio.
2.  **Refatoração Insegura:** A refatoração solicitada anteriormente (separação em camadas) foi feita baseada em revisão manual. Sem testes, não temos garantia de que o comportamento se manteve idêntico.
3.  **Integração com Banco:** As transações (`Prisma`) não são validadas, aumentando o risco de inconsistência de dados (ex: estoque baixado mas dispensa não registrada).

---

## 🚀 Recomendações de Priorização

Para elevar a cobertura de forma eficiente, a prioridade deve ser:

1.  **Módulo de Dispensação (`server/services/farmaciaService.js`):** Por ser a lógica mais complexa e crítica do sistema.
2.  **Camada de Autenticação (`server/middleware/auth.js`):** Para garantir que as restrições de segurança funcionem corretamente.
3.  **Validadores (`utils/dispensacaoUtils.js`):** Testes unitários para validar a lógica de "pode dispensar" (completa/parcial).

*Esta situação corrobora a avaliação de "Testabilidade: 4/10" dada anteriormente e reforça a necessidade urgente da implementação do plano de testes descrito em `docs/08_Testes.md`.*
