# Gestão de Dependências - Sisc Saúde

Este documento mapeia as dependências dos projetos Frontend e Backend, avaliando sua criticidade, estado de atualização e potenciais riscos.

## 📊 Mapeamento Geral

| Dependência | Versão | Nível | Categoria | Status |
| :--- | :--- | :--- | :--- | :--- |
| `react` / `react-dom` | ^18.3.1 | Crítica | Frontend | Atual |
| `express` | ^4.18.2 | Crítica | Backend | Estável |
| `@prisma/client` / `prisma` | ^5.7.1 | Crítica | Banco | Atual |
| `axios` | ^1.6.2 | Crítica | Frontend | Atual |
| `react-query` | ^3.39.3 | Alta | Frontend | **Obsoleta** |
| `jsonwebtoken` | ^9.0.2 | Crítica | Backend | Atual |
| `bcryptjs` | ^2.4.3 | Alta | Backend | Atual |
| `helmet` | ^7.1.0 | Alta | Backend | Atual |

---

## 🔍 Análise de Riscos

### 1. Dependências Críticas
*   **Prisma:** O ORM é a espinha dorsal da persistência de dados. A versão 5.x é robusta, mas exige atualizações frequentes para garantir performance.
*   **Express & JWT:** Essenciais para a segurança e roteamento da API.
*   **React:** Base do frontend.

### 2. Dependências Obsoletas
*   **react-query (v3):** Esta versão está defasada. A versão atual é a v5 (agora `@tanstack/react-query`). O upgrade trará melhorias de performance e refatoração da API, mas exigirá alterações significativas no código.

### 3. Possíveis Dependências Sem Uso
*   Com base em uma análise superficial dos arquivos, não foram identificadas dependências óbvias sem uso. Recomenda-se o uso da ferramenta `depcheck` para uma análise precisa.

### 4. Vulnerabilidades
*   Embora não tenhamos rodado `npm audit`, o projeto utiliza pacotes populares. Vulnerabilidades *zero-day* em pacotes como `express` ou `jsonwebtoken` são riscos inerentes.

---

## 🚀 Recomendações de Gestão

1.  **Monitoramento:** Integrar `npm audit` no pipeline de CI/CD para identificar vulnerabilidades conhecidas a cada build.
2.  **Atualização de Stack:**
    *   **Imediata:** Planejar o upgrade de `react-query` v3 para `@tanstack/react-query` v5. Isso deve ser feito com cautela, pois há *breaking changes*.
    *   **Periódica:** Rodar `npm outdated` mensalmente para identificar pacotes que podem ser atualizados com segurança (`npm update`).
3.  **Limpeza:** Utilizar `npx depcheck` no projeto frontend e backend para remover dependências não listadas nos arquivos de origem.
4.  **Segurança de Supply Chain:** Evitar a instalação de pacotes desconhecidos sem antes verificar o número de downloads e a atividade no GitHub.

---
*Este documento deve ser atualizado sempre que uma dependência crítica for alterada ou o projeto passar por uma refatoração de infraestrutura.*
