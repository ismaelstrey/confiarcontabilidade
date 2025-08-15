import type { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Interface para dados da requisição
interface RequestLogData {
  method: string;
  url: string;
  ip: string;
  userAgent?: string | undefined;
  userId?: string;
  statusCode?: number;
  responseTime?: number;
  contentLength?: number | undefined;
  referer?: string | undefined;
}

// Middleware para logging de requisições
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Capturar dados da requisição
  const requestData: RequestLogData = {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
  };

  // Capturar userId se disponível (após autenticação)
  if ((req as any).user?.id) {
    requestData.userId = (req as any).user.id;
  }

  // Override do método res.end para capturar dados da resposta
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: BufferEncoding | (() => void), callback?: () => void) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Dados da resposta
    requestData.statusCode = res.statusCode;
    requestData.responseTime = responseTime;
    const contentLengthHeader = res.get('Content-Length');
    requestData.contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : undefined;

    // Determinar nível do log baseado no status code
    let logLevel: 'info' | 'warn' | 'error' = 'info';
    if (res.statusCode >= 400 && res.statusCode < 500) {
      logLevel = 'warn';
    } else if (res.statusCode >= 500) {
      logLevel = 'error';
    }

    // Criar mensagem de log
    const message = `${requestData.method} ${requestData.url} ${requestData.statusCode} - ${responseTime}ms`;
    
    // Log da requisição
    logger.log(logLevel, message, {
      type: 'request',
      ...requestData,
      timestamp: new Date().toISOString(),
    });

    // Log adicional para requisições lentas (> 1 segundo)
    if (responseTime > 1000) {
      logger.warn('Slow Request Detected', {
        type: 'performance',
        ...requestData,
        threshold: '1000ms',
        timestamp: new Date().toISOString(),
      });
    }

    // Log adicional para erros 5xx
    if (res.statusCode >= 500) {
      logger.error('Server Error Response', {
        type: 'server_error',
        ...requestData,
        timestamp: new Date().toISOString(),
      });
    }

    // Chamar o método original
    return (originalEnd as any).call(this, chunk, encoding, callback);
  };

  // Log inicial da requisição (apenas em modo debug)
  if (process.env.DEBUG === 'true') {
    logger.debug('Incoming Request', {
      type: 'request_start',
      method: requestData.method,
      url: requestData.url,
      ip: requestData.ip,
      userAgent: requestData.userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Middleware para logging de body da requisição (apenas em desenvolvimento)
export const requestBodyLogger = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true') {
    // Não logar senhas e dados sensíveis
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const body = { ...req.body };
    
    // Remover campos sensíveis
    Object.keys(body).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        body[key] = '[REDACTED]';
      }
    });

    if (Object.keys(body).length > 0) {
      logger.debug('Request Body', {
        type: 'request_body',
        method: req.method,
        url: req.originalUrl || req.url,
        body,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  next();
};

// Middleware para logging de headers específicos
export const requestHeaderLogger = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true') {
    const importantHeaders = {
      'content-type': req.get('Content-Type'),
      'accept': req.get('Accept'),
      'authorization': req.get('Authorization') ? '[PRESENT]' : '[NOT_PRESENT]',
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'x-real-ip': req.get('X-Real-IP'),
    };

    // Filtrar headers undefined
    const filteredHeaders = Object.fromEntries(
      Object.entries(importantHeaders).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(filteredHeaders).length > 0) {
      logger.debug('Request Headers', {
        type: 'request_headers',
        method: req.method,
        url: req.originalUrl || req.url,
        headers: filteredHeaders,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  next();
};

export default requestLogger;