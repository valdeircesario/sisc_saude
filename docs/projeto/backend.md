# Backend

O backend é construído em Node.js com Express, estruturado em camadas para garantir separação de responsabilidades.

## Camadas
1. **`routes/`:** Definição de endpoints.
2. **`controllers/`:** Processamento da requisição e lógica de negócio.
3. **`services/`:** Acesso a dados (via Prisma) e regras complexas.
4. **`middleware/`:** Segurança e validação.
5. **`config/`:** Conexão com banco de dados.
