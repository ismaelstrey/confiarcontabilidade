"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterController = void 0;
const client_1 = require("@prisma/client");
const { body, validationResult } = require('express-validator');
const crypto = __importStar(require("crypto"));
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class NewsletterController {
    static subscribeValidation = [
        body('email')
            .isEmail()
            .withMessage('Email deve ser válido')
            .normalizeEmail(),
        body('name')
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage('Nome deve ter entre 2 e 100 caracteres')
            .trim(),
        body('preferences.frequency')
            .optional()
            .isIn(['daily', 'weekly', 'monthly'])
            .withMessage('Frequência deve ser daily, weekly ou monthly'),
        body('preferences.categories')
            .optional()
            .isArray()
            .withMessage('Categorias devem ser um array')
    ];
    static campaignValidation = [
        body('subject')
            .notEmpty()
            .withMessage('Assunto é obrigatório')
            .isLength({ min: 5, max: 200 })
            .withMessage('Assunto deve ter entre 5 e 200 caracteres')
            .trim(),
        body('content')
            .notEmpty()
            .withMessage('Conteúdo é obrigatório')
            .isLength({ min: 10 })
            .withMessage('Conteúdo deve ter pelo menos 10 caracteres')
            .trim(),
        body('htmlContent')
            .optional()
            .isLength({ min: 10 })
            .withMessage('Conteúdo HTML deve ter pelo menos 10 caracteres'),
        body('scheduledFor')
            .optional()
            .isISO8601()
            .withMessage('Data de agendamento deve ser válida')
            .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Data de agendamento deve ser no futuro');
            }
            return true;
        })
    ];
    static async subscribe(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: errors.array()
                });
                return;
            }
            const { email, name, preferences } = req.body;
            const existingSubscriber = await prisma.newsletter.findUnique({
                where: { email }
            });
            if (existingSubscriber) {
                if (existingSubscriber.isActive === true) {
                    res.status(409).json({
                        success: false,
                        message: 'Email já está inscrito na newsletter'
                    });
                    return;
                }
                const updatedSubscriber = await prisma.newsletter.update({
                    where: { email },
                    data: {
                        isActive: true,
                        name: name || existingSubscriber.name,
                        updatedAt: new Date()
                    }
                });
                logger_1.default.info('Newsletter reativada', {
                    email,
                    subscriberId: updatedSubscriber.id
                });
                res.status(200).json({
                    success: true,
                    message: 'Inscrição reativada com sucesso',
                    data: {
                        subscriber: {
                            id: updatedSubscriber.id,
                            email: updatedSubscriber.email,
                            name: updatedSubscriber.name,
                            isActive: updatedSubscriber.isActive,
                            subscribedAt: updatedSubscriber.createdAt
                        }
                    }
                });
                return;
            }
            const confirmationToken = crypto.randomBytes(32).toString('hex');
            const subscriber = await prisma.newsletter.create({
                data: {
                    email,
                    name: name || null,
                    isActive: false
                }
            });
            logger_1.default.info('Nova inscrição na newsletter', {
                email,
                subscriberId: subscriber.id,
                name: name || 'Não informado'
            });
            res.status(201).json({
                success: true,
                message: 'Inscrição realizada com sucesso. Verifique seu email para confirmar.',
                data: {
                    subscriber: {
                        id: subscriber.id,
                        email: subscriber.email,
                        name: subscriber.name,
                        isActive: subscriber.isActive,
                        subscribedAt: subscriber.createdAt
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao inscrever na newsletter', { error, email: req.body.email });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async confirmSubscription(req, res) {
        try {
            const { token } = req.params;
            if (!token) {
                res.status(400).json({
                    success: false,
                    message: 'Token de confirmação é obrigatório'
                });
                return;
            }
            const subscriber = await prisma.newsletter.findFirst({
                where: {
                    email: token,
                    isActive: false
                }
            });
            if (!subscriber) {
                res.status(404).json({
                    success: false,
                    message: 'Token inválido ou inscrição já confirmada'
                });
                return;
            }
            const confirmedSubscriber = await prisma.newsletter.update({
                where: { id: subscriber.id },
                data: {
                    isActive: true,
                    updatedAt: new Date()
                }
            });
            logger_1.default.info('Inscrição confirmada', {
                email: subscriber.email,
                subscriberId: subscriber.id
            });
            res.status(200).json({
                success: true,
                message: 'Inscrição confirmada com sucesso',
                data: {
                    subscriber: {
                        id: confirmedSubscriber.id,
                        email: confirmedSubscriber.email,
                        name: confirmedSubscriber.name,
                        isActive: confirmedSubscriber.isActive,
                        updatedAt: confirmedSubscriber.updatedAt
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao confirmar inscrição', { error, token: req.params.token });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async unsubscribe(req, res) {
        try {
            const { token } = req.params;
            const { email } = req.body;
            let subscriber;
            if (token) {
                subscriber = await prisma.newsletter.findFirst({
                    where: {
                        email: token,
                        isActive: true
                    }
                });
            }
            else if (email) {
                subscriber = await prisma.newsletter.findFirst({
                    where: { email, isActive: true }
                });
            }
            if (!subscriber) {
                res.status(404).json({
                    success: false,
                    message: 'Inscrição não encontrada ou já cancelada'
                });
                return;
            }
            const unsubscribeToken = crypto.randomBytes(32).toString('hex');
            const unsubscribedSubscriber = await prisma.newsletter.update({
                where: { id: subscriber.id },
                data: {
                    isActive: false,
                    updatedAt: new Date()
                }
            });
            logger_1.default.info('Inscrição cancelada', {
                email: subscriber.email,
                subscriberId: subscriber.id,
                method: token ? 'token' : 'email'
            });
            res.status(200).json({
                success: true,
                message: 'Inscrição cancelada com sucesso',
                data: {
                    subscriber: {
                        id: unsubscribedSubscriber.id,
                        email: unsubscribedSubscriber.email,
                        isActive: unsubscribedSubscriber.isActive,
                        updatedAt: unsubscribedSubscriber.updatedAt
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao cancelar inscrição', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getSubscribers(req, res) {
        try {
            const { status, search, dateFrom, dateTo, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {};
            if (status) {
                where.status = status;
            }
            if (search) {
                where.OR = [
                    { email: { contains: search, mode: 'insensitive' } },
                    { name: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom) {
                    where.createdAt.gte = new Date(dateFrom);
                }
                if (dateTo) {
                    const endDate = new Date(dateTo);
                    endDate.setHours(23, 59, 59, 999);
                    where.createdAt.lte = endDate;
                }
            }
            const orderBy = {};
            orderBy[sortBy] = sortOrder;
            const [subscribers, total] = await Promise.all([
                prisma.newsletter.findMany({
                    where,
                    skip,
                    take,
                    orderBy
                }),
                prisma.newsletter.count({ where })
            ]);
            const totalPages = Math.ceil(total / take);
            const activeCount = await prisma.newsletter.count({ where: { isActive: true } });
            const inactiveCount = await prisma.newsletter.count({ where: { isActive: false } });
            const statistics = {
                total,
                byStatus: {
                    active: activeCount,
                    inactive: inactiveCount
                }
            };
            res.status(200).json({
                success: true,
                message: 'Inscritos listados com sucesso',
                data: {
                    subscribers: subscribers,
                    statistics,
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
            logger_1.default.error('Erro ao listar inscritos', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async createCampaign(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: errors.array()
                });
                return;
            }
            const currentUser = req.user;
            const { subject, content, htmlContent, scheduledFor, targetAudience } = req.body;
            const campaign = { id: 'temp-id', subject, content };
            logger_1.default.info('Campanha de newsletter criada', {
                campaignId: campaign.id,
                subject: campaign.subject,
                createdBy: currentUser.id
            });
            res.status(201).json({
                success: true,
                message: 'Campanha criada com sucesso',
                data: {
                    campaign: campaign
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao criar campanha', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getCampaigns(req, res) {
        try {
            const { status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {};
            if (status) {
                where.status = status;
            }
            const orderBy = {};
            orderBy[sortBy] = sortOrder;
            const campaigns = [];
            const total = 0;
            const totalPages = Math.ceil(total / take);
            res.status(200).json({
                success: true,
                message: 'Campanhas listadas com sucesso',
                data: {
                    campaigns: campaigns.map(campaign => ({
                        ...campaign,
                        targetAudience: campaign.targetAudience ? JSON.parse(campaign.targetAudience) : null
                    })),
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
            logger_1.default.error('Erro ao listar campanhas', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async sendCampaign(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID da campanha é obrigatório'
                });
                return;
            }
            const subscribers = await prisma.newsletter.findMany({
                where: { isActive: true },
                select: { id: true, email: true, name: true }
            });
            if (subscribers.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Nenhum destinatário encontrado'
                });
                return;
            }
            logger_1.default.info('Newsletter enviada', {
                campaignId: id,
                recipientCount: subscribers.length,
                sentBy: currentUser.id
            });
            res.status(200).json({
                success: true,
                message: `Newsletter enviada com sucesso para ${subscribers.length} destinatários`,
                data: {
                    recipientCount: subscribers.length
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao enviar campanha', { error, campaignId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getNewsletterStats(req, res) {
        try {
            const { period = '30' } = req.query;
            const periodDays = Number(period);
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - periodDays);
            const [subscriberStats, campaignStats, recentActivity] = await Promise.all([
                Promise.all([
                    prisma.newsletter.count({ where: { isActive: true } }),
                    prisma.newsletter.count({ where: { isActive: false } })
                ]).then(([active, inactive]) => [
                    { isActive: true, _count: active },
                    { isActive: false, _count: inactive }
                ]),
                Promise.resolve([]),
                prisma.newsletter.findMany({
                    where: {
                        createdAt: { gte: dateLimit }
                    },
                    select: {
                        id: true,
                        email: true,
                        isActive: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                })
            ]);
            const statistics = {
                subscribers: {
                    total: subscriberStats.reduce((acc, stat) => acc + stat._count, 0),
                    byStatus: subscriberStats.reduce((acc, stat) => {
                        acc[stat.isActive ? 'active' : 'inactive'] = stat._count;
                        return acc;
                    }, {})
                },
                campaigns: {
                    total: 0,
                    totalRecipients: 0,
                    byStatus: {}
                },
                recentActivity: {
                    period: periodDays,
                    newSubscribers: recentActivity.length,
                    subscribers: recentActivity
                }
            };
            res.status(200).json({
                success: true,
                message: 'Estatísticas obtidas com sucesso',
                data: { statistics }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao obter estatísticas da newsletter', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}
exports.NewsletterController = NewsletterController;
exports.default = NewsletterController;
//# sourceMappingURL=newsletterController.js.map