# Recuperação e Alteração de Senha

## Visão geral

O SISC Saúde possui dois fluxos distintos:

- **Recuperação de senha:** destinada ao usuário que não está autenticado. Utiliza um token temporário enviado por email.
- **Alteração de senha:** destinada ao usuário autenticado. Exige a senha atual e não utiliza token de recuperação.

Os logins são independentes e existem oito tipos de usuário:

`paciente`, `funcionario`, `admin`, `ubs`, `hospital`, `upa`, `farmacia` e `laboratorio`.

## Recuperação de senha

### Fluxo

1. O usuário acessa `/recuperar-senha` no frontend.
2. Informa o email cadastrado e o tipo de usuário.
3. O backend localiza o usuário exclusivamente na tabela correspondente ao tipo informado.
4. É gerado um token aleatório de 32 bytes.
5. Apenas o hash SHA-256 do token é armazenado no banco.
6. O token puro é enviado ao email cadastrado por SMTP.
7. O link recebido abre `/recuperar-senha?token=...`.
8. O usuário informa e confirma a nova senha.
9. O backend valida o token, altera a senha com `bcrypt`, marca o token como usado e registra a data de uso.

O token expira em uma hora e só pode ser utilizado uma vez.

### Endpoint de solicitação

```http
POST /api/auth/solicitar-reset-senha
Content-Type: application/json
```

Exemplo de requisição:

```json
{
  "email": "usuario@exemplo.com",
  "tipoUsuario": "paciente"
}
```

Valores aceitos para `tipoUsuario`:

- `paciente`
- `funcionario`
- `admin`
- `ubs`
- `hospital`
- `upa`
- `farmacia`
- `laboratorio`

A resposta é intencionalmente genérica para não revelar se um email está cadastrado:

```json
{
  "message": "Se os dados forem válidos, um link de redefinição será enviado."
}
```

Se o email existir no tipo informado, o backend cria o token e envia o link ao próprio email cadastrado. O endereço SMTP configurado no sistema é somente o remetente.

### Endpoint de redefinição

```http
POST /api/auth/redefinir-senha
Content-Type: application/json
```

Exemplo de requisição:

```json
{
  "token": "token recebido no email",
  "novaSenha": "NovaSenha123"
}
```

A nova senha deve conter pelo menos oito caracteres, uma letra maiúscula, uma letra minúscula e um número. Tokens inexistentes, expirados ou já utilizados são rejeitados.

## Alteração de senha autenticada

```http
POST /api/auth/alterar-senha
Authorization: Bearer <jwt>
Content-Type: application/json
```

Exemplo de requisição:

```json
{
  "senhaAtual": "SenhaAtual123",
  "novaSenha": "NovaSenha123"
}
```

O tipo e o id do usuário são obtidos do JWT, e não do corpo da requisição. Assim, o usuário só pode alterar a própria senha.

## Persistência

A tabela `password_reset_tokens` é desacoplada das tabelas de usuários porque o Prisma não possui uma relação polimórfica nativa. Ela armazena o tipo e o id do usuário como valores validados pela aplicação.

Campos principais:

| Campo | Finalidade |
| --- | --- |
| `tipoUsuario` | Identifica a tabela de login correspondente. |
| `usuarioId` | Identifica o registro do usuário. |
| `tokenHash` | Armazena o hash do token, nunca o token puro. |
| `expiresAt` | Define o prazo de validade de uma hora. |
| `usado` | Impede reutilização do token. |
| `usadoEm` | Registra quando o token foi consumido. |
| `ipSolicitante` | Registra o IP que solicitou a recuperação. |
| `createdAt` | Registra a criação do token. |

A migration correspondente é `20260824223000_add_password_reset_tokens`. Ela cria somente a tabela de tokens e seus índices, sem chaves estrangeiras ou alterações nas tabelas existentes.

## Configuração SMTP

O envio utiliza Nodemailer com Gmail SMTP. As variáveis ficam no arquivo `server/.env`, que não deve ser versionado:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=conta-remetente@gmail.com
SMTP_PASSWORD=senha-de-aplicativo-do-gmail
SMTP_FROM="SISC Saúde <conta-remetente@gmail.com>"
PASSWORD_RESET_URL=http://localhost:5173/recuperar-senha
```

`SMTP_PASSWORD` deve ser uma senha de aplicativo do Google, e não a senha normal da conta. A conta remetente não precisa ser a conta do usuário que receberá o link.

O serviço de email está em `server/services/emailService.js`. O envio é realizado para o valor `email` encontrado na tabela correspondente ao `tipoUsuario`.

## Teste manual

1. Inicie o frontend e o backend.
2. Acesse `http://localhost:5173/recuperar-senha`.
3. Informe um email que realmente exista no banco.
4. Selecione o tipo de usuário correspondente.
5. Verifique a caixa de entrada e a pasta de spam do destinatário.
6. Abra o link recebido e informe uma nova senha válida.
7. Tente usar o mesmo link novamente; a segunda tentativa deve ser rejeitada.

Para testar somente o SMTP, a conexão pode ser verificada pelo serviço de email antes de testar a recuperação completa.

## Operação e segurança

- Nunca registrar ou armazenar o token puro em logs.
- Nunca colocar `SMTP_PASSWORD` no frontend ou no repositório.
- Revogar e gerar novamente a senha de aplicativo se ela for exposta.
- Manter `PASSWORD_RESET_URL` apontando para o endereço público correto em produção.
- Usar HTTPS em produção para impedir exposição do token no link.
- Limpar periodicamente tokens expirados ou antigos já utilizados.
- O erro de email inexistente continua retornando resposta genérica para reduzir enumeração de contas.
