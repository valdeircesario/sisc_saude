# Documentação - Histórico de Dispensações

## Visão Geral

Implementação de uma funcionalidade completa para listar e visualizar todas as dispensações de receitas de forma organizada, agrupadas por receita com possibilidade de expandir detalhes.

---

## Arquivos Criados

### 1. `src/components/DispensacoesLista.tsx`

**Responsabilidade:** Componente React que exibe o histórico de dispensações

**Funcionalidades:**

- ✅ Lista todas as dispensações agrupadas por receita
- ✅ Exibe em uma linha: paciente, médico, UBS, data
- ✅ Ordena por data (mais recente primeiro)
- ✅ Seta de expandir para receitas com múltiplas dispensações
- ✅ Exibe detalhes de cada dispensação ao expandir
- ✅ Carregamento assíncrono da API

**Estrutura de Dados Exibida:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Paciente | Médico | UBS | Data | Total Dispensações | [▼]      │
├─────────────────────────────────────────────────────────────────┤
│ ├─ Dispensação 1  [✓ Completa]   Data | Medicamento | Obs...   │
│ ├─ Dispensação 2  [⚠ Parcial]    Data | Medicamento | Obs...   │
│ └─ Dispensação 3  [✓ Completa]   Data | Medicamento | Obs...   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Arquivos Modificados

### 1. `server/routes/farmacia.js`

**Nova Rota:**

```javascript
GET / farmacia / dispensacoes / listar / todas;
```

**Responsabilidade:** Retorna todas as dispensações agrupadas por receita

**Resposta:**

```json
{
  "total": 5,
  "dispensacoes": [
    {
      "receitaId": "uuid",
      "registroAssinatura": "REC-2024-00123",
      "paciente": "João Silva",
      "medico": "Dr. Carlos",
      "ubs": "UBS Centro",
      "dataPrimeiraDispensacao": "2026-05-30T10:30:00Z",
      "totalDispensacoes": 2,
      "dispensacoes": [
        {
          "id": "uuid",
          "dataDispensacao": "2026-05-30T10:30:00Z",
          "statusDispensacao": "completa",
          "medicamentoFornecido": "Amoxicilina 500mg",
          "farmaciaResponsavel": "Farmacêutico João",
          "observacoesDispensacao": null,
          "farmacia": "Farmácia Central"
        },
        {
          "id": "uuid",
          "dataDispensacao": "2026-05-29T14:20:00Z",
          "statusDispensacao": "parcial",
          "medicamentoFornecido": "Ibuprofeno 400mg",
          "farmaciaResponsavel": "Farmacêutico Maria",
          "observacoesDispensacao": "Medicamento indisponível",
          "farmacia": "Farmácia Central"
        }
      ]
    }
  ]
}
```

**Características:**

- Busca todas as receitas com dispensações
- Seleciona apenas campos necessários
- Agrupa dispensações por receita
- Ordena por data descendente
- Filtra apenas receitas com dispensações

### 2. `src/pages/dashboards/FarmaciaDashboards.tsx`

**Mudanças:**

- ✅ Adicionado import: `History` do lucide-react
- ✅ Adicionado import: `DispensacoesLista` do componente
- ✅ Adicionado tipo "historico" ao activeTab
- ✅ Adicionado botão "Histórico" na sidebar
- ✅ Adicionado renderização condicional para aba histórico
- ✅ Atualizado pageTitle e pageDescription

---

## Fluxo de Funcionamento

### 1. **Frontend - Acesso à Feature**

```
Usuário clica em "Histórico"
  ↓
activeTab muda para "historico"
  ↓
DispensacoesLista é renderizado
```

### 2. **DispensacoesLista - Carregamento**

```
useEffect (montagem do componente)
  ↓
Faz GET /farmacia/dispensacoes/listar/todas
  ↓
Armazena em state: dispensacoes
  ↓
Renderiza lista
```

### 3. **Interação com Expandir**

```
Usuário clica na seta [▼]
  ↓
toggleExpandir() adiciona receitaId ao set expandidos
  ↓
Estado muda, componente re-renderiza
  ↓
Detalhes da dispensação aparecem com animação
```

### 4. **Formatação de Dados**

```
formatarData(iso8601) → DD/MM/YYYY HH:MM

obterCorStatus(status) → {
  "completa": { bg: verde, text: verde-escuro, border: verde-claro },
  "parcial": { bg: amarelo, text: marrom, border: amarelo-claro }
}
```

---

## Estilos CSS

### Classes Principais

| Classe              | Função                                                         |
| ------------------- | -------------------------------------------------------------- |
| `.dl-container`     | Container principal                                            |
| `.dl-header`        | Cabeçalho com título e contagem                                |
| `.dl-row`           | Linha de receita                                               |
| `.dl-row-main`      | Grid com colunas: paciente, médico, UBS, data, contagem, botão |
| `.dl-expand-btn`    | Botão de expandir (seta)                                       |
| `.dl-details`       | Container de detalhes expandidos                               |
| `.dl-detail-item`   | Cada dispensação dentro dos detalhes                           |
| `.dl-detail-status` | Badge de status (completa/parcial)                             |

### Animações

- **slideDown**: Expansão suave dos detalhes (0.3s)
- **Hover**: Mudança de fundo na linha

---

## Validações e Segurança

### Backend

- ✅ Autenticação obrigatória (token)
- ✅ Autorização obrigatória (role: farmacia)
- ✅ Filtro apenas receitas com dispensações
- ✅ Seleção de campos específicos (não retorna dados sensíveis desnecessários)

### Frontend

- ✅ Tratamento de erros com toast
- ✅ Estado de carregamento
- ✅ Mensagem quando não há dispensações
- ✅ Formatação segura de datas

---

## Exemplo de Uso

### Acesso à Feature

1. Farmacêutico entra no Dashboard da Farmácia
2. Clica na aba "Histórico" (novo botão na sidebar)
3. Lista com todas as dispensações é carregada
4. Clica na seta [▼] para expandir uma receita com múltiplas dispensações
5. Visualiza todos os detalhes de cada dispensação

### Informações Exibidas

**Na Linha Principal:**

- Nome do paciente
- Nome do médico que prescreveu
- UBS onde a receita foi emitida
- Data da dispensação mais recente
- Total de dispensações (ex: "3 dispensações")
- Seta de expandir (se > 1 dispensação)

**Nos Detalhes Expandidos:**

- Número sequencial da dispensação
- Status (✓ Completa / ⚠ Parcial)
- Data e hora exata
- Medicamento fornecido
- Farmácia responsável
- Observações (se houver)

---

## Próximos Passos (Opcional)

1. **Filtros Avançados:**
   - Por data (range)
   - Por status (completa/parcial)
   - Por paciente
   - Por médico

2. **Exportação:**
   - Exportar para PDF
   - Exportar para Excel
   - Imprimir

3. **Busca:**
   - Search por nome do paciente
   - Search por médico
   - Search por UBS

4. **Paginação:**
   - Carregar mais (load more)
   - Paginação com limite de linhas

5. **Auditoria:**
   - Log de quem visualizou
   - Timestamp de acesso

---

## Troubleshooting

### Problema: Nenhuma dispensação é exibida

**Solução:**

- Verifique se existem dispensações no banco de dados
- Confirme que a rota `/farmacia/dispensacoes/listar/todas` está funcionando
- Abra DevTools → Network e veja a resposta da API

### Problema: Erro ao carregar

**Solução:**

- Verifique se o usuário tem role "farmacia"
- Verifique se o token de autenticação é válido
- Veja os logs no servidor

### Problema: Detalhes não expandem

**Solução:**

- Verifique se o componente está renderizado corretamente
- Abra DevTools → Console e veja erros
- Confirme que a receita tem `totalDispensacoes > 1`
