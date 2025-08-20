import { PrismaClient } from '@prisma/client';

/**
 * Configuração global do Prisma Client otimizada para Bun
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Instância do Prisma Client com configurações otimizadas
 */
export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  });

// Evitar múltiplas instâncias em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Conectar ao banco de dados
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    throw error;
  }
};

/**
 * Desconectar do banco de dados
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
    throw error;
  }
};

/**
 * Verificar saúde da conexão com o banco
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Erro na verificação de saúde do banco:', error);
    return false;
  }
};

/**
 * Executar transação com retry automático
 */
export const executeTransaction = async <T>(
  fn: (prisma: PrismaClient) => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn);
    } catch (error: any) {
      lastError = error;
      console.warn(`❌ Tentativa ${attempt} de transação falhou:`, error.message);
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Aguardar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  
  throw lastError!;
};

/**
 * Limpar cache de consultas (útil para testes)
 */
export const clearQueryCache = async (): Promise<void> => {
  try {
    // Prisma não tem um método direto para limpar cache,
    // mas podemos forçar uma reconexão
    await prisma.$disconnect();
    await prisma.$connect();
    console.log('✅ Cache de consultas limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
  }
};

/**
 * Estatísticas de performance do banco
 */
export const getDatabaseStats = async () => {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      LIMIT 10
    `;
    
    return stats;
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do banco:', error);
    return null;
  }
};

// Configurar handlers para graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default prisma;