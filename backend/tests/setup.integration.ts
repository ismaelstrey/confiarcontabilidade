/**
 * Configuração para testes de integração
 * Contabilidade Igrejinha Backend
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Importar configuração base
import './setup';

// Configurar banco de dados de teste
const TEST_DATABASE_URL = 'file:./test-integration.db';
process.env.DATABASE_URL = TEST_DATABASE_URL;

// Cliente Prisma para testes
let prisma: PrismaClient;

// Configuração antes de todos os testes
beforeAll(async () => {
  console.log('🔧 Configurando ambiente de testes de integração...');
  
  // Remover banco de teste anterior se existir
  const dbPath = path.join(process.cwd(), 'test-integration.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  
  // Aplicar schema do banco
  try {
    execSync('npx prisma db push --force-reset', {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'pipe'
    });
    console.log('✅ Schema do banco aplicado');
  } catch (error) {
    console.error('❌ Erro ao aplicar schema:', error);
    throw error;
  }
  
  // Inicializar cliente Prisma
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: TEST_DATABASE_URL
      }
    },
    log: ['error'] // Apenas erros para não poluir os logs de teste
  });
  
  // Conectar ao banco
  await prisma.$connect();
  console.log('✅ Conectado ao banco de teste');
  
  // Executar seed básico para testes
  await seedTestData();
  console.log('✅ Dados de teste inseridos');
}, 60000); // Timeout de 60 segundos

// Limpeza após todos os testes
afterAll(async () => {
  console.log('🧹 Limpando ambiente de testes...');
  
  if (prisma) {
    await prisma.$disconnect();
  }
  
  // Remover banco de teste
  const dbPath = path.join(process.cwd(), 'test-integration.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  
  console.log('✅ Limpeza concluída');
}, 30000);

// Limpeza entre testes (manter estrutura, limpar dados)
beforeEach(async () => {
  if (prisma) {
    // Limpar dados em ordem para respeitar foreign keys
    await prisma.articleComment.deleteMany();
    await prisma.article.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.upload.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    
    // Recriar dados básicos
    await seedTestData();
  }
});

// Função para inserir dados de teste
async function seedTestData() {
  if (!prisma) return;
  
  try {
    // Criar categorias de teste
    const category = await prisma.category.create({
      data: {
        id: 'cat-test-1',
        name: 'Categoria Teste',
        slug: 'categoria-teste',
        description: 'Categoria para testes'
      }
    });
    
    // Criar usuário de teste
    const user = await prisma.user.create({
      data: {
        id: 'user-test-1',
        email: 'test@example.com',
        name: 'Usuário Teste',
        password: '$2b$10$hash.test.password', // Hash fictício
        role: 'USER',
        isActive: true,
        profile: {
          create: {
            bio: 'Bio de teste',
            phone: '(51) 99999-9999',
            address: 'Endereço de teste'
          }
        }
      }
    });
    
    // Criar usuário admin de teste
    await prisma.user.create({
      data: {
        id: 'admin-test-1',
        email: 'admin@example.com',
        name: 'Admin Teste',
        password: '$2b$10$hash.admin.password',
        role: 'ADMIN',
        isActive: true,
        profile: {
          create: {
            bio: 'Admin de teste',
            phone: '(51) 88888-8888',
            address: 'Endereço admin'
          }
        }
      }
    });
    
    // Criar artigo de teste
    await prisma.article.create({
      data: {
        id: 'article-test-1',
        title: 'Artigo de Teste',
        slug: 'artigo-de-teste',
        content: 'Conteúdo do artigo de teste',
        excerpt: 'Resumo do artigo',
        status: 'PUBLISHED',
        authorId: user.id,
        categories: {
          connect: {
           articleId_categoryId:{
            articleId:'article-test-1',
            categoryId:'cat-test-1'
           }
          }
        },
        readingTime: 5,
        viewCount: 0
      }
    });
    
    // Criar contato de teste
    await prisma.contact.create({
      data: {
        id: 'contact-test-1',
        name: 'Contato Teste',
        email: 'contato@example.com',
        phone: '(51) 77777-7777',
        subject: 'Assunto de teste',
        message: 'Mensagem de teste',
        status: 'PENDING',
        priority: 'MEDIUM'
      }
    });
    
  } catch (error) {
    console.error('Erro ao inserir dados de teste:', error);
    throw error;
  }
}

// Utilitários específicos para testes de integração
export const integrationTestUtils = {
  // Obter cliente Prisma
  getPrisma: () => prisma,
  
  // Criar usuário de teste no banco
  createTestUser: async (data: any = {}) => {
    return await prisma.user.create({
      data: {
        email: data.email || `test-${Date.now()}@example.com`,
        name: data.name || 'Test User',
        password: data.password || '$2b$10$hash.test.password',
        role: data.role || 'USER',
        isActive: data.isActive ?? true,
        profile: {
          create: {
            bio: data.bio || 'Test bio',
            phone: data.phone || '(51) 99999-9999',
            address: data.address || 'Test address'
          }
        },
        ...data
      },
      include: {
        profile: true
      }
    });
  },
  
  // Criar artigo de teste no banco
  createTestArticle: async (data: any = {}) => {
    // Garantir que existe uma categoria
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: 'test-category',
          isActive: true
        }
      });
    }
    
    // Garantir que existe um usuário
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await integrationTestUtils.createTestUser();
    }
    
    return await prisma.article.create({
      data: {
        title: data.title || `Test Article ${Date.now()}`,
        slug: data.slug || `test-article-${Date.now()}`,
        content: data.content || 'Test content',
        excerpt: data.excerpt || 'Test excerpt',
        status: data.status || 'PUBLISHED',
        authorId: data.authorId || user.id,
        categoryId: data.categoryId || category.id,
        tags: data.tags || ['test'],
        readingTime: data.readingTime || 5,
        viewCount: data.viewCount || 0,
        ...data
      },
      include: {
        author: true,
        categories: true,
        comments: true
      }
    });
  },
  
  // Criar contato de teste no banco
  createTestContact: async (data: any = {}) => {
    return await prisma.contact.create({
      data: {
        name: data.name || 'Test Contact',
        email: data.email || `contact-${Date.now()}@example.com`,
        phone: data.phone || '(51) 99999-9999',
        subject: data.subject || 'Test Subject',
        message: data.message || 'Test message',
        status: data.status || 'PENDING',
        priority: data.priority || 'MEDIUM',
        ...data
      }
    });
  },
  
  // Limpar todas as tabelas
  clearAllTables: async () => {
    await prisma.articleComment.deleteMany();
    await prisma.article.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.upload.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
  },
  
  // Contar registros em uma tabela
  countRecords: async (model: string) => {
    return await (prisma as any)[model].count();
  }
};

console.log('🧪 Configuração de testes de integração carregada');