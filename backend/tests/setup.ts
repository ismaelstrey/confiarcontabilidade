/**
 * Configuração global para testes unitários
 * Contabilidade Igrejinha Backend
 */

import { jest } from '@jest/globals';

// Configurar timezone para testes consistentes
process.env.TZ = 'UTC';

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.DATABASE_URL = 'file:./test.db';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.LOG_LEVEL = 'error';
process.env.UPLOAD_PATH = './test-uploads';

// Mock de console para testes mais limpos
global.console = {
  ...console,
  // Manter apenas erros importantes
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error, // Manter erros visíveis
};

// Configurações globais de timeout
jest.setTimeout(30000);

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Configurar matchers customizados (se necessário)
expect.extend({
  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },
  
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = typeof received === 'string' && uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
});

// Declarar tipos para os matchers customizados
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toBeValidUUID(): R;
    }
  }
}

// Configurar mocks globais para módulos externos
// jest.mock('nodemailer', () => ({
//   createTransport: jest.fn(() => ({
//     sendMail: jest.fn().mockResolvedValue("Teste" ),
//     verify: jest.fn().mockResolvedValue(true),
//   })),
// }));

jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    flushall: jest.fn(),
    quit: jest.fn(),
    // ping: jest.fn().mockResolvedValue('PONG'),
    on: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  };
  
  return jest.fn(() => mockRedis);
});

// Mock do winston para evitar problemas de logging em testes
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
  format: {
    combine: jest.fn(() => jest.fn()),
    timestamp: jest.fn(() => jest.fn()),
    errors: jest.fn(() => jest.fn()),
    json: jest.fn(() => jest.fn()),
    colorize: jest.fn(() => jest.fn()),
    simple: jest.fn(() => jest.fn()),
    printf: jest.fn(() => jest.fn()),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

// Mock do logger middleware
jest.mock('../src/middlewares/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  logStream: {
    write: jest.fn(),
  },
  logPerformance: jest.fn(),
  logDatabaseQuery: jest.fn(),
  logAuth: jest.fn(),
  logFileUpload: jest.fn(),
  logEmail: jest.fn(),
  logCache: jest.fn(),
}));

// Mock dos middlewares de segurança
jest.mock('../src/middlewares/security', () => ({
  corsMiddleware: jest.fn((req: any, res: any, next: any) => next()),
  helmetMiddleware: jest.fn((req: any, res: any, next: any) => next()),
  generalRateLimit: jest.fn((req: any, res: any, next: any) => next()),
  authRateLimit: jest.fn((req: any, res: any, next: any) => next()),
  apiRateLimit: jest.fn((req: any, res: any, next: any) => next()),
  uploadRateLimit: jest.fn((req: any, res: any, next: any) => next()),
  compressionMiddleware: jest.fn((req: any, res: any, next: any) => next()),
  customSecurityHeaders: jest.fn((req: any, res: any, next: any) => next()),
  securityLogger: jest.fn((req: any, res: any, next: any) => next()),
}));

// Mock do express-rate-limit
jest.mock('express-rate-limit', () => {
  return jest.fn(() => (req: any, res: any, next: any) => next());
});

// Mock do multer para upload de arquivos
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req: any, res: any, next: any) => {
      req.file = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        filename: 'test-123.jpg',
        path: '/tmp/test-123.jpg',
      };
      next();
    },
    array: () => (req: any, res: any, next: any) => {
      req.files = [
        {
          fieldname: 'files',
          originalname: 'test1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 1024,
          filename: 'test1-123.jpg',
          path: '/tmp/test1-123.jpg',
        },
      ];
      next();
    },
  });
  
  multer.memoryStorage = jest.fn();
  multer.diskStorage = jest.fn();
  
  return multer;
});

// Utilitários para testes
export const testUtils = {
  // Criar um usuário de teste
  createTestUser: () => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  // Criar um token JWT de teste
  createTestToken: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
  
  // Criar dados de requisição de teste
  createTestRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: testUtils.createTestUser(),
    ...overrides,
  }),
  
  // Criar dados de resposta de teste
  createTestResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  },
  
  // Aguardar um tempo específico (para testes com timers)
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

console.log('🧪 Configuração de testes carregada');