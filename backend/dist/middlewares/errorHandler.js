"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTooManyRequestsError = exports.createDatabaseError = exports.createConflictError = exports.createNotFoundError = exports.createForbiddenError = exports.createUnauthorizedError = exports.createValidationError = exports.asyncHandler = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("./logger");
class AppError extends Error {
    statusCode;
    code;
    details;
    isOperational;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (error, req, res, next) => {
    logger_1.logger.error('Error occurred:', {
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
    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const errorResponse = {
        success: false,
        error: {
            code,
            message: error.message || 'Erro interno do servidor',
        },
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method,
    };
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error.stack = error.stack;
        if (error.details) {
            errorResponse.error.details = error.details;
        }
    }
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
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const createValidationError = (message, details) => {
    return new AppError(message, 400, 'VALIDATION_ERROR', details);
};
exports.createValidationError = createValidationError;
const createUnauthorizedError = (message = 'Acesso não autorizado') => {
    return new AppError(message, 401, 'UNAUTHORIZED');
};
exports.createUnauthorizedError = createUnauthorizedError;
const createForbiddenError = (message = 'Acesso negado') => {
    return new AppError(message, 403, 'FORBIDDEN');
};
exports.createForbiddenError = createForbiddenError;
const createNotFoundError = (message = 'Recurso não encontrado') => {
    return new AppError(message, 404, 'NOT_FOUND');
};
exports.createNotFoundError = createNotFoundError;
const createConflictError = (message, details) => {
    return new AppError(message, 409, 'CONFLICT', details);
};
exports.createConflictError = createConflictError;
const createDatabaseError = (message, details) => {
    return new AppError(message, 500, 'DATABASE_ERROR', details);
};
exports.createDatabaseError = createDatabaseError;
const createTooManyRequestsError = (message = 'Muitas tentativas') => {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS');
};
exports.createTooManyRequestsError = createTooManyRequestsError;
//# sourceMappingURL=errorHandler.js.map