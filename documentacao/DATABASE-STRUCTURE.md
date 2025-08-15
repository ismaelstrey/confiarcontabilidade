# Estrutura do Banco de Dados

Este documento descreve a estrutura do banco de dados do sistema, incluindo os modelos, relacionamentos, índices e considerações de design.

## Modelos de Dados

O sistema utiliza o Prisma ORM para definir e gerenciar os modelos de dados. Abaixo estão os principais modelos e suas relações:

### User (Usuário)

Armazena informações sobre os usuários do sistema.

| Campo | Tipo | Descrição |
|-------|------|----------|
| id | String (UUID) | Identificador único do usuário |
| email | String | E-mail do usuário (único) |
| name | String | Nome completo do usuário |
| password | String | Senha criptografada |
| role | Enum (Role) | Papel do usuário (USER, ADMIN) |
| createdAt | DateTime | Data de criação do registro |
| updatedAt | DateTime | Data de última atualização |
| profile | Profile | Relação com o perfil do usuário |
| contacts | Contact[] | Relação com os contatos criados pelo usuário |
| articles | Article[] | Relação com os artigos criados pelo usuário |
| taxCalculations | TaxCalculation[] | Relação com os cálculos de impostos realizados pelo usuário |

### Profile (Perfil)

Armazena informações adicionais sobre o perfil do usuário.

| Campo | Tipo | Descrição |
|-------|------|----------|
| id | String (UUID) | Identificador único do perfil |
| userId | String | ID do usuário associado |
| bio | String | Biografia ou descrição do usuário |
| phone | String | Número de telefone |
| address | String | Endereço |
| city | String | Cidade |
| state | String | Estado |
| zipCode | String | CEP |
| avatarUrl | String | URL da imagem de avatar |
| user | User | Relação com o usuário |

### Contact (Contato)

Armazena informações sobre os contatos/mensagens enviados pelos visitantes do site.

| Campo | Tipo | Descrição |
|-------|------|----------|
| id | String (UUID) | Identificador único do contato |
| name | String | Nome da pessoa que entrou em contato |
| email | String | E-mail da pessoa |
| phone | String | Número de telefone |
| subject | String | Assunto da mensagem |
| message | String | Conteúdo da mensagem |
| status | Enum (ContactStatus) | Status do contato (PENDING, IN_PROGRESS, COMPLETED) |
| createdAt | DateTime | Data de criação do registro |
| updatedAt | DateTime | Data de última atualização |
| userId | String | ID do usuário que gerencia o contato (opcional) |
| user | User | Relação com o usuário que gerencia o contato |

### Service (Serviço)

Armazena informações sobre os serviços oferecidos pela empresa.

| Campo | Tipo | Descrição |
|-------|------|----------|
| id | String (UUID) | Identificador único do serviço |
| title | String | Título do serviço |
| description | String | Descrição detalhada do serviço |
| shortDescription | String | Descrição curta para exibição em cards |
| price | Decimal | Preço do serviço |
| priceDescription | String | Descrição do preço (ex: "a partir de") |
| icon | String | Nome do ícone para exibição |
| slug | String | Slug para URL amigável |
| isActive | Boolean | Indica se o serviço está ativo |
| createdAt | DateTime | Data de criação do registro |
| updatedAt | DateTime | Data de última atualização |

### Article (Artigo)

Armazena informações sobre os artigos/blog posts do site.

| Campo | Tipo | Descrição |
|-------|------|----------|
| id | String (UUID) | Identificador único do artigo |
| title | String | Título do artigo |
| content | String | Conteúdo do artigo em formato HTML |
| excerpt | String | Resumo do artigo |
| slug | String | Slug para URL amigável |
| coverImage | String | URL da imagem de capa |
| published | Boolean | Indica se o artigo está publicado |
| publishedAt | DateTime | Data de publicação |
| createdAt | DateTime | Data de criação do registro |
| updatedAt | DateTime | Data de última atualização |
| authorId | String | ID do autor (usuário) |
| author | User | Relação com o autor do artigo |

### FAQ (Perguntas Frequentes)

Armazena perguntas frequentes e suas respostas.

| Campo | Tipo | Descrição |
|-------|------|----------|
| id | String (UUID) | Identificador único da pergunta |
| question | String | Pergunta |
| answer | String | Resposta |
| order | Int | Ordem de exibição |
| isActive | Boolean | Indica se a pergunta está ativa |
| createdAt | DateTime | Data de criação do registro |
| updatedAt | DateTime | Data de última atualização |

### TeamMember (Membro da Equipe)

Armazena informações sobre os membros da equipe para exibição no site.

| Campo | Tipo | Descrição |
|-------|------|----------|
| id | String (UUID) | Identificador único do membro |
| name | String | Nome do membro |
| role | String | Cargo/função |
| bio | String | Biografia ou descrição |
| photoUrl | String | URL da foto |
| order | Int | Ordem de exibição |
| isActive | Boolean | Indica se o membro está ativo |
| createdAt | DateTime | Data de criação do registro |
| updatedAt | DateTime | Data de última atualização |

### Testimonial (Depoimento)

Armazena depoimentos de clientes para exibição no site.

| Campo | Tipo | Descrição |
|-------|------|----------|
| id | String (UUID) | Identificador único do depoimento |
| name | String | Nome da pessoa |
| company | String | Empresa ou organização |
| role | String | Cargo/função |
| content | String | Conteúdo do depoimento |
| rating | Int | Avaliação (1-5) |
| photoUrl | String | URL da foto |
| isActive | Boolean | Indica se o depoimento está ativo |
| createdAt | DateTime | Data de criação do registro |
| updatedAt | DateTime | Data de última atualização |

### Newsletter (Inscrição na Newsletter)

Armazena e-mails de pessoas inscritas na newsletter.

| Campo | Tipo | Descrição |
|-------|------|----------|
| id | String (UUID) | Identificador único da inscrição |
| email | String | E-mail da pessoa inscrita |
| name | String | Nome da pessoa (opcional) |
| isActive | Boolean | Indica se a inscrição está ativa |
| createdAt | DateTime | Data de criação do registro |
| updatedAt | DateTime | Data de última atualização |

### TaxCalculation (Cálculo de Impostos)

Armazena os resultados dos cálculos de impostos realizados pelos usuários.

| Campo | Tipo | Descrição |
|-------|------|----------|
| id | String (UUID) | Identificador único do cálculo |
| revenue | Decimal | Receita bruta |
| expenses | Decimal | Despesas |
| taxRegime | String | Regime tributário (Simples, Lucro Presumido, Lucro Real) |
| activityType | String | Tipo de atividade |
| calculatedTaxes | Json | Resultado do cálculo em formato JSON |
| createdAt | DateTime | Data de criação do registro |
| updatedAt | DateTime | Data de última atualização |
| userId | String | ID do usuário que realizou o cálculo (opcional) |
| user | User | Relação com o usuário que realizou o cálculo |

## Enumerações

### Role (Papel do Usuário)

```prisma
enum Role {
  USER
  ADMIN
}
```

### ContactStatus (Status do Contato)

```prisma
enum ContactStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}
```

## Relacionamentos

### One-to-One

- User → Profile: Um usuário possui um perfil.

### One-to-Many

- User → Contact: Um usuário pode gerenciar vários contatos.
- User → Article: Um usuário pode criar vários artigos.
- User → TaxCalculation: Um usuário pode realizar vários cálculos de impostos.

## Índices

Os seguintes índices são definidos para otimizar consultas frequentes:

```prisma
model User {
  // ... campos
  @@index([email])
}

model Contact {
  // ... campos
  @@index([status])
  @@index([userId])
}

model Article {
  // ... campos
  @@index([slug])
  @@index([authorId])
  @@index([published])
}

model Service {
  // ... campos
  @@index([slug])
  @@index([isActive])
}

model FAQ {
  // ... campos
  @@index([order])
  @@index([isActive])
}

model TeamMember {
  // ... campos
  @@index([order])
  @@index([isActive])
}

model Testimonial {
  // ... campos
  @@index([isActive])
  @@index([rating])
}

model Newsletter {
  // ... campos
  @@index([email])
  @@index([isActive])
}

model TaxCalculation {
  // ... campos
  @@index([userId])
  @@index([taxRegime])
}
```

## Considerações de Design

### Identificadores

Todos os modelos utilizam UUIDs como identificadores primários, o que oferece as seguintes vantagens:

- Geração distribuída sem necessidade de coordenação central
- Não revelam informações sobre o volume de dados
- Reduzem riscos de segurança associados a IDs sequenciais

### Soft Delete

Em vez de excluir registros permanentemente, alguns modelos podem implementar um padrão de "soft delete" usando o campo `isActive`. Isso permite que os dados sejam recuperados se necessário e mantém a integridade referencial.

### Auditoria

Todos os modelos incluem campos `createdAt` e `updatedAt` para fins de auditoria, permitindo rastrear quando os registros foram criados e modificados pela última vez.

### Normalização

O esquema segue os princípios de normalização de banco de dados para minimizar a redundância e melhorar a integridade dos dados:

- Informações do usuário separadas em `User` e `Profile`
- Relacionamentos adequados entre entidades
- Uso de chaves estrangeiras para manter a integridade referencial

## Migrações e Versionamento

O Prisma gerencia migrações de banco de dados, permitindo:

1. Rastrear alterações no esquema ao longo do tempo
2. Aplicar migrações de forma consistente em diferentes ambientes
3. Reverter alterações quando necessário

Para criar uma nova migração após alterar o esquema:

```bash
pnpm prisma migrate dev --name nome_da_migracao
```

Para aplicar migrações em ambiente de produção:

```bash
pnpm prisma migrate deploy
```

## Seed de Dados

O Prisma também suporta seed de dados para popular o banco de dados com dados iniciais:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          bio: 'Administrador do sistema',
          phone: '(51) 99999-9999',
        },
      },
    },
  });

  // Criar serviços iniciais
  const services = [
    {
      title: 'Contabilidade para Igrejas',
      shortDescription: 'Serviços contábeis especializados para igrejas e organizações religiosas',
      description: 'Oferecemos serviços contábeis completos para igrejas e organizações religiosas, incluindo declarações fiscais, folha de pagamento, relatórios financeiros e muito mais.',
      price: 500.00,
      priceDescription: 'a partir de',
      icon: 'church',
      slug: 'contabilidade-para-igrejas',
      isActive: true,
    },
    // Outros serviços...
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Para executar o seed:

```bash
pnpm prisma db seed
```

## Conclusão

A estrutura do banco de dados foi projetada para ser robusta, escalável e de fácil manutenção. O uso do Prisma ORM facilita o desenvolvimento, proporcionando uma camada de abstração sobre o banco de dados e ferramentas para migrações e seed de dados.

Os modelos e relacionamentos foram definidos para atender aos requisitos do sistema, com considerações de design que promovem a integridade dos dados, a segurança e o desempenho.