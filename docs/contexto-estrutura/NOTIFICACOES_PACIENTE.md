# Notificações do Paciente — Implementação

Documento que descreve a funcionalidade de notificações in-app para pacientes no Sisc Saúde.

---

## Objetivo

Informar o paciente automaticamente quando houver alterações relevantes no seu prontuário ou agendamentos, como:

- Consultas agendadas, canceladas ou realizadas
- Retornos médicos agendados
- Histórico médico registrado
- Receitas e atestados emitidos
- Exames solicitados, agendados ou com resultado
- Vacinas registradas
- Campanhas agendadas
- Internações (status, início, alta)
- Dispensações na farmácia

---

## Banco de dados

### Modelo `Notificacao` (`server/prisma/schema.prisma`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String | ID único (cuid) |
| `pacienteId` | String | Paciente destinatário |
| `titulo` | String | Título curto |
| `mensagem` | String | Texto descritivo |
| `tipo` | String | `CONSULTA`, `EXAME`, `RECEITA`, `DISPENSACAO`, `VACINA`, `INTERNACAO`, `HISTORICO`, `CAMPANHA`, `SISTEMA` |
| `acao` | String? | Ex.: `AGENDADA`, `CANCELADA`, `RESULTADO_DISPONIVEL` |
| `lida` | Boolean | Default `false` |
| `referenciaId` | String? | ID do registro relacionado |
| `createdAt` | DateTime | Data de criação |

Índice: `[pacienteId, lida, createdAt(sort: Desc)]`

### Aplicar no banco (sem apagar dados)

```bash
cd server
npx prisma generate
npx prisma db push
```

> `db push` sincroniza o schema **sem reset** — dados existentes são preservados.

---

## Backend

### Serviço central: `server/services/notificacaoService.js`

| Função | Uso |
|--------|-----|
| `criarNotificacao(data)` | Insere notificação |
| `criarNotificacaoSegura(data)` | Insere com try/catch — **nunca quebra a operação principal** |
| `listarNotificacoes(pacienteId, opts)` | Lista paginada |
| `contarNaoLidas(pacienteId)` | Contagem para badge |
| `marcarComoLida(id, pacienteId)` | Marca uma como lida |
| `marcarTodasComoLidas(pacienteId)` | Marca todas |
| `notificarConsultaAgendada`, etc. | Helpers por domínio |

### API REST (portal do paciente)

Todas as rotas usam `authorizePaciente` em `server/routes/paciente.js`:

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/paciente/notificacoes` | Lista (`?lida=false&limit=20&page=1`) |
| GET | `/api/paciente/notificacoes/contagem` | `{ naoLidas: N }` |
| PUT | `/api/paciente/notificacoes/:id/lida` | Marca uma como lida |
| PUT | `/api/paciente/notificacoes/marcar-todas-lidas` | Marca todas |

### Gatilhos (onde as notificações são criadas)

| Service | Eventos |
|---------|---------|
| `ubsService.js` | Agendar/cancelar consulta, agendar campanha, solicitar internação |
| `funcionarioService.js` | Histórico, receita, atestado, vacina, exame solicitado, retorno |
| `laboratorioService.js` | Exame agendado, resultado disponível |
| `hospitalService.js` | Status internação, internação iniciada, alta hospitalar |
| `farmaciaService.js` | Dispensação de receita |

**Regra:** notificações são side effects **após** a operação principal ter sucesso. Falha na notificação só gera log no console.

**Não notifica:** ações feitas pelo próprio paciente (ex.: cancelar consulta pelo portal).

---

## Frontend

### Hook: `src/hooks/useNotificacoes.ts`

- React Query com polling de contagem a cada 60s
- Mutations para marcar lida / marcar todas

### Componente: `src/components/Paciente/PacienteNotificacoesBell.tsx`

- Sino com badge no header do `PacienteDashboard`
- Dropdown com lista de notificações
- Clique navega para a aba correspondente (`TAB_POR_TIPO`)

| Tipo | Aba |
|------|-----|
| CONSULTA | consultas |
| HISTORICO | historico |
| EXAME | exames |
| RECEITA / DISPENSACAO | receitas |
| VACINA | vacinas |
| INTERNACAO | internacoes |
| CAMPANHA | home |

---

## Fluxo ponta a ponta

```
UBS agenda consulta
    → ubsService.agendarConsulta()
    → notificarConsultaAgendada() [seguro]
    → INSERT notificacoes

Paciente abre portal
    → GET /paciente/notificacoes/contagem
    → Badge no sino

Paciente clica notificação
    → PUT /paciente/notificacoes/:id/lida
    → Navega para aba "consultas"
```

---

## Teste manual

1. Login como UBS/funcionário e agende uma consulta para um paciente
2. Login como paciente
3. Verifique o sino com badge
4. Clique na notificação e confirme navegação para a aba correta

---

*Implementado em Junho/2026.*
