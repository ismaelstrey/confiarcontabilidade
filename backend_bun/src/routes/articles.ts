import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, authorize, optionalAuth } from '../middlewares/auth';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { rateLimiters } from '../middlewares/advancedRateLimit';

const articles = new Hono();

// Schemas de validação
const createArticleSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
  excerpt: z.string().max(500, 'Resumo deve ter no máximo 500 caracteres').optional(),
  featuredImage: z.string().url('URL da imagem inválida').optional(),
  published: z.boolean().default(false),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional()
});

const updateArticleSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').optional(),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres').optional(),
  excerpt: z.string().max(500, 'Resumo deve ter no máximo 500 caracteres').optional(),
  featuredImage: z.string().url('URL da imagem inválida').optional(),
  published: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional()
});

const commentSchema = z.object({
  content: z.string().min(1, 'Comentário não pode estar vazio').max(1000, 'Comentário deve ter no máximo 1000 caracteres')
});

const querySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  published: z.string().transform(val => val === 'true').optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'likes']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

/**
 * GET /articles
 * Listar artigos com filtros e paginação
 */
articles.get('/',
  rateLimiters.publicApi,
  optionalAuth,
  zValidator('query', querySchema),
  asyncHandler(async (c: any) => {
    const user = c.get('user');
    const { page = 1, limit = 10, search, category, tag, author, published, sortBy, sortOrder } = c.req.valid('query');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    // Se não for admin/moderador, mostrar apenas artigos publicados
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      where.published = true;
    } else if (published !== undefined) {
      where.published = published;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag
          }
        }
      };
    }

    if (author) {
      where.authorId = author;
    }

    // Ordenação
    const orderBy: any = {};
    if (sortBy === 'likes') {
      orderBy._count = { likes: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Buscar artigos
    const [articlesData, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          excerpt: true,
          featuredImage: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.article.count({ where })
    ]);

    // Formatar dados
    const articles = articlesData.map(article => ({
      ...article,
      categories: article.categories.map(c => c.category),
      tags: article.tags.map(t => t.tag),
      likesCount: article._count.likes,
      commentsCount: article._count.comments
    }));

    return c.json({
      success: true,
      data: {
        articles,
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
 * POST /articles
 * Criar novo artigo
 */
articles.post('/',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  zValidator('json', createArticleSchema),
  asyncHandler(async (c: any) => {
    const user = c.get('user');
    const { title, content, excerpt, featuredImage, published, categoryIds, tagIds } = c.req.valid('json');

    // Criar slug a partir do título
    const slug = title
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
    while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Criar artigo
    const article = await prisma.article.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt,
        featuredImage,
        published,
        authorId: user.id,
        categories: categoryIds ? {
          create: categoryIds.map((categoryId: string) => ({
            categoryId
          }))
        } : undefined,
        tags: tagIds ? {
          create: tagIds.map((tagId: string) => ({
            tagId
          }))
        } : undefined
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        published: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    return c.json({
      success: true,
      message: 'Artigo criado com sucesso',
      data: {
        ...article,
        categories: article.categories.map(c => c.category),
        tags: article.tags.map(t => t.tag)
      }
    }, 201);
  })
);

/**
 * GET /articles/:slug
 * Obter artigo por slug
 */
articles.get('/:slug',
  rateLimiters.publicApi,
  optionalAuth,
  asyncHandler(async (c: any) => {
    const user = c.get('user');
    const slug = c.req.param('slug');

    const article = await prisma.article.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        featuredImage: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        comments: {
          where: { approved: true },
          select: {
            id: true,
            content: true,
            createdAt: true,
            authorName: true,
            authorEmail: true

          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            likes: true,
            comments: { where: { approved: true } }
          }
        }
      }
    });

    if (!article) {
      throw createError('Artigo não encontrado', 404, 'ARTICLE_NOT_FOUND');
    }

    // Se não for admin/moderador e artigo não estiver publicado
    if (!article.published && (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR' && user.id !== article.author.id))) {
      throw createError('Artigo não encontrado', 404, 'ARTICLE_NOT_FOUND');
    }

    // Verificar se usuário curtiu o artigo
    let isLiked = false;
    if (user) {
      const like = await prisma.articleLike.findUnique({
        where: {
          userId_articleId: {
            userId: user.id,
            articleId: article.id
          }
        }
      });
      isLiked = !!like;
    }

    return c.json({
      success: true,
      data: {
        ...article,
        categories: article.categories.map(c => c.category),
        tags: article.tags.map(t => t.tag),
        likesCount: article._count.likes,
        commentsCount: article._count.comments,
        isLiked
      }
    });
  })
);

/**
 * PUT /articles/:slug
 * Atualizar artigo
 */
articles.put('/:slug',
  authMiddleware,
  zValidator('json', updateArticleSchema),
  asyncHandler(async (c: any) => {
    const user = c.get('user');
    const slug = c.req.param('slug');
    const updateData = c.req.valid('json');

    // Buscar artigo
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, authorId: true, title: true, slug: true }
    });

    if (!existingArticle) {
      throw createError('Artigo não encontrado', 404, 'ARTICLE_NOT_FOUND');
    }

    // Verificar permissões
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR' && user.id !== existingArticle.authorId) {
      throw createError('Sem permissão para editar este artigo', 403, 'FORBIDDEN');
    }

    // Se título foi alterado, gerar novo slug
    let newSlug = existingArticle.slug;
    if (updateData.title && updateData.title !== existingArticle.title) {
      const baseSlug = updateData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      newSlug = baseSlug;
      let counter = 1;
      while (await prisma.article.findFirst({ where: { slug: newSlug, id: { not: existingArticle.id } } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Preparar dados de atualização
    const { categoryIds, tagIds, ...articleData } = updateData;
    const finalUpdateData: any = {
      ...articleData,
      slug: newSlug
    };

    // Atualizar categorias se fornecidas
    if (categoryIds) {
      finalUpdateData.categories = {
        deleteMany: {},
        create: categoryIds.map((categoryId: string) => ({ categoryId }))
      };
    }

    // Atualizar tags se fornecidas
    if (tagIds) {
      finalUpdateData.tags = {
        deleteMany: {},
        create: tagIds.map((tagId: string) => ({ tagId }))
      };
    }

    const updatedArticle = await prisma.article.update({
      where: { id: existingArticle.id },
      data: finalUpdateData,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        published: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    return c.json({
      success: true,
      message: 'Artigo atualizado com sucesso',
      data: {
        ...updatedArticle,
        categories: updatedArticle.categories.map(c => c.category),
        tags: updatedArticle.tags.map(t => t.tag)
      }
    });
  })
);

/**
 * DELETE /articles/:slug
 * Deletar artigo
 */
articles.delete('/:slug',
  authMiddleware,
  asyncHandler(async (c: any) => {
    const user = c.get('user');
    const slug = c.req.param('slug');

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, authorId: true, title: true }
    });

    if (!article) {
      throw createError('Artigo não encontrado', 404, 'ARTICLE_NOT_FOUND');
    }

    // Verificar permissões
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR' && user.id !== article.authorId) {
      throw createError('Sem permissão para deletar este artigo', 403, 'FORBIDDEN');
    }

    await prisma.article.delete({
      where: { id: article.id }
    });

    return c.json({
      success: true,
      message: 'Artigo deletado com sucesso'
    });
  })
);

/**
 * POST /articles/:slug/like
 * Curtir/descurtir artigo
 */
articles.post('/:slug/like',
  authMiddleware,
  asyncHandler(async (c: any) => {
    const user = c.get('user');
    const slug = c.req.param('slug');

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, published: true }
    });

    if (!article || !article.published) {
      throw createError('Artigo não encontrado', 404, 'ARTICLE_NOT_FOUND');
    }

    // Verificar se já curtiu
    const existingLike = await prisma.articleLike.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: article.id
        }
      }
    });

    let isLiked: boolean;
    let likesCount: number;

    if (existingLike) {
      // Remover curtida
      await prisma.articleLike.delete({
        where: {
          userId_articleId: {
            userId: user.id,
            articleId: article.id
          }
        }
      });
      isLiked = false;
    } else {
      // Adicionar curtida
      await prisma.articleLike.create({
        data: {
          userId: user.id,
          articleId: article.id
        }
      });
      isLiked = true;
    }

    // Contar curtidas
    likesCount = await prisma.articleLike.count({
      where: { articleId: article.id }
    });

    return c.json({
      success: true,
      data: {
        isLiked,
        likesCount
      }
    });
  })
);

/**
 * POST /articles/:slug/comments
 * Adicionar comentário
 */
articles.post('/:slug/comments',
  authMiddleware,
  zValidator('json', commentSchema),
  asyncHandler(async (c: any) => {
    const user = c.get('user');
    const slug = c.req.param('slug');
    const { content } = c.req.valid('json');

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, published: true }
    });

    if (!article || !article.published) {
      throw createError('Artigo não encontrado', 404, 'ARTICLE_NOT_FOUND');
    }

    const comment = await prisma.articleComment.create({
      data: {
        content,
        authorId: user.id || '',
        articleId: article.id,
        isApproved: true, // Auto-aprovar por enquanto
        authorEmail: user.email || '',
        authorName: user.name || '',
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      }
    });

    return c.json({
      success: true,
      message: 'Comentário adicionado com sucesso',
      data: comment
    }, 201);
  })
);

export default articles;