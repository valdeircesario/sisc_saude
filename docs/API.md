# API - Sisc Saúde

Documentação completa dos endpoints da API REST do sistema.

## Notas Gerais
- Todas as rotas de API possuem prefixo `/api`.
- Autenticação necessária via `Authorization: Bearer <token>` para a maioria das rotas.
- Erros comuns:
  - `401 Unauthorized`: Token ausente ou inválido.
  - `403 Forbidden`: Usuário não tem permissão para esta rota (RBAC).
  - `429 Too Many Requests`: Rate limit atingido.
  - `500 Internal Server Error`: Erro no servidor.

---

## 1. Auth (`/api/auth`)
| Método | Endpoint | Descrição | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/login-paciente` | Login de paciente | Não |
| `POST` | `/login-sistema` | Login de funcionários/outros | Não |
| `POST` | `/register-paciente`| Registro de paciente | Não |

---

## 2. Admin (`/api/admin`)
*Requer role: `admin`*
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET/POST/PUT/DELETE` | `/ubs`, `/hospitais`, `/laboratorios`, `/upas`, `/farmacias` | Gestão de entidades |

---

## 3. UBS (`/api/ubs`)
*Requer role: `ubs` ou `funcionario`*
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/hospitais` | Listar hospitais |
| `GET` | `/pacientes` | Listar pacientes |
| `POST` | `/pacientes/:id/agendar-consulta` | Agendar consulta |
| `POST` | `/solicitar-internacao` | Solicitar internação |

---

## 4. Funcionário (`/api/funcionario`)
*Requer role: `funcionario`*
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/receitas` | Registrar receita médica |
| `POST` | `/dispensar-receita` | Dispensação (legado) |
| `POST` | `/dispensar-medicamentos`| Dispensação em massa |

---

## 5. Paciente (`/api/paciente`)
*Requer role: `paciente`*
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/perfil` | Dados do perfil |
| `GET` | `/historico-medico` | Histórico |
| `GET` | `/exames` | Exames |
| `GET` | `/notificacoes` | Listar notificações |

---

## 6. Farmácia (`/api/farmacia`)
*Requer role: `farmacia`*
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/receita/:registro` | Buscar receita |
| `POST` | `/dispensar` | Registrar dispensação |
| `PUT` | `/dispensacoes/:dispensacaoId` | Atualizar dispensação |

---

## 7. Exames (`/api/exames`)
| Método | Endpoint | Descrição | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/download/:filename` | Download seguro de exame | Sim |

---

*Esta documentação é um resumo. Verifique os arquivos em `server/routes/` para detalhes completos de parâmetros e respostas de cada endpoint.*
