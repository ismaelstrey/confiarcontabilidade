# Contabilidade Igrejinha - Backend API

> Sistema completo de gestão contábil especializado para igrejas e organizações religiosas

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API Documentation](#api-documentation)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Testes](#testes)
- [Deploy](#deploy)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O **Contabilidade Igrejinha** é uma solução completa para gestão contábil e fiscal de igrejas e organizações religiosas. O sistema oferece:

### Funcionalidades Principais

- 🔐 **Sistema de Autenticação** - JWT com refresh tokens
- 👥 **Gestão de Usuários** - Perfis e permissões
- 📝 **Blog/Artigos** - Sistema de conteúdo com categorias e tags
- 📞 **Formulário de Contato** - Gestão de leads e comunicação
- 🏢 **Catálogo de Serviços** - Apresentação dos serviços oferecidos
- 🧮 **Calculadora Fiscal** - Cálculos automáticos de impostos
- ❓ **FAQ** - Perguntas frequentes
- 👨‍💼 **Equipe** - Apresentação da equipe
- 💬 **Depoimentos** - Testemunhos de clientes
- 📧 **Newsletter** - Sistema de email marketing
- 📁 **Upload de Arquivos** - Gestão de documentos e imagens
- 🛡️ **Painel Administrativo** - Gestão completa do sistema
- 📊 **Monitoramento** - Health checks e métricas

### Diferenciais

- ⚡ **Performance** - Cache inteligente com Redis
- 🔒 **Segurança** - Múltiplas camadas de proteção
- 📱 **Responsivo** - API preparada para web e mobile
- 🧪 **Testado** - Cobertura completa de testes
- 📚 **Documentado** - Swagger/OpenAPI completo
- 🚀 **Escalável** - Arquitetura em camadas

## 🛠️ Tecnologias

### Core
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem de programação
- **[Express.js](https://expressjs.com/)** - Framework web
- **[Prisma](https://www.prisma.io/)** - ORM para banco de dados
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados principal
- **[Redis](https://redis.io/)** - Cache e sessões

### Autenticação e Segurança
- **[JWT](https://jwt.io/)** - JSON Web Tokens
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Hash de senhas
- **[Helmet](https://helmetjs.github.io/)** - Headers de segurança
- **[CORS](https://www.npmjs.com/package/cors)** - Cross-Origin Resource Sharing
- **[Express Rate Limit](https://www.npmjs.com/package/express-rate-limit)** - Rate limiting

### Validação e Documentação
- **[Zod](https://zod.dev/)** - Validação de schemas
- **[Swagger](https://swagger.io/)** - Documentação da API
- **[OpenAPI](https://www.openapis.org/)** - Especificação da API

### Utilitários
- **[Winston](https://github.com/winstonjs/winston)** - Sistema de logging
- **[Nodemailer](https://nodemailer.com/)** - Envio de emails
- **[Multer](https://www.npmjs.com/package/multer)** - Upload de arquivos
- **[Sharp](https://sharp.pixelplumbing.com/)** - Processamento de imagens
- **[PDFKit](https://pdfkit.org/)** - Geração de PDFs

### Desenvolvimento e Testes
- **[Jest](https://jestjs.io/)** - Framework de testes
- **[Supertest](https://www.npmjs.com/package/supertest)** - Testes de API
- **[ESLint](https://eslint.org/)** - Linting de código
- **[Prettier](https://prettier.io/)** - Formatação de código
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[PM2](https://pm2.keymetrics.io/)** - Gerenciador de processos

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **pnpm** (gerenciador de pacotes)
- **PostgreSQL** (versão 13 ou superior)
- **Redis** (versão 6 ou superior)
- **Git**

### Verificar Instalações

```bash
node --version  # v18.0.0+
pnpm --version  # 8.0.0+
psql --version  # 13.0+
redis-server --version  # 6.0.0+
```

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/contabilidade-igrejinha.git
cd contabilidade-igrejinha
```

### 2. Instale as Dependências

```bash
pnpm install
```

### 3. Configure o Banco de Dados

```bash
# Criar banco de dados PostgreSQL
psql -U postgres
CREATE DATABASE contabilidade_igrejinha;
CREATE DATABASE contabilidade_igrejinha_test;
\q
```

### 4. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

### 5. Execute as Migrações

```bash
# Gerar cliente Prisma
pnpm prisma generate

# Executar migrações
pnpm prisma migrate dev

# Seed do banco (opcional)
pnpm prisma db seed
```

### 6. Inicie o Servidor

```bash
# Desenvolvimento
pnpm dev

# Produção
pnpm build
pnpm start
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
NODE_ENV=development
PORT=3001
HOST=localhost

# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/contabilidade_igrejinha"
DATABASE_URL_TEST="postgresql://usuario:senha@localhost:5432/contabilidade_igrejinha_test"

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=seu_refresh_secret_super_seguro_aqui
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
FROM_EMAIL=noreply@contabilidadeigrejinha.com
FROM_NAME="Contabilidade Igrejinha"

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp,application/pdf
UPLOAD_PATH=uploads

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Monitoramento
SENTRY_DSN=sua_sentry_dsn_aqui
```

### Configuração do Redis

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# macOS
brew install redis
brew services start redis

# Windows
# Baixe e instale do site oficial do Redis
```

## 🎮 Uso

### Desenvolvimento

```bash
# Iniciar em modo desenvolvimento (hot reload)
pnpm dev

# Visualizar logs em tempo real
pnpm logs

# Executar migrações
pnpm migrate

# Reset do banco de dados
pnpm db:reset
```

### Produção

```bash
# Build da aplicação
pnpm build

# Iniciar com PM2
pnpm start:prod

# Parar aplicação
pnpm stop

# Reiniciar aplicação
pnpm restart

# Ver status
pnpm status
```

## 📖 API Documentation

A documentação completa da API está disponível via Swagger:

- **Desenvolvimento**: http://localhost:3001/api/docs
- **Produção**: https://api.contabilidadeigrejinha.com/api/docs

### Endpoints Principais

#### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Esqueci a senha
- `POST /api/auth/reset-password` - Resetar senha

#### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `POST /api/users/change-password` - Alterar senha
- `DELETE /api/users/account` - Deletar conta

#### Artigos
- `GET /api/articles` - Listar artigos
- `GET /api/articles/:id` - Obter artigo
- `POST /api/articles` - Criar artigo (admin)
- `PUT /api/articles/:id` - Atualizar artigo (admin)
- `DELETE /api/articles/:id` - Deletar artigo (admin)

#### Contato
- `POST /api/contact` - Enviar mensagem
- `GET /api/contact` - Listar mensagens (admin)
- `PUT /api/contact/:id/status` - Atualizar status (admin)

#### Calculadora Fiscal
- `POST /api/tax/calculate` - Calcular impostos
- `GET /api/tax/history` - Histórico de cálculos
- `POST /api/tax/save` - Salvar cálculo

### Exemplos de Uso

#### Registrar Usuário

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "MinhaSenh@123",
    "confirmPassword": "MinhaSenh@123"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "MinhaSenh@123"
  }'
```

#### Listar Artigos

```bash
curl -X GET "http://localhost:3001/api/articles?page=1&limit=10&search=contabilidade"
```

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações da aplicação
├── controllers/     # Controladores (Presentation Layer)
├── routes/          # Definição de rotas
├── services/        # Lógica de negócio (Business Layer)
├── repositories/    # Acesso a dados (Data Layer)
├── middlewares/     # Middlewares da aplicação
├── utils/           # Utilitários e helpers
├── schemas/         # Schemas de validação (Zod)
├── types/           # Definições de tipos TypeScript
├── docs/            # Documentação da API
├── tests/           # Testes automatizados
├── app.ts           # Configuração do Express
├── server.ts        # Inicialização do servidor
└── index.ts         # Ponto de entrada
```

### Documentação Detalhada

Para informações detalhadas sobre cada componente, consulte:

- 📋 [Visão Geral](./documentacao/BACKEND-OVERVIEW.md)
- 🎛️ [Controladores](./documentacao/BACKEND-CONTROLLERS.md)
- 🛣️ [Rotas](./documentacao/BACKEND-ROUTES.md)
- 🏢 [Serviços](./documentacao/BACKEND-SERVICES.md)
- 🗄️ [Repositórios](./documentacao/BACKEND-REPOSITORIES.md)
- 🔧 [Middlewares](./documentacao/BACKEND-MIDDLEWARES.md)
- 🛠️ [Utilitários](./documentacao/BACKEND-UTILS.md)
- 📊 [Modelos](./documentacao/BACKEND-MODELS.md)
- ⚙️ [Configuração](./documentacao/BACKEND-CONFIG.md)

## 📜 Scripts Disponíveis

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:prod": "pm2 start ecosystem.config.js",
    "stop": "pm2 stop ecosystem.config.js",
    "restart": "pm2 restart ecosystem.config.js",
    "status": "pm2 status",
    "logs": "pm2 logs",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "jest --config jest.e2e.config.js",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:seed": "prisma db seed",
    "prisma:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "db:push": "prisma db push",
    "prepare": "husky install"
  }
}
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
pnpm test

# Testes em modo watch
pnpm test:watch

# Testes com cobertura
pnpm test:coverage

# Testes end-to-end
pnpm test:e2e

# Teste específico
pnpm test -- --testNamePattern="AuthService"
```

### Estrutura de Testes

```
tests/
├── unit/              # Testes unitários
│   ├── services/      # Testes de serviços
│   ├── repositories/  # Testes de repositórios
│   └── utils/         # Testes de utilitários
├── integration/       # Testes de integração
│   ├── auth/          # Testes de autenticação
│   ├── users/         # Testes de usuários
│   └── articles/      # Testes de artigos
├── e2e/              # Testes end-to-end
│   └── api/          # Testes de API completos
└── fixtures/         # Dados de teste
    ├── users.json    # Usuários de teste
    └── articles.json # Artigos de teste
```

### Exemplo de Teste

```typescript
// tests/unit/services/authService.test.ts
import { AuthService } from '../../../src/services/authService';
import { UserRepository } from '../../../src/repositories/userRepository';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;
    
    authService = new AuthService(userRepository);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'MinhaSenh@123',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({ id: '1', ...userData });

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(userData.email);
    });
  });
});
```

## 🚀 Deploy

### Ambiente de Produção

#### 1. Preparação do Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2
npm install -g pm2

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Instalar Redis
sudo apt install redis-server
```

#### 2. Configuração do Banco

```bash
# Configurar PostgreSQL
sudo -u postgres psql
CREATE DATABASE contabilidade_igrejinha;
CREATE USER app_user WITH ENCRYPTED PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE contabilidade_igrejinha TO app_user;
\q
```

#### 3. Deploy da Aplicação

```bash
# Clone do repositório
git clone https://github.com/seu-usuario/contabilidade-igrejinha.git
cd contabilidade-igrejinha

# Instalar dependências
pnpm install --production

# Configurar variáveis de ambiente
cp .env.example .env
nano .env

# Build da aplicação
pnpm build

# Executar migrações
pnpm prisma migrate deploy

# Iniciar com PM2
pnpm start:prod
```

#### 4. Configuração do Nginx

```nginx
# /etc/nginx/sites-available/contabilidade-igrejinha
server {
    listen 80;
    server_name api.contabilidadeigrejinha.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5. SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d api.contabilidadeigrejinha.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Docker Deploy

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Build
RUN npm run build

# Gerar Prisma Client
RUN npx prisma generate

# Expor porta
EXPOSE 3001

# Comando de inicialização
CMD ["npm", "start"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://app_user:senha@db:5432/contabilidade_igrejinha
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=contabilidade_igrejinha
      - POSTGRES_USER=app_user
      - POSTGRES_PASSWORD=senha
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature (`git checkout -b feature/nova-feature`)
4. **Commit** suas mudanças (`git commit -m 'Add: nova feature'`)
5. **Push** para a branch (`git push origin feature/nova-feature`)
6. **Abra** um Pull Request

### Padrões de Commit

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

### Code Review

Todos os PRs passam por code review. Certifique-se de:

- ✅ Testes passando
- ✅ Linting sem erros
- ✅ Cobertura de testes mantida
- ✅ Documentação atualizada
- ✅ Commits seguindo padrão

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

- **Email**: suporte@contabilidadeigrejinha.com
- **Website**: https://contabilidadeigrejinha.com
- **Documentação**: https://docs.contabilidadeigrejinha.com
- **Issues**: https://github.com/seu-usuario/contabilidade-igrejinha/issues

---

<div align="center">
  <p>Feito com ❤️ pela equipe Contabilidade Igrejinha</p>
  <p>© 2024 Contabilidade Igrejinha. Todos os direitos reservados.</p>
</div>