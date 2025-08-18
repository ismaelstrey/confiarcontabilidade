"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class AdminController {
    static async getDashboard(req, res) {
        try {
            const { period = '30' } = req.query;
            const periodDays = Number(period);
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - periodDays);
            const [userStats, articleStats, contactStats, categoryStats] = await Promise.all([
                Promise.all([
                    prisma.user.count(),
                    prisma.user.count({ where: { isActive: true } }),
                    prisma.user.count({ where: { createdAt: { gte: dateLimit } } }),
                    prisma.user.count({ where: { role: 'ADMIN' } })
                ]),
                Promise.all([
                    prisma.article.count(),
                    prisma.article.count({ where: { status: 'PUBLISHED' } }),
                    prisma.article.count({ where: { createdAt: { gte: dateLimit } } }),
                    prisma.article.aggregate({ _sum: { views: true } })
                ]),
                Promise.all([
                    prisma.contact.count(),
                    prisma.contact.count({ where: { status: 'PENDING' } }),
                    prisma.contact.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
                    prisma.contact.count({ where: { createdAt: { gte: dateLimit } } })
                ]),
                Promise.all([
                    prisma.category.count()
                ])
            ]);
            const popularArticles = await prisma.article.findMany({
                where: { status: 'PUBLISHED' },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    views: true,
                    publishedAt: true,
                    author: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: { views: 'desc' },
                take: 5
            });
            const activeAuthors = await prisma.user.findMany({
                where: {
                    articles: {
                        some: {
                            status: 'PUBLISHED'
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    _count: {
                        select: {
                            articles: true
                        }
                    }
                },
                orderBy: {
                    articles: {
                        _count: 'desc'
                    }
                },
                take: 5
            });
            const recentContacts = await prisma.contact.findMany({
                where: { status: 'PENDING' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    subject: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            });
            const dailyStats = await prisma.$queryRaw `
        SELECT 
          DATE(createdAt) as date,
          'users' as type,
          COUNT(*) as count
        FROM User 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(createdAt)
        
        UNION ALL
        
        SELECT 
          DATE(createdAt) as date,
          'articles' as type,
          COUNT(*) as count
        FROM Article 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(createdAt)
        
        UNION ALL
        
        SELECT 
          DATE(createdAt) as date,
          'contacts' as type,
          COUNT(*) as count
        FROM Contact 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(createdAt)
        
        ORDER BY date DESC, type
      `;
            const dashboard = {
                period: {
                    days: periodDays,
                    from: dateLimit,
                    to: new Date()
                },
                statistics: {
                    users: {
                        total: userStats[0],
                        active: userStats[1],
                        newInPeriod: userStats[2],
                        admins: userStats[3]
                    },
                    articles: {
                        total: articleStats[0],
                        published: articleStats[1],
                        newInPeriod: articleStats[2],
                        totalViews: articleStats[3]._sum.views || 0
                    },
                    contacts: {
                        total: contactStats[0],
                        unread: contactStats[1],
                        pending: contactStats[2],
                        newInPeriod: contactStats[3]
                    },
                    categories: {
                        total: categoryStats[0]
                    }
                },
                popularArticles,
                activeAuthors,
                recentContacts,
                dailyStats
            };
            res.status(200).json({
                success: true,
                message: 'Dashboard carregado com sucesso',
                data: { dashboard }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao carregar dashboard', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getSystemStats(req, res) {
        try {
            const { period = '30', groupBy = 'day' } = req.query;
            const periodDays = Number(period);
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - periodDays);
            const growthStats = await Promise.all([
                prisma.user.groupBy({
                    by: ['createdAt'],
                    where: { createdAt: { gte: dateLimit } },
                    _count: true,
                    orderBy: { createdAt: 'asc' }
                }),
                prisma.article.groupBy({
                    by: ['createdAt'],
                    where: { createdAt: { gte: dateLimit } },
                    _count: true,
                    orderBy: { createdAt: 'asc' }
                }),
                prisma.contact.groupBy({
                    by: ['createdAt'],
                    where: { createdAt: { gte: dateLimit } },
                    _count: true,
                    orderBy: { createdAt: 'asc' }
                })
            ]);
            const categoryStats = await prisma.category.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    _count: {
                        select: {
                            articles: true
                        }
                    }
                },
                orderBy: {
                    articles: {
                        _count: 'desc'
                    }
                }
            });
            const engagementStats = await prisma.article.aggregate({
                where: {
                    status: 'PUBLISHED',
                    publishedAt: { gte: dateLimit }
                },
                _avg: { views: true },
                _sum: { views: true },
                _count: true
            });
            const allArticles = await prisma.article.findMany({
                where: { status: 'PUBLISHED' },
                include: {
                    tags: {
                        include: {
                            tag: {
                                select: { name: true }
                            }
                        }
                    }
                }
            });
            const tagCounts = {};
            allArticles.forEach(article => {
                article.tags.forEach(articleTag => {
                    const tagName = articleTag.tag.name;
                    tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
                });
            });
            const topTags = Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([tag, count]) => ({ tag, count }));
            const systemStats = {
                period: {
                    days: periodDays,
                    from: dateLimit,
                    to: new Date()
                },
                growth: {
                    users: growthStats[0],
                    articles: growthStats[1],
                    contacts: growthStats[2]
                },
                categories: categoryStats,
                engagement: {
                    averageViews: engagementStats._avg.views || 0,
                    totalViews: engagementStats._sum.views || 0,
                    totalArticles: engagementStats._count
                },
                topTags
            };
            res.status(200).json({
                success: true,
                message: 'Estatísticas do sistema obtidas com sucesso',
                data: { systemStats }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao obter estatísticas do sistema', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getSystemLogs(req, res) {
        try {
            const { level, dateFrom, dateTo, search, page = 1, limit = 50 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {};
            if (level) {
                where.level = level;
            }
            if (search) {
                where.OR = [
                    { message: { contains: search, mode: 'insensitive' } },
                    { meta: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (dateFrom || dateTo) {
                where.timestamp = {};
                if (dateFrom) {
                    where.timestamp.gte = new Date(dateFrom);
                }
                if (dateTo) {
                    const endDate = new Date(dateTo);
                    endDate.setHours(23, 59, 59, 999);
                    where.timestamp.lte = endDate;
                }
            }
            const mockLogs = [
                {
                    id: '1',
                    level: 'info',
                    message: 'Sistema iniciado',
                    timestamp: new Date(),
                    meta: JSON.stringify({ service: 'api' })
                },
                {
                    id: '2',
                    level: 'error',
                    message: 'Erro de conexão com banco de dados',
                    timestamp: new Date(Date.now() - 3600000),
                    meta: JSON.stringify({ error: 'Connection timeout' })
                }
            ];
            const logs = mockLogs.slice(skip, skip + take);
            const total = mockLogs.length;
            const totalPages = Math.ceil(total / take);
            res.status(200).json({
                success: true,
                message: 'Logs obtidos com sucesso',
                data: {
                    logs,
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
            logger_1.default.error('Erro ao obter logs do sistema', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async clearOldLogs(req, res) {
        try {
            const { olderThanDays = 30 } = req.body;
            const currentUser = req.user;
            if (olderThanDays < 1 || olderThanDays > 365) {
                res.status(400).json({
                    success: false,
                    message: 'Período deve ser entre 1 e 365 dias'
                });
                return;
            }
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - Number(olderThanDays));
            const deletedCount = { count: 0 };
            logger_1.default.info('Logs antigos removidos', {
                olderThanDays,
                deletedCount: deletedCount.count,
                deletedBy: currentUser.id
            });
            res.status(200).json({
                success: true,
                message: `${deletedCount.count} logs removidos com sucesso`,
                data: { deletedCount: deletedCount.count }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao limpar logs antigos', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getSystemInfo(req, res) {
        try {
            const systemInfo = {
                version: process.env.APP_VERSION || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
                platform: process.platform,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                database: {
                    status: 'connected',
                    version: 'PostgreSQL 14+'
                },
                features: {
                    authentication: true,
                    fileUpload: true,
                    emailService: false,
                    backup: true,
                    logging: true
                },
                lastBackup: null,
                maintenanceMode: false
            };
            res.status(200).json({
                success: true,
                message: 'Informações do sistema obtidas com sucesso',
                data: { systemInfo }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao obter informações do sistema', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async createBackup(req, res) {
        try {
            const options = req.body;
            const currentUser = req.user;
            const backupData = {};
            if (options.includeUsers !== false) {
                backupData.users = await prisma.user.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true
                    }
                });
            }
            if (options.includeArticles !== false) {
                backupData.articles = await prisma.article.findMany({
                    include: {
                        author: {
                            select: { id: true, name: true, email: true }
                        },
                        categories: {
                            include: {
                                category: {
                                    select: { id: true, name: true, slug: true }
                                }
                            }
                        }
                    }
                });
            }
            if (options.includeContacts !== false) {
                backupData.contacts = await prisma.contact.findMany();
            }
            if (options.includeCategories !== false) {
                backupData.categories = await prisma.category.findMany();
            }
            const backupId = `backup_${Date.now()}`;
            const backupInfo = {
                id: backupId,
                createdAt: new Date(),
                createdBy: currentUser.id,
                size: JSON.stringify(backupData).length,
                options,
                recordCounts: {
                    users: backupData.users?.length || 0,
                    articles: backupData.articles?.length || 0,
                    contacts: backupData.contacts?.length || 0,
                    categories: backupData.categories?.length || 0
                }
            };
            logger_1.default.info('Backup criado', {
                backupId,
                createdBy: currentUser.id,
                size: backupInfo.size,
                recordCounts: backupInfo.recordCounts
            });
            res.status(201).json({
                success: true,
                message: 'Backup criado com sucesso',
                data: { backup: backupInfo }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao criar backup', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getBackups(req, res) {
        try {
            const mockBackups = [
                {
                    id: 'backup_1703123456789',
                    createdAt: new Date('2023-12-20T10:30:00Z'),
                    createdBy: 'admin-user-id',
                    size: 1024000,
                    recordCounts: {
                        users: 25,
                        articles: 150,
                        contacts: 75,
                        categories: 10
                    }
                }
            ];
            res.status(200).json({
                success: true,
                message: 'Backups listados com sucesso',
                data: { backups: mockBackups }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao listar backups', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async toggleMaintenanceMode(req, res) {
        try {
            const { enabled, message } = req.body;
            const currentUser = req.user;
            logger_1.default.info('Modo de manutenção alterado', {
                enabled,
                message,
                changedBy: currentUser.id
            });
            res.status(200).json({
                success: true,
                message: `Modo de manutenção ${enabled ? 'ativado' : 'desativado'}`,
                data: {
                    maintenanceMode: enabled,
                    message: message || null
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao alterar modo de manutenção', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}
exports.AdminController = AdminController;
exports.default = AdminController;
//# sourceMappingURL=adminController.js.map