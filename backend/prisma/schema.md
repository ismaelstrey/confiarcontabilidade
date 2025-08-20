// Schema para testes com SQLite

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./test.db"
}

// Modelo básico de usuários para teste
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      String   @default("USER")
  avatar    String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  refreshTokens RefreshToken[]
  articles      Article[]
  comments      Comment[]
  newsletters   Newsletter[]

  @@map("users")
}

// Modelo de tokens de refresh
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  isRevoked Boolean  @default(false)

  // Relacionamentos
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

// Modelo de artigos
model Article {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String
  excerpt     String?
  coverImage  String?
  published   Boolean  @default(false)
  authorId    String
  categoryId  String?
  tags        String?  // Tags como string separada por vírgulas
  views       Int      @default(0)
  likes       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?

  // Relacionamentos
  author   User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  category Category?  @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  comments Comment[]

  @@map("articles")
}

// Modelo de categorias
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  color       String?   @default("#3B82F6")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relacionamentos
  articles Article[]

  @@map("categories")
}

// Modelo de comentários
model Comment {
  id        String   @id @default(cuid())
  content   String
  authorId  String
  articleId String
  parentId  String?  // Para comentários aninhados
  approved  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  author   User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  article  Article   @relation(fields: [articleId], references: [id], onDelete: Cascade)
  parent   Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies  Comment[] @relation("CommentReplies")

  @@map("comments")
}

// Modelo de contatos
model Contact {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String
  message   String
  status    String   @default("PENDING") // PENDING, READ, REPLIED
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("contacts")
}

// Modelo de newsletter
model Newsletter {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  isActive    Boolean  @default(true)
  subscribedAt DateTime @default(now())
  unsubscribedAt DateTime?
  userId      String?  // Opcional, para usuários logados

  // Relacionamentos
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("newsletters")
}

// Modelo de uploads
model Upload {
  id        String   @id @default(cuid())
  filename  String
  originalName String
  mimetype  String
  size      Int
  path      String
  url       String
  uploadedBy String?
  createdAt DateTime @default(now())

  @@map("uploads")
}

// Modelo de configurações do sistema
model SystemConfig {
  id    String @id @default(cuid())
  key   String @unique
  value String
  type  String @default("STRING") // STRING, NUMBER, BOOLEAN, JSON
  description String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("system_configs")
}

// Modelo de logs de auditoria
model AuditLog {
  id        String   @id @default(cuid())
  action    String   // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  entity    String   // USER, ARTICLE, etc.
  entityId  String?
  userId    String?
  details   String?  // JSON string com detalhes
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  @@map("audit_logs")
}