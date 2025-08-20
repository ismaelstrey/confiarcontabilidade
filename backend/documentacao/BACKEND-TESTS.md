# Testes do Backend - Contabilidade Igrejinha

Este documento contém exemplos de implementação dos principais testes para o backend da aplicação Contabilidade Igrejinha, utilizando Jest, Supertest e outras ferramentas.

## Estrutura de Testes

Os testes são organizados em três categorias principais:

1. **Testes Unitários**: Testam funções e componentes isoladamente
2. **Testes de Integração**: Testam a interação entre diferentes partes do sistema
3. **Testes End-to-End (E2E)**: Testam o fluxo completo da aplicação

## Configuração do Ambiente de Testes

### Configuração do Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/config/*.ts',
    '!src/docs/*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
};
```

### Arquivo de Setup

```typescript
// src/tests/setup.ts
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env.test
dotenv.config({ path: '.env.test' });

// Configuração global do Prisma para testes
const prisma = new PrismaClient();

// Limpa o banco de dados antes de cada teste
beforeEach(async () => {
  const tables = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tableNames = tables
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"${name}"`);

  if (tableNames.length > 0) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tableNames.join(', ')} CASCADE;`
    );
  }
});

// Fecha a conexão com o banco de dados após todos os testes
afterAll(async () => {
  await prisma.$disconnect();
});

// Configuração de timeout global
jest.setTimeout(30000);
```

### Arquivo .env.test

```
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/contabilidade_igrejinha_test
JWT_SECRET=test_jwt_secret
REFRESH_TOKEN_SECRET=test_refresh_token_secret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=test_user
EMAIL_PASS=test_pass
EMAIL_FROM_NAME=Contabilidade Igrejinha
EMAIL_FROM_ADDRESS=contato@contabilidadeigrejinha.com.br
ADMIN_EMAIL=admin@contabilidadeigrejinha.com.br
```

## Testes Unitários

### Testes de Utilitários

```typescript
// src/utils/__tests__/auth.test.ts
import { hashPassword, comparePassword, generateToken, verifyToken } from '../auth';
import jwt from 'jsonwebtoken';

describe('Auth Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'test123';
      const hashedPassword = await hashPassword(password);
      
      // Verifica se o hash é uma string
      expect(typeof hashedPassword).toBe('string');
      
      // Verifica se o hash é diferente da senha original
      expect(hashedPassword).not.toBe(password);
      
      // Verifica se o hash tem o formato correto (começa com $2b$)
      expect(hashedPassword).toMatch(/^\$2[aby]\$/); 
    });
  });
  
  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'test123';
      const hashedPassword = await hashPassword(password);
      
      const result = await comparePassword(password, hashedPassword);
      expect(result).toBe(true);
    });
    
    it('should return false for non-matching password', async () => {
      const password = 'test123';
      const wrongPassword = 'wrong123';
      const hashedPassword = await hashPassword(password);
      
      const result = await comparePassword(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });
  
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'CLIENT',
        name: 'Test User',
        password: 'hashedpassword',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        tokenVersion: 1,
      };
      
      const token = generateToken(user);
      
      // Verifica se o token é uma string
      expect(typeof token).toBe('string');
      
      // Verifica se o token pode ser decodificado
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret');
      expect(decoded).toHaveProperty('id', '1');
      expect(decoded).toHaveProperty('email', 'test@example.com');
      expect(decoded).toHaveProperty('role', 'CLIENT');
    });
  });
  
  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'CLIENT',
        name: 'Test User',
        password: 'hashedpassword',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        tokenVersion: 1,
      };
      
      const token = generateToken(user);
      const decoded = verifyToken(token);
      
      expect(decoded).toHaveProperty('id', '1');
      expect(decoded).toHaveProperty('email', 'test@example.com');
      expect(decoded).toHaveProperty('role', 'CLIENT');
    });
    
    it('should return null for an invalid token', () => {
      const result = verifyToken('invalid.token.here');
      expect(result).toBeNull();
    });
  });
});
```

### Testes de Validadores

```typescript
// src/validators/__tests__/authValidation.test.ts
import { authValidation } from '../authValidation';

describe('Auth Validation', () => {
  describe('register', () => {
    it('should validate valid registration data', () => {
      const validData = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        },
      };
      
      const result = authValidation.register.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid email', () => {
      const invalidData = {
        body: {
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        },
      };
      
      const result = authValidation.register.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.body?.email?._errors).toContain('Email inválido');
      }
    });
    
    it('should reject short name', () => {
      const invalidData = {
        body: {
          name: 'Te',
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        },
      };
      
      const result = authValidation.register.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.body?.name?._errors).toContain('Nome deve ter pelo menos 3 caracteres');
      }
    });
    
    it('should reject weak password', () => {
      const invalidData = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password',
          confirmPassword: 'password',
        },
      };
      
      const result = authValidation.register.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.body?.password?._errors).toBeTruthy();
      }
    });
    
    it('should reject mismatched passwords', () => {
      const invalidData = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword123!',
        },
      };
      
      const result = authValidation.register.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.body?.confirmPassword?._errors).toContain('Senhas não conferem');
      }
    });
  });
  
  describe('login', () => {
    it('should validate valid login data', () => {
      const validData = {
        body: {
          email: 'test@example.com',
          password: 'Password123!',
        },
      };
      
      const result = authValidation.login.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid email', () => {
      const invalidData = {
        body: {
          email: 'invalid-email',
          password: 'Password123!',
        },
      };
      
      const result = authValidation.login.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.body?.email?._errors).toContain('Email inválido');
      }
    });
    
    it('should reject empty password', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
          password: '',
        },
      };
      
      const result = authValidation.login.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.body?.password?._errors).toContain('Senha é obrigatória');
      }
    });
  });
});
```

### Testes de Serviços

```typescript
// src/services/__tests__/authService.test.ts
import { AuthService } from '../authService';
import { UserRepository } from '../../repositories/userRepository';
import { hashPassword } from '../../utils/auth';
import { AuthenticationError, ValidationError, NotFoundError } from '../../utils/error';

// Mock do repositório
jest.mock('../../repositories/userRepository');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  
  beforeEach(() => {
    // Limpa todos os mocks
    jest.clearAllMocks();
    
    // Cria uma instância mockada do repositório
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    
    // Cria o serviço com o repositório mockado
    authService = new AuthService(userRepository);
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Configura o mock para simular que o email não existe
      userRepository.findByEmail.mockResolvedValue(null);
      
      // Configura o mock para simular a criação do usuário
      const createdUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'CLIENT',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        tokenVersion: 1,
      };
      userRepository.create.mockResolvedValue(createdUser);
      
      // Dados para registro
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };
      
      // Executa o método de registro
      const result = await authService.register(userData);
      
      // Verifica se o método findByEmail foi chamado com o email correto
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      
      // Verifica se o método create foi chamado
      expect(userRepository.create).toHaveBeenCalled();
      
      // Verifica se o resultado contém o usuário criado (sem a senha)
      expect(result).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CLIENT',
        active: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      
      // Verifica se a senha não está presente no resultado
      expect(result).not.toHaveProperty('password');
    });
    
    it('should throw an error if email already exists', async () => {
      // Configura o mock para simular que o email já existe
      const existingUser = {
        id: '1',
        name: 'Existing User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'CLIENT',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        tokenVersion: 1,
      };
      userRepository.findByEmail.mockResolvedValue(existingUser);
      
      // Dados para registro
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };
      
      // Verifica se o método lança um erro
      await expect(authService.register(userData)).rejects.toThrow(ValidationError);
      
      // Verifica se o método findByEmail foi chamado com o email correto
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      
      // Verifica se o método create não foi chamado
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });
  
  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Senha original e hash
      const password = 'Password123!';
      const hashedPassword = await hashPassword(password);
      
      // Configura o mock para simular que o usuário existe
      const existingUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'CLIENT',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        tokenVersion: 1,
      };
      userRepository.findByEmail.mockResolvedValue(existingUser);
      
      // Dados para login
      const loginData = {
        email: 'test@example.com',
        password: password,
      };
      
      // Executa o método de login
      const result = await authService.login(loginData);
      
      // Verifica se o método findByEmail foi chamado com o email correto
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      
      // Verifica se o resultado contém o token e o usuário
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CLIENT',
        active: true,
      });
      
      // Verifica se a senha não está presente no resultado
      expect(result.user).not.toHaveProperty('password');
    });
    
    it('should throw an error if user does not exist', async () => {
      // Configura o mock para simular que o usuário não existe
      userRepository.findByEmail.mockResolvedValue(null);
      
      // Dados para login
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };
      
      // Verifica se o método lança um erro
      await expect(authService.login(loginData)).rejects.toThrow(AuthenticationError);
      
      // Verifica se o método findByEmail foi chamado com o email correto
      expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
    
    it('should throw an error if password is incorrect', async () => {
      // Senha original e hash
      const password = 'Password123!';
      const hashedPassword = await hashPassword(password);
      
      // Configura o mock para simular que o usuário existe
      const existingUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'CLIENT',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        tokenVersion: 1,
      };
      userRepository.findByEmail.mockResolvedValue(existingUser);
      
      // Dados para login com senha incorreta
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };
      
      // Verifica se o método lança um erro
      await expect(authService.login(loginData)).rejects.toThrow(AuthenticationError);
      
      // Verifica se o método findByEmail foi chamado com o email correto
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
    
    it('should throw an error if user is not active', async () => {
      // Senha original e hash
      const password = 'Password123!';
      const hashedPassword = await hashPassword(password);
      
      // Configura o mock para simular que o usuário existe mas não está ativo
      const existingUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'CLIENT',
        active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tokenVersion: 1,
      };
      userRepository.findByEmail.mockResolvedValue(existingUser);
      
      // Dados para login
      const loginData = {
        email: 'test@example.com',
        password: password,
      };
      
      // Verifica se o método lança um erro
      await expect(authService.login(loginData)).rejects.toThrow(AuthenticationError);
      
      // Verifica se o método findByEmail foi chamado com o email correto
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
});
```

## Testes de Integração

### Configuração do Supertest

```typescript
// src/tests/helpers/testServer.ts
import express from 'express';
import { setupApp } from '../../app';

/**
 * Cria uma instância do aplicativo Express para testes
 * @returns Aplicativo Express configurado
 */
export const createTestServer = async () => {
  const app = express();
  await setupApp(app);
  return app;
};
```

### Testes de Rotas de Autenticação

```typescript
// src/routes/__tests__/authRoutes.test.ts
import request from 'supertest';
import { Express } from 'express';
import { createTestServer } from '../../tests/helpers/testServer';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../utils/auth';

describe('Auth Routes', () => {
  let app: Express;
  let prisma: PrismaClient;
  
  beforeAll(async () => {
    app = await createTestServer();
    prisma = new PrismaClient();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'register-test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('name', 'Test User');
      expect(response.body.data.user).toHaveProperty('email', 'register-test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });
    
    it('should return 400 for existing email', async () => {
      // Cria um usuário primeiro
      const userData = {
        name: 'Existing User',
        email: 'existing-test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      // Tenta registrar com o mesmo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Email já está em uso');
    });
    
    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'Te', // Nome muito curto
        email: 'invalid-email', // Email inválido
        password: 'weak', // Senha fraca
        confirmPassword: 'different', // Senhas não conferem
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Cria um usuário para os testes de login
      const hashedPassword = await hashPassword('Password123!');
      
      await prisma.user.upsert({
        where: { email: 'login-test@example.com' },
        update: {},
        create: {
          name: 'Login Test User',
          email: 'login-test@example.com',
          password: hashedPassword,
          role: 'CLIENT',
          active: true,
        },
      });
    });
    
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'login-test@example.com',
        password: 'Password123!',
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('name', 'Login Test User');
      expect(response.body.data.user).toHaveProperty('email', 'login-test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });
    
    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'login-test@example.com',
        password: 'WrongPassword123!',
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Email ou senha inválidos');
    });
    
    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Email ou senha inválidos');
    });
  });
});
```

### Testes de Rotas Protegidas

```typescript
// src/routes/__tests__/protectedRoutes.test.ts
import request from 'supertest';
import { Express } from 'express';
import { createTestServer } from '../../tests/helpers/testServer';
import { PrismaClient } from '@prisma/client';
import { hashPassword, generateToken } from '../../utils/auth';

describe('Protected Routes', () => {
  let app: Express;
  let prisma: PrismaClient;
  let authToken: string;
  let userId: string;
  
  beforeAll(async () => {
    app = await createTestServer();
    prisma = new PrismaClient();
    
    // Cria um usuário para os testes
    const hashedPassword = await hashPassword('Password123!');
    
    const user = await prisma.user.upsert({
      where: { email: 'protected-test@example.com' },
      update: {},
      create: {
        name: 'Protected Routes Test User',
        email: 'protected-test@example.com',
        password: hashedPassword,
        role: 'CLIENT',
        active: true,
      },
    });
    
    userId = user.id;
    authToken = generateToken(user);
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  describe('GET /api/users/me', () => {
    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', userId);
      expect(response.body.data.user).toHaveProperty('name', 'Protected Routes Test User');
      expect(response.body.data.user).toHaveProperty('email', 'protected-test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });
    
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Não autenticado');
    });
    
    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Não autenticado');
    });
  });
  
  describe('PUT /api/users/me', () => {
    it('should update user profile when authenticated', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '(11) 98765-4321',
      };
      
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', userId);
      expect(response.body.data.user).toHaveProperty('name', 'Updated Name');
      expect(response.body.data.user).toHaveProperty('phone', '(11) 98765-4321');
    });
    
    it('should return 401 when not authenticated', async () => {
      const updateData = {
        name: 'Another Name',
      };
      
      const response = await request(app)
        .put('/api/users/me')
        .send(updateData)
        .expect(401);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Não autenticado');
    });
  });
});
```

### Testes de Rotas de Contato

```typescript
// src/routes/__tests__/contactRoutes.test.ts
import request from 'supertest';
import { Express } from 'express';
import { createTestServer } from '../../tests/helpers/testServer';
import { PrismaClient } from '@prisma/client';
import { hashPassword, generateToken } from '../../utils/auth';

describe('Contact Routes', () => {
  let app: Express;
  let prisma: PrismaClient;
  let adminToken: string;
  
  beforeAll(async () => {
    app = await createTestServer();
    prisma = new PrismaClient();
    
    // Cria um usuário admin para os testes
    const hashedPassword = await hashPassword('Password123!');
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin-test@example.com' },
      update: { role: 'ADMIN' },
      create: {
        name: 'Admin Test User',
        email: 'admin-test@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        active: true,
      },
    });
    
    adminToken = generateToken(admin);
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  describe('POST /api/contacts', () => {
    it('should create a new contact', async () => {
      const contactData = {
        name: 'Contact Test',
        email: 'contact-test@example.com',
        phone: '(11) 98765-4321',
        message: 'This is a test message for the contact form.',
        service: 'Contabilidade',
      };
      
      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(201);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('contact');
      expect(response.body.data.contact).toHaveProperty('id');
      expect(response.body.data.contact).toHaveProperty('name', 'Contact Test');
      expect(response.body.data.contact).toHaveProperty('email', 'contact-test@example.com');
      expect(response.body.data.contact).toHaveProperty('status', 'PENDING');
    });
    
    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'Co', // Nome muito curto
        email: 'invalid-email', // Email inválido
        phone: '123', // Telefone inválido
        message: 'Short', // Mensagem muito curta
      };
      
      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/contacts', () => {
    beforeEach(async () => {
      // Cria alguns contatos para os testes
      await prisma.contact.createMany({
        data: [
          {
            name: 'Contact 1',
            email: 'contact1@example.com',
            phone: '(11) 98765-4321',
            message: 'Message 1',
            status: 'PENDING',
          },
          {
            name: 'Contact 2',
            email: 'contact2@example.com',
            phone: '(11) 98765-4322',
            message: 'Message 2',
            status: 'CONTACTED',
          },
          {
            name: 'Contact 3',
            email: 'contact3@example.com',
            phone: '(11) 98765-4323',
            message: 'Message 3',
            status: 'CONVERTED',
          },
        ],
      });
    });
    
    it('should return all contacts for admin', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('contacts');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.contacts).toBeInstanceOf(Array);
      expect(response.body.data.contacts.length).toBeGreaterThanOrEqual(3);
    });
    
    it('should return 401 for unauthenticated users', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .expect(401);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Não autenticado');
    });
    
    it('should filter contacts by status', async () => {
      const response = await request(app)
        .get('/api/contacts?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('contacts');
      expect(response.body.data.contacts).toBeInstanceOf(Array);
      
      // Verifica se todos os contatos retornados têm status PENDING
      response.body.data.contacts.forEach((contact: any) => {
        expect(contact.status).toBe('PENDING');
      });
    });
  });
  
  describe('PUT /api/contacts/:id/status', () => {
    let contactId: string;
    
    beforeEach(async () => {
      // Cria um contato para os testes
      const contact = await prisma.contact.create({
        data: {
          name: 'Status Test Contact',
          email: 'status-test@example.com',
          phone: '(11) 98765-4321',
          message: 'Test message for status update',
          status: 'PENDING',
        },
      });
      
      contactId = contact.id;
    });
    
    it('should update contact status for admin', async () => {
      const updateData = {
        status: 'CONTACTED',
      };
      
      const response = await request(app)
        .put(`/api/contacts/${contactId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('contact');
      expect(response.body.data.contact).toHaveProperty('id', contactId);
      expect(response.body.data.contact).toHaveProperty('status', 'CONTACTED');
    });
    
    it('should return 401 for unauthenticated users', async () => {
      const updateData = {
        status: 'CONTACTED',
      };
      
      const response = await request(app)
        .put(`/api/contacts/${contactId}/status`)
        .send(updateData)
        .expect(401);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Não autenticado');
    });
    
    it('should return 400 for invalid status', async () => {
      const updateData = {
        status: 'INVALID_STATUS',
      };
      
      const response = await request(app)
        .put(`/api/contacts/${contactId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 404 for non-existent contact', async () => {
      const updateData = {
        status: 'CONTACTED',
      };
      
      const response = await request(app)
        .put(`/api/contacts/00000000-0000-0000-0000-000000000000/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('não encontrado');
    });
  });
});
```

## Testes End-to-End (E2E)

### Configuração do Ambiente E2E

```typescript
// src/tests/e2e/setup.ts
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../utils/auth';

/**
 * Configura o ambiente para testes E2E
 */
export const setupE2EEnvironment = async () => {
  const prisma = new PrismaClient();
  
  try {
    // Limpa o banco de dados
    const tables = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tableNames = tables
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"${name}"`);

    if (tableNames.length > 0) {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE ${tableNames.join(', ')} CASCADE;`
      );
    }
    
    // Cria dados iniciais para os testes
    
    // Cria um usuário admin
    const adminPassword = await hashPassword('Admin123!');
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'ADMIN',
        active: true,
      },
    });
    
    // Cria um usuário cliente
    const clientPassword = await hashPassword('Client123!');
    await prisma.user.create({
      data: {
        name: 'Client User',
        email: 'client@example.com',
        password: clientPassword,
        role: 'CLIENT',
        active: true,
      },
    });
    
    // Cria alguns serviços
    await prisma.service.createMany({
      data: [
        {
          title: 'Contabilidade para MEI',
          description: 'Serviços contábeis para Microempreendedores Individuais',
          content: 'Conteúdo detalhado sobre contabilidade para MEI...',
          icon: 'calculator',
          featured: true,
          order: 1,
          slug: 'contabilidade-mei',
        },
        {
          title: 'Contabilidade para Empresas',
          description: 'Serviços contábeis para empresas de pequeno e médio porte',
          content: 'Conteúdo detalhado sobre contabilidade para empresas...',
          icon: 'building',
          featured: true,
          order: 2,
          slug: 'contabilidade-empresas',
        },
        {
          title: 'Consultoria Fiscal',
          description: 'Consultoria especializada em planejamento tributário',
          content: 'Conteúdo detalhado sobre consultoria fiscal...',
          icon: 'file-text',
          featured: false,
          order: 3,
          slug: 'consultoria-fiscal',
        },
      ],
    });
    
    // Cria alguns artigos
    await prisma.article.createMany({
      data: [
        {
          title: 'Como abrir um MEI em 2023',
          excerpt: 'Guia completo para abrir seu MEI de forma rápida e segura',
          content: 'Conteúdo detalhado sobre como abrir um MEI...',
          author: 'Admin User',
          publishedAt: new Date(),
          category: 'MEI',
          tags: ['mei', 'empreendedorismo', 'contabilidade'],
          featured: true,
          readTime: 5,
          slug: 'como-abrir-mei-2023',
        },
        {
          title: 'Mudanças na legislação tributária para 2023',
          excerpt: 'Confira as principais mudanças na legislação tributária',
          content: 'Conteúdo detalhado sobre mudanças na legislação...',
          author: 'Admin User',
          publishedAt: new Date(),
          category: 'Tributário',
          tags: ['impostos', 'legislação', 'tributos'],
          featured: true,
          readTime: 8,
          slug: 'mudancas-legislacao-tributaria-2023',
        },
      ],
    });
    
    // Cria algumas FAQs
    await prisma.fAQ.createMany({
      data: [
        {
          question: 'O que é MEI?',
          answer: 'MEI é a sigla para Microempreendedor Individual...',
          category: 'MEI',
          order: 1,
        },
        {
          question: 'Quais impostos uma empresa do Simples Nacional paga?',
          answer: 'As empresas do Simples Nacional pagam...',
          category: 'Tributário',
          order: 2,
        },
        {
          question: 'Como funciona a declaração do Imposto de Renda para empresas?',
          answer: 'A declaração do Imposto de Renda para empresas...',
          category: 'Imposto de Renda',
          order: 3,
        },
      ],
    });
    
    console.log('E2E environment setup completed successfully');
  } catch (error) {
    console.error('Error setting up E2E environment:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Se este arquivo for executado diretamente
if (require.main === module) {
  setupE2EEnvironment()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
```

### Teste E2E de Fluxo de Autenticação

```typescript
// src/tests/e2e/auth.e2e.test.ts
import request from 'supertest';
import { Express } from 'express';
import { createTestServer } from '../helpers/testServer';

describe('Authentication E2E Flow', () => {
  let app: Express;
  let authToken: string;
  let refreshToken: string;
  
  beforeAll(async () => {
    app = await createTestServer();
  });
  
  it('should register a new user', async () => {
    const userData = {
      name: 'E2E Test User',
      email: 'e2e-test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('email', 'e2e-test@example.com');
  });
  
  it('should login with the registered user', async () => {
    const loginData = {
      email: 'e2e-test@example.com',
      password: 'Password123!',
    };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('refreshToken');
    expect(response.body.data).toHaveProperty('user');
    
    // Salva os tokens para uso em testes subsequentes
    authToken = response.body.data.token;
    refreshToken = response.body.data.refreshToken;
  });
  
  it('should access protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('email', 'e2e-test@example.com');
  });
  
  it('should refresh token successfully', async () => {
    const refreshData = {
      refreshToken,
    };
    
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .send(refreshData)
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('refreshToken');
    
    // Atualiza os tokens
    authToken = response.body.data.token;
    refreshToken = response.body.data.refreshToken;
  });
  
  it('should update user profile', async () => {
    const updateData = {
      name: 'Updated E2E User',
      phone: '(11) 98765-4321',
    };
    
    const response = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData)
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('name', 'Updated E2E User');
    expect(response.body.data.user).toHaveProperty('phone', '(11) 98765-4321');
  });
  
  it('should change password successfully', async () => {
    const changePasswordData = {
      currentPassword: 'Password123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };
    
    const response = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send(changePasswordData)
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Senha alterada com sucesso');
  });
  
  it('should login with the new password', async () => {
    const loginData = {
      email: 'e2e-test@example.com',
      password: 'NewPassword123!',
    };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('token');
  });
  
  it('should logout successfully', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Logout realizado com sucesso');
  });
  
  it('should not access protected route after logout', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(401);
    
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Não autenticado');
  });
});
```

### Teste E2E de Fluxo de Contato e Calculadora

```typescript
// src/tests/e2e/contact-calculator.e2e.test.ts
import request from 'supertest';
import { Express } from 'express';
import { createTestServer } from '../helpers/testServer';

describe('Contact and Calculator E2E Flow', () => {
  let app: Express;
  let adminToken: string;
  let contactId: string;
  
  beforeAll(async () => {
    app = await createTestServer();
    
    // Login como admin
    const loginData = {
      email: 'admin@example.com',
      password: 'Admin123!',
    };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData);
    
    adminToken = response.body.data.token;
  });
  
  it('should submit a contact form', async () => {
    const contactData = {
      name: 'E2E Contact Test',
      email: 'e2e-contact@example.com',
      phone: '(11) 98765-4321',
      message: 'This is a test message from the E2E test.',
      service: 'Contabilidade para MEI',
    };
    
    const response = await request(app)
      .post('/api/contacts')
      .send(contactData)
      .expect(201);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('contact');
    expect(response.body.data.contact).toHaveProperty('id');
    expect(response.body.data.contact).toHaveProperty('name', 'E2E Contact Test');
    expect(response.body.data.contact).toHaveProperty('status', 'PENDING');
    
    contactId = response.body.data.contact.id;
  });
  
  it('should list contacts as admin', async () => {
    const response = await request(app)
      .get('/api/contacts')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('contacts');
    expect(response.body.data.contacts).toBeInstanceOf(Array);
    
    // Verifica se o contato criado está na lista
    const foundContact = response.body.data.contacts.find(
      (contact: any) => contact.id === contactId
    );
    expect(foundContact).toBeTruthy();
  });
  
  it('should update contact status as admin', async () => {
    const updateData = {
      status: 'CONTACTED',
    };
    
    const response = await request(app)
      .put(`/api/contacts/${contactId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('contact');
    expect(response.body.data.contact).toHaveProperty('id', contactId);
    expect(response.body.data.contact).toHaveProperty('status', 'CONTACTED');
  });
  
  it('should use the tax calculator', async () => {
    const calculatorData = {
      revenue: 100000,
      expenses: 30000,
      employees: 2,
      taxRegime: 'SIMPLES_NACIONAL',
      businessType: 'SERVICOS',
    };
    
    const response = await request(app)
      .post('/api/calculator/tax')
      .send(calculatorData)
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('result');
    expect(response.body.data.result).toHaveProperty('totalTax');
    expect(response.body.data.result).toHaveProperty('netProfit');
    expect(response.body.data.result).toHaveProperty('taxBreakdown');
    expect(response.body.data.result.taxBreakdown).toBeInstanceOf(Object);
  });
  
  it('should save calculator result when authenticated', async () => {
    // Login como cliente
    const loginData = {
      email: 'client@example.com',
      password: 'Client123!',
    };
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send(loginData);
    
    const clientToken = loginResponse.body.data.token;
    
    // Dados da calculadora
    const calculatorData = {
      revenue: 150000,
      expenses: 50000,
      employees: 3,
      taxRegime: 'LUCRO_PRESUMIDO',
      businessType: 'COMERCIO',
      saveResult: true,
    };
    
    const response = await request(app)
      .post('/api/calculator/tax')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(calculatorData)
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('result');
    expect(response.body.data).toHaveProperty('savedCalculation');
    expect(response.body.data.savedCalculation).toHaveProperty('id');
  });
});
```

## Executando os Testes

### Scripts do package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=src/.*\\.test\\.ts$",
    "test:integration": "jest --testPathPattern=src/.*\\.integration\\.test\\.ts$",
    "test:e2e": "jest --testPathPattern=src/tests/e2e/.*\\.e2e\\.test\\.ts$",
    "test:setup-e2e": "ts-node src/tests/e2e/setup.ts"
  }
}
```

### Comandos para Execução

```bash
# Executar todos os testes
npm test

# Executar testes em modo de observação (watch mode)
npm run test:watch

# Executar testes e gerar relatório de cobertura
npm run test:coverage

# Executar apenas testes unitários
npm run test:unit

# Executar apenas testes de integração
npm run test:integration

# Configurar ambiente para testes E2E
npm run test:setup-e2e

# Executar testes E2E
npm run test:e2e
```

## Boas Práticas de Testes

1. **Isolamento**: Cada teste deve ser independente e não depender do estado de outros testes.

2. **Mocks e Stubs**: Use mocks para simular dependências externas e isolar a unidade sendo testada.

3. **Banco de Dados de Teste**: Use um banco de dados separado para testes, preferencialmente em memória ou em um container Docker.

4. **Limpeza**: Limpe o estado do banco de dados antes e depois dos testes para garantir isolamento.

5. **Cobertura**: Mantenha uma boa cobertura de testes, especialmente para lógica de negócios crítica.

6. **Testes Determinísticos**: Evite testes que dependem de fatores externos como data/hora atual ou valores aleatórios.

7. **Nomenclatura Clara**: Use nomes descritivos para seus testes que expliquem o que está sendo testado e o resultado esperado.

8. **Organização**: Organize os testes em uma estrutura que reflita a estrutura do código sendo testado.

9. **Testes Rápidos**: Mantenha os testes unitários rápidos para feedback imediato durante o desenvolvimento.

10. **CI/CD**: Integre os testes ao pipeline de CI/CD para garantir que todos os testes sejam executados antes do deploy.

## Conclusão

Este documento fornece exemplos de implementação dos principais testes para o backend da aplicação Contabilidade Igrejinha. Os exemplos cobrem testes unitários, de integração e end-to-end, fornecendo uma base sólida para o desenvolvimento de testes para o projeto.

A implementação de testes automatizados é essencial para garantir a qualidade do código, facilitar a manutenção e permitir a evolução do sistema com confiança. Seguindo as boas práticas e exemplos fornecidos, a equipe de desenvolvimento pode criar uma suíte de testes robusta que ajudará a identificar problemas precocemente e garantir que o sistema funcione conforme esperado.