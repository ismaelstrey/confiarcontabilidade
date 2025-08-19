import { Request, Response } from 'express';
import { cacheService } from '../services/cacheService';
import logger from '../utils/logger';

/**
 * Controller de exemplo demonstrando o uso do sistema de cache
 */
export class CacheExampleController {
  /**
   * Exemplo de busca com cache manual
   * Demonstra como usar o cache diretamente no controller
   */
  static async getDataWithCache(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }
      
      const cacheKey = `example:data:${id}`;
      
      // Tenta obter do cache primeiro
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.info(`Cache hit for key: ${cacheKey}`);
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
          message: 'Dados obtidos do cache'
        });
      }
      
      // Simula busca no banco de dados (operação custosa)
      logger.info(`Cache miss for key: ${cacheKey}, fetching from database`);
      const data = await CacheExampleController.simulateExpensiveOperation(id);
      
      // Armazena no cache por 10 minutos
      await cacheService.set(cacheKey, data, 600);
      
      return res.json({
        success: true,
        data,
        cached: false,
        message: 'Dados obtidos do banco de dados e armazenados no cache'
      });
    } catch (error) {
      logger.error('Erro ao obter dados com cache:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Exemplo de invalidação de cache
   * Demonstra como invalidar cache após uma operação de escrita
   */
  static async updateDataAndInvalidateCache(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }
      
      // Simula atualização no banco de dados
      const updatedData = await CacheExampleController.simulateUpdateOperation(id, updateData);
      
      // Invalida caches relacionados
      const cacheKeys = [
        `example:data:${id}`,
        `example:list:*`,
        `example:user:${(req as any).user?.id}:*`
      ];
      
      // Remove cache específico
      await cacheService.del(`example:data:${id}`);
      
      // Remove caches por padrão
      await cacheService.delPattern('example:list:*');
      
      logger.info(`Cache invalidated for data ID: ${id}`);
      
      return res.json({
        success: true,
        data: updatedData,
        message: 'Dados atualizados e cache invalidado'
      });
    } catch (error) {
      logger.error('Erro ao atualizar dados e invalidar cache:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Exemplo de cache com TTL dinâmico
   * Demonstra como definir TTL baseado no tipo de dados
   */
  static async getDataWithDynamicTTL(req: Request, res: Response) {
    try {
      const { type, id } = req.params;
      
      if (!type || !id) {
        return res.status(400).json({
          success: false,
          message: 'Type e ID são obrigatórios'
        });
      }
      
      const cacheKey = `example:${type}:${id}`;
      
      // Define TTL baseado no tipo de dados
      let ttl: number;
      switch (type) {
        case 'static':
          ttl = 3600; // 1 hora para dados estáticos
          break;
        case 'dynamic':
          ttl = 300; // 5 minutos para dados dinâmicos
          break;
        case 'realtime':
          ttl = 60; // 1 minuto para dados em tempo real
          break;
        default:
          ttl = 600; // 10 minutos padrão
      }
      
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
          ttl,
          message: `Dados ${type} obtidos do cache`
        });
      }
      
      const data = await CacheExampleController.simulateExpensiveOperation(id);
      await cacheService.set(cacheKey, data, ttl);
      
      return res.json({
        success: true,
        data,
        cached: false,
        ttl,
        message: `Dados ${type} obtidos do banco e armazenados no cache por ${ttl}s`
      });
    } catch (error) {
      logger.error('Erro ao obter dados com TTL dinâmico:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Exemplo de cache condicional
   * Demonstra como cachear baseado em condições específicas
   */
  static async getDataWithConditionalCache(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { useCache = 'true' } = req.query;
      const userRole = (req as any).user?.role;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }
      
      // Condições para usar cache
      const shouldUseCache = 
        useCache === 'true' && 
        userRole !== 'ADMIN' && // Admins sempre veem dados frescos
        !req.headers['cache-control']?.includes('no-cache');
      
      const cacheKey = `example:conditional:${id}:${userRole}`;
      
      if (shouldUseCache) {
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
          return res.json({
            success: true,
            data: cachedData,
            cached: true,
            message: 'Dados obtidos do cache (condicional)'
          });
        }
      }
      
      const data = await CacheExampleController.simulateExpensiveOperation(id);
      
      // Só armazena no cache se as condições permitirem
      if (shouldUseCache) {
        await cacheService.set(cacheKey, data, 300);
      }
      
      return res.json({
        success: true,
        data,
        cached: false,
        cacheUsed: shouldUseCache,
        message: shouldUseCache 
          ? 'Dados obtidos do banco e armazenados no cache'
          : 'Dados obtidos do banco (cache desabilitado)'
      });
    } catch (error) {
      logger.error('Erro ao obter dados com cache condicional:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Endpoint para gerenciar cache
   * Permite limpar, verificar status, etc.
   */
  static async manageCacheEndpoint(req: Request, res: Response) {
    try {
      const { action } = req.params;
      const { pattern, key } = req.body;
      
      switch (action) {
        case 'clear':
          if (pattern) {
            await cacheService.delPattern(pattern);
            return res.json({ success: true, message: `Cache limpo para padrão: ${pattern}` });
          } else if (key) {
            await cacheService.del(key);
            return res.json({ success: true, message: `Cache limpo para chave: ${key}` });
          } else {
            await cacheService.flush();
            return res.json({ success: true, message: 'Todo o cache foi limpo' });
          }
          
        case 'status':
          const isConnected = cacheService.isRedisConnected();
          const info = await cacheService.info();
          return res.json({
            success: true,
            connected: isConnected,
            info: isConnected ? info : null,
            message: `Redis está ${isConnected ? 'conectado' : 'desconectado'}`
          });
          
        case 'check':
          if (!key) {
            return res.status(400).json({
              success: false,
              message: 'Chave é obrigatória para verificar cache'
            });
          }
          const exists = await cacheService.exists(key);
          const ttl = exists ? await cacheService.ttl(key) : -2;
          return res.json({
            success: true,
            exists,
            ttl,
            message: exists 
              ? `Chave existe com TTL de ${ttl}s` 
              : 'Chave não existe no cache'
          });
          
        default:
          return res.status(400).json({
            success: false,
            message: 'Ação inválida. Use: clear, status, ou check'
          });
      }
    } catch (error) {
      logger.error('Erro ao gerenciar cache:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Simula uma operação custosa (consulta ao banco, API externa, etc.)
   */
  private static async simulateExpensiveOperation(id: string): Promise<any> {
    // Simula delay de operação custosa
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id,
      name: `Item ${id}`,
      description: 'Dados obtidos através de operação custosa',
      timestamp: new Date().toISOString(),
      processingTime: '1000ms'
    };
  }
  
  /**
   * Simula uma operação de atualização
   */
  private static async simulateUpdateOperation(id: string, updateData: any): Promise<any> {
    // Simula delay de operação de atualização
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id,
      ...updateData,
      updatedAt: new Date().toISOString(),
      processingTime: '500ms'
    };
  }
}