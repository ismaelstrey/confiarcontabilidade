import { Context, Next } from 'hono';
import { jwt, verify } from 'hono/jwt';
import { createError } from './errorHandler';
import { prisma } from '../lib/prisma';

/**
 * Interface para o payload do JWT
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Interface para o contexto com usuário autenticado
 */
export interface AuthContext extends Context {
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

/**
 * Middleware de autenticação JWT
 */
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Token de acesso requerido', 401, 'MISSING_TOKEN');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    if (!token) {
      throw createError('Token de acesso requerido', 401, 'MISSING_TOKEN');
    }

    // Verificar o token JWT
    const payload = await verify(token, process.env.JWT_SECRET!) as unknown as JWTPayload;

    if (!payload || !payload.userId) {
      throw createError('Token inválido', 401, 'INVALID_TOKEN');
    }

    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      throw createError('Usuário não encontrado', 401, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw createError('Usuário inativo', 401, 'USER_INACTIVE');
    }

    // Adicionar usuário ao contexto
    c.set('user', user);

    await next();
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError('Token inválido ou expirado', 401, 'AUTH_ERROR');
  }
};

/**
 * Middleware de autorização por role
 */
export const authorize = (...roles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    if (!roles.includes(user.role)) {
      throw createError('Acesso negado', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    await next();
  };
};

/**
 * Middleware para verificar se o usuário é o proprietário do recurso ou admin
 */
export const authorizeOwnerOrAdmin = async (c: Context, next: Next) => {
  const user = c.get('user');
  const resourceUserId = c.req.param('id') || c.req.param('userId');

  if (!user) {
    throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
  }

  // Admin pode acessar qualquer recurso
  if (user.role === 'ADMIN') {
    await next();
    return;
  }

  // Usuário só pode acessar seus próprios recursos
  if (user.id !== resourceUserId) {
    throw createError('Acesso negado', 403, 'INSUFFICIENT_PERMISSIONS');
  }

  await next();
};

/**
 * Middleware opcional de autenticação (não falha se não houver token)
 */
export const optionalAuth = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        const payload = await verify(token, process.env.JWT_SECRET!) as unknown as JWTPayload;

        if (payload && payload.userId) {
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isActive: true
            }
          });

          if (user && user.isActive) {
            c.set('user', user);
          }
        }
      }
    }
  } catch (error) {
    // Ignorar erros em autenticação opcional
    console.warn('Erro na autenticação opcional:', error);
  }

  await next();
};

/**
 * Função helper para obter o usuário do contexto
 */
export const getUser = (c: Context) => {
  return c.get('user');
};

/**
 * Função helper para verificar se o usuário tem uma role específica
 */
export const hasRole = (c: Context, role: string): boolean => {
  const user = c.get('user');
  return user && user.role === role;
};

/**
 * Função helper para verificar se o usuário tem uma das roles especificadas
 */
export const hasAnyRole = (c: Context, roles: string[]): boolean => {
  const user = c.get('user');
  return user && roles.includes(user.role);
};