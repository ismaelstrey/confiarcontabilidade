# Backend Bun - Contabilidade Igrejinha

Backend moderno construído com **Bun** runtime, **Hono** framework e **Prisma** ORM.

## 🚀 Tecnologias

- **Runtime**: Bun
- **Framework**: Hono
- **ORM**: Prisma
- **Banco de dados**: PostgreSQL
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod
- **Tipagem**: TypeScript

## 📁 Estrutura do Projeto

```
backend_bun/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.ts           # Script de seed
├── src/
│   ├── lib/
│   │   ├── auth.ts       # Utilitários de autenticação
│   │   └── prisma.ts     # Configuração do Prisma
│   ├── middlewares/
│   │   ├── auth.ts       # Middlewares de autenticação
│   │   └── errorHandler.ts # Tratamento de erros
│   ├── routes/
│   │   ├── admin.ts      # Rotas administrativas
│   │   ├── articles.ts   # Rotas de artigos
│   │   ├── auth.ts       # Rotas de autenticação
│   │   ├── calculator.ts # Rotas da calculadora
│   │   ├── contacts.ts   # Rotas de contato
│   │   ├── newsletter.ts # Rotas de newsletter
│   │   ├── uploads.ts    # Rotas de upload
│   │   └── users.ts      # Rotas de usuários
│   └── server.ts         # Servidor principal
├── uploads/              # Arquivos enviados
├── .env                  # Variáveis de ambiente
├── package.json
└── README.md
```

## 🛠️ Instalação

1. **Instalar dependências**:
   ```bash
   bun install
   ```

2. **Configurar variáveis de ambiente**:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

3. **Configurar banco de dados**:
   ```bash
   # Gerar cliente Prisma
   bunx prisma generate
   
   # Executar migrações
   bunx prisma db push
   
   # Popular banco com dados iniciais
   bun run seed
   ```

## 🚀 Execução

### Desenvolvimento
```bash
bun run dev
```

### Produção
```bash
bun run build
bun run start
```

### Outros comandos
```bash
# Executar testes
bun run test

# Visualizar banco de dados
bun run db:studio

# Reset do banco de dados
bun run db:reset

# Formatação de código
bun run format

# Linting
bun run lint
```

## 📋 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Perfil do usuário
- `PUT /api/auth/change-password` - Alterar senha
- `POST /api/auth/logout` - Logout

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `DELETE /api/users/account` - Deletar conta
- `GET /api/users` - Listar usuários (admin)
- `POST /api/users` - Criar usuário (admin)
- `GET /api/users/:id` - Obter usuário (admin)
- `PUT /api/users/:id` - Atualizar usuário (admin)
- `DELETE /api/users/:id` - Deletar usuário (admin)

### Artigos
- `GET /api/articles` - Listar artigos
- `POST /api/articles` - Criar artigo
- `GET /api/articles/:slug` - Obter artigo
- `PUT /api/articles/:slug` - Atualizar artigo
- `DELETE /api/articles/:slug` - Deletar artigo
- `POST /api/articles/:slug/like` - Curtir artigo
- `DELETE /api/articles/:slug/like` - Descurtir artigo
- `POST /api/articles/:slug/comments` - Comentar artigo

### Contatos
- `POST /api/contacts` - Enviar mensagem
- `GET /api/contacts` - Listar mensagens (admin)
- `GET /api/contacts/:id` - Obter mensagem (admin)
- `PUT /api/contacts/:id` - Atualizar mensagem (admin)
- `DELETE /api/contacts/:id` - Deletar mensagem (admin)
- `GET /api/contacts/stats` - Estatísticas (admin)

### Calculadora
- `POST /api/calculator/simple-interest` - Juros simples
- `POST /api/calculator/compound-interest` - Juros compostos
- `POST /api/calculator/loan-payment` - Pagamento de empréstimo
- `POST /api/calculator/investment-return` - Retorno de investimento
- `POST /api/calculator/tax` - Cálculo de impostos
- `POST /api/calculator/depreciation` - Depreciação
- `GET /api/calculator/history` - Histórico de cálculos
- `GET /api/calculator/history/:id` - Obter cálculo
- `DELETE /api/calculator/history/:id` - Deletar cálculo
- `GET /api/calculator/types` - Tipos de cálculo

### Newsletter
- `POST /api/newsletter/subscribe` - Inscrever-se
- `POST /api/newsletter/unsubscribe` - Desinscrever-se
- `GET /api/newsletter/subscribers` - Listar inscritos (admin)
- `GET /api/newsletter/subscribers/:id` - Obter inscrito (admin)
- `PUT /api/newsletter/subscribers/:id` - Atualizar inscrito (admin)
- `DELETE /api/newsletter/subscribers/:id` - Deletar inscrito (admin)
- `GET /api/newsletter/stats` - Estatísticas (admin)
- `POST /api/newsletter/bulk-action` - Ação em lote (admin)

### Uploads
- `POST /api/uploads` - Fazer upload
- `GET /api/uploads` - Listar uploads
- `GET /api/uploads/:id` - Obter upload
- `DELETE /api/uploads/:id` - Deletar upload
- `GET /api/uploads/serve/:filename` - Servir arquivo
- `GET /api/uploads/stats` - Estatísticas

### Admin
- `GET /api/admin/dashboard` - Dashboard
- `GET /api/admin/categories` - Listar categorias
- `POST /api/admin/categories` - Criar categoria
- `GET /api/admin/categories/:id` - Obter categoria
- `PUT /api/admin/categories/:id` - Atualizar categoria
- `DELETE /api/admin/categories/:id` - Deletar categoria
- `GET /api/admin/tags` - Listar tags
- `POST /api/admin/tags` - Criar tag
- `GET /api/admin/tags/:id` - Obter tag
- `PUT /api/admin/tags/:id` - Atualizar tag
- `DELETE /api/admin/tags/:id` - Deletar tag
- `GET /api/admin/system` - Informações do sistema

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

- **Access Token**: Válido por 15 minutos
- **Refresh Token**: Válido por 7 dias
- **Roles**: USER, MODERATOR, ADMIN

## 🗃️ Banco de Dados

O sistema utiliza PostgreSQL com Prisma ORM. Os principais modelos são:

- **User**: Usuários do sistema
- **Profile**: Perfis dos usuários
- **Article**: Artigos do blog
- **Category**: Categorias dos artigos
- **Tag**: Tags dos artigos
- **Comment**: Comentários dos artigos
- **Contact**: Mensagens de contato
- **Newsletter**: Inscrições na newsletter
- **Upload**: Arquivos enviados
- **CalculationHistory**: Histórico de cálculos

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Servidor
PORT=3001
NODE_ENV=development

# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/contabilidade_igrejinha"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro"
JWT_REFRESH_SECRET="seu-refresh-secret-super-seguro"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/webp,application/pdf"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"
SMTP_FROM="noreply@contabilidadeigrejinha.com"

# Admin (para seed)
ADMIN_EMAIL="admin@contabilidadeigrejinha.com"
ADMIN_PASSWORD="admin123"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache Redis (opcional)
REDIS_URL="redis://localhost:6379"
CACHE_TTL=3600
```

## 🧪 Testes

Para executar os testes:

```bash
bun run test
```

## 📝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Suporte

Para suporte, envie um email para suporte@contabilidadeigrejinha.com ou abra uma issue no GitHub.