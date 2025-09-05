import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@contabilidadeigrejinha.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      isActive: true,
      profile: {
        create: {
          bio: 'Administrador do sistema',
        },
      },
    },
  });

  console.log('✅ Usuário admin criado:', adminUser.email);

  // Criar categorias padrão
  const categories = [
    {
      name: 'Contabilidade',
      slug: 'contabilidade',
      description: 'Artigos sobre contabilidade geral',
      color: '#3B82F6',
    },
    {
      name: 'Impostos',
      slug: 'impostos',
      description: 'Informações sobre impostos e tributação',
      color: '#EF4444',
    },
    {
      name: 'Finanças',
      slug: 'financas',
      description: 'Dicas e orientações financeiras',
      color: '#10B981',
    },
    {
      name: 'Legislação',
      slug: 'legislacao',
      description: 'Atualizações sobre legislação contábil',
      color: '#8B5CF6',
    },
    {
      name: 'Dicas',
      slug: 'dicas',
      description: 'Dicas práticas para o dia a dia',
      color: '#F59E0B',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categorias criadas');

  // Criar tags padrão
  const tags = [
    { name: 'Iniciante', slug: 'iniciante' },
    { name: 'Avançado', slug: 'avancado' },
    { name: 'Tutorial', slug: 'tutorial' },
    { name: 'Novidade', slug: 'novidade' },
    { name: 'Importante', slug: 'importante' },
    { name: 'MEI', slug: 'mei' },
    { name: 'Simples Nacional', slug: 'simples-nacional' },
    { name: 'Lucro Presumido', slug: 'lucro-presumido' },
    { name: 'Lucro Real', slug: 'lucro-real' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log('✅ Tags criadas');

  // Criar artigo de exemplo
  const contabilidadeCategory = await prisma.category.findUnique({
    where: { slug: 'contabilidade' },
  });

  const inicianteTag = await prisma.tag.findUnique({
    where: { slug: 'iniciante' },
  });

  const tutorialTag = await prisma.tag.findUnique({
    where: { slug: 'tutorial' },
  });

  if (contabilidadeCategory && inicianteTag && tutorialTag) {
    const exampleArticle = await prisma.article.upsert({
      where: { slug: 'introducao-contabilidade-basica' },
      update: {},
      create: {
        title: 'Introdução à Contabilidade Básica',
        slug: 'introducao-contabilidade-basica',
        excerpt: 'Aprenda os conceitos fundamentais da contabilidade de forma simples e prática.',
        content: `# Introdução à Contabilidade Básica\n\nA contabilidade é uma ciência que estuda e controla o patrimônio das entidades, sejam elas pessoas físicas ou jurídicas.\n\n## O que é Contabilidade?\n\nA contabilidade é responsável por:\n\n- Registrar todas as movimentações financeiras\n- Controlar o patrimônio da empresa\n- Fornecer informações para tomada de decisões\n- Cumprir obrigações legais e fiscais\n\n## Conceitos Fundamentais\n\n### Patrimônio\nConjunto de bens, direitos e obrigações de uma entidade.\n\n### Ativo\nBens e direitos da empresa (dinheiro, estoque, equipamentos, etc.).\n\n### Passivo\nObrigações da empresa (empréstimos, fornecedores, impostos a pagar, etc.).\n\n### Patrimônio Líquido\nDiferença entre o Ativo e o Passivo.\n\n## Conclusão\n\nEsses são os conceitos básicos que todo empreendedor deve conhecer para manter suas finanças organizadas.`,
        status: 'PUBLISHED',
        published: true,
        publishedAt: new Date(),
        authorId: adminUser.id,
        categories: {
          create: {
            categoryId: contabilidadeCategory.id,
          },
        },
        tags: {
          create: [
            { tagId: inicianteTag.id },
            { tagId: tutorialTag.id },
          ],
        },
      },
    });

    console.log('✅ Artigo de exemplo criado:', exampleArticle.title);
  }

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });