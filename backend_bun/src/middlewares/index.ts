/**
 * Exportações centralizadas de todos os middlewares
 * Facilita a importação e uso dos middlewares em outras partes da aplicação
 */

// Middleware de autenticação
export {
  authMiddleware,
  authorize,
  authorizeOwnerOrAdmin,
  optionalAuth,
  getUser,
  hasRole,
  hasAnyRole
} from './auth';
export type { JWTPayload, AuthContext } from './auth';

// Middleware de tratamento de erros
export {
  errorHandler,
  createError,
  asyncHandler
} from './errorHandler';

// Middleware de validação
export {
  validate,
  commonSchemas,
  getValidatedData,
  validateFileUpload
} from './validation';

// Middleware de rate limiting
export {
  rateLimit,
  rateLimitConfigs,
  resetUserRateLimit,
  resetIpRateLimit
} from './rateLimit';

// Middleware de CORS
export {
  cors,
  developmentCors,
  productionCors,
  addCorsHeaders
} from './cors';

// Middleware de logging
export {
  logger,
  requestLogger,
  developmentLogger,
  productionLogger
} from './logger';

// Tipos e interfaces
export type { CorsOptions } from './cors';
export type { LogEntry, LoggerOptions } from './logger';
export type { ValidationSchema } from './validation';

// Tipos internos (não exportados diretamente dos arquivos)
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}