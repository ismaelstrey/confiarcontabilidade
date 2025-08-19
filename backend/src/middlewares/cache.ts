import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';
import logger from '../utils/logger';

/**
 * Interface para opções do middleware de cache
 */
interface CacheOptions {
  ttl?: number; // Tempo de vida em segundos
  keyGenerator?: (req: Request) => string; // Função para gerar chave personalizada
  condition?: (req: Request, res: Response) => boolean; // Condição para cachear
  skipCache?: (req: Request) => boolean; // Condição para pular o cache
}

/**
 * Gera uma chave de cache padrão baseada na requisição
 * @param req - Objeto de requisição Express
 * @returns Chave de cache
 */
function generateDefaultCacheKey(req: Request): string {
  const { method, originalUrl, query, user } = req;
  const userId = (user as any)?.id || 'anonymous';
  const queryString = Object.keys(query).length > 0 ? JSON.stringify(query) : '';
  
  return `cache:${method}:${originalUrl}:${userId}:${queryString}`;
}

/**
 * Middleware de cache para requisições HTTP
 * @param options - Opções de configuração do cache
 * @returns Middleware Express
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutos por padrão
    keyGenerator = generateDefaultCacheKey,
    condition = () => true,
    skipCache = () => false
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Pula o cache se a condição for verdadeira
      if (skipCache(req)) {
        return next();
      }

      // Só cacheia métodos GET
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = keyGenerator(req);
      
      // Tenta obter do cache
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Se não encontrou no cache, intercepta a resposta
      const originalJson = res.json;
      let responseData: any;

      res.json = function(data: any) {
        responseData = data;
        return originalJson.call(this, data);
      };

      // Intercepta o final da resposta
      res.on('finish', async () => {
        try {
          // Só cacheia se a resposta foi bem-sucedida e a condição for verdadeira
          if (res.statusCode >= 200 && res.statusCode < 300 && condition(req, res) && responseData) {
            await cacheService.set(cacheKey, responseData, ttl);
            logger.debug(`Cache set for key: ${cacheKey}`);
          }
        } catch (error) {
          logger.error('Error setting cache:', error);
        }
      });

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
}

/**
 * Middleware de cache específico para dados de usuário
 * @param ttl - Tempo de vida em segundos (padrão: 600 = 10 minutos)
 */
export function userCacheMiddleware(ttl: number = 600) {
  return cacheMiddleware({
    ttl,
    keyGenerator: (req) => {
      const userId = (req as any).user?.id || 'anonymous';
      return `user:${userId}:${req.originalUrl}`;
    },
    condition: (req, res) => {
      // Só cacheia se o usuário estiver autenticado
      return !!(req as any).user;
    }
  });
}

/**
 * Middleware de cache específico para dados públicos
 * @param ttl - Tempo de vida em segundos (padrão: 1800 = 30 minutos)
 */
export function publicCacheMiddleware(ttl: number = 1800) {
  return cacheMiddleware({
    ttl,
    keyGenerator: (req) => {
      return `public:${req.originalUrl}:${JSON.stringify(req.query)}`;
    },
    condition: () => true
  });
}

/**
 * Middleware de cache específico para artigos/blog
 * @param ttl - Tempo de vida em segundos (padrão: 3600 = 1 hora)
 */
export function articleCacheMiddleware(ttl: number = 3600) {
  return cacheMiddleware({
    ttl,
    keyGenerator: (req) => {
      const { slug, id } = req.params;
      const identifier = slug || id || req.originalUrl;
      return `article:${identifier}:${JSON.stringify(req.query)}`;
    },
    condition: () => true
  });
}

/**
 * Middleware para invalidar cache baseado em padrões
 * @param patterns - Padrões de chaves para invalidar
 */
export function invalidateCacheMiddleware(patterns: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Executa a operação primeiro
      next();

      // Invalida o cache após a resposta ser enviada
      res.on('finish', async () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          for (const pattern of patterns) {
            await cacheService.delPattern(pattern);
            logger.debug(`Cache invalidated for pattern: ${pattern}`);
          }
        }
      });
    } catch (error) {
      logger.error('Cache invalidation middleware error:', error);
      next();
    }
  };
}

/**
 * Middleware para invalidar cache de usuário específico
 * @param getUserId - Função para extrair o ID do usuário da requisição
 */
export function invalidateUserCacheMiddleware(getUserId?: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const pattern = getUserId ? `user:${getUserId(req)}:*` : 'user:*';
    const middleware = invalidateCacheMiddleware([pattern]);
    return middleware(req, res, next);
  };
}

/**
 * Middleware para invalidar cache público
 */
export function invalidatePublicCacheMiddleware() {
  return invalidateCacheMiddleware(['public:*']);
}

/**
 * Middleware para invalidar cache de artigos
 */
export function invalidateArticleCacheMiddleware() {
  return invalidateCacheMiddleware(['article:*']);
}