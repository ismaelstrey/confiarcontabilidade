import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, authorize } from '../middlewares/auth';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { rateLimiters } from '../middlewares/advancedRateLimit';

const newsletter = new Hono();

// Schemas de validação
const subscribeSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional()
});

const unsubscribeSchema = z.object({
  email: z.string().email('Email inválido')
});

const querySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)).optional(),
  search: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'email', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

const updateSubscriberSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  isActive: z.boolean().optional()
});

/**
 * POST /newsletter/subscribe
 * Inscrever-se na newsletter
 */
newsletter.post('/subscribe',
  rateLimiters.contact,
  zValidator('json', subscribeSchema),
  asyncHandler(async (c: any) => {
    const { email, name } = c.req.valid('json');

    // Verificar se email já está inscrito
    const existingSubscriber = await prisma.newsletter.findUnique({
      where: { email }
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return c.json({
          success: true,
          message: 'Este email já está inscrito na newsletter'
        });
      } else {
        // Reativar inscrição
        const updatedSubscriber = await prisma.newsletter.update({
          where: { email },
          data: {
            isActive: true,
            name: name || existingSubscriber.name,
            updatedAt: new Date()
          },
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            createdAt: true
          }
        });

        return c.json({
          success: true,
          message: 'Inscrição reativada com sucesso!',
          data: updatedSubscriber
        });
      }
    }

    // Criar nova inscrição
    const subscriber = await prisma.newsletter.create({
      data: {
        email,
        name,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true
      }
    });

    return c.json({
      success: true,
      message: 'Inscrição realizada com sucesso! Obrigado por se inscrever.',
      data: subscriber
    }, 201);
  })
);

/**
 * POST /newsletter/unsubscribe
 * Cancelar inscrição na newsletter
 */
newsletter.post('/unsubscribe',
  zValidator('json', unsubscribeSchema),
  asyncHandler(async (c: any) => {
    const { email } = c.req.valid('json');

    const subscriber = await prisma.newsletter.findUnique({
      where: { email }
    });

    if (!subscriber) {
      throw createError('Email não encontrado na lista de inscritos', 404, 'SUBSCRIBER_NOT_FOUND');
    }

    if (!subscriber.isActive) {
      return c.json({
        success: true,
        message: 'Este email já estava cancelado'
      });
    }

    // Desativar inscrição
    await prisma.newsletter.update({
      where: { email },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return c.json({
      success: true,
      message: 'Inscrição cancelada com sucesso. Sentiremos sua falta!'
    });
  })
);

/**
 * GET /newsletter/subscribers
 * Listar inscritos da newsletter (apenas admins/moderadores)
 */
newsletter.get('/subscribers',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  zValidator('query', querySchema),
  asyncHandler(async (c: any) => {
    const { page = 1, limit = 10, search, isActive, sortBy, sortOrder } = c.req.valid('query');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined) where.isActive = isActive;

    // Buscar inscritos
    const [subscribers, total] = await Promise.all([
      prisma.newsletter.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.newsletter.count({ where })
    ]);

    return c.json({
      success: true,
      data: {
        subscribers,
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
 * GET /newsletter/subscribers/:id
 * Obter inscrito por ID (apenas admins/moderadores)
 */
newsletter.get('/subscribers/:id',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  asyncHandler(async (c: any) => {
    const id = c.req.param('id');

    const subscriber = await prisma.newsletter.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!subscriber) {
      throw createError('Inscrito não encontrado', 404, 'SUBSCRIBER_NOT_FOUND');
    }

    return c.json({
      success: true,
      data: subscriber
    });
  })
);

/**
 * PUT /newsletter/subscribers/:id
 * Atualizar inscrito (apenas admins/moderadores)
 */
newsletter.put('/subscribers/:id',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  zValidator('json', updateSubscriberSchema),
  asyncHandler(async (c: any) => {
    const id = c.req.param('id');
    const updateData = c.req.valid('json');

    // Verificar se inscrito existe
    const existingSubscriber = await prisma.newsletter.findUnique({
      where: { id }
    });

    if (!existingSubscriber) {
      throw createError('Inscrito não encontrado', 404, 'SUBSCRIBER_NOT_FOUND');
    }

    const updatedSubscriber = await prisma.newsletter.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        updatedAt: true
      }
    });

    return c.json({
      success: true,
      message: 'Inscrito atualizado com sucesso',
      data: updatedSubscriber
    });
  })
);

/**
 * DELETE /newsletter/subscribers/:id
 * Deletar inscrito permanentemente (apenas admins)
 */
newsletter.delete('/subscribers/:id',
  authMiddleware,
  authorize('ADMIN'),
  asyncHandler(async (c: any) => {
    const id = c.req.param('id');

    const subscriber = await prisma.newsletter.findUnique({
      where: { id }
    });

    if (!subscriber) {
      throw createError('Inscrito não encontrado', 404, 'SUBSCRIBER_NOT_FOUND');
    }

    await prisma.newsletter.delete({
      where: { id }
    });

    return c.json({
      success: true,
      message: 'Inscrito removido permanentemente'
    });
  })
);

/**
 * GET /newsletter/stats
 * Obter estatísticas da newsletter (apenas admins/moderadores)
 */
newsletter.get('/stats',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  asyncHandler(async (c: any) => {
    const [totalSubscribers, activeSubscribers, inactiveSubscribers, recentSubscribers] = await Promise.all([
      // Total de inscritos
      prisma.newsletter.count(),
      // Inscritos ativos
      prisma.newsletter.count({
        where: { isActive: true }
      }),
      // Inscritos inativos
      prisma.newsletter.count({
        where: { isActive: false }
      }),
      // Inscritos recentes (últimos 30 dias)
      prisma.newsletter.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Estatísticas por mês (últimos 12 meses)
    const monthlyStats = await prisma.newsletter.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Agrupar por mês
    const monthlyData = monthlyStats.reduce((acc, stat) => {
      const month = stat.createdAt.toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    return c.json({
      success: true,
      data: {
        total: totalSubscribers,
        active: activeSubscribers,
        inactive: inactiveSubscribers,
        recent: recentSubscribers,
        growthRate: totalSubscribers > 0 ? (recentSubscribers / totalSubscribers) * 100 : 0,
        monthlyGrowth: monthlyData
      }
    });
  })
);

/**
 * POST /newsletter/bulk-action
 * Ações em lote para inscritos (apenas admins)
 */
newsletter.post('/bulk-action',
  authMiddleware,
  authorize('ADMIN'),
  zValidator('json', z.object({
    action: z.enum(['activate', 'deactivate', 'delete']),
    subscriberIds: z.array(z.string()).min(1, 'Pelo menos um inscrito deve ser selecionado')
  })),
  asyncHandler(async (c: any) => {
    const { action, subscriberIds } = c.req.valid('json');

    // Verificar se todos os IDs existem
    const existingSubscribers = await prisma.newsletter.findMany({
      where: {
        id: {
          in: subscriberIds
        }
      },
      select: { id: true }
    });

    if (existingSubscribers.length !== subscriberIds.length) {
      throw createError('Alguns inscritos não foram encontrados', 400, 'SUBSCRIBERS_NOT_FOUND');
    }

    let result;
    let message;

    switch (action) {
      case 'activate':
        result = await prisma.newsletter.updateMany({
          where: {
            id: {
              in: subscriberIds
            }
          },
          data: {
            isActive: true,
            updatedAt: new Date()
          }
        });
        message = `${result.count} inscritos ativados com sucesso`;
        break;

      case 'deactivate':
        result = await prisma.newsletter.updateMany({
          where: {
            id: {
              in: subscriberIds
            }
          },
          data: {
            isActive: false,
            updatedAt: new Date()
          }
        });
        message = `${result.count} inscritos desativados com sucesso`;
        break;

      case 'delete':
        result = await prisma.newsletter.deleteMany({
          where: {
            id: {
              in: subscriberIds
            }
          }
        });
        message = `${result.count} inscritos removidos permanentemente`;
        break;
    }

    return c.json({
      success: true,
      message,
      data: {
        action,
        affectedCount: result?.count || 0
      }
    });
  })
);

export default newsletter;