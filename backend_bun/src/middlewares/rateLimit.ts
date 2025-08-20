import { Context, Next } from 'hono';
import { createError } from './errorHandler';

/**
 * Interface para configuração do rate limiting
 */
interface RateLimitConfig {
  windowMs: number; // Janela de tempo em milissegundos
  maxRequests: number; // Máximo de requests por janela
  message?: string; // Mensagem customizada
  skipSuccessfulRequests?: boolean; // Não contar requests bem-sucedidos
  skipFailedRequests?: boolean; // Não contar requests com erro
}

/**
 * Store em memória para rate limiting
 * Em produção, considere usar Redis
 */
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  increment(key: string): { totalHits: number; resetTime: number } {
    const now = Date.now();
    const current = this.store.get(key);

    if (!current || now > current.resetTime) {
      // Primeira request ou janela expirou
      this.store.set(key, { count: 1, resetTime: now });
      return { totalHits: 1, resetTime: now };
    }

    // Incrementar contador
    current.count++;
    this.store.set(key, current);
    return { totalHits: current.count, resetTime: current.resetTime };
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  // Limpeza automática de entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const store = new MemoryStore();

// Limpeza automática a cada 5 minutos
setInterval(() => store.cleanup(), 5 * 60 * 1000);

/**
 * Middleware de rate limiting
 */
export const rateLimit = (config: RateLimitConfig) => {
  return async (c: Context, next: Next) => {
    // Obter identificador único (IP + User-Agent ou User ID se autenticado)
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';
    const user = c.get('user');
    
    const identifier = user ? `user:${user.id}` : `ip:${ip}:${userAgent}`;
    const key = `rateLimit:${identifier}`;

    const { totalHits, resetTime } = store.increment(key);
    const resetTimeSeconds = Math.ceil((resetTime + config.windowMs) / 1000);

    // Adicionar headers de rate limit
    c.header('X-RateLimit-Limit', config.maxRequests.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, config.maxRequests - totalHits).toString());
    c.header('X-RateLimit-Reset', resetTimeSeconds.toString());

    if (totalHits > config.maxRequests) {
      c.header('Retry-After', Math.ceil(config.windowMs / 1000).toString());
      
      throw createError(
        config.message || 'Muitas tentativas. Tente novamente mais tarde.',
        429,
        'RATE_LIMIT_EXCEEDED',
        {
          limit: config.maxRequests,
          windowMs: config.windowMs,
          resetTime: resetTimeSeconds
        }
      );
    }

    await next();
  };
};

/**
 * Configurações pré-definidas de rate limiting
 */
export const rateLimitConfigs = {
  // Rate limit geral - 100 requests por 15 minutos
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
  },

  // Rate limit para autenticação - 5 tentativas por 15 minutos
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },

  // Rate limit para upload - 10 uploads por hora
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10,
    message: 'Limite de uploads atingido. Tente novamente em 1 hora.'
  },

  // Rate limit para APIs públicas - 1000 requests por hora
  public: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 1000,
    message: 'Limite de requisições atingido. Tente novamente em 1 hora.'
  },

  // Rate limit rigoroso para operações sensíveis - 3 tentativas por hora
  strict: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3,
    message: 'Limite de tentativas atingido. Tente novamente em 1 hora.'
  }
};

/**
 * Middleware específico para diferentes tipos de operação
 */
export const authRateLimit = rateLimit(rateLimitConfigs.auth);
export const uploadRateLimit = rateLimit(rateLimitConfigs.upload);
export const publicRateLimit = rateLimit(rateLimitConfigs.public);
export const strictRateLimit = rateLimit(rateLimitConfigs.strict);
export const generalRateLimit = rateLimit(rateLimitConfigs.general);

/**
 * Função para resetar rate limit de um usuário específico (útil para admins)
 */
export const resetUserRateLimit = (userId: string) => {
  store.reset(`rateLimit:user:${userId}`);
};

/**
 * Função para resetar rate limit de um IP específico
 */
export const resetIpRateLimit = (ip: string, userAgent: string) => {
  store.reset(`rateLimit:ip:${ip}:${userAgent}`);
};