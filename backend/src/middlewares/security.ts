import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

/**
 * Configuração do CORS para permitir requisições de origens específicas
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL
    ].filter(Boolean); // Remove valores undefined/null

    // Permite requisições sem origin (ex: aplicações mobile, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true, // Permite cookies e headers de autenticação
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // Cache preflight por 24 horas
});

/**
 * Configuração do Helmet para segurança de headers HTTP
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Desabilita para compatibilidade
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Rate limiting geral para todas as rotas
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Máximo 1000 requisições por IP por janela
  message: {
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  skip: (req: Request): boolean => {
    // Pula rate limiting para IPs locais em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.socket.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || (ip?.startsWith('192.168.') ?? false);
    }
    return false;
  }
});

/**
 * Rate limiting mais restritivo para rotas de autenticação
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 tentativas de login por IP por janela
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  skip: (req: Request): boolean => {
    // Pula rate limiting para IPs locais em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.socket.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || (ip?.startsWith('192.168.') ?? false);
    }
    return false;
  }
});

/**
 * Rate limiting para rotas de upload
 */
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // Máximo 50 uploads por IP por hora
  message: {
    error: 'Limite de uploads excedido. Tente novamente em 1 hora.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiting para rotas de API em geral
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // Máximo 500 requisições por IP por janela
  message: {
    error: 'Limite de requisições da API excedido. Tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Middleware de compressão para otimizar o tamanho das respostas
 */
export const compressionMiddleware = compression({
  level: 6, // Nível de compressão (0-9)
  threshold: 1024, // Só comprime se a resposta for maior que 1KB
  filter: (req: Request, res: Response) => {
    // Não comprime se o cliente não suporta
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Usa o filtro padrão do compression
    return compression.filter(req, res);
  }
});

/**
 * Middleware para adicionar headers de segurança customizados
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove header que expõe informações do servidor
  res.removeHeader('X-Powered-By');
  
  // Adiciona headers de segurança customizados
  res.setHeader('X-API-Version', process.env.API_VERSION || '1.0.0');
  res.setHeader('X-Response-Time', Date.now().toString());
  
  // Previne ataques de clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Previne MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Força HTTPS em produção
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

/**
 * Middleware para log de requisições de segurança
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log da requisição
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);
  
  // Log da resposta quando terminar
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};