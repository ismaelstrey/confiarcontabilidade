import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Interface para dados de artigo
interface ArticleData {
  title?: string;
  content?: string;
  excerpt?: string;
  slug?: string;
  featuredImage?: string;
  isPublished?: boolean;
  publishedAt?: Date;
  tags?: string[];
  categoryId?: string;
}

// Interface para filtros de busca
interface ArticleFilters {
  search?: string;
  category?: string;
  tag?: string;
  isPublished?: boolean;
  authorId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'views';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Controller responsável pelo gerenciamento de artigos
 */
export class ArticleController {
  /**
   * Lista todos os artigos com paginação e filtros
   */
  static async getArticles(req: Request, res: Response): Promise<void> {
    try {
      const {
        search,
        category,
        tag,
        isPublished,
        authorId,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      }: ArticleFilters = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Construir filtros
      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (category) {
        where.category = {
          slug: category
        };
      }

      if (tag) {
        where.tags = {
          has: tag
        };
      }

      if (isPublished !== undefined) {
        where.status = isPublished ? 'PUBLISHED' : 'DRAFT';
      }

      if (authorId) {
        where.authorId = authorId;
      }

      // Definir ordenação
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Buscar artigos
      const [articles, total] = await Promise.all([
        prisma.article.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            categories: {
              include: {
                category: {
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
                comments: true
              }
            }
          },
          skip,
          take,
          orderBy
        }),
        prisma.article.count({ where })
      ]);

      const totalPages = Math.ceil(total / take);

      res.status(200).json({
        success: true,
        message: 'Artigos listados com sucesso',
        data: {
          articles,
          pagination: {
            page: Number(page),
            limit: take,
            total,
            totalPages,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1
          }
        }
      });
    } catch (error) {
      logger.error('Erro ao listar artigos', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca um artigo por ID ou slug
   */
  static async getArticle(req: Request, res: Response): Promise<void> {
    try {
      const { identifier } = req.params;
      const { incrementViews = 'false' } = req.query;

      if (!identifier) {
        res.status(400).json({
          success: false,
          message: 'ID ou slug do artigo é obrigatório'
        });
        return;
      }

      // Tentar buscar por ID primeiro, depois por slug
      let article = await prisma.article.findUnique({
        where: { id: identifier },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          comments: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              comments: true
            }
          }
        }
      });

      // Se não encontrou por ID, tentar por slug
      if (!article) {
        article = await prisma.article.findUnique({
          where: { slug: identifier },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            categories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            },
            comments: {
              where: { isApproved: true },
              orderBy: { createdAt: 'desc' }
            },
            _count: {
              select: {
                comments: true
              }
            }
          }
        });
      }

      if (!article) {
        res.status(404).json({
          success: false,
          message: 'Artigo não encontrado'
        });
        return;
      }

      // Incrementar visualizações se solicitado
      if (incrementViews === 'true') {
        await prisma.article.update({
          where: { id: article.id },
          data: { views: { increment: 1 } }
        });
        article.views += 1;
      }

      res.status(200).json({
        success: true,
        message: 'Artigo encontrado',
        data: { article }
      });
    } catch (error) {
      logger.error('Erro ao buscar artigo', { error, identifier: req.params.identifier });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cria um novo artigo
   */
  static async createArticle(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        content,
        excerpt,
        slug,
        featuredImage,
        isPublished = false,
        tags = [],
        categoryId
      }: ArticleData = req.body;
      const currentUser = (req as any).user;

      // Validações básicas
      if (!title || !content) {
        res.status(400).json({
          success: false,
          message: 'Título e conteúdo são obrigatórios'
        });
        return;
      }

      // Gerar slug se não fornecido
      let articleSlug = slug;
      if (!articleSlug) {
        articleSlug = title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }

      // Verificar se o slug já existe
      const existingArticle = await prisma.article.findUnique({
        where: { slug: articleSlug }
      });

      if (existingArticle) {
        // Adicionar timestamp ao slug para torná-lo único
        articleSlug = `${articleSlug}-${Date.now()}`;
      }

      // Verificar se a categoria existe (se fornecida)
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId }
        });

        if (!category) {
          res.status(400).json({
            success: false,
            message: 'Categoria não encontrada'
          });
          return;
        }
      }

      // Gerar excerpt se não fornecido
      let articleExcerpt = excerpt;
      if (!articleExcerpt) {
        // Remover tags HTML e pegar os primeiros 200 caracteres
        const plainText = content.replace(/<[^>]*>/g, '');
        articleExcerpt = plainText.length > 200
          ? plainText.substring(0, 200) + '...'
          : plainText;
      }

      // Criar artigo
      const articleData: any = {
        title: title || '',
        content: content || '',
        excerpt: articleExcerpt,
        slug: articleSlug,
        featuredImage: featuredImage || undefined,
        status: isPublished ? 'PUBLISHED' : 'DRAFT',
        publishedAt: isPublished ? new Date() : null,
        authorId: currentUser.id as string,
        tags: {
          create: tags?.map((tagId: string) => ({ tagId })) || []
        }
      };
      
      // Add categories if provided
      if (categoryId) {
        articleData.categories = {
          create: [{ categoryId }]
        };
      }
      
      const article = await prisma.article.create({
        data: articleData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true

            }
          },
          categories: {
            include: {
              category: {
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

      // Log da ação
      logger.info('Artigo criado', {
        articleId: article.id,
        title: article.title,
        authorId: currentUser.id,
        status: article.status
      });

      res.status(201).json({
        success: true,
        message: 'Artigo criado com sucesso',
        data: { article }
      });
    } catch (error) {
      logger.error('Erro ao criar artigo', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza um artigo existente
   */
  static async updateArticle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        excerpt,
        slug,
        featuredImage,
        isPublished,
        tags,
        categoryId
      }: ArticleData = req.body;
      const currentUser = (req as any).user;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do artigo é obrigatório'
        });
        return;
      }

      // Verificar se o artigo existe
      const existingArticle = await prisma.article.findUnique({
        where: { id }
      });

      if (!existingArticle) {
        res.status(404).json({
          success: false,
          message: 'Artigo não encontrado'
        });
        return;
      }

      // Verificar permissões (autor ou admin)
      if (currentUser.role !== 'ADMIN' && existingArticle.authorId !== currentUser.id) {
        res.status(403).json({
          success: false,
          message: 'Sem permissão para editar este artigo'
        });
        return;
      }

      // Preparar dados para atualização
      const updateData: any = {};

      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (excerpt) updateData.excerpt = excerpt;
      if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
      
      // Handle categories relationship
      if (categoryId !== undefined) {
        if (categoryId) {
          // Verificar se a categoria existe
          const category = await prisma.category.findUnique({
            where: { id: categoryId }
          });

          if (!category) {
            res.status(400).json({
              success: false,
              message: 'Categoria não encontrada'
            });
            return;
          }
          
          updateData.categories = {
            deleteMany: {},
            create: [{ categoryId }]
          };
        } else {
          updateData.categories = {
            deleteMany: {}
          };
        }
      }
      
      // Handle tags relationship
      if (tags) {
        updateData.tags = {
          deleteMany: {},
          create: tags.map((tagId: string) => ({ tagId }))
        };
      }

      // Verificar slug único se fornecido
      if (slug && slug !== existingArticle.slug) {
        const slugInUse = await prisma.article.findFirst({
          where: {
            slug,
            id: { not: id }
          }
        });

        if (slugInUse) {
          res.status(409).json({
            success: false,
            message: 'Slug já está em uso por outro artigo'
          });
          return;
        }

        updateData.slug = slug;
      }

      // Gerenciar publicação
      if (isPublished !== undefined) {
        updateData.status = isPublished ? 'PUBLISHED' : 'DRAFT';

        // Se está sendo publicado pela primeira vez
        if (isPublished && existingArticle.status !== 'PUBLISHED') {
          updateData.publishedAt = new Date();
        }

        // Se está sendo despublicado
        if (!isPublished && existingArticle.status === 'PUBLISHED') {
          updateData.publishedAt = null;
        }
      }

      updateData.updatedAt = new Date();

      // Atualizar artigo
      const updatedArticle = await prisma.article.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          categories: {
            include: {
              category: {
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

      // Log da ação
      logger.info('Artigo atualizado', {
        articleId: id,
        updatedBy: currentUser.id,
        changes: Object.keys(updateData)
      });

      res.status(200).json({
        success: true,
        message: 'Artigo atualizado com sucesso',
        data: { article: updatedArticle }
      });
    } catch (error) {
      logger.error('Erro ao atualizar artigo', { error, articleId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Remove um artigo
   */
  static async deleteArticle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do artigo é obrigatório'
        });
        return;
      }

      // Verificar se o artigo existe
      const existingArticle = await prisma.article.findUnique({
        where: { id }
      });

      if (!existingArticle) {
        res.status(404).json({
          success: false,
          message: 'Artigo não encontrado'
        });
        return;
      }

      // Verificar permissões (autor ou admin)
      if (currentUser.role !== 'ADMIN' && existingArticle.authorId !== currentUser.id) {
        res.status(403).json({
          success: false,
          message: 'Sem permissão para deletar este artigo'
        });
        return;
      }

      // Deletar artigo e comentários relacionados
      await prisma.$transaction([
        prisma.articleComment.deleteMany({
          where: { articleId: id }
        }),
        prisma.article.delete({
          where: { id }
        })
      ]);

      // Log da ação
      logger.info('Artigo deletado', {
        articleId: id,
        title: existingArticle.title,
        deletedBy: currentUser.id
      });

      res.status(200).json({
        success: true,
        message: 'Artigo deletado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao deletar artigo', { error, articleId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca artigos relacionados
   */
  static async getRelatedArticles(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do artigo é obrigatório'
        });
        return;
      }

      // Buscar o artigo atual
      const currentArticle = await prisma.article.findUnique({
        where: { id },
        select: {
          categories: {
            select: {
              categoryId: true
            }
          },
          tags: {
            select: {
              tagId: true
            }
          }
        }
      }) as { categories: { categoryId: string }[]; tags: { tagId: string }[] } | null;

      if (!currentArticle) {
        res.status(404).json({
          success: false,
          message: 'Artigo não encontrado'
        });
        return;
      }

      // Buscar artigos relacionados
      const relatedArticles = await prisma.article.findMany({
        where: {
          AND: [
            { id: { not: id } },
            { status: 'PUBLISHED' },
            {
              OR: [
                // Mesma categoria
                currentArticle.categories.length > 0 ? {
                  categories: {
                    some: {
                      categoryId: {
                        in: currentArticle.categories.map(cat => cat.categoryId)
                      }
                    }
                  }
                } : {},
                // Tags em comum
                currentArticle.tags.length > 0 ? {
                  tags: {
                    some: {
                      tagId: {
                        in: currentArticle.tags.map(tag => tag.tagId)
                      }
                    }
                  }
                } : {}
              ]
            }
          ]
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          slug: true,
          featuredImage: true,
          publishedAt: true,
          views: true,
          author: {
            select: {
              id: true,
              name: true
            }
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        take: Number(limit),
        orderBy: { publishedAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        message: 'Artigos relacionados encontrados',
        data: { articles: relatedArticles }
      });
    } catch (error) {
      logger.error('Erro ao buscar artigos relacionados', { error, articleId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca artigos populares
   */
  static async getPopularArticles(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10, period = '30' } = req.query;

      // Calcular data limite baseada no período
      const periodDays = Number(period);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - periodDays);

      const popularArticles = await prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          publishedAt: {
            gte: dateLimit
          }
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          slug: true,
          featuredImage: true,
          publishedAt: true,
          views: true,
          author: {
            select: {
              id: true,
              name: true
            }
          },
          categories: {
            include: {
              category: {
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
              comments: true
            }
          }
        },
        take: Number(limit),
        orderBy: [
          { views: 'desc' },
          { publishedAt: 'desc' }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Artigos populares encontrados',
        data: { articles: popularArticles }
      });
    } catch (error) {
      logger.error('Erro ao buscar artigos populares', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export default ArticleController;