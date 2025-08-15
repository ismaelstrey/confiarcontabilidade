# Backend - Sistema de Contabilidade Igrejinha

## 📋 Descrição

API REST para o sistema de contabilidade da Igrejinha, desenvolvida com Node.js, Express, TypeScript e Prisma. Oferece funcionalidades completas para gerenciamento de artigos, usuários, contatos, newsletter, calculadoras financeiras e administração do sistema.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Linguagem de programação
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Winston** - Sistema de logs
- **Swagger** - Documentação da API
- **Redis** - Cache
- **Nodemailer** - Envio de emails
- **Multer** - Upload de arquivos
- **Sharp** - Processamento de imagens
- **Zod** - Validação de dados
- **ESLint** - Padronização de código
- **Jest** - Testes
- **PM2** - Gerenciamento de processos

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/     # Controladores da API
│   ├── routes/          # Definição das rotas
│   ├── services/        # Lógica de negócio
│   ├── repositories/    # Acesso aos dados
│   ├── middlewares/     # Middlewares customizados
│   ├── utils/           # Utilitários
│   ├── validators/      # Validadores de dados
│   ├── docs/            # Documentação adicional
│   └── server.ts        # Arquivo principal
├── prisma/
│   └── schema.prisma    # Schema do banco de dados
├── logs/                # Arquivos de log
├── uploads/             # Arquivos enviados
├── .env                 # Variáveis de ambiente
├── .env.example         # Exemplo de variáveis
├── package.json         # Dependências
├── tsconfig.json        # Configuração TypeScript
└── eslint.config.js     # Configuração ESLint
```

## ⚙️ Configuração

### 1. Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- pnpm (gerenciador de pacotes)

### 2. Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd backend

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Gere o cliente Prisma
pnpm prisma generate

# Execute as migrações do banco
pnpm prisma migrate dev

# (Opcional) Popule o banco com dados iniciais
pnpm prisma db seed
```

### 3. Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```env
# Servidor
PORT=3001
NODE_ENV=development
API_VERSION=v1

# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/contabilidade_db"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=contabilidade_db
DB_USER=usuario
DB_PASSWORD=senha

# JWT
JWT_SECRET=seu_jwt_secret_muito_seguro
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
EMAIL_FROM=noreply@contabilidadeigrejinha.com

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL=3600

# Outros
CORS_ORIGIN=http://localhost:3000
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🏃‍♂️ Execução

### Desenvolvimento

```bash
# Modo desenvolvimento (com hot reload)
pnpm dev

# Executar testes
pnpm test

# Executar testes com coverage
pnpm test:coverage

# Verificar código com ESLint
pnpm lint

# Corrigir problemas do ESLint
pnpm lint:fix

# Formatar código
pnpm format
```

### Produção

```bash
# Build do projeto
pnpm build

# Executar em produção
pnpm start

# Executar com PM2
pnpm pm2:start

# Parar PM2
pnpm pm2:stop

# Reiniciar PM2
pnpm pm2:restart

# Ver logs do PM2
pnpm pm2:logs
```

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger:

- **Desenvolvimento**: http://localhost:3001/api-docs
- **Produção**: https://api.contabilidadeigrejinha.com/api-docs

### Principais Endpoints

#### Autenticação
- `POST /api/v1/auth/register` - Registrar usuário
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Renovar token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/forgot-password` - Esqueci a senha
- `POST /api/v1/auth/reset-password` - Redefinir senha

#### Artigos
- `GET /api/v1/articles` - Listar artigos
- `GET /api/v1/articles/:slug` - Obter artigo por slug
- `POST /api/v1/articles` - Criar artigo (Auth)
- `PUT /api/v1/articles/:id` - Atualizar artigo (Auth)
- `DELETE /api/v1/articles/:id` - Excluir artigo (Auth)

#### Usuários
- `GET /api/v1/users/profile` - Perfil do usuário (Auth)
- `PUT /api/v1/users/profile` - Atualizar perfil (Auth)
- `PUT /api/v1/users/change-password` - Alterar senha (Auth)
- `GET /api/v1/users` - Listar usuários (Admin)

#### Contatos
- `POST /api/v1/contacts` - Enviar mensagem
- `GET /api/v1/contacts` - Listar mensagens (Admin)
- `PUT /api/v1/contacts/:id/status` - Atualizar status (Admin)

#### Newsletter
- `POST /api/v1/newsletter/subscribe` - Inscrever-se
- `GET /api/v1/newsletter/confirm/:token` - Confirmar inscrição
- `POST /api/v1/newsletter/unsubscribe` - Cancelar inscrição

#### Calculadoras
- `POST /api/v1/calculator/income-tax` - Calcular IR
- `POST /api/v1/calculator/corporate-tax` - Calcular IR Pessoa Jurídica
- `POST /api/v1/calculator/payroll` - Calcular folha de pagamento
- `POST /api/v1/calculator/simples-nacional` - Calcular Simples Nacional

#### Uploads
- `POST /api/v1/uploads/image` - Upload de imagem (Auth)
- `POST /api/v1/uploads/document` - Upload de documento (Auth)
- `GET /api/v1/uploads/:id` - Obter arquivo (Auth)

#### Admin
- `GET /api/v1/admin/dashboard` - Dashboard (Admin)
- `GET /api/v1/admin/system-info` - Info do sistema (Admin)
- `GET /api/v1/admin/activity-logs` - Logs de atividade (Admin)

## 🗄️ Banco de Dados

### Migrações

```bash
# Criar nova migração
pnpm prisma migrate dev --name nome_da_migracao

# Aplicar migrações em produção
pnpm prisma migrate deploy

# Reset do banco (desenvolvimento)
pnpm prisma migrate reset

# Ver status das migrações
pnpm prisma migrate status
```

### Prisma Studio

```bash
# Abrir interface gráfica do banco
pnpm prisma studio
```

## 🔒 Segurança

- **Autenticação JWT** com tokens de acesso e refresh
- **Hash de senhas** com bcrypt
- **Rate limiting** para prevenir ataques
- **Helmet** para headers de segurança
- **CORS** configurado
- **Validação de dados** com Zod
- **Sanitização** de inputs
- **Logs de auditoria** para ações sensíveis

## 📊 Monitoramento

### Logs

Os logs são salvos em `logs/` com rotação automática:
- `error.log` - Erros
- `combined.log` - Todos os logs
- `access.log` - Logs de acesso

### Health Check

- `GET /health` - Status da aplicação
- `GET /api/v1/admin/system-info` - Informações detalhadas (Admin)

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Testes em modo watch
pnpm test:watch

# Testes com coverage
pnpm test:coverage

# Testes de integração
pnpm test:integration

# Testes unitários
pnpm test:unit
```

## 📦 Deploy

### Docker

```bash
# Build da imagem
docker build -t contabilidade-backend .

# Executar container
docker run -p 3001:3001 --env-file .env contabilidade-backend
```

### PM2

```bash
# Configuração no ecosystem.config.js
pnpm pm2:start

# Monitoramento
pnpm pm2:monit

# Logs
pnpm pm2:logs
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use **camelCase** para variáveis e funções
- Use **PascalCase** para classes e interfaces
- Sempre adicione **tipagem TypeScript**
- Escreva **comentários em português**
- Siga as regras do **ESLint**
- Mantenha **cobertura de testes** acima de 80%

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte técnico:
- Email: dev@contabilidadeigrejinha.com
- Issues: [GitHub Issues](https://github.com/usuario/contabilidade-backend/issues)

---

**Desenvolvido com ❤️ para Contabilidade Igrejinha**