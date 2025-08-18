"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.generateTokens = exports.authorizeOwnerOrAdmin = exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const errorHandler_1 = require("./errorHandler");
const logger_1 = require("./logger");
const prisma = new client_1.PrismaClient();
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, logger_1.logAuth)('Authentication failed - No token provided', undefined, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.originalUrl,
            });
            throw (0, errorHandler_1.createUnauthorizedError)('Token de acesso não fornecido');
        }
        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            logger_1.logger.error('JWT_SECRET not configured');
            throw new Error('Configuração de autenticação inválida');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            },
        });
        if (!user) {
            (0, logger_1.logAuth)('Authentication failed - User not found', decoded.userId, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.originalUrl,
            });
            throw (0, errorHandler_1.createUnauthorizedError)('Usuário não encontrado');
        }
        if (!user.isActive) {
            (0, logger_1.logAuth)('Authentication failed - User inactive', user.id, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.originalUrl,
            });
            throw (0, errorHandler_1.createUnauthorizedError)('Conta desativada');
        }
        req.user = user;
        (0, logger_1.logAuth)('Authentication successful', user.id, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl,
            role: user.role,
        });
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            (0, logger_1.logAuth)('Authentication failed - Invalid token', undefined, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.originalUrl,
                error: error.message,
            });
            next((0, errorHandler_1.createUnauthorizedError)('Token inválido'));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            (0, logger_1.logAuth)('Authentication failed - Token expired', undefined, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.originalUrl,
            });
            next((0, errorHandler_1.createUnauthorizedError)('Token expirado'));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next((0, errorHandler_1.createUnauthorizedError)('Usuário não autenticado'));
        }
        if (!roles.includes(req.user.role)) {
            (0, logger_1.logAuth)('Authorization failed - Insufficient permissions', req.user.id, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.originalUrl,
                userRole: req.user.role,
                requiredRoles: roles,
            });
            return next((0, errorHandler_1.createForbiddenError)('Permissões insuficientes'));
        }
        (0, logger_1.logAuth)('Authorization successful', req.user.id, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl,
            userRole: req.user.role,
            requiredRoles: roles,
        });
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            },
        });
        if (user && user.isActive) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const authorizeOwnerOrAdmin = (userIdParam = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return next((0, errorHandler_1.createUnauthorizedError)('Usuário não autenticado'));
        }
        const targetUserId = req.params[userIdParam];
        const isOwner = req.user.id === targetUserId;
        const isAdmin = req.user.role === 'ADMIN';
        if (!isOwner && !isAdmin) {
            (0, logger_1.logAuth)('Authorization failed - Not owner or admin', req.user.id, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.originalUrl,
                targetUserId,
                userRole: req.user.role,
            });
            return next((0, errorHandler_1.createForbiddenError)('Acesso negado'));
        }
        (0, logger_1.logAuth)('Authorization successful - Owner or admin', req.user.id, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl,
            targetUserId,
            userRole: req.user.role,
            isOwner,
            isAdmin,
        });
        next();
    };
};
exports.authorizeOwnerOrAdmin = authorizeOwnerOrAdmin;
const generateTokens = (user) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    if (!jwtSecret || !jwtRefreshSecret) {
        throw new Error('JWT secrets not configured');
    }
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
    const refreshToken = jsonwebtoken_1.default.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const verifyRefreshToken = (token) => {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
        throw new Error('JWT refresh secret not configured');
    }
    return jsonwebtoken_1.default.verify(token, jwtRefreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
exports.default = { authenticate: exports.authenticate, authorize: exports.authorize, optionalAuth: exports.optionalAuth, authorizeOwnerOrAdmin: exports.authorizeOwnerOrAdmin };
//# sourceMappingURL=auth.js.map