import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { z } from 'zod';

// Schemas de resposta comuns
const ErrorResponseSchema = z.object({
  success: z.boolean().default(false),
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
  timestamp: z.string()
});

const SuccessResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional(),
  data: z.any().optional()
});

// Schemas de usuário
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']),
  isActive: z.boolean(),
  avatar: z.string().nullable(),
  bio: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).default('USER')
});

const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
  isActive: z.boolean().optional()
});

const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

// Schemas de autenticação
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
});

const AuthResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string(),
  data: z.object({
    user: UserSchema,
    token: z.string()
  })
});

// Schemas de artigos
const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  slug: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  featuredImage: z.string().nullable(),
  isPublished: z.boolean(),
  views: z.number(),
  likes: z.number(),
  authorId: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable()
  }),
  createdAt: z.string(),
  updatedAt: z.string()
});

const CreateArticleSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(50),
  excerpt: z.string().max(200).optional(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().url().optional(),
  isPublished: z.boolean().default(false)
});

const UpdateArticleSchema = z.object({
  title: z.string().min(5).optional(),
  content: z.string().min(50).optional(),
  excerpt: z.string().max(200).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().url().optional(),
  isPublished: z.boolean().optional()
});

// Schemas de contatos
const ContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  subject: z.string(),
  message: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  createdAt: z.string(),
  updatedAt: z.string()
});

const CreateContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(5),
  message: z.string().min(10)
});

// Configuração do OpenAPI
export const openApiConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Contabilidade Igrejinha API',
    version: '1.0.0',
    description: 'API completa para sistema de contabilidade com gestão de usuários, artigos, contatos e calculadoras.',
    contact: {
      name: 'Suporte Técnico',
      email: 'suporte@contabilidadeigrejinha.com.br'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3334/api/v1',
      description: 'Servidor de Desenvolvimento'
    },
    {
      url: 'https://api.contabilidadeigrejinha.com.br/api/v1',
      description: 'Servidor de Produção'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: UserSchema,
      CreateUser: CreateUserSchema,
      UpdateUser: UpdateUserSchema,
      UpdateProfile: UpdateProfileSchema,
      Login: LoginSchema,
      Register: RegisterSchema,
      AuthResponse: AuthResponseSchema,
      Article: ArticleSchema,
      CreateArticle: CreateArticleSchema,
      UpdateArticle: UpdateArticleSchema,
      Contact: ContactSchema,
      CreateContact: CreateContactSchema,
      SuccessResponse: SuccessResponseSchema,
      ErrorResponse: ErrorResponseSchema
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Criar instância do OpenAPIHono
export const createOpenAPIApp = () => {
  const app = new OpenAPIHono();

  // Configurar documentação
  app.doc('/doc', openApiConfig);

  // Configurar Swagger UI
  app.get('/ui', swaggerUI({ url: '/doc' }));

  return app;
};

// Exportar schemas para uso nas rotas
export {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UpdateProfileSchema,
  LoginSchema,
  RegisterSchema,
  AuthResponseSchema,
  ArticleSchema,
  CreateArticleSchema,
  UpdateArticleSchema,
  ContactSchema,
  CreateContactSchema,
  SuccessResponseSchema,
  ErrorResponseSchema
};