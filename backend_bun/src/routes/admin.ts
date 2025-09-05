import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, authorize } from '../middlewares/auth';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { rateLimiters, conditionalRateLimit, isAdmin } from '../middlewares/advancedRateLimit';

const admin = new Hono();

// Aplicar middlewares de autenticação, autorização e rate limiting para todas as rotas
admin.use('*', conditionalRateLimit((c) => !isAdmin(c), rateLimiters.admin));

// Schemas de validação
const createCategorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional()
});

const updateCategorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional()
});

const createTagSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional()
});

const updateTagSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional()
});

const querySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

/**
 * GET /admin/dashboard
 * Dashboard com estatísticas gerais
 */
admin.get('/dashboard',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  asyncHandler(async (c: any) => {
    const [userStats, articleStats, contactStats, newsletterStats, uploadStats] = await Promise.all([
      // Estatísticas de usuários
      Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({ where: { role: 'MODERATOR' } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]),
      // Estatísticas de artigos
      Promise.all([
        prisma.article.count(),
        prisma.article.count({ where: { published: true } }),
        prisma.article.count({ where: { published: false } }),
        prisma.articleLike.count(),
        prisma.articleComment.count({ where: { isApproved: true } })
      ]),
      // Estatísticas de contatos
      Promise.all([
        prisma.contact.count(),
        prisma.contact.count({ where: { status: 'PENDING' } }),
        prisma.contact.count({ where: { status: 'RESOLVED' } }),
        prisma.contact.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]),
      // Estatísticas de newsletter
      Promise.all([
        prisma.newsletter.count(),
        prisma.newsletter.count({ where: { isActive: true } }),
        prisma.newsletter.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]),
      // Estatísticas de uploads
      Promise.all([
        prisma.upload.count(),
        prisma.upload.aggregate({ _sum: { size: true } }),
        prisma.upload.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ])
    ]);

    return c.json({
      success: true,
      data: {
        users: {
          total: userStats[0],
          active: userStats[1],
          admins: userStats[2],
          moderators: userStats[3],
          recentlyRegistered: userStats[4]
        },
        articles: {
          total: articleStats[0],
          published: articleStats[1],
          drafts: articleStats[2],
          totalLikes: articleStats[3],
          totalComments: articleStats[4]
        },
        contacts: {
          total: contactStats[0],
          pending: contactStats[1],
          resolved: contactStats[2],
          recent: contactStats[3]
        },
        newsletter: {
          total: newsletterStats[0],
          active: newsletterStats[1],
          recentSubscriptions: newsletterStats[2]
        },
        uploads: {
          total: uploadStats[0],
          totalSize: uploadStats[1]._sum.size || 0,
          recent: uploadStats[2]
        }
      }
    });
  })
);

/**
 * GET /admin/categories
 * Listar categorias
 */
admin.get('/categories',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  zValidator('query', querySchema),
  asyncHandler(async (c: any) => {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = c.req.valid('query');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar categorias
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              articles: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.category.count({ where })
    ]);

    return c.json({
      success: true,
      data: {
        categories: categories.map(category => ({
          ...category,
          articlesCount: category._count.articles
        })),
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
 * POST /admin/categories
 * Criar nova categoria
 */
admin.post('/categories',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  zValidator('json', createCategorySchema),
  asyncHandler(async (c: any) => {
    const { name, description } = c.req.valid('json');

    // Criar slug a partir do nome
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Verificar se slug já existe
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true
      }
    });

    return c.json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: category
    }, 201);
  })
);

/**
 * PUT /admin/categories/:id
 * Atualizar categoria
 */
admin.put('/categories/:id',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  zValidator('json', updateCategorySchema),
  asyncHandler(async (c: any) => {
    const id = c.req.param('id');
    const updateData = c.req.valid('json');

    // Verificar se categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      throw createError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
    }

    // Se nome foi alterado, gerar novo slug
    let newSlug = existingCategory.slug;
    if (updateData.name && updateData.name !== existingCategory.name) {
      const baseSlug = updateData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      newSlug = baseSlug;
      let counter = 1;
      while (await prisma.category.findFirst({ where: { slug: newSlug, id: { not: id } } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...updateData,
        slug: newSlug
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        updatedAt: true
      }
    });

    return c.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: updatedCategory
    });
  })
);

/**
 * DELETE /admin/categories/:id
 * Deletar categoria
 */
admin.delete('/categories/:id',
  authMiddleware,
  authorize('ADMIN'),
  asyncHandler(async (c: any) => {
    const id = c.req.param('id');

    // Verificar se categoria existe
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!category) {
      throw createError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
    }

    // Verificar se categoria tem artigos associados
    if (category._count.articles > 0) {
      throw createError('Não é possível deletar categoria com artigos associados', 400, 'CATEGORY_HAS_ARTICLES');
    }

    await prisma.category.delete({
      where: { id }
    });

    return c.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    });
  })
);

/**
 * GET /admin/tags
 * Listar tags
 */
admin.get('/tags',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  zValidator('query', querySchema),
  asyncHandler(async (c: any) => {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = c.req.valid('query');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar tags
    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              articles: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.tag.count({ where })
    ]);

    return c.json({
      success: true,
      data: {
        tags: tags.map(tag => ({
          ...tag,
          articlesCount: tag._count.articles
        })),
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
 * POST /admin/tags
 * Criar nova tag
 */
admin.post('/tags',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  zValidator('json', createTagSchema),
  asyncHandler(async (c: any) => {
    const { name, description } = c.req.valid('json');

    // Criar slug a partir do nome
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Verificar se slug já existe
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.tag.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug: finalSlug,
        description
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true
      }
    });

    return c.json({
      success: true,
      message: 'Tag criada com sucesso',
      data: tag
    }, 201);
  })
);

/**
 * PUT /admin/tags/:id
 * Atualizar tag
 */
admin.put('/tags/:id',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  zValidator('json', updateTagSchema),
  asyncHandler(async (c: any) => {
    const id = c.req.param('id');
    const updateData = c.req.valid('json');

    // Verificar se tag existe
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!existingTag) {
      throw createError('Tag não encontrada', 404, 'TAG_NOT_FOUND');
    }

    // Se nome foi alterado, gerar novo slug
    let newSlug = existingTag.slug;
    if (updateData.name && updateData.name !== existingTag.name) {
      const baseSlug = updateData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      newSlug = baseSlug;
      let counter = 1;
      while (await prisma.tag.findFirst({ where: { slug: newSlug, id: { not: id } } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        ...updateData,
        slug: newSlug
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        updatedAt: true
      }
    });

    return c.json({
      success: true,
      message: 'Tag atualizada com sucesso',
      data: updatedTag
    });
  })
);

/**
 * DELETE /admin/tags/:id
 * Deletar tag
 */
admin.delete('/tags/:id',
  authMiddleware,
  authorize('ADMIN'),
  asyncHandler(async (c: any) => {
    const id = c.req.param('id');

    // Verificar se tag existe
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!tag) {
      throw createError('Tag não encontrada', 404, 'TAG_NOT_FOUND');
    }

    // Verificar se tag tem artigos associados
    if (tag._count.articles > 0) {
      throw createError('Não é possível deletar tag com artigos associados', 400, 'TAG_HAS_ARTICLES');
    }

    await prisma.tag.delete({
      where: { id }
    });

    return c.json({
      success: true,
      message: 'Tag deletada com sucesso'
    });
  })
);

/**
 * GET /admin/system-info
 * Informações do sistema
 */
admin.get('/system-info',
  authMiddleware,
  authorize('ADMIN'),
  asyncHandler(async (c: any) => {
    const systemInfo = {
      runtime: 'Bun',
      version: Bun.version,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    return c.json({
      success: true,
      data: systemInfo
    });
  })
);

export default admin;