import type { Context } from 'hono';
import type { ErrorHandler } from 'hono';

/**
 * Interface para erros customizados
 */
export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Middleware de tratamento de erros global
 */
export const errorHandler: ErrorHandler = (err: Error | CustomError, c: Context) => {
  console.error('❌ Erro capturado:', {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
    timestamp: new Date().toISOString()
  });

  // Erro customizado com status code
  if ('statusCode' in err && err.statusCode) {

    return c.json({
      success: false,
      message: err.message,
      code: (err as CustomError).code || 'CUSTOM_ERROR',
      details: (err as CustomError).details || null,
      timestamp: new Date().toISOString()
    }, 500);
  }

  // Erros de validação do Zod
  if (err.name === 'ZodError') {
    return c.json({
      success: false,
      message: 'Dados de entrada inválidos',
      code: 'VALIDATION_ERROR',
      details: (err as any).errors,
      timestamp: new Date().toISOString()
    }, 400);
  }

  // Erros do Prisma
  if (err.message.includes('Prisma')) {
    return c.json({
      success: false,
      message: 'Erro interno do banco de dados',
      code: 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    }, 500);
  }

  // Erros de JWT
  if (err.message.includes('jwt') || err.message.includes('token')) {
    return c.json({
      success: false,
      message: 'Token inválido ou expirado',
      code: 'AUTH_ERROR',
      timestamp: new Date().toISOString()
    }, 401);
  }

  // Erro genérico
  return c.json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message,
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  }, 500);
};

/**
 * Função para criar erros customizados
 */
export const createError = (message: string, statusCode: number = 500, code?: string, details?: any): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

/**
 * Wrapper para funções async que podem gerar erros
 */
export const asyncHandler = (fn: Function) => {
  return async (c: Context, next?: Function) => {
    try {
      return await fn(c, next);
    } catch (error) {
      throw error;
    }
  };
};