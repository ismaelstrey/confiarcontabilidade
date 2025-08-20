# Visão Geral do Backend - Contabilidade Igrejinha

Este documento fornece uma visão completa da arquitetura e estrutura do backend da aplicação Contabilidade Igrejinha.

## Índice

1. [Arquitetura Geral](#arquitetura-geral)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Fluxo de Dados](#fluxo-de-dados)
5. [Componentes Principais](#componentes-principais)
6. [Integração entre Camadas](#integração-entre-camadas)
7. [Segurança](#segurança)
8. [Performance](#performance)
9. [Monitoramento](#monitoramento)
10. [Deploy](#deploy)

## Arquitetura Geral

O backend segue uma **arquitetura em camadas (Layered Architecture)** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                    (React + TypeScript)                    │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Routes    │  │ Controllers │  │    Middlewares      │ │
│  │             │  │             │  │                     │ │
│  │ • Auth      │  │ • Auth      │  │ • Authentication    │ │
│  │ • Users     │  │ • Users     │  │ • Authorization     │ │
│  │ • Articles  │  │ • Articles  │  │ • Validation        │ │
│  │ • Services  │  │ • Services  │  │ • Error Handling    │ │
│  │ • Tax       │  │ • Tax       │  │ • Rate Limiting     │ │
│  │ • Contact   │  │ • Contact   │  │ • Logging           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Services   │  │ Validators  │  │      Utils          │ │
│  │             │  │             │  │                     │ │
│  │ • Auth      │  │ • Zod       │  │ • Email             │ │
│  │ • Users     │  │ • Custom    │  │ • File Upload       │ │
│  │ • Articles  │  │ • Business  │  │ • PDF Generation    │ │
│  │ • Tax Calc  │  │ • Rules     │  │ • Date Utils        │ │
│  │ • Email     │  │             │  │ • Crypto            │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │Repositories │  │   Models    │  │      Cache          │ │
│  │             │  │             │  │                     │ │
│  │ • User      │  │ • Prisma    │  │ • Redis             │ │
│  │ • Article   │  │ • Types     │  │ • Memory Cache      │ │
│  │ • Contact   │  │ • DTOs      │  │ • Query Cache       │ │
│  │ • Service   │  │ • Schemas   │  │                     │ │
│  │ • Tax       │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ PostgreSQL  │  │    Redis    │  │    File System      │ │
│  │             │  │             │  │                     │ │
│  │ • Users     │  │ • Sessions  │  │ • Uploads           │ │
│  │ • Articles  │  │ • Cache     │  │ • Logs              │ │
│  │ • Services  │  │ • Temp Data │  │ • Backups           │ │
│  │ • Contacts  │  │             │  │                     │ │
│  │ • Tax Data  │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Estrutura de Pastas

```
src/
├── config/                 # Configurações da aplicação
│   ├── index.ts            # Configuração principal
│   ├── database.ts         # Configuração do Prisma
│   ├── redis.ts            # Configuração do Redis
│   ├── email.ts            # Configuração de email
│   ├── upload.ts           # Configuração de upload
│   ├── swagger.ts          # Configuração do Swagger
│   ├── logger.ts           # Configuração de logs
│   ├── security.ts         # Configurações de segurança
│   └── monitoring.ts       # Configuração de monitoramento
│
├── controllers/            # Controladores (Presentation Layer)
│   ├── authController.ts   # Autenticação e autorização
│   ├── userController.ts   # Gerenciamento de usuários
│   ├── articleController.ts # Gerenciamento de artigos
│   ├── contactController.ts # Formulário de contato
│   ├── serviceController.ts # Serviços oferecidos
│   ├── taxController.ts    # Calculadora fiscal
│   ├── faqController.ts    # Perguntas frequentes
│   ├── teamController.ts   # Equipe
│   ├── testimonialController.ts # Depoimentos
│   ├── newsletterController.ts # Newsletter
│   ├── uploadController.ts # Upload de arquivos
│   ├── adminController.ts  # Painel administrativo
│   └── healthController.ts # Health checks
│
├── routes/                 # Definição de rotas
│   ├── index.ts           # Roteador principal
│   ├── auth.routes.ts     # Rotas de autenticação
│   ├── user.routes.ts     # Rotas de usuário
│   ├── article.routes.ts  # Rotas de artigos
│   ├── contact.routes.ts  # Rotas de contato
│   ├── service.routes.ts  # Rotas de serviços
│   ├── tax.routes.ts      # Rotas de cálculo fiscal
│   ├── faq.routes.ts      # Rotas de FAQ
│   ├── team.routes.ts     # Rotas de equipe
│   ├── testimonial.routes.ts # Rotas de depoimentos
│   ├── newsletter.routes.ts # Rotas de newsletter
│   ├── upload.routes.ts   # Rotas de upload
│   ├── admin.routes.ts    # Rotas administrativas
│   ├── health.routes.ts   # Rotas de saúde
│   └── docs.routes.ts     # Documentação Swagger
│
├── services/              # Lógica de negócio (Business Layer)
│   ├── authService.ts     # Serviços de autenticação
│   ├── userService.ts     # Serviços de usuário
│   ├── articleService.ts  # Serviços de artigos
│   ├── contactService.ts  # Serviços de contato
│   ├── serviceService.ts  # Serviços de serviços
│   ├── taxService.ts      # Serviços de cálculo fiscal
│   ├── faqService.ts      # Serviços de FAQ
│   ├── teamService.ts     # Serviços de equipe
│   ├── testimonialService.ts # Serviços de depoimentos
│   ├── newsletterService.ts # Serviços de newsletter
│   ├── uploadService.ts   # Serviços de upload
│   ├── emailService.ts    # Serviços de email
│   └── cacheService.ts    # Serviços de cache
│
├── repositories/          # Acesso a dados (Data Layer)
│   ├── index.ts          # Container de repositórios
│   ├── userRepository.ts # Repositório de usuários
│   ├── articleRepository.ts # Repositório de artigos
│   ├── contactRepository.ts # Repositório de contatos
│   ├── serviceRepository.ts # Repositório de serviços
│   ├── taxRepository.ts  # Repositório de cálculos fiscais
│   ├── faqRepository.ts  # Repositório de FAQ
│   ├── teamRepository.ts # Repositório de equipe
│   ├── testimonialRepository.ts # Repositório de depoimentos
│   └── newsletterRepository.ts # Repositório de newsletter
│
├── middlewares/           # Middlewares da aplicação
│   ├── auth.ts           # Autenticação JWT
│   ├── admin.ts          # Autorização de admin
│   ├── validation.ts     # Validação de dados
│   ├── error.ts          # Tratamento de erros
│   ├── logger.ts         # Logging de requests
│   ├── rateLimit.ts      # Rate limiting
│   ├── upload.ts         # Upload de arquivos
│   ├── cache.ts          # Cache de respostas
│   ├── cors.ts           # CORS
│   ├── compression.ts    # Compressão de respostas
│   └── notFound.ts       # Rota não encontrada
│
├── utils/                 # Utilitários e helpers
│   ├── index.ts          # Exportações principais
│   ├── errors.ts         # Classes de erro customizadas
│   ├── logger.ts         # Sistema de logging
│   ├── auth.ts           # Utilitários de autenticação
│   ├── date.ts           # Utilitários de data
│   ├── string.ts         # Utilitários de string
│   ├── file.ts           # Utilitários de arquivo
│   ├── email.ts          # Utilitários de email
│   ├── validation.ts     # Validadores customizados
│   ├── pagination.ts     # Utilitários de paginação
│   ├── tax.ts            # Cálculos fiscais
│   └── constants.ts      # Constantes da aplicação
│
├── schemas/               # Schemas de validação (Zod)
│   ├── user.ts           # Schemas de usuário
│   ├── article.ts        # Schemas de artigo
│   ├── contact.ts        # Schemas de contato
│   ├── service.ts        # Schemas de serviço
│   ├── tax.ts            # Schemas de cálculo fiscal
│   ├── faq.ts            # Schemas de FAQ
│   ├── team.ts           # Schemas de equipe
│   ├── testimonial.ts    # Schemas de depoimento
│   ├── newsletter.ts     # Schemas de newsletter
│   └── common.ts         # Schemas comuns
│
├── types/                 # Definições de tipos TypeScript
│   ├── index.ts          # Tipos principais
│   ├── auth.ts           # Tipos de autenticação
│   ├── user.ts           # Tipos de usuário
│   ├── article.ts        # Tipos de artigo
│   ├── contact.ts        # Tipos de contato
│   ├── service.ts        # Tipos de serviço
│   ├── tax.ts            # Tipos de cálculo fiscal
│   ├── api.ts            # Tipos de API
│   └── database.ts       # Tipos de banco de dados
│
├── docs/                  # Documentação da API
│   ├── swagger.json      # Especificação OpenAPI
│   └── examples/         # Exemplos de uso
│
├── tests/                 # Testes automatizados
│   ├── unit/             # Testes unitários
│   ├── integration/      # Testes de integração
│   ├── e2e/              # Testes end-to-end
│   └── fixtures/         # Dados de teste
│
├── app.ts                 # Configuração do Express
├── server.ts              # Inicialização do servidor
└── index.ts               # Ponto de entrada
```

## Tecnologias Utilizadas

### Core
- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões

### Autenticação e Segurança
- **JWT** - JSON Web Tokens
- **bcrypt** - Hash de senhas
- **Helmet** - Headers de segurança
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Limitação de requisições

### Validação e Documentação
- **Zod** - Validação de schemas
- **Swagger/OpenAPI** - Documentação da API
- **Class Validator** - Validação de classes

### Utilitários
- **Winston** - Sistema de logging
- **Nodemailer** - Envio de emails
- **Multer** - Upload de arquivos
- **Sharp** - Processamento de imagens
- **PDFKit** - Geração de PDFs
- **Moment.js** - Manipulação de datas

### Desenvolvimento e Testes
- **Jest** - Framework de testes
- **Supertest** - Testes de API
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Husky** - Git hooks
- **PM2** - Gerenciador de processos

## Fluxo de Dados

### 1. Requisição HTTP
```
Cliente → Middleware → Rota → Controller → Service → Repository → Database
```

### 2. Resposta HTTP
```
Database → Repository → Service → Controller → Middleware → Cliente
```

### 3. Fluxo Detalhado

1. **Cliente** faz requisição HTTP
2. **Middlewares** processam a requisição:
   - CORS
   - Rate Limiting
   - Logging
   - Autenticação
   - Validação
3. **Rota** direciona para o controller apropriado
4. **Controller** processa a requisição:
   - Extrai dados da requisição
   - Chama o service apropriado
   - Formata a resposta
5. **Service** implementa a lógica de negócio:
   - Valida regras de negócio
   - Chama repositórios
   - Processa dados
6. **Repository** acessa os dados:
   - Executa queries no banco
   - Aplica cache quando apropriado
   - Retorna dados formatados
7. **Resposta** é enviada de volta ao cliente

## Componentes Principais

### 1. Sistema de Autenticação
- **JWT Tokens** para autenticação
- **Refresh Tokens** para renovação
- **Role-based Access Control** (RBAC)
- **Password Reset** via email
- **Email Verification**

### 2. Sistema de Cache
- **Redis** para cache distribuído
- **Memory Cache** para dados temporários
- **Query Cache** para otimização
- **TTL** configurável por tipo de dado

### 3. Sistema de Upload
- **Multer** para processamento
- **Sharp** para otimização de imagens
- **Validação** de tipos e tamanhos
- **Storage** local ou cloud

### 4. Sistema de Email
- **Nodemailer** para envio
- **Templates** HTML responsivos
- **Queue** para processamento assíncrono
- **Tracking** de entregas

### 5. Sistema de Logging
- **Winston** para logging estruturado
- **Rotação** de arquivos de log
- **Níveis** de log configuráveis
- **Correlação** de requests

### 6. Sistema de Monitoramento
- **Health Checks** para serviços
- **Métricas** de performance
- **Alertas** automáticos
- **Dashboard** de monitoramento

## Integração entre Camadas

### 1. Dependency Injection
```typescript
// Container de dependências
class Container {
  private repositories: RepositoryContainer;
  private services: ServiceContainer;
  private controllers: ControllerContainer;

  constructor() {
    this.repositories = new RepositoryContainer();
    this.services = new ServiceContainer(this.repositories);
    this.controllers = new ControllerContainer(this.services);
  }
}
```

### 2. Interface Contracts
```typescript
// Interfaces para desacoplamento
interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}

interface IUserService {
  register(data: RegisterDTO): Promise<AuthResponse>;
  login(data: LoginDTO): Promise<AuthResponse>;
  getProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, data: UpdateProfileDTO): Promise<UserProfile>;
}
```

### 3. Error Handling
```typescript
// Tratamento centralizado de erros
class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Middleware de tratamento de erros
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
  }

  // Log do erro
  logger.error('Unhandled error:', error);

  return res.status(500).json({
    message: 'Erro interno do servidor',
    statusCode: 500,
    timestamp: new Date().toISOString(),
  });
};
```

## Segurança

### 1. Autenticação
- **JWT** com expiração configurável
- **Refresh Tokens** para renovação segura
- **Password Hashing** com bcrypt
- **Rate Limiting** para tentativas de login

### 2. Autorização
- **Role-based Access Control** (RBAC)
- **Resource-based Permissions**
- **Middleware** de autorização
- **Validação** de permissões

### 3. Validação de Dados
- **Zod** para validação de schemas
- **Sanitização** de inputs
- **SQL Injection** prevention
- **XSS** protection

### 4. Headers de Segurança
- **Helmet** para headers seguros
- **CORS** configurado adequadamente
- **CSP** (Content Security Policy)
- **HSTS** (HTTP Strict Transport Security)

### 5. Rate Limiting
- **Express Rate Limit** para limitação geral
- **Rate Limiting** específico por endpoint
- **IP Whitelisting** para APIs internas
- **Sliding Window** algorithm

## Performance

### 1. Cache Strategy
```typescript
// Estratégia de cache em camadas
class CacheStrategy {
  // L1: Memory Cache (mais rápido)
  private memoryCache = new Map();
  
  // L2: Redis Cache (distribuído)
  private redisCache = redis;
  
  async get(key: string): Promise<any> {
    // Tentar L1 primeiro
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    
    // Tentar L2
    const value = await this.redisCache.get(key);
    if (value) {
      // Armazenar em L1 para próximas consultas
      this.memoryCache.set(key, value);
      return value;
    }
    
    return null;
  }
}
```

### 2. Database Optimization
- **Connection Pooling** com Prisma
- **Query Optimization** com índices
- **Lazy Loading** para relacionamentos
- **Pagination** para listas grandes

### 3. Response Optimization
- **Compression** com gzip
- **JSON** minification
- **HTTP/2** support
- **CDN** para assets estáticos

### 4. Monitoring
- **Response Time** tracking
- **Memory Usage** monitoring
- **Database** performance metrics
- **Error Rate** tracking

## Monitoramento

### 1. Health Checks
```typescript
// Sistema de health checks
class HealthChecker {
  async checkDatabase(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
  
  async checkRedis(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch {
      return false;
    }
  }
  
  async getOverallHealth(): Promise<HealthStatus> {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);
    
    return {
      status: database && redis ? 'healthy' : 'unhealthy',
      services: { database, redis },
      timestamp: new Date().toISOString(),
    };
  }
}
```

### 2. Métricas
- **Request Count** por endpoint
- **Response Time** médio
- **Error Rate** por tipo
- **Active Connections**

### 3. Alertas
- **Email** para erros críticos
- **Slack** para notificações
- **SMS** para emergências
- **Dashboard** em tempo real

## Deploy

### 1. Ambientes
- **Development** - Ambiente local
- **Staging** - Ambiente de teste
- **Production** - Ambiente de produção

### 2. CI/CD Pipeline
```yaml
# GitHub Actions exemplo
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          pm2 stop all
          git pull origin main
          npm ci --production
          npm run build
          npm run prisma:migrate
          pm2 start ecosystem.config.js
```

### 3. Docker
```dockerfile
# Dockerfile para produção
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### 4. PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'contabilidade-igrejinha-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
```

## Conclusão

Esta arquitetura fornece uma base sólida e escalável para o backend da aplicação Contabilidade Igrejinha. Os principais benefícios incluem:

### Vantagens da Arquitetura

1. **Separação de Responsabilidades**
   - Cada camada tem uma responsabilidade específica
   - Facilita manutenção e testes
   - Permite desenvolvimento paralelo

2. **Escalabilidade**
   - Arquitetura preparada para crescimento
   - Cache distribuído com Redis
   - Connection pooling otimizado

3. **Segurança**
   - Múltiplas camadas de segurança
   - Validação rigorosa de dados
   - Autenticação e autorização robustas

4. **Manutenibilidade**
   - Código bem estruturado e documentado
   - Testes automatizados
   - Logging e monitoramento abrangentes

5. **Performance**
   - Sistema de cache inteligente
   - Otimizações de banco de dados
   - Compressão e minificação

6. **Confiabilidade**
   - Health checks automáticos
   - Tratamento robusto de erros
   - Backup e recuperação

### Próximos Passos

1. **Implementação Gradual**
   - Começar com funcionalidades core
   - Adicionar features incrementalmente
   - Testes contínuos

2. **Otimização Contínua**
   - Monitorar performance
   - Otimizar queries lentas
   - Ajustar configurações de cache

3. **Expansão de Features**
   - Adicionar novos módulos
   - Integrar com APIs externas
   - Implementar analytics avançados

Esta documentação serve como guia completo para o desenvolvimento, manutenção e evolução do backend da aplicação Contabilidade Igrejinha.