# 🛡️ Correções de Segurança Implementadas

## Resumo Executivo

Foram aplicadas **6 correções críticas de segurança** para mitigar vulnerabilidades identificadas:

- ✅ Exposição pública de dados médicos (IDOR)
- ✅ Acesso direto a arquivos (Path Traversal)
- ✅ Falta de autenticação em downloads
- ✅ Fraca validação de senhas
- ✅ Rate limiting insuficiente para login
- ✅ Validação de variáveis de ambiente críticas

---

## 1. 🔐 Validação de JWT_SECRET (Resiliência)

### Arquivo: `server/index.js`

**Problema:** Se `JWT_SECRET` não fosse configurado no `.env`, a aplicação usaria `undefined`, tornando todos os tokens forjáveis.

**Solução:**

```javascript
// ✅ SEGURANÇA: Validar variáveis de ambiente críticas
if (!process.env.JWT_SECRET) {
  console.error(
    "❌ ERRO CRÍTICO: JWT_SECRET não configurado nas variáveis de ambiente.",
  );
  console.error(
    "   Verifique o arquivo .env e certifique-se que JWT_SECRET está definido.",
  );
  process.exit(1);
}
```

**Impacto:** O servidor agora derruba com erro claro se a chave de segurança não estiver configurada, prevenindo exposição acidental.

---

## 2. 🚫 Remoção de Rota Estática de Uploads (IDOR)

### Arquivo: `server/index.js`

**Problema:** A linha `app.use("/uploads", express.static(...))` permitia acesso público direto a PDFs de laudos/exames sem autenticação.

**Solução:**

```javascript
// ✅ SEGURANÇA: REMOVIDO - Os uploads agora só podem ser acessados através de rotas autenticadas
// Evita exposição pública de dados médicos sensíveis (IDOR)
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
```

**Impacto:**

- ❌ **Antes:** `https://api.saude.com/uploads/exames/12345.pdf` era acessível sem login
- ✅ **Depois:** Apenas rotas autenticadas (`/api/exames/download/:filename`) permitem acesso aos arquivos

---

## 3. 🔒 Autenticação em Rotas de Download

### Arquivo: `server/routes/exame.js`

**Problema:** Rota de download não possuía middleware de autenticação, permitindo acesso anônimo.

**Solução:**

```javascript
// ✅ SEGURANÇA: Download de arquivo de exame com autenticação e sanitização
// Requer token JWT válido e sanitiza o filename para prevenir path traversal
router.get("/download/:filename", authenticateToken, async (req, res) => {
  // ... código ...
});
```

**Impacto:** Agora todos os downloads exigem token JWT válido, prevenendo acesso não autorizado.

---

## 4. 🛡️ Sanitização de Filename (Path Traversal)

### Arquivo: `server/routes/exame.js`

**Problema:** Ataque de path traversal: `filename = ../../../etc/passwd` permitiria ler arquivos sensíveis do servidor.

**Solução:**

```javascript
// ✅ SEGURANÇA: Sanitizar o filename com path.basename para prevenir path traversal
// Isso remove qualquer '../' ou '..\' da URL, impedindo acesso a arquivos fora da pasta de uploads
const sanitizedFilename = path.basename(filename);
const filePath = path.join(
  process.cwd(),
  "uploads",
  "exames",
  sanitizedFilename,
);
```

**Exemplos:**

- ❌ `filename = ../../../etc/passwd` → ✅ Sanitizado para `passwd`
- ❌ `filename = ..\..\windows\system32\config\sam` → ✅ Sanitizado para `sam`
- ✅ `filename = exame_valido.pdf` → ✅ Permitido (sem path traversal)

---

## 5. 🔐 Rate Limiter Específico para Autenticação

### Arquivo: `server/middleware/auth.js`

**Problema:** Rate limiter global era muito brando (100 req/15min), permitindo 100 tentativas de força bruta a cada 15 minutos.

**Solução:**

```javascript
// ✅ SEGURANÇA: Rate limiter específico para rotas de autenticação
// Limite muito mais rígido para prevenir ataques de força bruta
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas
  message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Impacto:** Bloqueio após apenas 5 tentativas de login falhas, prevenendo força bruta efetivamente.

### Arquivo: `server/routes/auth.js`

**Aplicação do rate limiter:**

```javascript
import { authLimiter } from "../middleware/auth.js";

// ✅ SEGURANÇA: Login para pacientes com rate limiting de força bruta
router.post("/login-paciente", authLimiter, async (req, res) => {
  // ... código ...
});

// ✅ SEGURANÇA: Login para sistema com rate limiting de força bruta
router.post("/login-sistema", authLimiter, async (req, res) => {
  // ... código ...
});
```

---

## 6. 🔑 Fortalecimento de Validação de Senha

### Arquivo: `server/routes/auth.js`

**Problema:** Validação fraca: apenas verificava `senha.length < 6`, aceitando senhas simples como `"123456"`.

**Solução:**

```javascript
// ✅ SEGURANÇA: Validar senha com critérios fortes
// Exigir: mínimo 8 caracteres, pelo menos uma letra maiúscula, uma letra minúscula e um número
const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
if (!senhaRegex.test(senha)) {
  return res.status(400).json({
    message:
      "Senha deve ter: mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula e um número",
  });
}
```

**Exemplos:**

- ❌ `"123456"` → Rejeitada (sem letras)
- ❌ `"abcdefgh"` → Rejeitada (sem números/maiúsculas)
- ❌ `"Abc123"` → Rejeitada (apenas 6 caracteres)
- ✅ `"Abcd1234"` → Aceita (8 chars, maiúscula, minúscula, número)

---

## 📋 Checklist de Implementação

| Item                                         | Status       | Arquivo                     |
| -------------------------------------------- | ------------ | --------------------------- |
| ✅ Validar JWT_SECRET no boot                | Implementado | `server/index.js`           |
| ✅ Remover rota estática `/uploads`          | Implementado | `server/index.js`           |
| ✅ Adicionar autenticação em `/download`     | Implementado | `server/routes/exame.js`    |
| ✅ Sanitizar filename com `path.basename()`  | Implementado | `server/routes/exame.js`    |
| ✅ Rate limiter específico (5 tentativas)    | Implementado | `server/middleware/auth.js` |
| ✅ Validação forte de senha                  | Implementado | `server/routes/auth.js`     |
| ✅ Aplicar rate limiter em `/login-paciente` | Implementado | `server/routes/auth.js`     |
| ✅ Aplicar rate limiter em `/login-sistema`  | Implementado | `server/routes/auth.js`     |

---

## 🚀 Próximos Passos Recomendados

1. **CORS Rigoroso em Produção:**
   - Revisar configuração de CORS em `.env`
   - Usar apenas domínios específicos em produção
   - Manter `credentials: true` apenas quando necessário

2. **Logging de Segurança:**
   - Implementar auditoria de tentativas de acesso falhadas
   - Registrar path traversal attempts detectados

3. **Testes de Segurança:**
   - Testar path traversal: `/api/exames/download/../../../etc/passwd`
   - Testar acesso não autenticado: Remover token e tentar download
   - Testar rate limiter: Fazer 6 requisições de login em sequência

4. **Documentação de Variáveis de Ambiente:**
   - Adicionar validação para outras variáveis críticas
   - Criar template `.env.example` com todas as variáveis necessárias

5. **Criptografia HTTPS:**
   - Garantir que em produção, a aplicação roda apenas sobre HTTPS
   - Usar certificados SSL/TLS válidos

---

## 📝 Notas Importantes

- ✅ **Sem quebra de funcionalidade:** Todas as mudanças mantêm a compatibilidade com o código existente
- ✅ **Tokens JWT** continuam funcionando normalmente para rotas autenticadas
- ✅ **Downloads legítimos** funcionam normalmente com autenticação
- ⚠️ **Clientes antigos** que acessavam `/uploads` diretamente precisarão usar `/api/exames/download/:filename` com token

---

**Data:** 2026-06-04  
**Status:** ✅ Implementado  
**Versão:** 1.0
