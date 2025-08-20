import { Request, Response, NextFunction } from 'express';
import {
  cacheMiddleware,
  userCacheMiddleware,
  publicCacheMiddleware,
  articleCacheMiddleware,
  invalidateCacheMiddleware,
  invalidateUserCacheMiddleware,
  invalidatePublicCacheMiddleware,
  invalidateArticleCacheMiddleware
} from '../cache';
import { cacheService } from '../../services/cacheService';
import logger from '../../utils/logger';

// Mock do cacheService
jest.mock('../../services/cacheService', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    delPattern: jest.fn(),
  },
}));

// Mock do logger
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const mockCacheService = cacheService as jest.Mocked<typeof cacheService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Cache Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: jest.SpyInstance;
  let onSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      method: 'GET',
      originalUrl: '/api/v1/test',
      query: {},
      params: {},
      user: { id: '123', email: 'test@example.com', role: 'USER' }
    } as any;

    jsonSpy = jest.fn();
    onSpy = jest.fn();

    mockRes = {
      json: jsonSpy,
      on: onSpy,
      statusCode: 200
    } as any;

    mockNext = jest.fn();
  });

  describe('cacheMiddleware', () => {
    it('should return cached data when available', async () => {
      const cachedData = { message: 'cached response' };
      mockCacheService.get.mockResolvedValue(cachedData);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCacheService.get).toHaveBeenCalled();
      expect(jsonSpy).toHaveBeenCalledWith(cachedData);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Cache hit'));
    });

    it('should proceed to next middleware when cache miss', async () => {
      mockCacheService.get.mockResolvedValue(null);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCacheService.get).toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should skip cache for non-GET requests', async () => {
      mockReq.method = 'POST';

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCacheService.get).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should skip cache when skipCache condition is true', async () => {
      const middleware = cacheMiddleware({
        skipCache: () => true
      });
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCacheService.get).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use custom key generator', async () => {
      const customKey = 'custom:key';
      mockCacheService.get.mockResolvedValue(null);

      const middleware = cacheMiddleware({
        keyGenerator: () => customKey
      });
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCacheService.get).toHaveBeenCalledWith(customKey);
    });

    it('should handle cache errors gracefully', async () => {
      const error = new Error('Cache error');
      mockCacheService.get.mockRejectedValue(error);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith('Cache middleware error:', error);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should cache response data on finish event', async () => {
      mockCacheService.get.mockResolvedValue(null);
      const responseData = { message: 'response data' };

      // Mock do comportamento do res.json
      jsonSpy.mockImplementation(function(data) {
        return data;
      });

      // Mock do comportamento do res.on
      onSpy.mockImplementation((event, callback) => {
        if (event === 'finish') {
          // Simula o evento finish sendo chamado
          setTimeout(() => callback(), 0);
        }
      });

      const middleware = cacheMiddleware({ ttl: 600 });
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(onSpy).toHaveBeenCalledWith('finish', expect.any(Function));
    });
  });

  describe('userCacheMiddleware', () => {
    it('should generate user-specific cache key', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockReq.user = { id: '456', email: 'test@example.com', role: 'user' };

      const middleware = userCacheMiddleware(300);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCacheService.get).toHaveBeenCalledWith(
        expect.stringContaining('user:456:')
      );
    });

    it('should handle anonymous users', async () => {
      mockCacheService.get.mockResolvedValue(null);
      delete mockReq.user;

      const middleware = userCacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCacheService.get).toHaveBeenCalledWith(
        expect.stringContaining('user:anonymous:')
      );
    });
  });

  describe('publicCacheMiddleware', () => {
    it('should generate public cache key', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockReq.query = { page: '1', limit: '10' };

      const middleware = publicCacheMiddleware(1800);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCacheService.get).toHaveBeenCalledWith(
        expect.stringContaining('public:')
      );
    });
  });

  describe('articleCacheMiddleware', () => {
    it('should generate article cache key with slug', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockReq.params = { slug: 'test-article' };

      const middleware = articleCacheMiddleware(3600);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCacheService.get).toHaveBeenCalledWith(
        expect.stringContaining('article:test-article:')
      );
    });

    it('should generate article cache key with id', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockReq.params = { id: '123' };

      const middleware = articleCacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockCacheService.get).toHaveBeenCalledWith(
        expect.stringContaining('article:123:')
      );
    });
  });

  describe('invalidateCacheMiddleware', () => {
    it('should invalidate cache patterns on successful response', async () => {
      const patterns = ['user:*', 'public:*'];
      mockRes.statusCode = 200;
      mockCacheService.delPattern.mockResolvedValue(undefined);

      const middleware = invalidateCacheMiddleware(patterns);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(onSpy).toHaveBeenCalledWith('finish', expect.any(Function));

      // Simula o evento 'finish'
      const finishCallback = onSpy.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(mockCacheService.delPattern).toHaveBeenCalledTimes(patterns.length);
      patterns.forEach(pattern => {
        expect(mockCacheService.delPattern).toHaveBeenCalledWith(pattern);
      });
    });

    it('should not invalidate cache on error response', async () => {
      const patterns = ['user:*', 'public:*'];
      mockRes.statusCode = 500;
      mockCacheService.delPattern.mockResolvedValue(undefined);

      const middleware = invalidateCacheMiddleware(patterns);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simula o evento 'finish'
      const finishCallback = onSpy.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(mockCacheService.delPattern).not.toHaveBeenCalled();
    });
  });

  describe('invalidateUserCacheMiddleware', () => {
    it('should invalidate user cache with default pattern', async () => {
      mockRes.statusCode = 200;
      mockCacheService.delPattern.mockResolvedValue(undefined);

      const middleware = invalidateUserCacheMiddleware();
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simula o evento 'finish'
      const finishCallback = onSpy.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(mockNext).toHaveBeenCalled();
      expect(mockCacheService.delPattern).toHaveBeenCalledWith('user:*');
    });

    it('should invalidate user cache with custom getUserId', async () => {
      mockRes.statusCode = 200;
      const getUserId = (req: Request) => '789';
      mockCacheService.delPattern.mockResolvedValue(undefined);

      const middleware = invalidateUserCacheMiddleware(getUserId);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simula o evento 'finish'
      const finishCallback = onSpy.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(mockNext).toHaveBeenCalled();
      expect(mockCacheService.delPattern).toHaveBeenCalledWith('user:789:*');
    });
  });

  describe('invalidatePublicCacheMiddleware', () => {
    it('should invalidate public cache', async () => {
      mockRes.statusCode = 200;
      mockCacheService.delPattern.mockResolvedValue(undefined);

      const middleware = invalidatePublicCacheMiddleware();
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simula o evento 'finish'
      const finishCallback = onSpy.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(mockNext).toHaveBeenCalled();
      expect(mockCacheService.delPattern).toHaveBeenCalledWith('public:*');
    });
  });

  describe('invalidateArticleCacheMiddleware', () => {
    it('should invalidate article cache', async () => {
      mockRes.statusCode = 200;
      mockCacheService.delPattern.mockResolvedValue(undefined);

      const middleware = invalidateArticleCacheMiddleware();
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simula o evento 'finish'
      const finishCallback = onSpy.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(mockNext).toHaveBeenCalled();
      expect(mockCacheService.delPattern).toHaveBeenCalledWith('article:*');
    });
  });
});