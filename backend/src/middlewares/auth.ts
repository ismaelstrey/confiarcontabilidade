import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createUnauthorizedError, createForbiddenError } from './errorHandler';
import { logger, logAuth } from './logger';

const prisma = new PrismaClient();

// Interface para o payload do JWT
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Estender o tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
      };
    }
  }
}

// Middleware de autenticação
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logAuth('Authentication failed - No token provided', undefined, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
      });
      throw createUnauthorizedError('Token de acesso não fornecido');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verificar e decodificar o token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      throw new Error('Configuração de autenticação inválida');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Buscar usuário no banco de dados
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
      logAuth('Authentication failed - User not found', decoded.userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
      });
      throw createUnauthorizedError('Usuário não encontrado');
    }

    if (!user.isActive) {
      logAuth('Authentication failed - User inactive', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
      });
      throw createUnauthorizedError('Conta desativada');
    }

    // Adicionar usuário ao request
    req.user = user;

    // Log de autenticação bem-sucedida
    logAuth('Authentication successful', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      role: user.role,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logAuth('Authentication failed - Invalid token', undefined, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        error: error.message,
      });
      next(createUnauthorizedError('Token inválido'));
    } else if (error instanceof jwt.TokenExpiredError) {
      logAuth('Authentication failed - Token expired', undefined, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
      });
      next(createUnauthorizedError('Token expirado'));
    } else {
      next(error);
    }
  }
};

// Middleware de autorização por role
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createUnauthorizedError('Usuário não autenticado'));
    }

    if (!roles.includes(req.user.role)) {
      logAuth('Authorization failed - Insufficient permissions', req.user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        userRole: req.user.role,
        requiredRoles: roles,
      });
      return next(createForbiddenError('Permissões insuficientes'));
    }

    logAuth('Authorization successful', req.user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      userRole: req.user.role,
      requiredRoles: roles,
    });

    next();
  };
};

// Middleware de autenticação opcional (não falha se não houver token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continua sem usuário
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
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
  } catch (error) {
    // Em caso de erro, continua sem usuário
    next();
  }
};

// Middleware para verificar se o usuário é o próprio ou admin
export const authorizeOwnerOrAdmin = (userIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createUnauthorizedError('Usuário não autenticado'));
    }

    const targetUserId = req.params[userIdParam];
    const isOwner = req.user.id === targetUserId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      logAuth('Authorization failed - Not owner or admin', req.user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        targetUserId,
        userRole: req.user.role,
      });
      return next(createForbiddenError('Acesso negado'));
    }

    logAuth('Authorization successful - Owner or admin', req.user.id, {
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

// Função utilitária para gerar tokens
export const generateTokens = (user: { id: string; email: string; role: string }) => {
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

  const accessToken = (jwt.sign as any)(payload, jwtSecret!, { expiresIn: jwtExpiresIn });
  const refreshToken = (jwt.sign as any)(payload, jwtRefreshSecret!, { expiresIn: jwtRefreshExpiresIn });

  return { accessToken, refreshToken };
};

// Função para verificar refresh token
export const verifyRefreshToken = (token: string) => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret) {
    throw new Error('JWT refresh secret not configured');
  }

  return jwt.verify(token, jwtRefreshSecret) as JwtPayload;
};

export default { authenticate, authorize, optionalAuth, authorizeOwnerOrAdmin };