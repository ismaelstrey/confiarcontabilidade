import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { hashPassword } from '../../utils/auth';

// Carrega variáveis de ambiente do arquivo .env.test
dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

/**
 * Configura o banco de dados de teste
 */
async function setupTestDatabase() {
  try {
    console.log('🔧 Configurando banco de dados de teste...');

    // Executa as migrações do Prisma
    console.log('📦 Executando migrações...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // Limpa dados existentes
    console.log('🧹 Limpando dados existentes...');
    await cleanDatabase();

    // Cria dados de seed para testes
    console.log('🌱 Criando dados de seed...');
    await seedTestData();

    console.log('✅ Banco de dados de teste configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados de teste:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Limpa todos os dados do banco de teste
 */
async function cleanDatabase() {
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
}

/**
 * Cria dados de seed para testes
 */
async function seedTestData() {
  // Cria usuários de teste
  const testUsers = [
    {
      name: 'Admin Test',
      email: 'admin@test.com',
      password: await hashPassword('Admin123!'),
      role: 'ADMIN' as const,
      active: true,
    },
    {
      name: 'Client Test',
      email: 'client@test.com',
      password: await hashPassword('Client123!'),
      role: 'CLIENT' as const,
      active: true,
    },
    {
      name: 'Inactive User',
      email: 'inactive@test.com',
      password: await hashPassword('Inactive123!'),
      role: 'CLIENT' as const,
      active: false,
    },
  ];

  for (const userData of testUsers) {
    await prisma.user.create({
      data: userData,
    });
  }

  console.log(`📝 Criados ${testUsers.length} usuários de teste`);

  // Aqui você pode adicionar outros dados de seed conforme necessário
  // Por exemplo: organizações, categorias, etc.
}

/**
 * Verifica se o banco de dados está acessível
 */
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados estabelecida');
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    console.log('💡 Certifique-se de que:');
    console.log('   - O PostgreSQL está rodando');
    console.log('   - As credenciais no .env.test estão corretas');
    console.log('   - O banco de dados de teste existe');
    throw error;
  }
}

/**
 * Cria o banco de dados de teste se não existir
 */
async function createTestDatabaseIfNotExists() {
  try {
    // Extrai informações da URL do banco
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL não definida no .env.test');
    }

    const url = new URL(dbUrl);
    const dbName = url.pathname.slice(1); // Remove a barra inicial
    
    console.log(`🔍 Verificando se o banco '${dbName}' existe...`);
    
    // Tenta conectar ao banco específico
    await prisma.$connect();
    console.log(`✅ Banco '${dbName}' já existe`);
  } catch (error) {
    console.log('⚠️  Banco de teste não encontrado, tentando criar...');
    
    try {
      // Aqui você pode adicionar lógica para criar o banco automaticamente
      // Por enquanto, apenas informa ao usuário
      console.log('💡 Para criar o banco de teste manualmente:');
      console.log('   createdb contabilidade_igrejinha_test');
      throw new Error('Banco de dados de teste não existe');
    } catch (createError) {
      throw createError;
    }
  }
}

// Executa o setup se o script for chamado diretamente
if (require.main === module) {
  (async () => {
    await checkDatabaseConnection();
    await createTestDatabaseIfNotExists();
    await setupTestDatabase();
  })();
}

export {
  setupTestDatabase,
  cleanDatabase,
  seedTestData,
  checkDatabaseConnection,
};