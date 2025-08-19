import Redis from 'ioredis';
import logger from '../../utils/logger';

// Mock do Redis
jest.mock('ioredis');
const MockedRedis = Redis as jest.MockedClass<typeof Redis>;

// Mock do logger
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock do config
jest.mock('../../config/config', () => ({
  config: {
    cache: {
      redis: {
        host: 'localhost',
        port: 6379,
        password: '',
        db: 0,
      },
      ttl: 3600, // TTL padrão em segundos
    },
  },
}));

// Importar após os mocks
import { CacheService } from '../cacheService';

describe('CacheService', () => {
  let mockRedisInstance: any;
  let cacheService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar mock da instância do Redis
    mockRedisInstance = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      setex: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
      flushdb: jest.fn(),
      info: jest.fn(),
      on: jest.fn(),
      status: 'ready',
    };

    MockedRedis.mockImplementation(() => mockRedisInstance);
    
    // Criar nova instância para cada teste
    cacheService = new CacheService();
    // Configurar o estado de conexão como true por padrão
    (cacheService as any).isConnected = true;
  });

  describe('connect', () => {
    it('should connect to Redis successfully', async () => {
      mockRedisInstance.connect.mockResolvedValue(undefined);

      await cacheService.connect();

      expect(mockRedisInstance.connect).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      mockRedisInstance.connect.mockRejectedValue(error);

      await expect(cacheService.connect()).rejects.toThrow('Connection failed');
      expect(logger.error).toHaveBeenCalledWith('Failed to connect to Redis:', error);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from Redis successfully', async () => {
      mockRedisInstance.disconnect.mockResolvedValue('OK' as any);

      await cacheService.disconnect();

      expect(mockRedisInstance.disconnect).toHaveBeenCalled();
    });

    it('should handle disconnection errors', async () => {
      const error = new Error('Disconnection failed');
      mockRedisInstance.disconnect.mockRejectedValue(error);

      await cacheService.disconnect();

      expect(logger.error).toHaveBeenCalledWith('Failed to disconnect from Redis:', error);
    });
  });

  describe('isRedisConnected', () => {
    it('should return true when Redis is connected', () => {
      // Mock do método privado isConnected
      (cacheService as any).isConnected = true;
      mockRedisInstance.status = 'ready';

      const result = cacheService.isRedisConnected();

      expect(result).toBe(true);
    });

    it('should return false when Redis is not connected', () => {
      (cacheService as any).isConnected = false;
      mockRedisInstance.status = 'disconnected' as any;

      const result = cacheService.isRedisConnected();

      expect(result).toBe(false);
    });
  });

  describe('set', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
      mockRedisInstance.status = 'ready';
    });

    it('should set a value in cache with default TTL', async () => {
      const key = 'test:key';
      const value = { data: 'test' };
      mockRedisInstance.setex.mockResolvedValue('OK');

      await cacheService.set(key, value);

      expect(mockRedisInstance.setex).toHaveBeenCalledWith(
        key,
        3600, // TTL padrão da configuração
        JSON.stringify(value)
      );
      expect(logger.debug).toHaveBeenCalledWith(`Cache set: ${key} (TTL: 3600s)`);
    });

    it('should set a value in cache with custom TTL', async () => {
      const key = 'test:key';
      const value = { data: 'test' };
      const ttl = 1800;
      mockRedisInstance.setex.mockResolvedValue('OK');

      await cacheService.set(key, value, ttl);

      expect(mockRedisInstance.setex).toHaveBeenCalledWith(
        key,
        ttl,
        JSON.stringify(value)
      );
      expect(logger.debug).toHaveBeenCalledWith(`Cache set: ${key} (TTL: ${ttl}s)`);
    });

    it('should skip cache set when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;
      const key = 'test:key';
      const value = { data: 'test' };

      await cacheService.set(key, value);

      expect(mockRedisInstance.setex).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('Redis not connected, skipping cache set');
    });

    it('should handle set errors gracefully', async () => {
      const key = 'test:key';
      const value = { data: 'test' };
      const error = new Error('Set failed');
      mockRedisInstance.setex.mockRejectedValue(error);

      await cacheService.set(key, value);

      expect(logger.error).toHaveBeenCalledWith(`Failed to set cache for key ${key}:`, error);
    });
  });

  describe('get', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
      mockRedisInstance.status = 'ready';
    });

    it('should get a value from cache', async () => {
      const key = 'test:key';
      const value = { data: 'test' };
      mockRedisInstance.get.mockResolvedValue(JSON.stringify(value));

      const result = await cacheService.get(key);

      expect(mockRedisInstance.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
      expect(logger.debug).toHaveBeenCalledWith(`Cache hit: ${key}`);
    });

    it('should return null when key does not exist', async () => {
      const key = 'test:key';
      mockRedisInstance.get.mockResolvedValue(null);

      const result = await cacheService.get(key);

      expect(result).toBeNull();
    });

    it('should return null when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;
      const key = 'test:key';

      const result = await cacheService.get(key);

      expect(result).toBeNull();
      expect(mockRedisInstance.get).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('Redis not connected, skipping cache get');
    });

    it('should handle get errors gracefully', async () => {
      const key = 'test:key';
      const error = new Error('Get failed');
      mockRedisInstance.get.mockRejectedValue(error);

      const result = await cacheService.get(key);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(`Failed to get cache for key ${key}:`, error);
    });
  });

  describe('del', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
      mockRedisInstance.status = 'ready';
    });

    it('should delete a key from cache', async () => {
      const key = 'test:key';
      mockRedisInstance.del.mockResolvedValue(1);

      await cacheService.del(key);

      expect(mockRedisInstance.del).toHaveBeenCalledWith(key);
      expect(logger.debug).toHaveBeenCalledWith(`Cache deleted: ${key}`);
    });

    it('should skip delete when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;
      const key = 'test:key';

      await cacheService.del(key);

      expect(mockRedisInstance.del).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('Redis not connected, skipping cache delete');
    });
  });

  describe('delMany', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
      mockRedisInstance.status = 'ready';
    });

    it('should delete multiple keys from cache', async () => {
      const keys = ['test:key1', 'test:key2'];
      mockRedisInstance.del.mockResolvedValue(2);

      await cacheService.delMany(keys);

      expect(mockRedisInstance.del).toHaveBeenCalledWith(...keys);
      expect(logger.debug).toHaveBeenCalledWith(`Cache deleted: ${keys.join(', ')}`);
    });

    it('should skip delete when keys array is empty', async () => {
      await cacheService.delMany([]);

      expect(mockRedisInstance.del).not.toHaveBeenCalled();
    });
  });

  describe('delPattern', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
      mockRedisInstance.status = 'ready';
    });

    it('should delete keys matching pattern', async () => {
      const pattern = 'test:*';
      const keys = ['test:key1', 'test:key2'];
      mockRedisInstance.keys.mockResolvedValue(keys);
      mockRedisInstance.del.mockResolvedValue(2);

      await cacheService.delPattern(pattern);

      expect(mockRedisInstance.keys).toHaveBeenCalledWith(pattern);
      expect(mockRedisInstance.del).toHaveBeenCalledWith(...keys);
      expect(logger.debug).toHaveBeenCalledWith(`Cache pattern deleted: ${pattern} (${keys.length} keys)`);
    });

    it('should not delete when no keys match pattern', async () => {
      const pattern = 'test:*';
      mockRedisInstance.keys.mockResolvedValue([]);

      await cacheService.delPattern(pattern);

      expect(mockRedisInstance.keys).toHaveBeenCalledWith(pattern);
      expect(mockRedisInstance.del).not.toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
      mockRedisInstance.status = 'ready';
    });

    it('should return true when key exists', async () => {
      const key = 'test:key';
      mockRedisInstance.exists.mockResolvedValue(1);

      const result = await cacheService.exists(key);

      expect(result).toBe(true);
      expect(mockRedisInstance.exists).toHaveBeenCalledWith(key);
    });

    it('should return false when key does not exist', async () => {
      const key = 'test:key';
      mockRedisInstance.exists.mockResolvedValue(0);

      const result = await cacheService.exists(key);

      expect(result).toBe(false);
    });

    it('should return false when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;
      const key = 'test:key';

      const result = await cacheService.exists(key);

      expect(result).toBe(false);
      expect(mockRedisInstance.exists).not.toHaveBeenCalled();
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
      mockRedisInstance.status = 'ready';
    });

    it('should flush all cache', async () => {
      mockRedisInstance.flushdb.mockResolvedValue('OK');

      await cacheService.flush();

      expect(mockRedisInstance.flushdb).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Cache flushed');
    });

    it('should skip flush when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;

      await cacheService.flush();

      expect(mockRedisInstance.flushdb).not.toHaveBeenCalled();
    });
  });
});