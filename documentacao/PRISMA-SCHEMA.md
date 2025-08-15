# Prisma Schema - Contabilidade Igrejinha

Este arquivo contém o schema completo do Prisma para o backend da aplicação Contabilidade Igrejinha.

## Schema Completo

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   Profile?
}

model Profile {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  phone     String?
  company   String?
  position  String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Contact {
  id        String        @id @default(uuid())
  name      String
  email     String
  phone     String
  company   String?
  message   String
  service   String?
  status    ContactStatus @default(PENDING)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model Service {
  id          String   @id @default(uuid())
  title       String
  description String
  icon        String
  features    String[]
  priceFrom   Float?
  priceTo     Float?
  period      String?
  popular     Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Article {
  id          String    @id @default(uuid())
  title       String
  excerpt     String
  content     String    @db.Text
  author      String
  publishedAt DateTime
  updatedAt   DateTime?
  category    String
  tags        String[]
  featured    Boolean   @default(false)
  readTime    Int
  slug        String    @unique
  seoTitle    String?
  seoDesc     String?
  seoKeywords String[]
  createdAt   DateTime  @default(now())
}

model FAQ {
  id        String   @id @default(uuid())
  question  String
  answer    String   @db.Text
  category  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model TeamMember {
  id          String   @id @default(uuid())
  name        String
  role        String
  bio         String   @db.Text
  avatar      String
  credentials String[]
  linkedin    String?
  email       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Testimonial {
  id        String   @id @default(uuid())
  name      String
  company   String
  role      String
  content   String   @db.Text
  rating    Int
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Newsletter {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model TaxCalculation {
  id             String   @id @default(uuid())
  revenue        Float
  employees      Int
  businessType   String
  hasPartners    Boolean
  monthlyTax     Float
  annualTax      Float
  taxRate        Float
  recommendations String[]
  federalTax     Float
  stateTax       Float
  municipalTax   Float
  createdAt      DateTime @default(now())
  email          String?
  phone          String?
}

enum Role {
  ADMIN
  ACCOUNTANT
  CLIENT
}

enum ContactStatus {
  PENDING
  CONTACTED
  CONVERTED
  ARCHIVED
}
```

## Instruções para Uso

1. Crie um arquivo `schema.prisma` na pasta `prisma` do seu projeto backend
2. Copie o conteúdo acima para o arquivo
3. Configure a variável de ambiente `DATABASE_URL` no arquivo `.env`
4. Execute os seguintes comandos para inicializar o banco de dados:

```bash
# Instalar dependências do Prisma
pnpm add -D prisma
pnpm add @prisma/client

# Gerar cliente Prisma
pnpm prisma generate

# Criar as tabelas no banco de dados
pnpm prisma migrate dev --name init
```

## Relacionamentos

- **User -> Profile**: Um usuário tem um perfil (1:1)
- **Outros modelos**: Entidades independentes sem relacionamentos diretos

## Enums

- **Role**: Define os papéis de usuário (ADMIN, ACCOUNTANT, CLIENT)
- **ContactStatus**: Define os status possíveis para contatos (PENDING, CONTACTED, CONVERTED, ARCHIVED)

## Campos Especiais

- **@db.Text**: Usado para campos de texto longos (content, bio, answer)
- **@default(uuid())**: Gera IDs únicos automaticamente
- **@updatedAt**: Atualiza automaticamente o timestamp quando o registro é modificado
- **@default(now())**: Define o timestamp de criação automaticamente

## Índices e Constraints

- **@unique**: Garante que não haverá duplicação de valores (email, slug)
- **onDelete: Cascade**: Quando um usuário é excluído, seu perfil também é removido

---

*Este schema pode ser expandido conforme novas necessidades surjam durante o desenvolvimento do backend.*