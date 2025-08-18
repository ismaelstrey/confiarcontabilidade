"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class ContactController {
    static async createContact(req, res) {
        try {
            const { name, email, phone, subject, message } = req.body;
            if (!name || !email || !subject || !message) {
                res.status(400).json({
                    success: false,
                    message: 'Nome, email, assunto e mensagem são obrigatórios'
                });
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({
                    success: false,
                    message: 'Formato de email inválido'
                });
                return;
            }
            if (message.length < 10) {
                res.status(400).json({
                    success: false,
                    message: 'A mensagem deve ter pelo menos 10 caracteres'
                });
                return;
            }
            if (message.length > 5000) {
                res.status(400).json({
                    success: false,
                    message: 'A mensagem não pode exceder 5000 caracteres'
                });
                return;
            }
            if (phone) {
                const phoneRegex = /^[\d\s\(\)\+\-\.]{10,}$/;
                if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                    res.status(400).json({
                        success: false,
                        message: 'Formato de telefone inválido'
                    });
                    return;
                }
            }
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const recentContacts = await prisma.contact.count({
                where: {
                    email,
                    createdAt: {
                        gte: oneHourAgo
                    }
                }
            });
            if (recentContacts >= 3) {
                res.status(429).json({
                    success: false,
                    message: 'Muitas mensagens enviadas. Tente novamente em uma hora.'
                });
                return;
            }
            const contact = await prisma.contact.create({
                data: {
                    name: name.trim(),
                    email: email.toLowerCase().trim(),
                    phone: phone?.trim() || null,
                    subject: subject.trim(),
                    message: message.trim(),
                    status: 'PENDING'
                }
            });
            logger_1.default.info('Novo contato recebido', {
                contactId: contact.id,
                email: contact.email,
                subject: contact.subject
            });
            res.status(201).json({
                success: true,
                message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
                data: {
                    id: contact.id,
                    createdAt: contact.createdAt
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao criar contato', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor. Tente novamente mais tarde.'
            });
        }
    }
    static async getContacts(req, res) {
        try {
            const { search, status, dateFrom, dateTo, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { subject: { contains: search, mode: 'insensitive' } },
                    { message: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (status) {
                where.status = status;
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
            const [contacts, total] = await Promise.all([
                prisma.contact.findMany({
                    where,
                    skip,
                    take,
                    orderBy
                }),
                prisma.contact.count({ where })
            ]);
            const totalPages = Math.ceil(total / take);
            const stats = await prisma.contact.groupBy({
                by: ['status'],
                _count: true
            });
            const statistics = {
                total,
                pending: stats.find(s => s.status === 'PENDING')?._count || 0,
                inProgress: stats.find(s => s.status === 'IN_PROGRESS')?._count || 0,
                resolved: stats.find(s => s.status === 'RESOLVED')?._count || 0,
                closed: stats.find(s => s.status === 'CLOSED')?._count || 0
            };
            res.status(200).json({
                success: true,
                message: 'Contatos listados com sucesso',
                data: {
                    contacts,
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
            logger_1.default.error('Erro ao listar contatos', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getContactById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID do contato é obrigatório'
                });
                return;
            }
            const contact = await prisma.contact.findUnique({
                where: { id }
            });
            if (!contact) {
                res.status(404).json({
                    success: false,
                    message: 'Contato não encontrado'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Contato encontrado',
                data: { contact }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao buscar contato', { error, contactId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID do contato é obrigatório'
                });
                return;
            }
            const contact = await prisma.contact.findUnique({
                where: { id }
            });
            if (!contact) {
                res.status(404).json({
                    success: false,
                    message: 'Contato não encontrado'
                });
                return;
            }
            if (contact.status !== 'PENDING') {
                res.status(400).json({
                    success: false,
                    message: 'Contato já foi processado'
                });
                return;
            }
            await prisma.contact.update({
                where: { id },
                data: {
                    status: 'IN_PROGRESS'
                }
            });
            logger_1.default.info('Contato marcado como lido', {
                contactId: id,
                readBy: currentUser.id
            });
            res.status(200).json({
                success: true,
                message: 'Contato marcado como lido'
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao marcar contato como lido', { error, contactId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async markMultipleAsRead(req, res) {
        try {
            const { contactIds } = req.body;
            const currentUser = req.user;
            if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Lista de IDs de contatos é obrigatória'
                });
                return;
            }
            if (contactIds.length > 100) {
                res.status(400).json({
                    success: false,
                    message: 'Máximo de 100 contatos por vez'
                });
                return;
            }
            const result = await prisma.contact.updateMany({
                where: {
                    id: { in: contactIds },
                    status: 'PENDING'
                },
                data: {
                    status: 'IN_PROGRESS'
                }
            });
            logger_1.default.info('Múltiplos contatos marcados como lidos', {
                count: result.count,
                readBy: currentUser.id
            });
            res.status(200).json({
                success: true,
                message: `${result.count} contatos marcados como lidos`,
                data: { updatedCount: result.count }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao marcar múltiplos contatos como lidos', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async replyToContact(req, res) {
        try {
            const { id } = req.params;
            const { message } = req.body;
            const currentUser = req.user;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID do contato é obrigatório'
                });
                return;
            }
            if (!message) {
                res.status(400).json({
                    success: false,
                    message: 'Mensagem de resposta é obrigatória'
                });
                return;
            }
            if (message.length < 10) {
                res.status(400).json({
                    success: false,
                    message: 'A resposta deve ter pelo menos 10 caracteres'
                });
                return;
            }
            const contact = await prisma.contact.findUnique({
                where: { id }
            });
            if (!contact) {
                res.status(404).json({
                    success: false,
                    message: 'Contato não encontrado'
                });
                return;
            }
            const updatedContact = await prisma.contact.update({
                where: { id },
                data: {
                    status: 'RESOLVED'
                }
            });
            logger_1.default.info('Resposta enviada para contato', {
                contactId: id,
                repliedBy: currentUser.id,
                recipientEmail: contact.email
            });
            res.status(200).json({
                success: true,
                message: 'Resposta enviada com sucesso',
                data: {
                    contact: {
                        id: updatedContact.id,
                        status: updatedContact.status
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao responder contato', { error, contactId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async deleteContact(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID do contato é obrigatório'
                });
                return;
            }
            const contact = await prisma.contact.findUnique({
                where: { id }
            });
            if (!contact) {
                res.status(404).json({
                    success: false,
                    message: 'Contato não encontrado'
                });
                return;
            }
            await prisma.contact.delete({
                where: { id }
            });
            logger_1.default.info('Contato deletado', {
                contactId: id,
                email: contact.email,
                subject: contact.subject,
                deletedBy: currentUser.id
            });
            res.status(200).json({
                success: true,
                message: 'Contato deletado com sucesso'
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao deletar contato', { error, contactId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async deleteMultipleContacts(req, res) {
        try {
            const { contactIds } = req.body;
            const currentUser = req.user;
            if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Lista de IDs de contatos é obrigatória'
                });
                return;
            }
            if (contactIds.length > 100) {
                res.status(400).json({
                    success: false,
                    message: 'Máximo de 100 contatos por vez'
                });
                return;
            }
            const result = await prisma.contact.deleteMany({
                where: {
                    id: { in: contactIds }
                }
            });
            logger_1.default.info('Múltiplos contatos deletados', {
                count: result.count,
                deletedBy: currentUser.id
            });
            res.status(200).json({
                success: true,
                message: `${result.count} contatos deletados com sucesso`,
                data: { deletedCount: result.count }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao deletar múltiplos contatos', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getContactStats(req, res) {
        try {
            const { period = '30' } = req.query;
            const periodDays = Number(period);
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - periodDays);
            const [totalStats, periodStats, dailyStats] = await Promise.all([
                prisma.contact.groupBy({
                    by: ['status'],
                    _count: true
                }),
                prisma.contact.groupBy({
                    by: ['status'],
                    where: {
                        createdAt: { gte: dateLimit }
                    },
                    _count: true
                }),
                prisma.$queryRaw `
          SELECT 
            DATE(createdAt) as date,
            COUNT(*) as count
          FROM Contact 
          WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY DATE(createdAt)
          ORDER BY date DESC
        `
            ]);
            const total = await prisma.contact.count();
            const totalInPeriod = await prisma.contact.count({
                where: { createdAt: { gte: dateLimit } }
            });
            const statistics = {
                total: {
                    all: total,
                    pending: totalStats.find(s => s.status === 'PENDING')?._count || 0,
                    inProgress: totalStats.find(s => s.status === 'IN_PROGRESS')?._count || 0,
                    resolved: totalStats.find(s => s.status === 'RESOLVED')?._count || 0,
                    closed: totalStats.find(s => s.status === 'CLOSED')?._count || 0
                },
                period: {
                    days: periodDays,
                    all: totalInPeriod,
                    pending: periodStats.find(s => s.status === 'PENDING')?._count || 0,
                    inProgress: periodStats.find(s => s.status === 'IN_PROGRESS')?._count || 0,
                    resolved: periodStats.find(s => s.status === 'RESOLVED')?._count || 0,
                    closed: periodStats.find(s => s.status === 'CLOSED')?._count || 0
                },
                daily: dailyStats
            };
            res.status(200).json({
                success: true,
                message: 'Estatísticas obtidas com sucesso',
                data: { statistics }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao obter estatísticas de contatos', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}
exports.ContactController = ContactController;
exports.default = ContactController;
//# sourceMappingURL=contactController.js.map