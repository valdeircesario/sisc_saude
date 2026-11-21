# Matriz de Riscos - Sisc Saúde

Este documento mapeia os principais riscos identificados na arquitetura e operação do Sisc Saúde, visando orientar futuras ações de mitigação e monitoramento.

## 📊 Matriz de Riscos

| Categoria | Risco | Impacto | Mitigação Atual | Ação Recomendada |
| :--- | :--- | :--- | :--- | :--- |
| **Crítico** | Falha no Banco de Dados (SPOF) | Alta | Conexão via `Prisma` | Implementar backup automático e monitoramento (uptime). |
| **Funcional** | Erro na transação de Dispensação | Alta | Transações Prisma | Implementar testes de integração automatizados. |
| **Segurança** | Path Traversal / IDOR | Alta | Sanitização e autenticação | Auditoria periódica de rotas de download. |
| **Segurança** | Credenciais vazadas | Alta | Validação de variáveis no boot | Segregação de segredos (secrets management). |
| **Disponibilidade**| Rate Limiter (Self-DoS) | Média | Limites de requisição | Ajustar limites por ambiente (dev vs prod). |
| **Disponibilidade**| Queda do servidor único | Alta | N/A | Implementar orquestração (PM2) ou containers. |
| **Integridade** | Perda de arquivos (PDFs) | Média | File system local | Implementar backup de volume ou storage em nuvem. |

---

## 🔍 Detalhamento dos Riscos

### 1. Funcionalidades Críticas
*   **Autenticação/Autorização:** Se o servidor JWT falhar ou as chaves forem comprometidas, todo o acesso ao sistema é invalidado ou exposto.
*   **Dispensação de Receitas:** Lógica complexa que envolve estoque e integridade. Falhas aqui resultam em erros médicos graves.
*   **Prontuário Médico:** Dados sensíveis. Exposição incorreta viola conformidade (LGPD/Leis de saúde).

### 2. Pontos Únicos de Falha (SPOF)
*   **Servidor Express Único:** Atualmente rodando como um único processo. Se o Node.js falhar, o serviço para.
*   **Banco de Dados Único:** Não há estratégia de *failover* ou redundância configurada.

### 3. Riscos de Segurança
*   **Broken Access Control:** Embora mitigado, novas rotas podem esquecer middlewares de `authorizeRole`.
*   **Sanitização de Input:** Confiança em `path.basename`. Caso novas formas de upload ou manipulação de arquivos surjam, a sanitização pode ser contornada.

### 4. Riscos de Indisponibilidade
*   **Configuração de Rate Limiter:** Como identificado, a configuração atual causa erros 429 durante o desenvolvimento, podendo causar negação de serviço em cenários reais de alto tráfego se não ajustada.
*   **Validação Crítica de Ambiente:** O uso de `process.exit(1)` no `index.js` para variáveis ausentes é correto para segurança, mas causa downtime imediato se a infraestrutura falhar ao injetar variáveis.

### 5. Riscos de Perda de Dados
*   **Falta de Backups:** Não há evidência de rotinas de backup para o banco de dados (PostgreSQL) ou para a pasta `/uploads` (exames PDF).
*   **Atomicidade de Transação:** Embora o Prisma suporte transações, erros na implementação de lógica de negócio (serviços) podem deixar registros inconsistentes (ex: dispensação criada, mas estoque não reduzido).

---
*Este documento deve ser revisado trimestralmente ou sempre que houver mudanças estruturais significativas no sistema.*
