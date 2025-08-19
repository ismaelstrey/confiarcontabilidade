import Redis from 'ioredis';
import { config } from '../config/config';
import logger from '../utils/logger';

/**
 * Serviço de cache usando Redis
 * Gerencia operações de cache para melhorar performance da aplicação
 */
class CacheService {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.redis = new Redis({
      host: config.cache.redis.host,
      port: config.cache.redis.port,
      password: config.cache.redis.password || '',
      db: config.cache.redis.db,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.setupEventListeners();
  }

  /**
   * Configura os listeners de eventos do Redis
   */
  private setupEventListeners(): void {
    this.redis.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis connection error:', error);
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  }

  /**
   * Conecta ao Redis
   */
  async connect(): Promise<void> {
    try {
      await this.redis.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Desconecta do Redis
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.disconnect();
      this.isConnected = false;
    } catch (error) {
      logger.error('Failed to disconnect from Redis:', error);
    }
  }

  /**
   * Verifica se o Redis está conectado
   */
  isRedisConnected(): boolean {
    return this.isConnected && this.redis.status === 'ready';
  }

  /**
   * Define um valor no cache
   * @param key - Chave do cache
   * @param value - Valor a ser armazenado
   * @param ttl - Tempo de vida em segundos (opcional)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (!this.isRedisConnected()) {
        logger.warn('Redis not connected, skipping cache set');
        return;
      }

      const serializedValue = JSON.stringify(value);
      const cacheTtl = ttl || config.cache.ttl;

      await this.redis.setex(key, cacheTtl, serializedValue);
      logger.debug(`Cache set: ${key} (TTL: ${cacheTtl}s)`);
    } catch (error) {
      logger.error(`Failed to set cache for key ${key}:`, error);
    }
  }

  /**
   * Obtém um valor do cache
   * @param key - Chave do cache
   * @returns Valor do cache ou null se não encontrado
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (!this.isRedisConnected()) {
        logger.warn('Redis not connected, skipping cache get');
        return null;
      }

      const value = await this.redis.get(key);
      if (!value) {
        return null;
      }

      const parsedValue = JSON.parse(value);
      logger.debug(`Cache hit: ${key}`);
      return parsedValue;
    } catch (error) {
      logger.error(`Failed to get cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove um valor do cache
   * @param key - Chave do cache
   */
  async del(key: string): Promise<void> {
    try {
      if (!this.isRedisConnected()) {
        logger.warn('Redis not connected, skipping cache delete');
        return;
      }

      await this.redis.del(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error(`Failed to delete cache for key ${key}:`, error);
    }
  }

  /**
   * Remove múltiplas chaves do cache
   * @param keys - Array de chaves do cache
   */
  async delMany(keys: string[]): Promise<void> {
    try {
      if (!this.isRedisConnected() || keys.length === 0) {
        return;
      }

      await this.redis.del(...keys);
      logger.debug(`Cache deleted: ${keys.join(', ')}`);
    } catch (error) {
      logger.error(`Failed to delete cache for keys ${keys.join(', ')}:`, error);
    }
  }

  /**
   * Remove todas as chaves que correspondem ao padrão
   * @param pattern - Padrão das chaves (ex: 'user:*')
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      if (!this.isRedisConnected()) {
        return;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache pattern deleted: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      logger.error(`Failed to delete cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Verifica se uma chave existe no cache
   * @param key - Chave do cache
   * @returns True se a chave existe
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Failed to check cache existence for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Define o tempo de vida de uma chave
   * @param key - Chave do cache
   * @param ttl - Tempo de vida em segundos
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      if (!this.isRedisConnected()) {
        return;
      }

      await this.redis.expire(key, ttl);
      logger.debug(`Cache TTL set: ${key} (${ttl}s)`);
    } catch (error) {
      logger.error(`Failed to set TTL for key ${key}:`, error);
    }
  }

  /**
   * Obtém o tempo de vida restante de uma chave
   * @param key - Chave do cache
   * @returns Tempo de vida em segundos (-1 se não tem TTL, -2 se não existe)
   */
  async ttl(key: string): Promise<number> {
    try {
      if (!this.isRedisConnected()) {
        return -2;
      }

      return await this.redis.ttl(key);
    } catch (error) {
      logger.error(`Failed to get TTL for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Limpa todo o cache
   */
  async flush(): Promise<void> {
    try {
      if (!this.isRedisConnected()) {
        return;
      }

      await this.redis.flushdb();
      logger.info('Cache flushed');
    } catch (error) {
      logger.error('Failed to flush cache:', error);
    }
  }

  /**
   * Obtém informações sobre o Redis
   */
  async info(): Promise<any> {
    try {
      if (!this.isRedisConnected()) {
        return null;
      }

      const info = await this.redis.info();
      return info;
    } catch (error) {
      logger.error('Failed to get Redis info:', error);
      return null;
    }
  }
}

// Instância singleton do serviço de cache
export const cacheService = new CacheService();

// Exportar a classe para testes
export { CacheService };