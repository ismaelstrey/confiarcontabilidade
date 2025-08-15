# Segurança do Backend - Contabilidade Igrejinha

Este documento contém exemplos de implementação de segurança para o backend da aplicação Contabilidade Igrejinha.

## Autenticação e Autorização

### Gerenciamento de Tokens JWT

```typescript
// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Interface para o payload do token JWT
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Interface para os tokens gerados
 */
export interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

/**
 * Utilitário para gerenciamento de tokens JWT
 */
export class TokenUtil {
  /**
   * Gera tokens de acesso e refresh para um usuário
   * @param payload Dados do usuário para incluir no token
   * @returns Tokens gerados
   */
  static generateTokens(payload: TokenPayload): TokenResponse {
    const token = jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });
    
    const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn,
    });
    
    return {
      token,
      refreshToken,
      expiresIn: env.jwt.expiresIn,
      refreshExpiresIn: env.jwt.refreshExpiresIn,
    };
  }
  
  /**
   * Verifica e decodifica um token JWT
   * @param token Token JWT a ser verificado
   * @param isRefreshToken Indica se é um refresh token
   * @returns Payload do token decodificado
   * @throws Error se o token for inválido
   */
  static verifyToken(token: string, isRefreshToken = false): TokenPayload {
    try {
      const secret = isRefreshToken ? env.jwt.refreshSecret : env.jwt.secret;
      return jwt.verify(token, secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      }
      throw error;
    }
  }
  
  /**
   * Atualiza os tokens usando um refresh token
   * @param refreshToken Refresh token a ser usado para atualização
   * @returns Novos tokens gerados
   * @throws Error se o refresh token for inválido
   */
  static refreshTokens(refreshToken: string): TokenResponse {
    const payload = this.verifyToken(refreshToken, true);
    return this.generateTokens(payload);
  }
}
```

### Middleware de Autenticação

```typescript
// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { TokenUtil } from '../utils/jwt';
import { AppError } from '../utils/appError';

/**
 * Estende a interface Request para incluir o usuário autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware para verificar se o usuário está autenticado
 * @param req Objeto de requisição
 * @param res Objeto de resposta
 * @param next Função para passar para o próximo middleware
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verifica se o cabeçalho de autorização está presente
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError('Token de autenticação não fornecido', 401);
    }
    
    // Extrai o token do cabeçalho
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new AppError('Formato de token inválido', 401);
    }
    
    // Verifica e decodifica o token
    const decoded = TokenUtil.verifyToken(token);
    
    // Adiciona os dados do usuário à requisição
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expirado' || error.message === 'Token inválido') {
        return next(new AppError('Sessão expirada ou inválida. Por favor, faça login novamente', 401));
      }
    }
    next(new AppError('Não autorizado', 401));
  }
};

/**
 * Middleware para autenticação opcional
 * Se o token estiver presente e for válido, adiciona os dados do usuário à requisição
 * Se não estiver presente ou for inválido, continua a execução sem erro
 * @param req Objeto de requisição
 * @param res Objeto de resposta
 * @param next Função para passar para o próximo middleware
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verifica se o cabeçalho de autorização está presente
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }
    
    // Extrai o token do cabeçalho
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return next();
    }
    
    // Verifica e decodifica o token
    const decoded = TokenUtil.verifyToken(token);
    
    // Adiciona os dados do usuário à requisição
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    // Ignora erros de token e continua sem autenticação
    next();
  }
};
```

### Middleware de Autorização por Função

```typescript
// src/middlewares/roleMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

/**
 * Middleware para verificar se o usuário tem as funções necessárias
 * @param allowedRoles Array de funções permitidas
 * @returns Middleware para verificação de função
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verifica se o usuário está autenticado
      if (!req.user) {
        throw new AppError('Não autenticado', 401);
      }
      
      // Verifica se o usuário tem uma das funções permitidas
      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError('Acesso negado. Você não tem permissão para acessar este recurso', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

### Middleware de Propriedade de Recurso

```typescript
// src/middlewares/ownershipMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/appError';

/**
 * Middleware para verificar se o usuário é o proprietário do recurso
 * @param model Nome do modelo Prisma
 * @param paramName Nome do parâmetro que contém o ID do recurso
 * @param allowAdmin Se true, permite acesso a usuários com função ADMIN
 * @returns Middleware para verificação de propriedade
 */
export const ownershipMiddleware = (
  model: 'User' | 'SavedCalculation' | 'Article' | 'Contact',
  paramName = 'id',
  allowAdmin = true
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verifica se o usuário está autenticado
      if (!req.user) {
        throw new AppError('Não autenticado', 401);
      }
      
      // Se o usuário for admin e allowAdmin for true, permite o acesso
      if (allowAdmin && req.user.role === 'ADMIN') {
        return next();
      }
      
      // Obtém o ID do recurso
      const resourceId = req.params[paramName];
      if (!resourceId) {
        throw new AppError(`Parâmetro ${paramName} não fornecido`, 400);
      }
      
      // Verifica se o recurso existe e pertence ao usuário
      const resource = await (prisma as any)[model].findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });
      
      if (!resource) {
        throw new AppError('Recurso não encontrado', 404);
      }
      
      if (resource.userId !== req.user.userId) {
        throw new AppError('Acesso negado. Você não é o proprietário deste recurso', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

## Proteção contra Ataques Comuns

### Middleware de Segurança

```typescript
// src/middlewares/securityMiddleware.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';
import { env } from '../config/env';

/**
 * Configura os middlewares de segurança para a aplicação
 * @param app Instância do Express
 */
export const setupSecurityMiddlewares = (app: Express) => {
  // Helmet - Configura vários cabeçalhos HTTP para segurança
  app.use(helmet());
  
  // Content Security Policy (CSP)
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
        connectSrc: ["'self'", 'https://api.contabilidadeigrejinha.com.br'],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    })
  );
  
  // Strict-Transport-Security
  app.use(
    helmet.hsts({
      maxAge: 31536000, // 1 ano em segundos
      includeSubDomains: true,
      preload: true,
    })
  );
  
  // X-Content-Type-Options
  app.use(helmet.noSniff());
  
  // X-Frame-Options
  app.use(helmet.frameguard({ action: 'deny' }));
  
  // X-XSS-Protection
  app.use(helmet.xssFilter());
  
  // Referrer-Policy
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
  
  // Limita o tamanho do corpo da requisição
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  
  // Rate Limiting - Limita o número de requisições por IP
  const limiter = rateLimit({
    windowMs: env.rateLimit.windowMs, // 15 minutos por padrão
    max: env.rateLimit.max, // 100 requisições por janela por padrão
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas requisições deste IP, por favor tente novamente após 15 minutos',
    skip: (req) => env.isDevelopment, // Desativa em desenvolvimento
  });
  
  // Aplica o rate limiting a todas as rotas da API
  app.use('/api', limiter);
  
  // Rate Limiting mais restritivo para rotas de autenticação
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 requisições por janela
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas tentativas de login, por favor tente novamente após 15 minutos',
    skip: (req) => env.isDevelopment, // Desativa em desenvolvimento
  });
  
  // Aplica o rate limiting mais restritivo às rotas de autenticação
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
  app.use('/api/auth/reset-password', authLimiter);
};
```

### Sanitização de Entrada

```typescript
// src/utils/sanitize.ts
import { stripHtml } from 'string-strip-html';
import validator from 'validator';

/**
 * Utilitário para sanitização de dados de entrada
 */
export class SanitizeUtil {
  /**
   * Remove tags HTML de uma string
   * @param input String a ser sanitizada
   * @returns String sanitizada
   */
  static stripHtml(input: string): string {
    if (!input) return input;
    return stripHtml(input).result.trim();
  }
  
  /**
   * Escapa caracteres HTML em uma string
   * @param input String a ser escapada
   * @returns String escapada
   */
  static escapeHtml(input: string): string {
    if (!input) return input;
    return validator.escape(input);
  }
  
  /**
   * Normaliza uma string removendo caracteres especiais e espaços extras
   * @param input String a ser normalizada
   * @returns String normalizada
   */
  static normalizeString(input: string): string {
    if (!input) return input;
    return input
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  
  /**
   * Sanitiza um objeto recursivamente
   * @param obj Objeto a ser sanitizado
   * @returns Objeto sanitizado
   */
  static sanitizeObject<T>(obj: T): T {
    if (!obj) return obj;
    
    if (typeof obj === 'string') {
      return this.stripHtml(obj) as unknown as T;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item)) as unknown as T;
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      
      return sanitized as T;
    }
    
    return obj;
  }
}
```

### Middleware de Sanitização

```typescript
// src/middlewares/sanitizationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { SanitizeUtil } from '../utils/sanitize';

/**
 * Middleware para sanitizar dados de entrada
 * @param req Objeto de requisição
 * @param res Objeto de resposta
 * @param next Função para passar para o próximo middleware
 */
export const sanitizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Sanitiza o corpo da requisição
  if (req.body) {
    req.body = SanitizeUtil.sanitizeObject(req.body);
  }
  
  // Sanitiza os parâmetros da URL
  if (req.params) {
    req.params = SanitizeUtil.sanitizeObject(req.params);
  }
  
  // Sanitiza os parâmetros de consulta
  if (req.query) {
    req.query = SanitizeUtil.sanitizeObject(req.query);
  }
  
  next();
};
```

## Gerenciamento de Senhas

### Utilitário de Hash de Senha

```typescript
// src/utils/password.ts
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Utilitário para gerenciamento de senhas
 */
export class PasswordUtil {
  /**
   * Gera um hash para uma senha
   * @param password Senha a ser hasheada
   * @returns Hash da senha
   */
  static async hash(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
  
  /**
   * Verifica se uma senha corresponde a um hash
   * @param password Senha a ser verificada
   * @param hash Hash para comparação
   * @returns true se a senha corresponder ao hash, false caso contrário
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  /**
   * Gera um token aleatório para redefinição de senha
   * @returns Token gerado
   */
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * Gera um hash para um token de redefinição de senha
   * @param token Token a ser hasheado
   * @returns Hash do token
   */
  static hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
  
  /**
   * Verifica a força de uma senha
   * @param password Senha a ser verificada
   * @returns Objeto com resultado da verificação e mensagem
   */
  static checkPasswordStrength(password: string): { isStrong: boolean; message: string } {
    if (password.length < 8) {
      return { isStrong: false, message: 'A senha deve ter pelo menos 8 caracteres' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { isStrong: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
    }
    
    if (!/[a-z]/.test(password)) {
      return { isStrong: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
    }
    
    if (!/[0-9]/.test(password)) {
      return { isStrong: false, message: 'A senha deve conter pelo menos um número' };
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isStrong: false, message: 'A senha deve conter pelo menos um caractere especial' };
    }
    
    return { isStrong: true, message: 'Senha forte' };
  }
}
```

## Tratamento de Erros

### Classe de Erro Personalizada

```typescript
// src/utils/appError.ts
/**
 * Classe para erros personalizados da aplicação
 */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  errors?: string[];
  
  /**
   * Cria uma nova instância de AppError
   * @param message Mensagem de erro
   * @param statusCode Código de status HTTP
   * @param errors Lista de erros específicos
   */
  constructor(message: string, statusCode: number, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;
    
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Middleware de Tratamento de Erros

```typescript
// src/middlewares/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Middleware para tratamento de erros
 * @param err Erro a ser tratado
 * @param req Objeto de requisição
 * @param res Objeto de resposta
 * @param next Função para passar para o próximo middleware
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log do erro
  logger.error('Erro:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  // Erro operacional conhecido
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(env.isDevelopment && { stack: err.stack }),
    });
  }
  
  // Erro de validação do Zod
  if (err instanceof ZodError) {
    const errors = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors,
      ...(env.isDevelopment && { stack: err.stack }),
    });
  }
  
  // Erros do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Erro de violação de chave única
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[]) || ['campo'];
      
      return res.status(409).json({
        status: 'error',
        message: `Já existe um registro com este ${field.join(', ')}`,
        ...(env.isDevelopment && { stack: err.stack }),
      });
    }
    
    // Erro de registro não encontrado
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Registro não encontrado',
        ...(env.isDevelopment && { stack: err.stack }),
      });
    }
  }
  
  // Erro de validação do Express
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: [err.message],
      ...(env.isDevelopment && { stack: err.stack }),
    });
  }
  
  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'JSON inválido',
      ...(env.isDevelopment && { stack: err.stack }),
    });
  }
  
  // Erro desconhecido
  const statusCode = 500;
  const message = env.isProduction
    ? 'Erro interno do servidor'
    : err.message || 'Erro interno do servidor';
  
  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(env.isDevelopment && { stack: err.stack }),
  });
};
```

## Validação de Dados

### Middleware de Validação com Zod

```typescript
// src/middlewares/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/appError';

/**
 * Middleware para validação de dados com Zod
 * @param schema Esquema Zod para validação
 * @returns Middleware para validação
 */
export const validationMiddleware = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida os dados da requisição com o esquema Zod
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata os erros de validação
        const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        
        next(new AppError('Erro de validação', 400, errors));
      } else {
        next(error);
      }
    }
  };
};
```

## Proteção de Uploads de Arquivos

### Middleware de Upload Seguro

```typescript
// src/middlewares/uploadMiddleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

// Tipos de arquivos permitidos
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Tamanho máximo de arquivo
const MAX_FILE_SIZE = env.upload.maxFileSize; // 5MB por padrão

// Cria o diretório de uploads se não existir
const uploadDir = path.join(process.cwd(), env.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'misc';
    
    // Define a pasta com base no tipo de arquivo
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      folder = 'images';
    } else if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      folder = 'documents';
    }
    
    const destPath = path.join(uploadDir, folder);
    
    // Cria a pasta se não existir
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    // Gera um nome de arquivo seguro
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Filtro de arquivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Verifica o tipo de arquivo com base no campo
  if (file.fieldname === 'image' || file.fieldname === 'avatar' || file.fieldname === 'logo') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Tipo de imagem não permitido. Use JPEG, PNG ou WebP', 400));
    }
  } else if (file.fieldname === 'document' || file.fieldname === 'attachment') {
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Tipo de documento não permitido. Use PDF, DOC ou DOCX', 400));
    }
  } else {
    // Para outros campos, verifica se o tipo está na lista de permitidos
    const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new AppError('Tipo de arquivo não permitido', 400));
    }
  }
  
  cb(null, true);
};

// Configuração do Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Middleware para upload de imagem única
 */
export const uploadImage = upload.single('image');

/**
 * Middleware para upload de documento único
 */
export const uploadDocument = upload.single('document');

/**
 * Middleware para upload de avatar
 */
export const uploadAvatar = upload.single('avatar');

/**
 * Middleware para upload de múltiplas imagens
 * @param maxCount Número máximo de imagens
 */
export const uploadImages = (maxCount = 5) => upload.array('images', maxCount);

/**
 * Middleware para upload de múltiplos arquivos em campos diferentes
 * @param fields Configuração dos campos
 */
export const uploadFiles = (fields: { name: string; maxCount: number }[]) => {
  return upload.fields(fields);
};

/**
 * Middleware para tratamento de erros do Multer
 */
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(`Tamanho do arquivo excede o limite de ${MAX_FILE_SIZE / 1024 / 1024}MB`, 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Campo de arquivo inesperado', 400));
    }
    return next(new AppError(`Erro no upload: ${err.message}`, 400));
  }
  next(err);
};
```

## Proteção contra CSRF

### Middleware de Proteção CSRF

```typescript
// src/middlewares/csrfMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import csrf from 'csurf';
import { env } from '../config/env';

// Configuração do CSRF
const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
  },
});

/**
 * Middleware para proteção CSRF
 * @param req Objeto de requisição
 * @param res Objeto de resposta
 * @param next Função para passar para o próximo middleware
 */
export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Ignora a proteção CSRF para rotas específicas
  const ignoredPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh-token',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/contacts',
    '/api/calculator/tax',
  ];
  
  if (ignoredPaths.includes(req.path)) {
    return next();
  }
  
  // Aplica a proteção CSRF
  csrfProtection(req, res, next);
};

/**
 * Middleware para gerar token CSRF
 * @param req Objeto de requisição
 * @param res Objeto de resposta
 * @param next Função para passar para o próximo middleware
 */
export const generateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Gera um token CSRF e o envia na resposta
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    secure: env.isProduction,
    sameSite: 'strict',
  });
  next();
};
```

## Boas Práticas de Segurança

### Configuração de CORS

```typescript
// src/middlewares/corsMiddleware.ts
import cors from 'cors';
import { env } from '../config/env';

/**
 * Configuração do CORS
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permite requisições sem origin (como apps mobile ou Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Lista de origens permitidas
    const allowedOrigins = [
      env.frontendUrl,
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    
    // Em produção, adiciona o domínio principal
    if (env.isProduction) {
      allowedOrigins.push('https://contabilidadeigrejinha.com.br');
    }
    
    // Verifica se a origem está na lista de permitidas
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400, // 24 horas em segundos
};

/**
 * Middleware de CORS
 */
export const corsMiddleware = cors(corsOptions);
```

### Configuração de Cookies Seguros

```typescript
// src/middlewares/cookieMiddleware.ts
import cookieParser from 'cookie-parser';
import { Express } from 'express';
import { env } from '../config/env';

/**
 * Configura o middleware de cookies
 * @param app Instância do Express
 */
export const setupCookieMiddleware = (app: Express) => {
  // Configuração de cookies seguros
  app.use(cookieParser(env.jwt.secret));
  
  // Configuração padrão para cookies
  app.set('trust proxy', 1); // Necessário para HTTPS em produção com proxy
  
  // Middleware para configurar cookies seguros em todas as respostas
  app.use((req, res, next) => {
    // Método para definir cookies seguros
    res.cookie = (name: string, value: string, options: any = {}) => {
      const secureOptions = {
        ...options,
        httpOnly: options.httpOnly !== false,
        secure: env.isProduction,
        sameSite: options.sameSite || 'lax',
      };
      
      return res.cookie(name, value, secureOptions);
    };
    
    next();
  });
};
```

## Conclusão

Este documento fornece exemplos de implementação de segurança para o backend da aplicação Contabilidade Igrejinha. A segurança é um aspecto crítico de qualquer aplicação web, e as implementações apresentadas aqui seguem as melhores práticas da indústria.

As implementações incluem:

1. **Autenticação e Autorização**: Gerenciamento de tokens JWT, middleware de autenticação e autorização por função.
2. **Proteção contra Ataques Comuns**: Middleware de segurança, sanitização de entrada e proteção contra CSRF.
3. **Gerenciamento de Senhas**: Utilitário para hash e verificação de senhas.
4. **Tratamento de Erros**: Classe de erro personalizada e middleware de tratamento de erros.
5. **Validação de Dados**: Middleware de validação com Zod.
6. **Proteção de Uploads de Arquivos**: Middleware para upload seguro de arquivos.
7. **Boas Práticas de Segurança**: Configuração de CORS e cookies seguros.

Estas implementações fornecem uma base sólida para a segurança do backend da aplicação Contabilidade Igrejinha, protegendo contra as vulnerabilidades mais comuns e seguindo as melhores práticas de segurança.