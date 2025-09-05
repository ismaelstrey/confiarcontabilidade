import { Context, Next } from 'hono';
import { createError } from './errorHandler';

/**
 * Interface para configuração de rate limiting
 */
interface RateLimitConfig {
  windowMs: number; // Janela de tempo em milissegundos
  maxRequests: number; // Máximo de requisições por janela
  message?: string; // Mensagem personalizada
  skipSuccessfulRequests?: boolean; // Pular requisições bem-sucedidas
  skipFailedRequests?: boolean; // Pular requisições com falha
  keyGenerator?: (c: Context) => string; // Gerador de chave personalizado
}

/**
 * Configurações predefinidas de rate limiting
 */
export const RATE_LIMIT_CONFIGS = {
  // Rate limiting geral - mais restritivo
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,
    message: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  
  // Rate limiting para autenticação - muito restritivo
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    skipSuccessfulRequests: true
  },
  
  // Rate limiting para registro - restritivo
  REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3,
    message: 'Muitas tentativas de registro. Tente novamente em 1 hora.'
  },
  
  // Rate limiting para upload - moderado
  UPLOAD: {
    windowMs: 10 * 60 * 1000, // 10 minutos
    maxRequests: 20,
    message: 'Muitos uploads. Tente novamente em 10 minutos.'
  },
  
  // Rate limiting para contatos - moderado
  CONTACT: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 5,
    message: 'Muitas mensagens de contato. Tente novamente em 1 hora.'
  },
  
  // Rate limiting para APIs públicas - liberal
  PUBLIC_API: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 60,
    message: 'Muitas requisições à API. Tente novamente em 1 minuto.'
  },
  
  // Rate limiting para operações administrativas - muito liberal
  ADMIN: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 200,
    message: 'Muitas operações administrativas. Tente novamente em 1 minuto.'
  }
} as const;

/**
 * Armazenamento em memória para contadores de rate limiting
 */
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  
  /**
   * Incrementa o contador para uma chave
   */
  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.store.get(key);
    
    // Se não existe ou expirou, criar novo
    if (!existing || now > existing.resetTime) {
      const resetTime = now + windowMs;
      const entry = { count: 1, resetTime };
      this.store.set(key, entry);
      return entry;
    }
    
    // Incrementar contador existente
    existing.count++;
    this.store.set(key, existing);
    return existing;
  }
  
  /**
   * Limpa entradas expiradas periodicamente
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Instância global do store
const store = new MemoryStore();

// Limpar entradas expiradas a cada 5 minutos
setInterval(() => store.cleanup(), 5 * 60 * 1000);

/**
 * Gerador de chave padrão baseado no IP
 */
const defaultKeyGenerator = (c: Context): string => {
  const forwarded = c.req.header('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             c.req.header('x-real-ip') || 
             c.env?.ip || 
             'unknown';
  return `rate_limit:${ip}`;
};

/**
 * Gerador de chave baseado no usuário autenticado
 */
export const userKeyGenerator = (c: Context): string => {
  const user = c.get('user');
  if (user?.id) {
    return `rate_limit:user:${user.id}`;
  }
  return defaultKeyGenerator(c);
};

/**
 * Gerador de chave baseado no IP e endpoint
 */
export const endpointKeyGenerator = (endpoint: string) => (c: Context): string => {
  const baseKey = defaultKeyGenerator(c);
  return `${baseKey}:${endpoint}`;
};

/**
 * Middleware de rate limiting avançado
 */
export const advancedRateLimit = (config: RateLimitConfig) => {
  return async (c: Context, next: Next) => {
    const keyGenerator = config.keyGenerator || defaultKeyGenerator;
    const key = keyGenerator(c);
    
    // Incrementar contador
    const { count, resetTime } = store.increment(key, config.windowMs);
    
    // Adicionar headers de rate limiting
    const remaining = Math.max(0, config.maxRequests - count);
    const resetTimeSeconds = Math.ceil(resetTime / 1000);
    
    c.header('X-RateLimit-Limit', config.maxRequests.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', resetTimeSeconds.toString());
    
    // Verificar se excedeu o limite
    if (count > config.maxRequests) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
      c.header('Retry-After', retryAfter.toString());
      
      throw createError(
        config.message || 'Muitas requisições',
        429,
        'RATE_LIMIT_EXCEEDED',
        {
          limit: config.maxRequests,
          current: count,
          resetTime: resetTimeSeconds,
          retryAfter
        }
      );
    }
    
    await next();
    
    // Se configurado para pular requisições bem-sucedidas
    if (config.skipSuccessfulRequests && c.res.status < 400) {
      // Decrementar contador para requisições bem-sucedidas
      const current = store.increment(key, config.windowMs);
      if (current.count > 1) {
        current.count--;
      }
    }
    
    // Se configurado para pular requisições com falha
    if (config.skipFailedRequests && c.res.status >= 400) {
      // Decrementar contador para requisições com falha
      const current = store.increment(key, config.windowMs);
      if (current.count > 1) {
        current.count--;
      }
    }
  };
};

/**
 * Middlewares pré-configurados
 */
export const rateLimiters = {
  general: advancedRateLimit(RATE_LIMIT_CONFIGS.GENERAL),
  auth: advancedRateLimit(RATE_LIMIT_CONFIGS.AUTH),
  register: advancedRateLimit(RATE_LIMIT_CONFIGS.REGISTER),
  upload: advancedRateLimit(RATE_LIMIT_CONFIGS.UPLOAD),
  contact: advancedRateLimit(RATE_LIMIT_CONFIGS.CONTACT),
  publicApi: advancedRateLimit(RATE_LIMIT_CONFIGS.PUBLIC_API),
  admin: advancedRateLimit(RATE_LIMIT_CONFIGS.ADMIN)
};

/**
 * Rate limiter personalizado para endpoints específicos
 */
export const createEndpointRateLimit = (endpoint: string, config: Partial<RateLimitConfig> = {}) => {
  const fullConfig: RateLimitConfig = {
    ...RATE_LIMIT_CONFIGS.GENERAL,
    ...config,
    keyGenerator: config.keyGenerator || endpointKeyGenerator(endpoint)
  };
  
  return advancedRateLimit(fullConfig);
};

/**
 * Rate limiter baseado no usuário
 */
export const createUserRateLimit = (config: Partial<RateLimitConfig> = {}) => {
  const fullConfig: RateLimitConfig = {
    ...RATE_LIMIT_CONFIGS.GENERAL,
    ...config,
    keyGenerator: userKeyGenerator
  };
  
  return advancedRateLimit(fullConfig);
};

/**
 * Middleware para aplicar rate limiting condicional
 */
export const conditionalRateLimit = (
  condition: (c: Context) => boolean,
  rateLimiter: (c: Context, next: Next) => Promise<void>
) => {
  return async (c: Context, next: Next) => {
    if (condition(c)) {
      await rateLimiter(c, next);
    } else {
      await next();
    }
  };
};

/**
 * Utilitário para verificar se o usuário é admin (para rate limiting condicional)
 */
export const isAdmin = (c: Context): boolean => {
  const user = c.get('user');
  return user?.role === 'ADMIN';
};

/**
 * Utilitário para verificar se a requisição é de um IP local
 */
export const isLocalRequest = (c: Context): boolean => {
  const forwarded = c.req.header('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             c.req.header('x-real-ip') || 
             c.env?.ip || 
             'unknown';
  
  return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
};