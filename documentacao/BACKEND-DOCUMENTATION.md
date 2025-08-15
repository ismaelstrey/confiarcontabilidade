# Documentação Backend - Contabilidade Igrejinha

## 📋 Visão Geral

Esta documentação descreve a implementação do backend para o site institucional da Confiar Contabilidade, fornecendo uma API RESTful para suportar as funcionalidades do frontend existente em Next.js.

### Objetivo Principal
Desenvolver uma API robusta, segura e escalável que atenda às necessidades do site institucional, incluindo gerenciamento de conteúdo, autenticação de usuários, processamento de formulários e integração com serviços externos.

### Stack Tecnológica
- **Linguagem**: TypeScript
- **Framework**: Node.js + Express.js
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT + bcrypt
- **Documentação**: Swagger (swagger-ui-express)
- **Validação**: Zod
- **Gerenciador de Dependências**: pnpm
- **Gerenciamento de Processos**: PM2
- **Variáveis de Ambiente**: dotenv
- **Padronização**: ESLint

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── controllers/       # Controladores para cada recurso
├── routes/           # Definição de rotas da API
├── services/         # Lógica de negócios
├── repositories/     # Acesso ao banco de dados
├── middlewares/      # Middlewares Express
├── utils/            # Funções utilitárias
├── validators/       # Esquemas de validação Zod
├── docs/             # Documentação Swagger
├── types/            # Definições de tipos TypeScript
└── server.ts         # Ponto de entrada da aplicação
```

### Padrões de Projeto
- **Arquitetura em Camadas**: Separação clara entre controllers, services e repositories
- **Repository Pattern**: Abstração do acesso ao banco de dados
- **Dependency Injection**: Injeção de dependências para facilitar testes
- **Error Handling**: Tratamento centralizado de erros
- **Middleware Pattern**: Uso de middlewares para funcionalidades transversais

## 🗄️ Modelo de Dados

### Entidades Principais

#### User
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   Profile?
}

enum Role {
  ADMIN
  ACCOUNTANT
  CLIENT
}
```

#### Profile
```prisma
model Profile {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  phone     String?
  company   String?
  position  String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Contact
```prisma
model Contact {
  id        String   @id @default(uuid())
  name      String
  email     String
  phone     String
  company   String?
  message   String
  service   String?
  status    ContactStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ContactStatus {
  PENDING
  CONTACTED
  CONVERTED
  ARCHIVED
}
```

#### Service
```prisma
model Service {
  id          String   @id @default(uuid())
  title       String
  description String
  icon        String
  features    String[]
  priceFrom   Float?
  priceTo     Float?
  period      String?
  popular     Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Article
```prisma
model Article {
  id          String   @id @default(uuid())
  title       String
  excerpt     String
  content     String   @db.Text
  author      String
  publishedAt DateTime
  updatedAt   DateTime?
  category    String
  tags        String[]
  featured    Boolean  @default(false)
  readTime    Int
  slug        String   @unique
  seoTitle    String?
  seoDesc     String?
  seoKeywords String[]  
  createdAt   DateTime @default(now())
}
```

#### FAQ
```prisma
model FAQ {
  id        String   @id @default(uuid())
  question   String
  answer     String   @db.Text
  category   String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

#### TeamMember
```prisma
model TeamMember {
  id          String   @id @default(uuid())
  name        String
  role        String
  bio         String   @db.Text
  avatar      String
  credentials String[]
  linkedin    String?
  email       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Testimonial
```prisma
model Testimonial {
  id        String   @id @default(uuid())
  name      String
  company   String
  role      String
  content   String   @db.Text
  rating    Int
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🔐 Autenticação e Autorização

### Estratégia de Autenticação
- JWT (JSON Web Token) para autenticação stateless
- Tokens de acesso com expiração curta (15 minutos)
- Tokens de refresh com expiração longa (7 dias)
- Armazenamento seguro de senhas com bcrypt

### Middleware de Autenticação
```typescript
// Exemplo de middleware de autenticação
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no token' });
  }
  
  const [scheme, token] = parts;
  
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token mal formatado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
```

### Controle de Acesso Baseado em Funções (RBAC)
```typescript
// Exemplo de middleware de autorização
import { Request, Response, NextFunction } from 'express';

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Não autorizado' });
    }
    
    return next();
  };
};
```

## 🌐 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/refresh` - Renovar token de acesso
- `POST /api/auth/logout` - Logout de usuário
- `GET /api/auth/me` - Obter dados do usuário atual

### Usuários
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/:id` - Obter usuário específico
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Remover usuário

### Contatos
- `POST /api/contacts` - Criar novo contato
- `GET /api/contacts` - Listar contatos (admin)
- `GET /api/contacts/:id` - Obter contato específico
- `PUT /api/contacts/:id` - Atualizar status do contato
- `DELETE /api/contacts/:id` - Remover contato

### Serviços
- `POST /api/services` - Criar novo serviço (admin)
- `GET /api/services` - Listar serviços
- `GET /api/services/:id` - Obter serviço específico
- `PUT /api/services/:id` - Atualizar serviço (admin)
- `DELETE /api/services/:id` - Remover serviço (admin)

### Artigos
- `POST /api/articles` - Criar novo artigo (admin)
- `GET /api/articles` - Listar artigos
- `GET /api/articles/:slug` - Obter artigo por slug
- `PUT /api/articles/:id` - Atualizar artigo (admin)
- `DELETE /api/articles/:id` - Remover artigo (admin)

### FAQs
- `POST /api/faqs` - Criar nova FAQ (admin)
- `GET /api/faqs` - Listar FAQs
- `GET /api/faqs/:id` - Obter FAQ específica
- `PUT /api/faqs/:id` - Atualizar FAQ (admin)
- `DELETE /api/faqs/:id` - Remover FAQ (admin)

### Equipe
- `POST /api/team` - Adicionar membro à equipe (admin)
- `GET /api/team` - Listar membros da equipe
- `GET /api/team/:id` - Obter membro específico
- `PUT /api/team/:id` - Atualizar membro (admin)
- `DELETE /api/team/:id` - Remover membro (admin)

### Depoimentos
- `POST /api/testimonials` - Adicionar depoimento (admin)
- `GET /api/testimonials` - Listar depoimentos
- `GET /api/testimonials/:id` - Obter depoimento específico
- `PUT /api/testimonials/:id` - Atualizar depoimento (admin)
- `DELETE /api/testimonials/:id` - Remover depoimento (admin)

### Calculadora Fiscal
- `POST /api/calculator` - Calcular impostos

## 🔄 Integração com Frontend

### Hooks de API

Exemplo de hook para consumir a API no frontend:

```typescript
// useApi.ts - Hook para consumir a API no frontend
import { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Hook genérico para fazer requisições
export function useApi<T>(url: string, options?: any) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get<T>(url, options);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, error, loading };
}

// Hook para enviar dados
export function useApiMutation<T, R>(url: string, method: 'post' | 'put' | 'delete' = 'post') {
  const [data, setData] = useState<R | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const mutate = async (payload: T) => {
    try {
      setLoading(true);
      const response = await api[method]<R>(url, payload);
      setData(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err as Error);
      setData(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, error, loading };
}
```

## 🔧 Configuração e Deployment

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# Ambiente
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/contabilidade?schema=public"

# Autenticação
JWT_SECRET=seu_jwt_secret_seguro
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=seu_email@example.com
SMTP_PASS=sua_senha
EMAIL_FROM=contato@confiarcontabilidade.com.br

# Integração WhatsApp
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_PHONE=5551981754701

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Scripts de Inicialização

Adicione os seguintes scripts ao `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "lint": "eslint . --ext .ts",
    "test": "jest"
  }
}
```

### Configuração do PM2

Crie um arquivo `ecosystem.config.js` na raiz do projeto:

```javascript
module.exports = {
  apps: [
    {
      name: 'contabilidade-api',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

## 📝 Documentação da API

### Swagger

Configure o Swagger para documentar a API:

```typescript
// src/docs/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Contabilidade API',
      version: '1.0.0',
      description: 'API para o site institucional da Confiar Contabilidade',
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://api.confiarcontabilidade.com.br/api',
        description: 'Servidor de produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);
```

## 🧪 Testes

### Configuração de Testes

Utilize Jest para testes unitários e de integração:

```typescript
// Exemplo de teste unitário para o serviço de autenticação
import { AuthService } from '../src/services/authService';
import { UserRepository } from '../src/repositories/userRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock do repositório de usuários
jest.mock('../src/repositories/userRepository');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    authService = new AuthService(userRepository);
  });

  describe('login', () => {
    it('should return a token when credentials are valid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      userRepository.findByEmail.mockResolvedValue({
        id: '1',
        email,
        password: hashedPassword,
        name: 'Test User',
        role: 'CLIENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Act
      const result = await authService.login(email, password);
      
      // Assert
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw an error when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';
      
      userRepository.findByEmail.mockResolvedValue(null);
      
      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow('Credenciais inválidas');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    });
  });
});
```

## 🚀 Próximos Passos

1. **Setup do Projeto**
   - Inicializar projeto Node.js com TypeScript
   - Configurar ESLint e Prettier
   - Instalar dependências necessárias

2. **Configuração do Banco de Dados**
   - Configurar Prisma ORM
   - Criar modelos de dados
   - Executar migrações iniciais

3. **Implementação da Autenticação**
   - Criar serviço de autenticação
   - Implementar JWT
   - Configurar middlewares de autenticação

4. **Desenvolvimento dos Endpoints**
   - Implementar controllers e rotas
   - Configurar validação com Zod
   - Documentar com Swagger

5. **Integração com Frontend**
   - Configurar CORS
   - Testar integração com o frontend
   - Implementar hooks de API no frontend

6. **Testes e Qualidade**
   - Escrever testes unitários
   - Configurar CI/CD
   - Realizar testes de integração

7. **Deployment**
   - Configurar ambiente de produção
   - Configurar PM2
   - Implementar monitoramento

## 📚 Recursos Adicionais

- [Documentação do Prisma](https://www.prisma.io/docs/)
- [Documentação do Express](https://expressjs.com/)
- [Documentação do JWT](https://jwt.io/introduction/)
- [Documentação do Zod](https://zod.dev/)
- [Documentação do PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

*Esta documentação será atualizada conforme o desenvolvimento do backend avançar.*