import { PrismaClient } from '@prisma/client';

/**
 * Instância global do Prisma Client
 * Configurada com logs baseados no ambiente
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.NODE_ENV === 'test' ? 'file:./test.db' : (process.env.DATABASE_URL || 'file:./dev.db'),
    },
  },
});

/**
 * Conecta ao banco de dados
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
};

/**
 * Desconecta do banco de dados
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
  }
};