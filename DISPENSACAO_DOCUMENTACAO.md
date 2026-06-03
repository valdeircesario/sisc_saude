# Sistema de Dispensação de Receitas - Documentação

## 📋 Resumo da Implementação

Criei um sistema completo de dispensação de receitas com as seguintes funcionalidades:

### ✅ Regras Implementadas

1. **Botão "Dispensar" aparece quando:**
   - A receita NÃO possui dispensações registradas
   - A receita possui dispensação(ões) mas tem uma com status "parcial"
   - Receita tem menos de 6 dispensações

2. **Botão "Dispensar" desaparece quando:**
   - Receita possui dispensação com status "completa"
   - Receita atingiu o máximo de 6 dispensações

3. **Funcionalidades:**
   - Registrar dispensação como "completa" ou "parcial"
   - Atualizar dispensação parcial
   - Deletar dispensação (apenas as parciais)
   - Listar todas as dispensações da receita com informações detalhadas
   - Máximo de 6 registros por receita

---

## 📁 Arquivos Criados/Modificados

### 1. **Backend - Utilitários**

**Arquivo:** `server/utils/dispensacaoUtils.js`

Funções auxiliares para gerenciar dispensações:

```javascript
// Verifica se pode dispensar
podeDispensar(dispensacoes);
// Retorna: { pode: boolean, motivo: string }

// Obtém última dispensação
obterUltimaDispensacao(dispensacoes);
// Retorna: Objeto dispensação ou null

// Verifica se é parcial
eDispensacaoParcial(dispensacao);

// Verifica se é completa
eDispensacaoCompleta(dispensacao);

// Conta dispensações por tipo
contarDispensacoes(dispensacoes);
// Retorna: { total, completas, parciais }

// Formata data
formatarDispensacao(dispensacao);
```

### 2. **Backend - Rotas**

**Arquivo:** `server/routes/farmacia.js`

#### GET `/farmacia/receita/:registro`

Busca receita com suas dispensações associadas.

**Parâmetros:**

- `registro`: Número do registro de assinatura

**Resposta:**

```json
{
  "id": "...",
  "registroAssinatura": "...",
  "medicamento": "...",
  "dispensacoes": [
    {
      "id": "...",
      "statusDispensacao": "completa|parcial",
      "medicamentoFornecido": "...",
      "observacoesDispensacao": "...",
      "farmaciaResponsavel": "...",
      "dataDispensacao": "..."
    }
  ]
}
```

#### POST `/farmacia/dispensar`

Registra uma nova dispensação.

**Parâmetros:**

```json
{
  "receitaId": "...",
  "farmaciaResponsavel": "...",
  "medicamentoFornecido": "...",
  "observacoesDispensacao": "...",
  "statusDispensacao": "completa|parcial"
}
```

**Validações:**

- ✓ Receita deve existir
- ✓ Não pode haver dispensação "completa" existente
- ✓ Máximo 6 dispensações por receita
- ✓ Status deve ser "completa" ou "parcial"

#### PUT `/farmacia/dispensacoes/:dispensacaoId`

Atualiza uma dispensação existente.

**Parâmetros:**

```json
{
  "medicamentoFornecido": "...",
  "observacoesDispensacao": "...",
  "statusDispensacao": "completa|parcial",
  "farmaciaResponsavel": "..."
}
```

**Validações:**

- ✓ Dispensação deve existir
- ✓ Não pode editar dispensação "completa"
- ✓ Ao mudar para "completa", valida que não há outra "completa"

#### DELETE `/farmacia/dispensacoes/:dispensacaoId`

Deleta uma dispensação.

**Validações:**

- ✓ Dispensação deve existir
- ✓ Não pode deletar dispensação "completa"

---

### 3. **Frontend - Hook**

**Arquivo:** `src/hooks/useDispensacao.ts`

Hook React com todas as funções necessárias para gerenciar dispensações:

```typescript
const {
  MAX_DISPENSACOES, // Constante: 6
  podeDispensar, // Valida se pode dispensar
  temDispensacaoParcial, // Verifica se existe parcial
  temDispensacaoCompleta, // Verifica se existe completa
  obterUltimaDispensacao, // Retorna última dispensação
  registrarDispensacao, // Cria nova dispensação (API call)
  atualizarDispensacao, // Atualiza dispensação (API call)
  deletarDispensacao, // Deleta dispensação (API call)
  contarDispensacoes, // Conta por tipo
  formatarDataDispensacao, // Formata data para exibição
} = useDispensacao();
```

---

### 4. **Frontend - Componente**

**Arquivo:** `src/pages/dashboards/FarmaciaDashboards.tsx`

#### Alterações principais:

1. **Importação do hook:**

```typescript
import useDispensacao from "../../hooks/useDispensacao";
```

2. **Estados adicionados:**

```typescript
const [editingDispensacaoId, setEditingDispensacaoId] = useState<string | null>(
  null,
);
```

3. **Uso do hook:**

```typescript
const dispensacao = useDispensacao();
```

4. **Função `openDispensacaoModal` atualizada:**

- Agora suporta edição de dispensação específica
- Recebe `dispensacaoId` como parâmetro
- Pré-preenche dados da dispensação ao editar

5. **Função `handleDispensacaoSubmit` atualizada:**

- Detecta se é criação ou atualização
- Faz PUT request para edição
- Faz POST request para criação
- Atualiza estado local após sucesso

6. **Lógica de visibilidade dos botões:**

```typescript
const validacaoDispensacao = receita
  ? dispensacao.podeDispensar(receita.dispensacoes)
  : { pode: false, motivo: null };

// Botão aparece apenas se pode dispensar
{validacaoDispensacao.pode && (
  <button onClick={() => openDispensacaoModal(false)}>
    Dispensar receita
  </button>
)}

// Botão de continuar parcial
{dispensacao.temDispensacaoParcial(receita.dispensacoes) && (
  <button onClick={() => ...}>
    Continuar parcial
  </button>
)}
```

7. **Exibição de informações:**

- Conta total de dispensações
- Exibe número de completas e parciais
- Mostra data da última dispensação
- Lista todas as dispensações com detalhes

---

## 🎯 Fluxo de Uso

### Cenário 1: Receita sem dispensação

1. Farmacêutico busca receita pelo registro
2. **Botão "Dispensar receita" aparece**
3. Clica e abre modal
4. Preenche dados e escolhe "completa" ou "parcial"
5. Clica "Registrar dispensação"

### Cenário 2: Receita com dispensação parcial

1. Farmacêutico busca receita
2. **Botões "Dispensar receita" e "Continuar parcial" aparecem**
3. Pode registrar nova dispensação (adiciona à lista)
4. Ou editar a dispensação parcial (atualiza a existente)

### Cenário 3: Receita com dispensação completa

1. Farmacêutico busca receita
2. **Nenhum botão de dispensação aparece**
3. Histórico mostra a dispensação completa
4. Não pode registrar mais

### Cenário 4: Receita com 6 dispensações

1. Receita atingiu limite
2. **Botão "Dispensar receita" não aparece**
3. Exibe aviso: "Máximo de 6 dispensações atingido"

---

## 🔒 Validações e Segurança

### Backend

- ✅ Autenticação obrigatória (middleware)
- ✅ Autorização por role (apenas "farmacia")
- ✅ Validação de dados de entrada
- ✅ Tratamento de erros
- ✅ Limites de dispensação

### Frontend

- ✅ Validação antes de submit
- ✅ Feedback visual (toast messages)
- ✅ Estados de loading
- ✅ Desabilita botões quando necessário
- ✅ Exibe motivos de rejeição

---

## 📊 Estrutura de Dados

### Dispensação (banco de dados)

```prisma
model DispensacaoReceita {
  id                      String   @id @default(cuid())
  receitaId               String
  farmaciaId              String
  statusDispensacao       String   // "completa" | "parcial"
  observacoesDispensacao  String?
  medicamentoFornecido    String?
  farmaciaResponsavel     String?
  dataDispensacao         DateTime @default(now())
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  receita   ReceitaMedica @relation(fields: [receitaId], references: [id])
  farmacia  Farmacia      @relation(fields: [farmaciaId], references: [id])
}
```

---

## 🧪 Testes

Para testar a funcionalidade:

1. **Teste 1: Dispensação Completa**
   - Busque uma receita
   - Registre uma dispensação com status "completa"
   - Verifique que o botão desaparece

2. **Teste 2: Dispensação Parcial**
   - Busque uma receita
   - Registre uma dispensação com status "parcial"
   - Verifique que ambos os botões aparecem
   - Edite a dispensação para "completa"
   - Verifique que desaparece novamente

3. **Teste 3: Limite de Dispensações**
   - Registre 6 dispensações parciais
   - Verifique que o botão "Dispensar receita" desaparece
   - Tente registrar a 7ª (deve retornar erro)

4. **Teste 4: Histórico**
   - Registre várias dispensações
   - Verifique que todas aparecem listadas corretamente
   - Verifique que as datas estão corretas

---

## 🚀 Próximas Melhorias Possíveis

1. Adicionar relatórios de dispensação
2. Adicionar filtros de data
3. Adicionar assinatura digital
4. Adicionar impressão de documento
5. Adicionar sincronização com estoque
6. Adicionar notificações quando dispensação está próxima do vencimento

---

**Implementação concluída em:** 30/05/2026
**Status:** ✅ Funcional e testado
