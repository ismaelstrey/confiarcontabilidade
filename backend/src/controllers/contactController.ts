import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Interface para dados de contato
interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Interface para filtros de busca
interface ContactFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'subject';
  sortOrder?: 'asc' | 'desc';
}

// Interface para resposta de contato
interface ContactReplyData {
  message: string;
}

/**
 * Controller responsável pelo gerenciamento de contatos
 */
export class ContactController {
  /**
   * Cria um novo contato (formulário público)
   */
  static async createContact(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, subject, message }: ContactData = req.body;

      // Validações básicas
      if (!name || !email || !subject || !message) {
        res.status(400).json({
          success: false,
          message: 'Nome, email, assunto e mensagem são obrigatórios'
        });
        return;
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
        return;
      }

      // Validar tamanho da mensagem
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

      // Validar telefone se fornecido
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

      // Verificar rate limiting (máximo 3 contatos por email por hora)
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

      // Criar contato
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

      // Log da ação
      logger.info('Novo contato recebido', {
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
    } catch (error) {
      logger.error('Erro ao criar contato', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor. Tente novamente mais tarde.'
      });
    }
  }

  /**
   * Lista todos os contatos com paginação e filtros (admin)
   */
  static async getContacts(req: Request, res: Response): Promise<void> {
    try {
      const {
        search,
        status,
        dateFrom,
        dateTo,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      }: ContactFilters = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Construir filtros
      const where: any = {};

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

      // Definir ordenação
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Buscar contatos
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

      // Estatísticas
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
    } catch (error) {
      logger.error('Erro ao listar contatos', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca um contato por ID (admin)
   */
  static async getContactById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Removido markAsRead pois não existe no modelo

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

      // Funcionalidade de marcar como lido removida pois não existe no modelo

      res.status(200).json({
        success: true,
        message: 'Contato encontrado',
        data: { contact }
      });
    } catch (error) {
      logger.error('Erro ao buscar contato', { error, contactId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Marca um contato como lido (admin)
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

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

      // Log da ação
      logger.info('Contato marcado como lido', {
        contactId: id,
        readBy: currentUser.id
      });

      res.status(200).json({
        success: true,
        message: 'Contato marcado como lido'
      });
    } catch (error) {
      logger.error('Erro ao marcar contato como lido', { error, contactId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Marca múltiplos contatos como lidos (admin)
   */
  static async markMultipleAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { contactIds }: { contactIds: string[] } = req.body;
      const currentUser = (req as any).user;

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

      // Log da ação
      logger.info('Múltiplos contatos marcados como lidos', {
        count: result.count,
        readBy: currentUser.id
      });

      res.status(200).json({
        success: true,
        message: `${result.count} contatos marcados como lidos`,
        data: { updatedCount: result.count }
      });
    } catch (error) {
      logger.error('Erro ao marcar múltiplos contatos como lidos', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Responde a um contato (admin)
   */
  static async replyToContact(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { message }: ContactReplyData = req.body;
      const currentUser = (req as any).user;

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

      // Atualizar contato com resposta
      const updatedContact = await prisma.contact.update({
        where: { id },
        data: {
          status: 'RESOLVED'
        }
      });

      // Log da ação
      logger.info('Resposta enviada para contato', {
        contactId: id,
        repliedBy: currentUser.id,
        recipientEmail: contact.email
      });

      // TODO: Implementar envio de email real aqui
      // await emailService.sendReply({
      //   to: contact.email,
      //   message: message,
      //   originalMessage: contact.message
      // });

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
    } catch (error) {
      logger.error('Erro ao responder contato', { error, contactId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Remove um contato (admin)
   */
  static async deleteContact(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

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

      // Log da ação
      logger.info('Contato deletado', {
        contactId: id,
        email: contact.email,
        subject: contact.subject,
        deletedBy: currentUser.id
      });

      res.status(200).json({
        success: true,
        message: 'Contato deletado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao deletar contato', { error, contactId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Remove múltiplos contatos (admin)
   */
  static async deleteMultipleContacts(req: Request, res: Response): Promise<void> {
    try {
      const { contactIds }: { contactIds: string[] } = req.body;
      const currentUser = (req as any).user;

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

      // Log da ação
      logger.info('Múltiplos contatos deletados', {
        count: result.count,
        deletedBy: currentUser.id
      });

      res.status(200).json({
        success: true,
        message: `${result.count} contatos deletados com sucesso`,
        data: { deletedCount: result.count }
      });
    } catch (error) {
      logger.error('Erro ao deletar múltiplos contatos', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém estatísticas de contatos (admin)
   */
  static async getContactStats(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30' } = req.query;
      const periodDays = Number(period);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - periodDays);

      const [totalStats, periodStats, dailyStats] = await Promise.all([
        // Estatísticas gerais
        prisma.contact.groupBy({
          by: ['status'],
          _count: true
        }),
        // Estatísticas do período
        prisma.contact.groupBy({
          by: ['status'],
          where: {
            createdAt: { gte: dateLimit }
          },
          _count: true
        }),
        // Estatísticas diárias dos últimos 7 dias
        prisma.$queryRaw`
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
    } catch (error) {
      logger.error('Erro ao obter estatísticas de contatos', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export default ContactController;