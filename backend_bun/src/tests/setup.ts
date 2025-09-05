/**
 * Configuração global para testes
 * Este arquivo é executado antes de todos os testes
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import { prisma } from '../lib/prisma';

// Configurar ambiente de teste
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';

/**
 * Configuração antes de todos os testes
 */
beforeAll(async () => {
  // Conectar ao banco de dados de teste
  await prisma.$connect();
  
  // Executar migrações se necessário
  // await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
  
  console.log('🧪 Configuração de testes inicializada');
});

/**
 * Limpeza após todos os testes
 */
afterAll(async () => {
  // Limpar banco de dados de teste
  await cleanDatabase();
  
  // Desconectar do banco
  await prisma.$disconnect();
  
  console.log('🧹 Limpeza de testes concluída');
});

/**
 * Limpeza antes de cada teste
 */
beforeEach(async () => {
  // Limpar dados entre testes para isolamento
  await cleanDatabase();
});

/**
 * Função para limpar o banco de dados
 */
export async function cleanDatabase() {
  try {
    // Desabilitar foreign key constraints temporariamente
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF`;
    
    const tablenames = await prisma.$queryRaw<
      Array<{ name: string }>
    >`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';`;

    const tables = tablenames
      .map(({ name }) => name)
      .filter((name) => name !== '_prisma_migrations');

    // Deletar dados de todas as tabelas
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
    }
    
    // Reabilitar foreign key constraints
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
  } catch (error) {
    console.log('Erro ao limpar banco de dados:', error);
    // Garantir que foreign keys sejam reabilitadas mesmo em caso de erro
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
  }
}

/**
 * Função helper para criar usuário de teste
 */
export async function createTestUser(overrides: any = {}) {
  const defaultUser = {
    email: 'test@example.com',
    name: 'Test User',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPyS/K2u', // 'password123'
    role: 'USER',
    isActive: true,
    ...overrides
  };

  const user = await prisma.user.create({
    data: defaultUser
  });

  const token = generateTestToken(user.id, user.role);

  return {
    ...user,
    token
  };
}

/**
 * Função helper para criar admin de teste
 */
export async function createTestAdmin(overrides: any = {}) {
  return await createTestUser({
    email: 'admin@example.com',
    name: 'Test Admin',
    role: 'ADMIN',
    ...overrides
  });
}

/**
 * Função helper para gerar token JWT de teste
 */
export function generateTestToken(userId: string, role: string = 'USER') {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

/**
 * Função helper para fazer requisições autenticadas
 */
export function createAuthHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}