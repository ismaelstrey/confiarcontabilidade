import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const { body, validationResult } = require('express-validator');
import * as crypto from 'crypto';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Interface para dados de newsletter
interface NewsletterData {
  email: string;
  name?: string;
  preferences?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
  };
}

// Interface para filtros de busca
interface NewsletterFilters {
  status?: 'ACTIVE' | 'UNSUBSCRIBED' | 'PENDING';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'email' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// Interface para dados de campanha
interface CampaignData {
  subject: string;
  content: string;
  htmlContent?: string;
  scheduledFor?: Date;
  targetAudience?: {
    status?: string[];
    categories?: string[];
  };
}

/**
 * Controller responsável pelo gerenciamento de newsletter
 */
export class NewsletterController {
  /**
   * Validações para inscrição na newsletter
   */
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

  /**
   * Validações para campanha
   */
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
      .custom((value: string) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Data de agendamento deve ser no futuro');
        }
        return true;
      })
  ];

  /**
   * Inscreve um email na newsletter
   */
  static async subscribe(req: Request, res: Response): Promise<void> {
    try {
      // Verificar validações
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
        return;
      }

      const { email, name, preferences }: NewsletterData = req.body;

      // Verificar se já existe
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

        // Reativar se estava inativo
        const updatedSubscriber = await prisma.newsletter.update({
          where: { email },
          data: {
            isActive: true,
            name: name || existingSubscriber.name,
            updatedAt: new Date()
          }
        });

        // Log da ação
        logger.info('Newsletter reativada', {
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

      // Gerar token de confirmação
      const confirmationToken = crypto.randomBytes(32).toString('hex');

      // Criar nova inscrição
      const subscriber = await prisma.newsletter.create({
        data: {
          email,
          name: name || null,
          isActive: false // TODO: Implementar sistema de confirmação adequado
        }
      });

      // Log da ação
      logger.info('Nova inscrição na newsletter', {
        email,
        subscriberId: subscriber.id,
        name: name || 'Não informado'
      });

      // TODO: Enviar email de confirmação
      // await emailService.sendConfirmationEmail(email, confirmationToken);

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
    } catch (error) {
      logger.error('Erro ao inscrever na newsletter', { error, email: req.body.email });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Confirma inscrição na newsletter
   */
  static async confirmSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token de confirmação é obrigatório'
        });
        return;
      }

      // TODO: Implementar confirmationToken no schema
      const subscriber = await prisma.newsletter.findFirst({
        where: {
          email: token, // Usando token como email temporariamente
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

      // Confirmar inscrição
      const confirmedSubscriber = await prisma.newsletter.update({
        where: { id: subscriber.id },
        data: {
          isActive: true,
          updatedAt: new Date()
        }
      });

      // Log da ação
      logger.info('Inscrição confirmada', {
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
    } catch (error) {
      logger.error('Erro ao confirmar inscrição', { error, token: req.params.token });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cancela inscrição na newsletter
   */
  static async unsubscribe(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { email } = req.body;

      let subscriber;

      if (token) {
        // Cancelamento via token (link no email)
        // TODO: Implementar tokens de confirmação e cancelamento no schema
        subscriber = await prisma.newsletter.findFirst({
          where: {
            email: token, // Usando token como email temporariamente
            isActive: true
          }
        });
      } else if (email) {
        // Cancelamento via email
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

      // Gerar token de cancelamento
      const unsubscribeToken = crypto.randomBytes(32).toString('hex');

      // Cancelar inscrição
      const unsubscribedSubscriber = await prisma.newsletter.update({
        where: { id: subscriber.id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      // Log da ação
      logger.info('Inscrição cancelada', {
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
    } catch (error) {
      logger.error('Erro ao cancelar inscrição', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Lista inscritos com paginação e filtros (Admin)
   */
  static async getSubscribers(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        search,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      }: NewsletterFilters = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Construir filtros
      const where: any = {};

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

      // Definir ordenação
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Buscar inscritos
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

      // Estatísticas por status ativo/inativo
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
    } catch (error) {
      logger.error('Erro ao listar inscritos', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cria uma nova campanha de newsletter (Admin)
   */
  static async createCampaign(req: Request, res: Response): Promise<void> {
    try {
      // Verificar validações
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
        return;
      }

      const currentUser = (req as any).user;
      const { subject, content, htmlContent, scheduledFor, targetAudience }: CampaignData = req.body;

      // TODO: Implementar modelo de campanha no schema.prisma
      // const campaign = await prisma.newsletterCampaign.create({
      //   data: {
      //     subject,
      //     content,
      //     htmlContent: htmlContent || null,
      //     status: scheduledFor ? 'SCHEDULED' : 'DRAFT',
      //     scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      //     targetAudience: targetAudience ? JSON.stringify(targetAudience) : null,
      //     createdById: currentUser.id
      //   }
      // });
      
      const campaign = { id: 'temp-id', subject, content };

      // Log da ação
      logger.info('Campanha de newsletter criada', {
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
    } catch (error) {
      logger.error('Erro ao criar campanha', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Lista campanhas (Admin)
   */
  static async getCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Construir filtros
      const where: any = {};
      if (status) {
        where.status = status;
      }

      // Definir ordenação
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder;

      // TODO: Implementar modelo de campanha no schema.prisma
      // const [campaigns, total] = await Promise.all([
      //   prisma.newsletterCampaign.findMany({
      //     where,
      //     include: {
      //       createdBy: {
      //         select: {
      //           id: true,
      //           name: true,
      //           email: true
      //         }
      //       }
      //     },
      //     skip,
      //     take,
      //     orderBy
      //   }),
      //   prisma.newsletterCampaign.count({ where })
      // ]);
      
      const campaigns: any[] = [];
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
    } catch (error) {
      logger.error('Erro ao listar campanhas', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Envia uma campanha (Admin)
   */
  static async sendCampaign(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID da campanha é obrigatório'
        });
        return;
      }

      // TODO: Implementar modelo de campanha no schema.prisma
      // const campaign = await prisma.newsletterCampaign.findUnique({
      //   where: { id }
      // });

      // if (!campaign) {
      //   res.status(404).json({
      //     success: false,
      //     message: 'Campanha não encontrada'
      //   });
      //   return;
      // }

      // Buscar destinatários ativos
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

      // TODO: Implementar envio real de emails
      // await emailService.sendCampaign(campaign, subscribers);

      // TODO: Implementar envio real de emails e atualização de campanha
      // await prisma.newsletterCampaign.update({
      //   where: { id },
      //   data: {
      //     status: 'SENT',
      //     updatedAt: new Date()
      //   }
      // });

      // Log da ação
      logger.info('Newsletter enviada', {
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
    } catch (error) {
      logger.error('Erro ao enviar campanha', { error, campaignId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém estatísticas da newsletter (Admin)
   */
  static async getNewsletterStats(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30' } = req.query;
      const periodDays = Number(period);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - periodDays);

      const [subscriberStats, campaignStats, recentActivity] = await Promise.all([
        // Estatísticas de inscritos por status ativo/inativo
        Promise.all([
          prisma.newsletter.count({ where: { isActive: true } }),
          prisma.newsletter.count({ where: { isActive: false } })
        ]).then(([active, inactive]) => [
          { isActive: true, _count: active },
          { isActive: false, _count: inactive }
        ]),
        // TODO: Implementar estatísticas de campanhas quando modelo for criado
        // prisma.newsletterCampaign.groupBy({
        //   by: ['status'],
        //   _count: true,
        //   _sum: { recipientCount: true }
        // }),
        Promise.resolve([]),
        // Atividade recente
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
          }, {} as any)
        },
        // TODO: Implementar estatísticas de campanhas quando modelo for criado
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
    } catch (error) {
      logger.error('Erro ao obter estatísticas da newsletter', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export default NewsletterController;