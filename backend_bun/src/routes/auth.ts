import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  generateTokenPair,
  hashPassword,
  verifyPassword,
  verifyRefreshToken
} from '../lib/auth';
import { authMiddleware } from '../middlewares/auth';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { rateLimiters, createEndpointRateLimit } from '../middlewares/advancedRateLimit';

const auth = new Hono();

// Schemas de validação
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional().default('USER')
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório')
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres')
});

/**
 * POST /auth/register
 * Registrar novo usuário
 */
auth.post('/register',
  rateLimiters.register,
  zValidator('json', registerSchema),
  asyncHandler(async (c: any) => {
    const { name, email, password, role } = c.req.valid('json');

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw createError('Email já está em uso', 409, 'EMAIL_ALREADY_EXISTS');
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // Gerar tokens
    const tokens = await generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return c.json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user,
        ...tokens
      }
    }, 201);
  })
);

/**
 * POST /auth/login
 * Fazer login
 */
auth.post('/login',
  rateLimiters.auth,
  zValidator('json', loginSchema),
  asyncHandler(async (c: any) => {
    const { email, password } = c.req.valid('json');

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw createError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw createError('Conta inativa', 401, 'ACCOUNT_INACTIVE');
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      throw createError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    // Gerar tokens
    const tokens = await generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userWithoutPassword,
        ...tokens
      }
    });
  })
);

/**
 * POST /auth/refresh-token
 * Renovar token de acesso
 */
auth.post('/refresh-token',
  zValidator('json', refreshTokenSchema),
  asyncHandler(async (c: any) => {
    const { refreshToken } = c.req.valid('json');

    // Verificar refresh token
    const payload = await verifyRefreshToken(refreshToken);

    // Verificar se usuário ainda existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      throw createError('Usuário não encontrado ou inativo', 401, 'USER_NOT_FOUND');
    }

    // Gerar novos tokens
    const tokens = await generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return c.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: tokens
    });
  })
);

/**
 * GET /auth/me
 * Obter perfil do usuário autenticado
 */
auth.get('/me',
  authMiddleware,
  asyncHandler(async (c: any) => {
    const user = c.get('user');

    // Buscar dados completos do usuário
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            bio: true,
            phone: true,
            address: true
          }
        }
      }
    });

    if (!fullUser) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    return c.json({
      success: true,
      data: fullUser
    });
  })
);

/**
 * POST /auth/change-password
 * Alterar senha do usuário autenticado
 */
auth.post('/change-password',
  authMiddleware,
  zValidator('json', changePasswordSchema),
  asyncHandler(async (c: any) => {
    const user = c.get('user');
    const { currentPassword, newPassword } = c.req.valid('json');

    // Buscar usuário com senha
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!fullUser) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Verificar senha atual
    const isValidPassword = await verifyPassword(currentPassword, fullUser.password);

    if (!isValidPassword) {
      throw createError('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
    }

    // Hash da nova senha
    const hashedNewPassword = await hashPassword(newPassword);

    // Atualizar senha
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    return c.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  })
);

/**
 * POST /auth/logout
 * Logout (invalidar token)
 */
auth.post('/logout',
  authMiddleware,
  asyncHandler(async (c: any) => {
    // Em uma implementação real, você poderia adicionar o token a uma blacklist
    // Por enquanto, apenas retornamos sucesso
    return c.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  })
);

export default auth;