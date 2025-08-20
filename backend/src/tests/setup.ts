import { cacheService } from '../services/cacheService';
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente de teste
dotenv.config({ path: '.env.test' });

// Limpa o banco de dados antes de cada teste (apenas para testes de integração)
beforeEach(async () => {
  // Pula limpeza do banco para testes unitários
  if (process.env.JEST_WORKER_ID && !process.env.RUN_INTEGRATION_TESTS) {
    return;
  }

  try {
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
  } catch (error) {
    // Ignora erros de conexão para testes unitários
    if (!process.env.RUN_INTEGRATION_TESTS) {
      return;
    }
    console.log('Error cleaning database:', error);
  }
});

// Fecha a conexão com o banco de dados após todos os testes
afterAll(async () => {
  await prisma.$disconnect();
});

// Configuração de timeout global
jest.setTimeout(30000);

// Mock do console para evitar logs desnecessários durante os testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Configuração de variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_token_secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';

export { prisma };