/**
 * Classe base para erros da aplicação
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 400, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de validação
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

/**
 * Erro de autenticação
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Não autenticado') {
    super(message, 401, true);
  }
}

/**
 * Erro de autorização
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Não autorizado') {
    super(message, 403, true);
  }
}

/**
 * Erro de recurso não encontrado
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404, true);
  }
}

/**
 * Erro de conflito
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflito de recursos') {
    super(message, 409, true);
  }
}

/**
 * Erro de serviço indisponível
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Serviço temporariamente indisponível') {
    super(message, 503, true);
  }
}

/**
 * Função para verificar se um erro é operacional
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Função para extrair informações do erro
 */
export const getErrorInfo = (error: Error) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      stack: error.stack
    };
  }
  
  return {
    message: error.message,
    statusCode: 500,
    isOperational: false,
    stack: error.stack
  };
};