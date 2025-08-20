import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';
import { authMiddleware, authorize, authorizeOwnerOrAdmin } from '../middlewares/auth';
import { createError, asyncHandler } from '../middlewares/errorHandler';

const users = new Hono();

// Schemas de validação
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  avatar: z.string().url('URL do avatar inválida').optional(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).default('USER')
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
  isActive: z.boolean().optional()
});

const querySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)).optional(),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
  isActive: z.string().transform(val => val === 'true').optional()
});

/**
 * GET /users/profile
 * Obter perfil do usuário autenticado
 */
users.get('/profile',
  authMiddleware,
  asyncHandler(async (c) => {
    const user = c.get('user');

    const profile = await prisma.user.findUnique({
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

    if (!profile) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    return c.json({
      success: true,
      data: profile
    });
  })
);

/**
 * PUT /users/profile
 * Atualizar perfil do usuário autenticado
 */
users.put('/profile',
  authMiddleware,
  zValidator('json', updateProfileSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { name, avatar, bio, phone, address } = c.req.valid('json');

    // Atualizar dados do usuário
    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    // Atualizar perfil
    const profileData: any = {};
    if (bio !== undefined) profileData.bio = bio;
    if (phone !== undefined) profileData.phone = phone;
    if (address !== undefined) profileData.address = address;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...updateData,
        profile: Object.keys(profileData).length > 0 ? {
          upsert: {
            create: profileData,
            update: profileData
          }
        } : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
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

    return c.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedUser
    });
  })
);

/**
 * DELETE /users/delete-account
 * Deletar conta do usuário autenticado
 */
users.delete('/delete-account',
  authMiddleware,
  asyncHandler(async (c) => {
    const user = c.get('user');

    // Não permitir que admin delete sua própria conta se for o único admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN', isActive: true }
      });

      if (adminCount <= 1) {
        throw createError('Não é possível deletar a única conta de administrador', 400, 'LAST_ADMIN');
      }
    }

    await prisma.user.delete({
      where: { id: user.id }
    });

    return c.json({
      success: true,
      message: 'Conta deletada com sucesso'
    });
  })
);

/**
 * GET /users
 * Listar usuários (apenas admins)
 */
users.get('/',
  authMiddleware,
  authorize('ADMIN'),
  zValidator('query', querySchema),
  asyncHandler(async (c) => {
    const { page = 1, limit = 10, search, role, isActive } = c.req.valid('query');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    // Buscar usuários
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return c.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

/**
 * POST /users
 * Criar novo usuário (apenas admins)
 */
users.post('/',
  authMiddleware,
  authorize('ADMIN'),
  zValidator('json', createUserSchema),
  asyncHandler(async (c) => {
    const { name, email, password, role } = c.req.valid('json');

    // Verificar se email já existe
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

    return c.json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: user
    }, 201);
  })
);

/**
 * GET /users/:id
 * Obter usuário por ID
 */
users.get('/:id',
  authMiddleware,
  authorizeOwnerOrAdmin,
  asyncHandler(async (c) => {
    const id = c.req.param('id');

    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    return c.json({
      success: true,
      data: user
    });
  })
);

/**
 * PUT /users/:id
 * Atualizar usuário (apenas admins)
 */
users.put('/:id',
  authMiddleware,
  authorize('ADMIN'),
  zValidator('json', updateUserSchema),
  asyncHandler(async (c) => {
    const id = c.req.param('id');
    const updateData = c.req.valid('json');

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Se alterando email, verificar se não existe outro usuário com o mesmo
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email }
      });

      if (emailExists) {
        throw createError('Email já está em uso', 409, 'EMAIL_ALREADY_EXISTS');
      }
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        updatedAt: true
      }
    });

    return c.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: updatedUser
    });
  })
);

/**
 * DELETE /users/:id
 * Deletar usuário (apenas admins)
 */
users.delete('/:id',
  authMiddleware,
  authorize('ADMIN'),
  asyncHandler(async (c) => {
    const id = c.req.param('id');
    const currentUser = c.get('user');

    // Não permitir que admin delete a si mesmo
    if (id === currentUser.id) {
      throw createError('Não é possível deletar sua própria conta', 400, 'CANNOT_DELETE_SELF');
    }

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Não permitir deletar o último admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN', isActive: true }
      });

      if (adminCount <= 1) {
        throw createError('Não é possível deletar o último administrador', 400, 'LAST_ADMIN');
      }
    }

    await prisma.user.delete({
      where: { id }
    });

    return c.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  })
);

export default users;