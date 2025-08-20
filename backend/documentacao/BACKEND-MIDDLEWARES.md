# Middlewares do Backend - Contabilidade Igrejinha

Este documento contém exemplos de implementação dos principais middlewares para o backend da aplicação Contabilidade Igrejinha.

## Estrutura de um Middleware

Cada middleware segue uma estrutura padrão:

1. Importação de dependências
2. Definição da função do middleware
3. Processamento da requisição
4. Chamada para o próximo middleware ou controlador

## AuthMiddleware

```typescript
// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';

interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Estender a interface Request do Express para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next(new AppError('Token não fornecido', 401));
  }
  
  // Formato do token: Bearer <token>
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return next(new AppError('Erro no formato do token', 401));
  }
  
  const [scheme, token] = parts;
  
  if (!/^Bearer$/i.test(scheme)) {
    return next(new AppError('Token mal formatado', 401));
  }
  
  try {
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    
    // Adicionar informações do usuário à requisição
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };
    
    return next();
  } catch (error) {
    return next(new AppError('Token inválido', 401));
  }
}

// Middleware para verificar permissões baseadas em roles
export function roleMiddleware(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Usuário não autenticado', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Acesso não autorizado', 403));
    }
    
    return next();
  };
}
```

## ErrorMiddleware

```typescript
// src/middlewares/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import logger from '../utils/logger';

// Middleware para tratamento de erros operacionais
export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  // Verificar se é um erro operacional (criado pela aplicação)
  if (err instanceof AppError) {
    // Registrar erro operacional
    logger.warn({
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }
  
  // Erro não operacional (não previsto)
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });
  
  // Em ambiente de produção, não expor detalhes do erro
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
    });
  }
  
  // Em ambiente de desenvolvimento, retornar detalhes do erro
  return res.status(500).json({
    status: 'error',
    message: err.message,
    stack: err.stack,
  });
}

// Middleware para tratar rotas não encontradas
export function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  const error = new AppError(`Rota não encontrada: ${req.originalUrl}`, 404);
  next(error);
}
```

## ValidationMiddleware

```typescript
// src/middlewares/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/appError';

// Middleware para validação de dados com Zod
export function validationMiddleware(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar dados da requisição (body, query, params)
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      return next();
    } catch (error) {
      // Tratar erros de validação do Zod
      if (error instanceof ZodError) {
        // Formatar erros de validação
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          status: 'error',
          message: 'Erro de validação',
          errors: validationErrors,
        });
      }
      
      // Passar outros erros para o middleware de erro
      return next(error);
    }
  };
}
```

## RateLimitMiddleware

```typescript
// src/middlewares/rateLimitMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { AppError } from '../utils/appError';

// Cliente Redis (opcional, pode usar armazenamento em memória)
const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

// Middleware para limitar requisições
export const apiLimiter = rateLimit({
  // Usar Redis como store se disponível, caso contrário usar memória
  store: redisClient
    ? new RedisStore({
        // @ts-ignore - Tipagem incompatível entre versões
        sendCommand: (...args: string[]) => redisClient.call(...args),
      })
    : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP em cada janela
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Muitas requisições, tente novamente mais tarde' },
});

// Middleware mais restritivo para rotas sensíveis (login, registro, etc.)
export const authLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        // @ts-ignore - Tipagem incompatível entre versões
        sendCommand: (...args: string[]) => redisClient.call(...args),
      })
    : undefined,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Limite de 10 tentativas por IP em cada janela
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Muitas tentativas, tente novamente mais tarde' },
});
```

## LoggingMiddleware

```typescript
// src/middlewares/loggingMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Middleware para registrar informações sobre as requisições
export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  // Registrar início da requisição
  const startTime = Date.now();
  
  // Registrar informações básicas
  const logInfo = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };
  
  // Registrar quando a resposta for enviada
  res.on('finish', () => {
    // Calcular tempo de resposta
    const responseTime = Date.now() - startTime;
    
    // Adicionar informações da resposta
    const logData = {
      ...logInfo,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
    };
    
    // Registrar com nível apropriado baseado no status code
    if (res.statusCode >= 500) {
      logger.error(logData);
    } else if (res.statusCode >= 400) {
      logger.warn(logData);
    } else {
      logger.info(logData);
    }
  });
  
  next();
}
```

## CorsMiddleware

```typescript
// src/middlewares/corsMiddleware.ts
import cors from 'cors';

// Configuração do CORS
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Lista de origens permitidas
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      // Adicionar outros domínios conforme necessário
    ];
    
    // Permitir requisições sem origem (como apps mobile ou Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar se a origem está na lista de permitidas
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Bloqueado pelo CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 horas em segundos
};

// Exportar middleware configurado
export const corsMiddleware = cors(corsOptions);
```

## SecurityMiddleware

```typescript
// src/middlewares/securityMiddleware.ts
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import xss from 'xss-clean';
import hpp from 'hpp';

// Middleware Helmet para cabeçalhos de segurança
export const helmetMiddleware = helmet();

// Middleware para prevenir ataques XSS
export const xssMiddleware = xss();

// Middleware para prevenir poluição de parâmetros HTTP
export const hppMiddleware = hpp({
  whitelist: [
    // Lista de parâmetros que podem ser duplicados
    'order',
    'sort',
    'limit',
    'page',
  ],
});

// Middleware para definir política de segurança de conteúdo (CSP)
export function cspMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://analytics.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' https://api.example.com;"
  );
  next();
}

// Middleware para prevenir clickjacking
export function frameGuardMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
}
```

## CompressionMiddleware

```typescript
// src/middlewares/compressionMiddleware.ts
import compression from 'compression';
import { Request } from 'express';

// Função para determinar quais requisições devem ser comprimidas
const shouldCompress = (req: Request, res: any) => {
  // Não comprimir se o cliente especificar que não quer compressão
  if (req.headers['x-no-compression']) {
    return false;
  }
  
  // Comprimir todas as outras respostas
  return compression.filter(req, res);
};

// Middleware de compressão configurado
export const compressionMiddleware = compression({
  filter: shouldCompress,
  level: 6, // Nível de compressão (0-9, onde 9 é o máximo)
  threshold: 1024, // Tamanho mínimo em bytes para comprimir (1KB)
});
```

## CacheMiddleware

```typescript
// src/middlewares/cacheMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Cache em memória
const cache = new NodeCache({
  stdTTL: 300, // 5 minutos em segundos
  checkperiod: 60, // Verificar expiração a cada 1 minuto
});

// Middleware para cache de respostas
export function cacheMiddleware(duration: number = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Pular cache para métodos não-GET ou usuários autenticados
    if (req.method !== 'GET' || req.user) {
      return next();
    }
    
    // Criar chave de cache baseada na URL e query params
    const key = `__express__${req.originalUrl || req.url}`;
    
    // Verificar se temos cache para esta chave
    const cachedBody = cache.get(key);
    
    if (cachedBody) {
      // Enviar resposta do cache
      res.send(cachedBody);
      return;
    }
    
    // Armazenar a resposta original para uso posterior
    const originalSend = res.send;
    
    // Sobrescrever o método send
    res.send = function(body: any): Response {
      // Armazenar no cache apenas se for uma resposta bem-sucedida
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, duration);
      }
      
      // Chamar o método original
      return originalSend.call(this, body);
    };
    
    next();
  };
}

// Middleware para limpar cache
export function clearCacheMiddleware(keys: string[] | string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Após a resposta ser enviada
    res.on('finish', () => {
      // Limpar cache apenas para respostas bem-sucedidas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (Array.isArray(keys)) {
          keys.forEach(key => cache.del(key));
        } else {
          cache.del(keys);
        }
      }
    });
    
    next();
  };
}
```

## FileUploadMiddleware

```typescript
// src/middlewares/fileUploadMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/appError';

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Gerar nome de arquivo único
    const uniqueFilename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

// Filtro de arquivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos de arquivo permitidos
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de arquivo não suportado. Apenas JPEG, PNG, GIF e PDF são permitidos.', 400) as any);
  }
};

// Configuração do multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware para upload de um único arquivo
export const uploadSingleFile = (fieldName: string) => upload.single(fieldName);

// Middleware para upload de múltiplos arquivos
export const uploadMultipleFiles = (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount);

// Middleware para upload de múltiplos campos
export const uploadFields = (fields: { name: string; maxCount: number }[]) => upload.fields(fields);

// Middleware para tratar erros de upload
export function handleUploadErrors(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    // Erros específicos do Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Arquivo muito grande. Tamanho máximo permitido: 5MB', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Arquivo inesperado. Verifique o nome do campo e o número de arquivos', 400));
    }
    return next(new AppError(`Erro no upload: ${err.message}`, 400));
  }
  
  // Passar outros erros para o próximo middleware
  next(err);
}
```

## Configuração dos Middlewares na Aplicação

```typescript
// src/app.ts
import express from 'express';
import { corsMiddleware } from './middlewares/corsMiddleware';
import { helmetMiddleware, xssMiddleware, hppMiddleware, cspMiddleware, frameGuardMiddleware } from './middlewares/securityMiddleware';
import { compressionMiddleware } from './middlewares/compressionMiddleware';
import { loggingMiddleware } from './middlewares/loggingMiddleware';
import { apiLimiter } from './middlewares/rateLimitMiddleware';
import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware';
import { handleUploadErrors } from './middlewares/fileUploadMiddleware';

// Importar rotas
import authRoutes from './routes/authRoutes';
import contactRoutes from './routes/contactRoutes';
import articleRoutes from './routes/articleRoutes';
import serviceRoutes from './routes/serviceRoutes';
import calculatorRoutes from './routes/calculatorRoutes';
import faqRoutes from './routes/faqRoutes';
import teamRoutes from './routes/teamRoutes';
import testimonialRoutes from './routes/testimonialRoutes';
import newsletterRoutes from './routes/newsletterRoutes';

const app = express();

// Middlewares de segurança e configuração
app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(cspMiddleware);
app.use(frameGuardMiddleware);
app.use(express.json({ limit: '10kb' })); // Limitar tamanho do body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(xssMiddleware);
app.use(hppMiddleware);
app.use(compressionMiddleware);

// Middleware de logging
app.use(loggingMiddleware);

// Middleware de rate limiting
app.use('/api', apiLimiter);

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Middleware para tratar erros de upload
app.use(handleUploadErrors);

// Middleware para rotas não encontradas
app.use(notFoundMiddleware);

// Middleware para tratamento de erros
app.use(errorMiddleware);

export default app;
```

## Conclusão

Estes exemplos de middlewares fornecem uma base sólida para o desenvolvimento do backend da aplicação Contabilidade Igrejinha. Eles seguem as melhores práticas de desenvolvimento, incluindo:

- Autenticação e autorização
- Tratamento de erros
- Validação de dados
- Limitação de taxa de requisições
- Logging
- Segurança (CORS, Helmet, XSS, etc.)
- Compressão
- Cache
- Upload de arquivos

Ao implementar estes middlewares, você terá uma aplicação mais segura, robusta e eficiente, capaz de lidar com diversos cenários e proteger contra ameaças comuns.

---

*Este documento pode ser expandido com mais exemplos conforme necessário durante o desenvolvimento do backend.*