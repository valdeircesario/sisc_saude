# Segurança

O sistema implementa práticas robustas de segurança:

- **IDOR:** Bloqueio de acesso direto a arquivos sensíveis (uploads).
- **Path Traversal:** Sanitização de filenames.
- **Rate Limiting:** Proteção contra força bruta (auth) e DoS (global).
- **Criptografia:** Senhas com `bcryptjs`.
- **Validação:** Verificação rigorosa de variáveis de ambiente (`JWT_SECRET`).
