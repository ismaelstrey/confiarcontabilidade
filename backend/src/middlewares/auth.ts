import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import logger from '../utils/logger';

// Interface para payload do JWT
interface JWTPayload {
  id: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

// Estender interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware de autenticação JWT
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
      return;
    }

    // Verificar token usando AuthService
    const decoded = AuthService.verifyAccessToken(token);
    
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
      return;
    }

    // Buscar usuário no banco de dados
    const user = await AuthService.getUserById(decoded.id);
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    // Adicionar usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error: any) {
    logger.error('Erro na autenticação', { error: error.message });
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar roles específicas
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissão insuficiente'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar se é admin
 */
export const requireAdmin = requireRole(['ADMIN']);

/**
 * Middleware para verificar se é admin ou moderador
 */
export const requireAdminOrModerator = requireRole(['ADMIN', 'MODERATOR']);

/**
 * Alias para compatibilidade com código existente
 */
export const authenticate = authenticateToken;
export const authorize = (...roles: string[]) => {
  return requireRole(roles);
};
export const authorizeOwnerOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user;
  const resourceUserId = req.params.id || req.params.userId;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
    return;
  }

  // Permite se for admin ou se for o próprio usuário
  if (user.role === 'ADMIN' || user.id === resourceUserId) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: 'Acesso negado. Você só pode acessar seus próprios recursos'
  });
};