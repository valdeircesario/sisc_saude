# Auditoria de Segurança - Sisc Saúde

Esta auditoria avalia a postura de segurança do Sisc Saúde, identificando proteções ativas e vetores de risco.

## 📊 Resumo da Auditoria

| Critério | Status | Observação |
| :--- | :--- | :--- |
| **Autenticação** | ✅ Bom | Uso de JWT, mas com risco via `localStorage`. |
| **Autorização** | ✅ Excelente | Middleware `authorizeRole` robusto. |
| **JWT** | ⚠️ Atenção | Necessidade de validação de expiração e refresh token. |
| **Uploads** | ✅ Excelente | Proteção contra Path Traversal e IDOR implementada. |
| **APIs** | ✅ Bom | Uso de `helmet` e rate limiting global. |
| **Prisma** | ✅ Excelente | Abstração previne SQL Injection (se usado via ORM). |
| **Validações** | ⚠️ Atenção | Limite de upload (10MB) e sanitização de inputs. |
| **XSS** | ⚠️ Atenção | Risco devido ao armazenamento de token em `localStorage`. |
| **CSRF** | ❌ Crítico | Nenhuma proteção explícita implementada. |
| **Exposição de Dados** | ✅ Bom | Uploads privados; validar retornos dos controllers. |

---

## 🔍 Análise Detalhada

### 1. Autenticação e JWT
*   **Pontos Fortes:** Implementação sólida com middlewares e validação de `JWT_SECRET`.
*   **Riscos:** O token é armazenado no `localStorage`, que é acessível via scripts maliciosos (XSS).
*   **Recomendação:** Migrar para `HttpOnly Cookies` para armazenamento de tokens.

### 2. Autorização (RBAC)
*   **Pontos Fortes:** O padrão `authorizeRole(['admin', ...])` é simples, eficaz e aplicado de forma consistente nas rotas.

### 3. Uploads e Arquivos
*   **Pontos Fortes:** Rota `/uploads` pública foi removida. Download exige autenticação e sanitização com `path.basename`.
*   **Riscos:** Falta de limitação de *mimetype* (ex: impedir upload de arquivos executáveis `.exe`, `.js`).

### 4. APIs, Validação e Segurança
*   **SQL Injection:** O Prisma previne nativamente. É crucial garantir que nenhum `queryRaw` utilize interpolação de strings insegura.
*   **Rate Limiting:** Global implementado, mas o `authLimiter` específico precisa de ajuste fino para não afetar o desenvolvimento.
*   **XSS:** React protege contra XSS em inputs de renderização, mas não protege o `localStorage` do usuário.
*   **CSRF:** Sem proteção. Embora JWT geralmente ajude, se usado em `Authorization` header no Axios, requer validação de `Origin`/`Referer`.

### 5. Exposição de Dados Sensíveis
*   **Recomendação:** Auditar `controllers` (especialmente `pacienteController.js` e `funcionarioController.js`) para garantir que campos como `senha` nunca sejam retornados nas respostas JSON.

---

## 🚀 Recomendações de Ação

1.  **Imediata:**
    *   Revisar todos os `controllers` para garantir que campos sensíveis (`senha`, `hash`) nunca saiam na resposta da API (`JSON.stringify` ou Prisma `select`).
    *   Implementar limitação de `mimetype` e extensão no `multer` para uploads de exames.

2.  **Médio Prazo:**
    *   Migrar armazenamento de JWT de `localStorage` para `HttpOnly Cookies` (require alterações no backend para set-cookie e frontend para remover armazenamento manual).
    *   Implementar proteção contra CSRF caso o sistema migre para cookies.

3.  **Longo Prazo:**
    *   Implementar *Refresh Tokens* para diminuir o tempo de vida do JWT principal.
    *   Auditoria periódica de segurança automática (ex: `npm audit`).

---
*A segurança é um processo contínuo. Esta auditoria deve ser revisada a cada nova funcionalidade crítica.*
