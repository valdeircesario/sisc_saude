# Autenticação e Autorização

O sistema utiliza **JWT (JSON Web Token)** para autenticação, gerenciado via `AuthContext` no frontend e middlewares no backend.

## Mecanismos
- **`AuthContext`:** Armazena token e usuário no `localStorage`.
- **`authenticateToken`:** Middleware para validar JWT.
- **`authorizeRole`:** Middleware para restrição de acesso por tipo de usuário.
