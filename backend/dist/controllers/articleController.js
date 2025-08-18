"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleController = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class ArticleController {
    static async getArticles(req, res) {
        try {
            const { search, category, tag, isPublished, authorId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {};
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
            const orderBy = {};
            orderBy[sortBy] = sortOrder;
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
        }
        catch (error) {
            logger_1.default.error('Erro ao listar artigos', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getArticle(req, res) {
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
        }
        catch (error) {
            logger_1.default.error('Erro ao buscar artigo', { error, identifier: req.params.identifier });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async createArticle(req, res) {
        try {
            const { title, content, excerpt, slug, featuredImage, isPublished = false, tags = [], categoryId } = req.body;
            const currentUser = req.user;
            if (!title || !content) {
                res.status(400).json({
                    success: false,
                    message: 'Título e conteúdo são obrigatórios'
                });
                return;
            }
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
            const existingArticle = await prisma.article.findUnique({
                where: { slug: articleSlug }
            });
            if (existingArticle) {
                articleSlug = `${articleSlug}-${Date.now()}`;
            }
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
            let articleExcerpt = excerpt;
            if (!articleExcerpt) {
                const plainText = content.replace(/<[^>]*>/g, '');
                articleExcerpt = plainText.length > 200
                    ? plainText.substring(0, 200) + '...'
                    : plainText;
            }
            const articleData = {
                title: title || '',
                content: content || '',
                excerpt: articleExcerpt,
                slug: articleSlug,
                featuredImage: featuredImage || undefined,
                status: isPublished ? 'PUBLISHED' : 'DRAFT',
                publishedAt: isPublished ? new Date() : null,
                authorId: currentUser.id,
                tags: {
                    create: tags?.map((tagId) => ({ tagId })) || []
                }
            };
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
            logger_1.default.info('Artigo criado', {
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
        }
        catch (error) {
            logger_1.default.error('Erro ao criar artigo', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async updateArticle(req, res) {
        try {
            const { id } = req.params;
            const { title, content, excerpt, slug, featuredImage, isPublished, tags, categoryId } = req.body;
            const currentUser = req.user;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID do artigo é obrigatório'
                });
                return;
            }
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
            if (currentUser.role !== 'ADMIN' && existingArticle.authorId !== currentUser.id) {
                res.status(403).json({
                    success: false,
                    message: 'Sem permissão para editar este artigo'
                });
                return;
            }
            const updateData = {};
            if (title)
                updateData.title = title;
            if (content)
                updateData.content = content;
            if (excerpt)
                updateData.excerpt = excerpt;
            if (featuredImage !== undefined)
                updateData.featuredImage = featuredImage;
            if (categoryId !== undefined) {
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
                    updateData.categories = {
                        deleteMany: {},
                        create: [{ categoryId }]
                    };
                }
                else {
                    updateData.categories = {
                        deleteMany: {}
                    };
                }
            }
            if (tags) {
                updateData.tags = {
                    deleteMany: {},
                    create: tags.map((tagId) => ({ tagId }))
                };
            }
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
            if (isPublished !== undefined) {
                updateData.status = isPublished ? 'PUBLISHED' : 'DRAFT';
                if (isPublished && existingArticle.status !== 'PUBLISHED') {
                    updateData.publishedAt = new Date();
                }
                if (!isPublished && existingArticle.status === 'PUBLISHED') {
                    updateData.publishedAt = null;
                }
            }
            updateData.updatedAt = new Date();
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
            logger_1.default.info('Artigo atualizado', {
                articleId: id,
                updatedBy: currentUser.id,
                changes: Object.keys(updateData)
            });
            res.status(200).json({
                success: true,
                message: 'Artigo atualizado com sucesso',
                data: { article: updatedArticle }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao atualizar artigo', { error, articleId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async deleteArticle(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID do artigo é obrigatório'
                });
                return;
            }
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
            if (currentUser.role !== 'ADMIN' && existingArticle.authorId !== currentUser.id) {
                res.status(403).json({
                    success: false,
                    message: 'Sem permissão para deletar este artigo'
                });
                return;
            }
            await prisma.$transaction([
                prisma.articleComment.deleteMany({
                    where: { articleId: id }
                }),
                prisma.article.delete({
                    where: { id }
                })
            ]);
            logger_1.default.info('Artigo deletado', {
                articleId: id,
                title: existingArticle.title,
                deletedBy: currentUser.id
            });
            res.status(200).json({
                success: true,
                message: 'Artigo deletado com sucesso'
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao deletar artigo', { error, articleId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getRelatedArticles(req, res) {
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
            });
            if (!currentArticle) {
                res.status(404).json({
                    success: false,
                    message: 'Artigo não encontrado'
                });
                return;
            }
            const relatedArticles = await prisma.article.findMany({
                where: {
                    AND: [
                        { id: { not: id } },
                        { status: 'PUBLISHED' },
                        {
                            OR: [
                                currentArticle.categories.length > 0 ? {
                                    categories: {
                                        some: {
                                            categoryId: {
                                                in: currentArticle.categories.map(cat => cat.categoryId)
                                            }
                                        }
                                    }
                                } : {},
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
        }
        catch (error) {
            logger_1.default.error('Erro ao buscar artigos relacionados', { error, articleId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getPopularArticles(req, res) {
        try {
            const { limit = 10, period = '30' } = req.query;
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
        }
        catch (error) {
            logger_1.default.error('Erro ao buscar artigos populares', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}
exports.ArticleController = ArticleController;
exports.default = ArticleController;
//# sourceMappingURL=articleController.js.map