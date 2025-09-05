import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, authorize } from '../middlewares/auth';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { rateLimiters } from '../middlewares/advancedRateLimit';

const contacts = new Hono();

// Schemas de validação
const createContactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres')
});

const updateContactSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  response: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional()
});

const querySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)).optional(),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

/**
 * POST /contacts
 * Criar nova mensagem de contato
 */
contacts.post('/',
  rateLimiters.contact,
  zValidator('json', createContactSchema),
  asyncHandler(async (c: any) => {
    const { name, email, phone, subject, message } = c.req.valid('json');

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        status: 'PENDING',
        priority: 'MEDIUM'
      },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        status: true,
        createdAt: true
      }
    });

    return c.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      data: contact
    }, 201);
  })
);

/**
 * GET /contacts
 * Listar mensagens de contato (apenas admins/moderadores)
 */
contacts.get('/',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  zValidator('query', querySchema),
  asyncHandler(async (c: any) => {
    const { page = 1, limit = 10, search, status, priority, sortBy, sortOrder } = c.req.valid('query');
    const skip = (page - 1) * limit;

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

    if (status) where.status = status;
    if (priority) where.priority = priority;

    // Buscar contatos
    const [contactsData, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          status: true,
          priority: true,
          response: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.contact.count({ where })
    ]);

    return c.json({
      success: true,
      data: {
        contacts: contactsData,
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
 * GET /contacts/:id
 * Obter mensagem de contato por ID (apenas admins/moderadores)
 */
contacts.get('/:id',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  asyncHandler(async (c: any) => {
    const id = c.req.param('id');

    const contact = await prisma.contact.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        status: true,
        priority: true,
        response: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!contact) {
      throw createError('Mensagem de contato não encontrada', 404, 'CONTACT_NOT_FOUND');
    }

    return c.json({
      success: true,
      data: contact
    });
  })
);

/**
 * PUT /contacts/:id
 * Atualizar mensagem de contato (apenas admins/moderadores)
 */
contacts.put('/:id',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  zValidator('json', updateContactSchema),
  asyncHandler(async (c: any) => {
    const id = c.req.param('id');
    const updateData = c.req.valid('json');

    // Verificar se contato existe
    const existingContact = await prisma.contact.findUnique({
      where: { id }
    });

    if (!existingContact) {
      throw createError('Mensagem de contato não encontrada', 404, 'CONTACT_NOT_FOUND');
    }

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        status: true,
        priority: true,
        response: true,
        updatedAt: true
      }
    });

    return c.json({
      success: true,
      message: 'Mensagem de contato atualizada com sucesso',
      data: updatedContact
    });
  })
);

/**
 * DELETE /contacts/:id
 * Deletar mensagem de contato (apenas admins)
 */
contacts.delete('/:id',
  authMiddleware,
  authorize('ADMIN'),
  asyncHandler(async (c: any) => {
    const id = c.req.param('id');

    const contact = await prisma.contact.findUnique({
      where: { id }
    });

    if (!contact) {
      throw createError('Mensagem de contato não encontrada', 404, 'CONTACT_NOT_FOUND');
    }

    await prisma.contact.delete({
      where: { id }
    });

    return c.json({
      success: true,
      message: 'Mensagem de contato deletada com sucesso'
    });
  })
);

/**
 * GET /contacts/stats
 * Obter estatísticas das mensagens de contato (apenas admins/moderadores)
 */
contacts.get('/stats',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  asyncHandler(async (c: any) => {
    const [statusStats, priorityStats, totalContacts, recentContacts] = await Promise.all([
      // Estatísticas por status
      prisma.contact.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      // Estatísticas por prioridade
      prisma.contact.groupBy({
        by: ['priority'],
        _count: {
          id: true
        }
      }),
      // Total de contatos
      prisma.contact.count(),
      // Contatos recentes (últimos 7 dias)
      prisma.contact.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Formatar estatísticas por status
    const statusCounts = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Formatar estatísticas por prioridade
    const priorityCounts = priorityStats.reduce((acc, stat) => {
      acc[stat.priority] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    return c.json({
      success: true,
      data: {
        total: totalContacts,
        recent: recentContacts,
        byStatus: {
          pending: statusCounts.PENDING || 0,
          inProgress: statusCounts.IN_PROGRESS || 0,
          resolved: statusCounts.RESOLVED || 0,
          closed: statusCounts.CLOSED || 0
        },
        byPriority: {
          low: priorityCounts.LOW || 0,
          medium: priorityCounts.MEDIUM || 0,
          high: priorityCounts.HIGH || 0,
          urgent: priorityCounts.URGENT || 0
        }
      }
    });
  })
);

export default contacts;