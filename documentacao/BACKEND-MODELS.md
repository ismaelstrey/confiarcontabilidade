# Modelos e Schemas do Backend

Este documento fornece exemplos de implementação para os modelos de dados, schemas de validação e tipos TypeScript do sistema Contabilidade Igrejinha.

## Visão Geral

Os modelos são responsáveis por:
- Definir estruturas de dados consistentes
- Implementar validações com Zod
- Fornecer tipos TypeScript seguros
- Padronizar interfaces de API
- Garantir integridade dos dados

## 1. Schema do Prisma

Definição do banco de dados usando Prisma ORM.

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modelo de Usuário
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  phone     String?
  avatar    String?
  role      UserRole @default(CLIENT)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  profile           UserProfile?
  taxCalculations   TaxCalculation[]
  contacts          Contact[]
  refreshTokens     RefreshToken[]
  passwordResets    PasswordReset[]
  auditLogs         AuditLog[]

  @@map("users")
}

// Perfil do Usuário
model UserProfile {
  id          String    @id @default(uuid())
  userId      String    @unique
  cpf         String?   @unique
  cnpj        String?   @unique
  birthDate   DateTime?
  address     String?
  city        String?
  state       String?
  zipCode     String?
  companyName String?
  activity    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relacionamentos
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

// Tokens de Refresh
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  // Relacionamentos
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

// Reset de Senha
model PasswordReset {
  id        String   @id @default(uuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  // Relacionamentos
  user User @relation(fields: [email], references: [email], onDelete: Cascade)

  @@map("password_resets")
}

// Contatos
model Contact {
  id        String        @id @default(uuid())
  name      String
  email     String
  phone     String?
  subject   String
  message   String
  status    ContactStatus @default(PENDING)
  userId    String?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  // Relacionamentos
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("contacts")
}

// Artigos do Blog
model Article {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  content     String
  excerpt     String?
  coverImage  String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  readTime    Int?
  views       Int      @default(0)
  authorId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relacionamentos
  author     User              @relation(fields: [authorId], references: [id])
  categories ArticleCategory[]
  tags       ArticleTag[]

  @@map("articles")
}

// Categorias de Artigos
model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  color       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relacionamentos
  articles ArticleCategory[]

  @@map("categories")
}

// Tags de Artigos
model Tag {
  id        String   @id @default(uuid())
  name      String   @unique
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  articles ArticleTag[]

  @@map("tags")
}

// Relacionamento Artigo-Categoria (Many-to-Many)
model ArticleCategory {
  articleId  String
  categoryId String
  createdAt  DateTime @default(now())

  // Relacionamentos
  article  Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([articleId, categoryId])
  @@map("article_categories")
}

// Relacionamento Artigo-Tag (Many-to-Many)
model ArticleTag {
  articleId String
  tagId     String
  createdAt DateTime @default(now())

  // Relacionamentos
  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag     Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([articleId, tagId])
  @@map("article_tags")
}

// Serviços
model Service {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String
  price       Decimal?
  duration    String?
  features    String[]
  isActive    Boolean  @default(true)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("services")
}

// Cálculos Fiscais
model TaxCalculation {
  id             String                @id @default(uuid())
  userId         String
  companyName    String
  cnpj           String?
  activity       String
  monthlyRevenue Decimal
  regime         TaxRegime
  results        Json
  savedAt        DateTime              @default(now())
  updatedAt      DateTime              @updatedAt

  // Relacionamentos
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("tax_calculations")
}

// FAQ
model FAQ {
  id        String   @id @default(uuid())
  question  String
  answer    String
  category  String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("faqs")
}

// Equipe
model TeamMember {
  id          String   @id @default(uuid())
  name        String
  position    String
  bio         String?
  photo       String?
  email       String?
  linkedin    String?
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("team_members")
}

// Depoimentos
model Testimonial {
  id         String   @id @default(uuid())
  clientName String
  company    String?
  content    String
  rating     Int      @default(5)
  photo      String?
  isActive   Boolean  @default(true)
  order      Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("testimonials")
}

// Newsletter
model NewsletterSubscriber {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String?
  isActive    Boolean  @default(true)
  subscribedAt DateTime @default(now())
  unsubscribedAt DateTime?

  @@map("newsletter_subscribers")
}

// Logs de Auditoria
model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  resource  String
  resourceId String?
  oldData   Json?
  newData   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  // Relacionamentos
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}

// Enums
enum UserRole {
  ADMIN
  CLIENT
}

enum ContactStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum TaxRegime {
  MEI
  SIMPLES
  PRESUMIDO
  REAL
}
```

## 2. Tipos TypeScript

Definições de tipos baseadas nos modelos Prisma.

```typescript
// src/types/user.ts
import { User, UserProfile, UserRole } from '@prisma/client';

// Tipo de usuário com perfil
export type UserWithProfile = User & {
  profile?: UserProfile | null;
};

// Tipo de usuário público (sem dados sensíveis)
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  createdAt: Date;
};

// Dados para criação de usuário
export type CreateUserData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
};

// Dados para atualização de usuário
export type UpdateUserData = {
  name?: string;
  phone?: string;
  avatar?: string;
};

// Dados para atualização de perfil
export type UpdateProfileData = {
  cpf?: string;
  cnpj?: string;
  birthDate?: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  companyName?: string;
  activity?: string;
};

// Dados de login
export type LoginData = {
  email: string;
  password: string;
};

// Dados de registro
export type RegisterData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

// Resposta de autenticação
export type AuthResponse = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};
```

```typescript
// src/types/article.ts
import { Article, Category, Tag } from '@prisma/client';

// Artigo com relacionamentos
export type ArticleWithRelations = Article & {
  author: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  categories: ({
    category: Category;
  })[];
  tags: ({
    tag: Tag;
  })[];
};

// Artigo público (para listagem)
export type PublicArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | null;
  readTime?: number | null;
  views: number;
  author: {
    name: string;
    avatar?: string | null;
  };
  categories: Category[];
  tags: Tag[];
};

// Dados para criação de artigo
export type CreateArticleData = {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  categoryIds?: string[];
  tagIds?: string[];
};

// Dados para atualização de artigo
export type UpdateArticleData = {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  categoryIds?: string[];
  tagIds?: string[];
};
```

```typescript
// src/types/tax.ts
import { TaxCalculation, TaxRegime } from '@prisma/client';

// Dados para cálculo fiscal
export type TaxCalculationData = {
  companyName: string;
  cnpj?: string;
  activity: string;
  monthlyRevenue: number;
};

// Resultado de cálculo por regime
export type RegimeCalculation = {
  monthlyTax: number;
  yearlyTax: number;
  effectiveRate: number;
  details: {
    [key: string]: number;
  };
};

// Resultado completo do cálculo
export type TaxCalculationResult = {
  mei?: RegimeCalculation;
  simples: RegimeCalculation;
  presumido: RegimeCalculation;
  real: RegimeCalculation;
  recommended: string;
};

// Histórico de cálculos
export type TaxCalculationHistory = {
  id: string;
  companyName: string;
  activity: string;
  monthlyRevenue: number;
  regime: TaxRegime;
  savedAt: Date;
};
```

```typescript
// src/types/api.ts
// Tipos para respostas da API

// Resposta padrão da API
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
};

// Resposta de erro da API
export type ApiError = {
  success: false;
  message: string;
  errors?: string[];
  statusCode: number;
};

// Dados de paginação
export type PaginationData = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Resposta paginada
export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  pagination: PaginationData;
};

// Parâmetros de consulta
export type QueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
};

// Filtros de data
export type DateFilter = {
  startDate?: Date;
  endDate?: Date;
};
```

## 3. Schemas de Validação com Zod

Schemas para validação de dados de entrada.

```typescript
// src/schemas/user.ts
import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Schema para registro de usuário
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  phone: z.string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido')
    .optional(),
  role: z.nativeEnum(UserRole).optional()
});

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'Senha é obrigatória')
});

// Schema para atualização de usuário
export const updateUserSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  phone: z.string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido')
    .optional(),
  avatar: z.string().url('URL do avatar inválida').optional()
});

// Schema para atualização de perfil
export const updateProfileSchema = z.object({
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
    .optional(),
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido')
    .optional(),
  birthDate: z.string()
    .datetime('Data de nascimento inválida')
    .transform(str => new Date(str))
    .optional(),
  address: z.string().max(200, 'Endereço muito longo').optional(),
  city: z.string().max(100, 'Cidade muito longa').optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  zipCode: z.string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido')
    .optional(),
  companyName: z.string().max(200, 'Nome da empresa muito longo').optional(),
  activity: z.string().max(200, 'Atividade muito longa').optional()
});

// Schema para alteração de senha
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
});

// Schema para reset de senha
export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase()
});

// Schema para confirmação de reset de senha
export const confirmResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
});
```

```typescript
// src/schemas/article.ts
import { z } from 'zod';

// Schema para criação de artigo
export const createArticleSchema = z.object({
  title: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  content: z.string()
    .min(50, 'Conteúdo deve ter pelo menos 50 caracteres'),
  excerpt: z.string()
    .max(500, 'Resumo deve ter no máximo 500 caracteres')
    .optional(),
  coverImage: z.string().url('URL da imagem inválida').optional(),
  published: z.boolean().optional().default(false),
  categoryIds: z.array(z.string().uuid('ID de categoria inválido')).optional(),
  tagIds: z.array(z.string().uuid('ID de tag inválido')).optional()
});

// Schema para atualização de artigo
export const updateArticleSchema = createArticleSchema.partial();

// Schema para criação de categoria
export const createCategorySchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  description: z.string()
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal')
    .optional()
});

// Schema para atualização de categoria
export const updateCategorySchema = createCategorySchema.partial();

// Schema para criação de tag
export const createTagSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(30, 'Nome deve ter no máximo 30 caracteres')
});

// Schema para atualização de tag
export const updateTagSchema = createTagSchema.partial();
```

```typescript
// src/schemas/tax.ts
import { z } from 'zod';
import { TaxRegime } from '@prisma/client';

// Schema para cálculo fiscal
export const taxCalculationSchema = z.object({
  companyName: z.string()
    .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
    .max(200, 'Nome da empresa deve ter no máximo 200 caracteres'),
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido')
    .optional(),
  activity: z.string()
    .min(5, 'Atividade deve ter pelo menos 5 caracteres')
    .max(200, 'Atividade deve ter no máximo 200 caracteres'),
  monthlyRevenue: z.number()
    .positive('Receita mensal deve ser positiva')
    .max(100000000, 'Receita mensal muito alta')
});

// Schema para salvar cálculo
export const saveTaxCalculationSchema = taxCalculationSchema.extend({
  regime: z.nativeEnum(TaxRegime),
  results: z.record(z.any())
});
```

```typescript
// src/schemas/contact.ts
import { z } from 'zod';
import { ContactStatus } from '@prisma/client';

// Schema para criação de contato
export const createContactSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido').toLowerCase(),
  phone: z.string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido')
    .optional(),
  subject: z.string()
    .min(5, 'Assunto deve ter pelo menos 5 caracteres')
    .max(200, 'Assunto deve ter no máximo 200 caracteres'),
  message: z.string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(1000, 'Mensagem deve ter no máximo 1000 caracteres')
});

// Schema para atualização de status do contato
export const updateContactStatusSchema = z.object({
  status: z.nativeEnum(ContactStatus)
});
```

```typescript
// src/schemas/common.ts
import { z } from 'zod';

// Schema para parâmetros de paginação
export const paginationSchema = z.object({
  page: z.string()
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, 'Página deve ser maior que 0')
    .optional()
    .default('1'),
  limit: z.string()
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0 && val <= 100, 'Limite deve estar entre 1 e 100')
    .optional()
    .default('10')
});

// Schema para parâmetros de busca
export const searchSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Schema para filtros de data
export const dateFilterSchema = z.object({
  startDate: z.string()
    .datetime('Data inicial inválida')
    .transform(str => new Date(str))
    .optional(),
  endDate: z.string()
    .datetime('Data final inválida')
    .transform(str => new Date(str))
    .optional()
});

// Schema para parâmetros de UUID
export const uuidParamSchema = z.object({
  id: z.string().uuid('ID inválido')
});

// Schema para upload de arquivo
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Nome do arquivo é obrigatório'),
  mimetype: z.string().min(1, 'Tipo do arquivo é obrigatório'),
  size: z.number().positive('Tamanho do arquivo deve ser positivo')
});

// Schema para newsletter
export const newsletterSubscribeSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional()
});
```

## 4. DTOs (Data Transfer Objects)

Objetos para transferência de dados entre camadas.

```typescript
// src/dtos/user.dto.ts
export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'ADMIN' | 'CLIENT';
}

export class UpdateUserDto {
  name?: string;
  phone?: string;
  avatar?: string;
}

export class UpdateProfileDto {
  cpf?: string;
  cnpj?: string;
  birthDate?: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  companyName?: string;
  activity?: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class ResetPasswordDto {
  email: string;
}

export class ConfirmResetPasswordDto {
  token: string;
  password: string;
}
```

```typescript
// src/dtos/article.dto.ts
export class CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  categoryIds?: string[];
  tagIds?: string[];
}

export class UpdateArticleDto {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  categoryIds?: string[];
  tagIds?: string[];
}

export class CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
}

export class UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
}

export class CreateTagDto {
  name: string;
}

export class UpdateTagDto {
  name?: string;
}
```

```typescript
// src/dtos/tax.dto.ts
export class TaxCalculationDto {
  companyName: string;
  cnpj?: string;
  activity: string;
  monthlyRevenue: number;
}

export class SaveTaxCalculationDto extends TaxCalculationDto {
  regime: 'MEI' | 'SIMPLES' | 'PRESUMIDO' | 'REAL';
  results: Record<string, any>;
}
```

```typescript
// src/dtos/contact.dto.ts
export class CreateContactDto {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export class UpdateContactStatusDto {
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}
```

```typescript
// src/dtos/common.dto.ts
export class PaginationDto {
  page?: number = 1;
  limit?: number = 10;
}

export class SearchDto extends PaginationDto {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class DateFilterDto {
  startDate?: Date;
  endDate?: Date;
}

export class FileUploadDto {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export class NewsletterSubscribeDto {
  email: string;
  name?: string;
}
```

## 5. Interfaces de Resposta

Interfaces para padronizar respostas da API.

```typescript
// src/interfaces/response.interface.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  statusCode: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
    createdAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

export interface TaxCalculationResponse {
  mei?: {
    monthlyTax: number;
    yearlyTax: number;
    effectiveRate: number;
    details: Record<string, number>;
  };
  simples: {
    monthlyTax: number;
    yearlyTax: number;
    effectiveRate: number;
    details: Record<string, number>;
  };
  presumido: {
    monthlyTax: number;
    yearlyTax: number;
    effectiveRate: number;
    details: Record<string, number>;
  };
  real: {
    monthlyTax: number;
    yearlyTax: number;
    effectiveRate: number;
    details: Record<string, number>;
  };
  recommended: string;
}
```

## 6. Configuração de Modelos

### Arquivo de Índice dos Modelos

```typescript
// src/models/index.ts
// Re-exportar tipos do Prisma
export * from '@prisma/client';

// Re-exportar tipos customizados
export * from '../types/user';
export * from '../types/article';
export * from '../types/tax';
export * from '../types/api';

// Re-exportar DTOs
export * from '../dtos/user.dto';
export * from '../dtos/article.dto';
export * from '../dtos/tax.dto';
export * from '../dtos/contact.dto';
export * from '../dtos/common.dto';

// Re-exportar schemas
export * from '../schemas/user';
export * from '../schemas/article';
export * from '../schemas/tax';
export * from '../schemas/contact';
export * from '../schemas/common';

// Re-exportar interfaces
export * from '../interfaces/response.interface';
```

### Configuração do Cliente Prisma

```typescript
// src/config/database.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Configurar cliente Prisma
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Configurar logging de queries
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Query executed', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Configurar logging de erros
prisma.$on('error', (e) => {
  logger.error('Database error', {
    message: e.message,
    target: e.target,
  });
});

// Configurar logging de informações
prisma.$on('info', (e) => {
  logger.info('Database info', {
    message: e.message,
    target: e.target,
  });
});

// Configurar logging de avisos
prisma.$on('warn', (e) => {
  logger.warn('Database warning', {
    message: e.message,
    target: e.target,
  });
});

// Função para conectar ao banco
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database', error);
    process.exit(1);
  }
};

// Função para desconectar do banco
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Failed to disconnect from database', error);
  }
};

// Função para verificar saúde do banco
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
};

export { prisma };
export default prisma;
```

## Boas Práticas

### 1. Modelagem de Dados
- Usar UUIDs como chaves primárias
- Implementar timestamps (createdAt, updatedAt)
- Definir relacionamentos apropriados
- Usar enums para valores fixos
- Implementar soft deletes quando necessário

### 2. Validação
- Validar todos os dados de entrada
- Usar schemas Zod reutilizáveis
- Fornecer mensagens de erro claras
- Validar tanto no frontend quanto no backend

### 3. Tipos TypeScript
- Definir tipos específicos para cada contexto
- Usar tipos derivados do Prisma
- Implementar tipos para respostas da API
- Evitar uso de `any`

### 4. DTOs
- Usar DTOs para transferência de dados
- Separar DTOs de entrada e saída
- Implementar validação nos DTOs
- Manter DTOs simples e focados

### 5. Performance
- Usar índices apropriados no banco
- Implementar paginação
- Otimizar queries com includes seletivos
- Usar conexões de pool

## Conclusão

Esta implementação dos modelos e schemas fornece uma base sólida para o sistema Contabilidade Igrejinha. A estrutura modular e tipada garante consistência, segurança e facilita a manutenção do código. Os schemas de validação com Zod asseguram a integridade dos dados, enquanto os tipos TypeScript proporcionam desenvolvimento mais seguro e produtivo.