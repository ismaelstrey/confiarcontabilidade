import type { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Interface para erros customizados
export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// Classe para erros da aplicação
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de tratamento de erros
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log do erro
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    code: error.code,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    details: error.details,
  });

  // Definir status code padrão
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';

  // Resposta base do erro
  const errorResponse: any = {
    success: false,
    error: {
      code,
      message: error.message || 'Erro interno do servidor',
    },
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  };

  // Adicionar detalhes em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
    if (error.details) {
      errorResponse.error.details = error.details;
    }
  }

  // Tratamento específico para diferentes tipos de erro
  switch (code) {
    case 'VALIDATION_ERROR':
      errorResponse.error.message = 'Dados de entrada inválidos';
      break;
    case 'UNAUTHORIZED':
      errorResponse.error.message = 'Acesso não autorizado';
      break;
    case 'FORBIDDEN':
      errorResponse.error.message = 'Acesso negado';
      break;
    case 'NOT_FOUND':
      errorResponse.error.message = 'Recurso não encontrado';
      break;
    case 'CONFLICT':
      errorResponse.error.message = 'Conflito de dados';
      break;
    case 'TOO_MANY_REQUESTS':
      errorResponse.error.message = 'Muitas tentativas. Tente novamente mais tarde';
      break;
    case 'DATABASE_ERROR':
      errorResponse.error.message = 'Erro no banco de dados';
      if (process.env.NODE_ENV !== 'production') {
        errorResponse.error.details = error.details;
      }
      break;
    default:
      if (statusCode >= 500) {
        errorResponse.error.message = 'Erro interno do servidor';
      }
  }

  // Enviar resposta de erro
  res.status(statusCode).json(errorResponse);
};

// Middleware para capturar erros assíncronos
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Funções utilitárias para criar erros específicos
export const createValidationError = (message: string, details?: any) => {
  return new AppError(message, 400, 'VALIDATION_ERROR', details);
};

export const createUnauthorizedError = (message: string = 'Acesso não autorizado') => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

export const createForbiddenError = (message: string = 'Acesso negado') => {
  return new AppError(message, 403, 'FORBIDDEN');
};

export const createNotFoundError = (message: string = 'Recurso não encontrado') => {
  return new AppError(message, 404, 'NOT_FOUND');
};

export const createConflictError = (message: string, details?: any) => {
  return new AppError(message, 409, 'CONFLICT', details);
};

export const createDatabaseError = (message: string, details?: any) => {
  return new AppError(message, 500, 'DATABASE_ERROR', details);
};

export const createTooManyRequestsError = (message: string = 'Muitas tentativas') => {
  return new AppError(message, 429, 'TOO_MANY_REQUESTS');
};