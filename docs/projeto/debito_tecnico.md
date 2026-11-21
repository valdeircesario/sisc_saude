# Débito Técnico

- **Desenvolvimento:** O `authLimiter` é muito rígido para ambiente de desenvolvimento (erro 429 frequente), necessitando ajuste.
- **Configuração:** `baseURL` do Axios hardcoded em `api.ts`.
- **Estado:** Uso de `localStorage` para tokens (considerar `httpOnly` cookies).
