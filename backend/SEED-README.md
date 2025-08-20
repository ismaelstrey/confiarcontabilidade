# Seed do Banco de Dados

Este documento explica como usar o sistema de seed para criar dados iniciais no banco de dados.

## Usuário Administrador Padrão

O seed cria automaticamente um usuário administrador com as seguintes características:

### Configuração no .env

```env
# Configurações do Usuário Administrador Padrão
ADMIN_EMAIL=admin@contabilidadeigrejinha.com
ADMIN_NAME=Administrador
ADMIN_PASSWORD=admin123
```

### Credenciais Padrão

- **Email:** admin@contabilidadeigrejinha.com
- **Senha:** admin123
- **Role:** ADMIN
- **Status:** Ativo

## Como Executar o Seed

### 1. Executar o seed

```bash
# Navegar para o diretório do backend
cd backend

# Executar o seed
pnpm run db:seed
```

### 2. Verificar se funcionou

O seed exibirá uma mensagem de sucesso com os dados do usuário criado:

```
✅ Usuário administrador criado com sucesso:
📧 Email: admin@contabilidadeigrejinha.com
👤 Nome: Administrador
🔑 Role: ADMIN
🆔 ID: [ID_GERADO]

🔐 Credenciais de acesso:
Email: admin@contabilidadeigrejinha.com
Senha: admin123

⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!
```

## Personalização

Você pode personalizar as informações do usuário administrador alterando as variáveis no arquivo `.env`:

- `ADMIN_EMAIL`: Email do administrador
- `ADMIN_NAME`: Nome do administrador
- `ADMIN_PASSWORD`: Senha padrão (será hasheada automaticamente)

## Segurança

⚠️ **IMPORTANTE:**

1. **Altere a senha padrão** após o primeiro login
2. **Não use credenciais padrão em produção**
3. **Use senhas fortes** em ambiente de produção
4. **Mantenha as variáveis de ambiente seguras**

## Comportamento

- Se o usuário administrador já existir, o seed não criará um duplicado
- A senha é automaticamente hasheada usando bcrypt
- O usuário é criado com role 'ADMIN' e status ativo

## Troubleshooting

### Erro: Usuário já existe

Se você ver a mensagem "Usuário administrador já existe", significa que o seed já foi executado anteriormente. Isso é normal e esperado.

### Erro de conexão com banco

Verifique se:
1. O banco de dados está rodando
2. As configurações de `DATABASE_URL` estão corretas no `.env`
3. As migrações foram executadas (`pnpm run db:migrate`)

### Erro de dependências

Certifique-se de que todas as dependências estão instaladas:

```bash
pnpm install
```