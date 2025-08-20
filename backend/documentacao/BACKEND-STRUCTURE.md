# Estrutura do Backend

Este documento descreve a estrutura do backend do sistema Contabilidade Igrejinha, detalhando os principais componentes, suas responsabilidades e como implementá-los.

## Visão Geral

O backend do sistema segue uma arquitetura em camadas, com clara separação de responsabilidades entre os diferentes componentes. A estrutura de diretórios reflete essa organização:

```
backend/
├── prisma/            # Esquema e migrações do Prisma
├── src/               # Código-fonte da aplicação
│   ├── config/        # Configurações da aplicação
│   ├── controllers/   # Controladores da API
│   ├── middlewares/   # Middlewares do Express
│   ├── repositories/  # Camada de acesso a dados
│   ├── routes/        # Definição de rotas
│   ├── services/      # Lógica de negócios
│   ├── utils/         # Utilitários e helpers
│   ├── validators/    # Validadores de dados (Zod)
│   ├── docs/          # Documentação Swagger
│   ├── types/         # Tipos e interfaces TypeScript
│   ├── server.ts      # Ponto de entrada da aplicação
│   └── app.ts         # Configuração da aplicação Express
├── tests/             # Testes automatizados
│   ├── unit/          # Testes unitários
│   ├── integration/   # Testes de integração
│   └── e2e/           # Testes end-to-end
├── .env               # Variáveis de ambiente
├── .env.example       # Exemplo de variáveis de ambiente
├── .env.test          # Variáveis de ambiente para testes
├── package.json       # Dependências e scripts
└── tsconfig.json      # Configuração do TypeScript
```

## Componentes Principais

### 1. Ponto de Entrada da Aplicação

#### `server.ts`

Responsável por iniciar o servidor HTTP e conectar ao banco de dados.

```typescript
// src/server.ts
import { app } from './app';
import { PrismaClient } from '@prisma/client';
import { config } from './config';

const prisma = new PrismaClient();
const PORT = config.server.port;

async function startServer() {
  try {
    // Conectar ao banco de dados
    await prisma.$connect();
    console.log('📦 Conectado ao banco de dados');

    // Iniciar o servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

startServer();
```

#### `app.ts`

Configura a aplicação Express, incluindo middlewares globais, rotas e tratamento de erros.

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { notFoundMiddleware } from './middlewares/notFoundMiddleware';
import { routes } from './routes';
import { config } from './config';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json';

const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(config.cors));
app.use(helmet());
app.use(compression());

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas da API
app.use('/api', routes);

// Middleware para rotas não encontradas
app.use(notFoundMiddleware);

// Middleware de tratamento de erros
app.use(errorMiddleware);

export { app };
```

### 2. Configuração

#### `config/index.ts`

Centraliza todas as configurações da aplicação, carregando variáveis de ambiente.

```typescript
// src/config/index.ts
import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

export const config = {
  env: process.env.NODE_ENV || 'development',
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@contabilidadeigrejinha.com.br',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || path.resolve(__dirname, '..', '..', 'uploads'),
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10), // 5MB
    allowedMimeTypes: {
      image: ['image/jpeg', 'image/png', 'image/gif'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
};
```

### 3. Rotas

#### `routes/index.ts`

Agrega todas as rotas da aplicação.

```typescript
// src/routes/index.ts
import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { contactRoutes } from './contactRoutes';
import { articleRoutes } from './articleRoutes';
import { serviceRoutes } from './serviceRoutes';
import { calculatorRoutes } from './calculatorRoutes';
import { faqRoutes } from './faqRoutes';
import { teamRoutes } from './teamRoutes';
import { testimonialRoutes } from './testimonialRoutes';
import { newsletterRoutes } from './newsletterRoutes';

const router = Router();

// Rotas públicas e autenticadas
router.use('/auth', authRoutes);
router.use('/contacts', contactRoutes);
router.use('/articles', articleRoutes);
router.use('/services', serviceRoutes);
router.use('/calculator', calculatorRoutes);
router.use('/faqs', faqRoutes);
router.use('/team', teamRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/newsletter', newsletterRoutes);

export const routes = router;
```

### 4. Controladores

Os controladores são responsáveis por receber as requisições HTTP, chamar os serviços apropriados e retornar as respostas.

#### `controllers/authController.ts`

```typescript
// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ApiError } from '../utils/apiError';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body;
      const result = await this.authService.register(userData);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      return res.status(200).json({ message: 'E-mail de recuperação enviado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await this.authService.resetPassword(token, password);
      return res.status(200).json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const user = await this.authService.getUserProfile(userId);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

// Instanciação do controlador com suas dependências
const authService = new AuthService();
export const authController = new AuthController(authService);
```

### 5. Serviços

Os serviços contêm a lógica de negócios da aplicação.

#### `services/authService.ts`

```typescript
// src/services/authService.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { ApiError } from '../utils/apiError';
import { EmailService } from './emailService';

export class AuthService {
  private prisma: PrismaClient;
  private emailService: EmailService;

  constructor() {
    this.prisma = new PrismaClient();
    this.emailService = new EmailService();
  }

  async register(userData: any) {
    // Verificar se o e-mail já está em uso
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ApiError('E-mail já está em uso', 400);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Criar o usuário
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: 'USER',
        profile: {
          create: {
            name: userData.name,
            phone: userData.phone,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Gerar tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);

    // Enviar e-mail de boas-vindas
    await this.emailService.sendWelcomeEmail(user.email, user.profile.name);

    // Retornar dados do usuário e tokens (sem a senha)
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // Buscar o usuário pelo e-mail
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new ApiError('Credenciais inválidas', 401);
    }

    // Verificar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError('Credenciais inválidas', 401);
    }

    // Gerar tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);

    // Retornar dados do usuário e tokens (sem a senha)
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verificar o refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as { id: string };
      
      // Verificar se o usuário existe
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new ApiError('Token inválido', 401);
      }

      // Gerar novos tokens
      const tokens = this.generateTokens(user.id);
      return tokens;
    } catch (error) {
      throw new ApiError('Token inválido ou expirado', 401);
    }
  }

  async forgotPassword(email: string) {
    // Buscar o usuário pelo e-mail
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      // Não informamos ao cliente se o e-mail existe ou não por segurança
      return;
    }

    // Gerar token de redefinição de senha
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Salvar o token no banco de dados
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Enviar e-mail com o link de redefinição de senha
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.profile.name,
      resetToken
    );
  }

  async resetPassword(token: string, newPassword: string) {
    // Buscar o usuário pelo token de redefinição
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new ApiError('Token inválido ou expirado', 400);
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar a senha e limpar o token de redefinição
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new ApiError('Usuário não encontrado', 404);
    }

    // Retornar dados do usuário (sem a senha)
    const { password, resetToken, resetTokenExpiry, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }

  private generateTokens(userId: string) {
    // Gerar access token
    const accessToken = jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // Gerar refresh token (validade mais longa)
    const refreshToken = jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
```

### 6. Repositórios

Os repositórios são responsáveis pelo acesso aos dados, encapsulando a lógica de persistência.

#### `repositories/contactRepository.ts`

```typescript
// src/repositories/contactRepository.ts
import { PrismaClient, Contact, Prisma } from '@prisma/client';

export class ContactRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: Prisma.ContactCreateInput): Promise<Contact> {
    return this.prisma.contact.create({
      data,
    });
  }

  async findById(id: string): Promise<Contact | null> {
    return this.prisma.contact.findUnique({
      where: { id },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ContactWhereInput;
    orderBy?: Prisma.ContactOrderByWithRelationInput;
  }): Promise<{ contacts: Contact[]; total: number }> {
    const { skip, take, where, orderBy } = params;

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        skip,
        take,
        where,
        orderBy,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { contacts, total };
  }

  async update(id: string, data: Prisma.ContactUpdateInput): Promise<Contact> {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Contact> {
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
```

### 7. Middlewares

Os middlewares são funções que têm acesso ao objeto de requisição, ao objeto de resposta e à próxima função no ciclo de requisição-resposta.

#### `middlewares/authMiddleware.ts`

```typescript
// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../utils/apiError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Estender a interface Request para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware para verificar se o usuário está autenticado
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar se o token está presente no cabeçalho Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Não autorizado', 401);
    }

    // Extrair o token
    const token = authHeader.split(' ')[1];

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError('Não autorizado', 401);
    }

    // Adicionar o usuário à requisição
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError('Token inválido', 401));
    } else {
      next(error);
    }
  }
};

// Middleware para verificar se o usuário tem a role necessária
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Não autorizado', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError('Acesso proibido', 403));
    }

    next();
  };
};
```

#### `middlewares/errorMiddleware.ts`

```typescript
// src/middlewares/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { config } from '../config';

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', error);

  // Erros da API (personalizados)
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  // Erros de validação do Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: error.errors,
    });
  }

  // Erros do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Erro de registro único (unique constraint)
    if (error.code === 'P2002') {
      const field = error.meta?.target as string[];
      return res.status(400).json({
        status: 'error',
        message: `Já existe um registro com este ${field.join(', ')}`,
      });
    }

    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Registro não encontrado',
      });
    }
  }

  // Erro genérico
  const statusCode = 500;
  const message = config.env === 'production' 
    ? 'Erro interno do servidor' 
    : error.message || 'Erro interno do servidor';

  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.env !== 'production' && { stack: error.stack }),
  });
};
```

### 8. Validadores

Os validadores são responsáveis por validar os dados de entrada das requisições.

#### `validators/authValidator.ts`

```typescript
// src/validators/authValidator.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Esquema de validação para registro
export const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
});

// Esquema de validação para login
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Esquema de validação para refresh token
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

// Esquema de validação para recuperação de senha
export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

// Esquema de validação para redefinição de senha
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

// Middleware de validação
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Erro de validação',
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};
```

### 9. Utilitários

Funções auxiliares e classes utilitárias para uso em toda a aplicação.

#### `utils/apiError.ts`

```typescript
// src/utils/apiError.ts
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string) {
    return new ApiError(message, 400);
  }

  static unauthorized(message: string = 'Não autorizado') {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = 'Acesso proibido') {
    return new ApiError(message, 403);
  }

  static notFound(message: string = 'Recurso não encontrado') {
    return new ApiError(message, 404);
  }

  static internal(message: string = 'Erro interno do servidor') {
    return new ApiError(message, 500);
  }
}
```

## Implementação Passo a Passo

### 1. Configuração Inicial

1. Crie a estrutura de diretórios conforme descrito acima.
2. Configure o TypeScript (`tsconfig.json`).
3. Instale as dependências necessárias.
4. Configure o ambiente com arquivos `.env` e `.env.example`.

### 2. Configuração do Banco de Dados

1. Configure o Prisma e crie o esquema do banco de dados.
2. Execute as migrações iniciais.

### 3. Implementação das Camadas

1. Implemente os utilitários e classes de erro.
2. Implemente os middlewares globais.
3. Implemente os validadores de dados.
4. Implemente os repositórios para acesso aos dados.
5. Implemente os serviços com a lógica de negócios.
6. Implemente os controladores para lidar com as requisições.
7. Configure as rotas da API.

### 4. Configuração da Aplicação

1. Implemente o arquivo `app.ts` com a configuração do Express.
2. Implemente o arquivo `server.ts` para iniciar o servidor.

### 5. Testes

1. Configure o ambiente de testes.
2. Implemente testes unitários para os serviços e utilitários.
3. Implemente testes de integração para as rotas.
4. Implemente testes end-to-end para fluxos completos.

### 6. Documentação

1. Configure o Swagger para documentação da API.
2. Documente todas as rotas e esquemas.

## Conclusão

Esta estrutura de backend fornece uma base sólida para o desenvolvimento do sistema Contabilidade Igrejinha, seguindo boas práticas de arquitetura em camadas, separação de responsabilidades e organização de código. A implementação dos componentes descritos neste documento permitirá a criação de uma API robusta, segura e escalável para atender às necessidades do sistema.