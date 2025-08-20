import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, authorize } from '../middlewares/auth';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const uploads = new Hono();

// Configurações de upload
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
};

// Schemas de validação
const querySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)).optional(),
  type: z.enum(['image', 'document', 'spreadsheet']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'filename', 'size']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Função para gerar nome único do arquivo
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${name}-${timestamp}-${random}${ext}`;
}

// Função para determinar o tipo do arquivo
function getFileType(mimeType: string): string {
  if (ALLOWED_TYPES.image.includes(mimeType)) return 'image';
  if (ALLOWED_TYPES.document.includes(mimeType)) return 'document';
  if (ALLOWED_TYPES.spreadsheet.includes(mimeType)) return 'spreadsheet';
  return 'other';
}

// Função para validar arquivo
function validateFile(file: File): { valid: boolean; error?: string } {
  // Verificar tamanho
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`
    };
  }

  // Verificar tipo
  const allAllowedTypes = [...ALLOWED_TYPES.image, ...ALLOWED_TYPES.document, ...ALLOWED_TYPES.spreadsheet];
  if (!allAllowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não permitido'
    };
  }

  return { valid: true };
}

// Garantir que o diretório de upload existe
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * POST /uploads
 * Upload de arquivo
 */
uploads.post('/',
  authMiddleware,
  asyncHandler(async (c) => {
    const user = c.get('user');
    
    // Obter arquivo do form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw createError('Nenhum arquivo foi enviado', 400, 'NO_FILE_PROVIDED');
    }

    // Validar arquivo
    const validation = validateFile(file);
    if (!validation.valid) {
      throw createError(validation.error!, 400, 'INVALID_FILE');
    }

    // Garantir que o diretório existe
    await ensureUploadDir();

    // Gerar nome único
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);
    const relativePath = path.join('uploads', uniqueFilename).replace(/\\/g, '/');

    try {
      // Salvar arquivo
      const buffer = await file.arrayBuffer();
      await writeFile(filePath, new Uint8Array(buffer));

      // Salvar informações no banco
      const upload = await prisma.upload.create({
        data: {
          filename: uniqueFilename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          path: relativePath,
          type: getFileType(file.type),
          uploadedById: user.id
        },
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          size: true,
          path: true,
          type: true,
          createdAt: true,
          uploadedBy: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return c.json({
        success: true,
        message: 'Arquivo enviado com sucesso',
        data: upload
      }, 201);
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
      throw createError('Erro interno do servidor ao salvar arquivo', 500, 'UPLOAD_ERROR');
    }
  })
);

/**
 * GET /uploads
 * Listar uploads
 */
uploads.get('/',
  authMiddleware,
  zValidator('query', querySchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { page = 1, limit = 10, type, search, sortBy, sortOrder } = c.req.valid('query');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    // Se não for admin/moderador, mostrar apenas próprios uploads
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      where.uploadedById = user.id;
    }
    
    if (type) where.type = type;
    
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar uploads
    const [uploadsData, total] = await Promise.all([
      prisma.upload.findMany({
        where,
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          size: true,
          path: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          uploadedBy: {
            select: {
              id: true,
              name: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.upload.count({ where })
    ]);

    return c.json({
      success: true,
      data: {
        uploads: uploadsData,
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
 * GET /uploads/:id
 * Obter upload por ID
 */
uploads.get('/:id',
  authMiddleware,
  asyncHandler(async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    const upload = await prisma.upload.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        path: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        uploadedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!upload) {
      throw createError('Upload não encontrado', 404, 'UPLOAD_NOT_FOUND');
    }

    // Verificar permissões
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR' && user.id !== upload.uploadedBy.id) {
      throw createError('Sem permissão para acessar este arquivo', 403, 'FORBIDDEN');
    }

    return c.json({
      success: true,
      data: upload
    });
  })
);

/**
 * DELETE /uploads/:id
 * Deletar upload
 */
uploads.delete('/:id',
  authMiddleware,
  asyncHandler(async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    const upload = await prisma.upload.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        path: true,
        uploadedById: true
      }
    });

    if (!upload) {
      throw createError('Upload não encontrado', 404, 'UPLOAD_NOT_FOUND');
    }

    // Verificar permissões
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR' && user.id !== upload.uploadedById) {
      throw createError('Sem permissão para deletar este arquivo', 403, 'FORBIDDEN');
    }

    try {
      // Deletar arquivo físico
      const filePath = path.join(process.cwd(), upload.path);
      if (existsSync(filePath)) {
        await Bun.file(filePath).exists().then(exists => {
          if (exists) {
            // Bun não tem unlink direto, usar fs
            require('fs').unlinkSync(filePath);
          }
        });
      }

      // Deletar registro do banco
      await prisma.upload.delete({
        where: { id }
      });

      return c.json({
        success: true,
        message: 'Arquivo deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw createError('Erro interno do servidor ao deletar arquivo', 500, 'DELETE_ERROR');
    }
  })
);

/**
 * GET /uploads/serve/:filename
 * Servir arquivo estático
 */
uploads.get('/serve/:filename',
  asyncHandler(async (c) => {
    const filename = c.req.param('filename');
    
    // Verificar se arquivo existe no banco
    const upload = await prisma.upload.findFirst({
      where: { filename },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        path: true
      }
    });

    if (!upload) {
      throw createError('Arquivo não encontrado', 404, 'FILE_NOT_FOUND');
    }

    const filePath = path.join(process.cwd(), upload.path);
    
    try {
      const file = Bun.file(filePath);
      const exists = await file.exists();
      
      if (!exists) {
        throw createError('Arquivo físico não encontrado', 404, 'PHYSICAL_FILE_NOT_FOUND');
      }

      // Definir headers apropriados
      c.header('Content-Type', upload.mimeType);
      c.header('Content-Disposition', `inline; filename="${upload.originalName}"`);
      c.header('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
      
      return c.body(await file.arrayBuffer());
    } catch (error) {
      console.error('Erro ao servir arquivo:', error);
      throw createError('Erro interno do servidor ao servir arquivo', 500, 'SERVE_ERROR');
    }
  })
);

/**
 * GET /uploads/stats
 * Obter estatísticas de uploads (apenas admins/moderadores)
 */
uploads.get('/stats',
  authMiddleware,
  authorize('ADMIN', 'MODERATOR'),
  asyncHandler(async (c) => {
    const [totalUploads, totalSize, typeStats, recentUploads] = await Promise.all([
      // Total de uploads
      prisma.upload.count(),
      // Tamanho total
      prisma.upload.aggregate({
        _sum: {
          size: true
        }
      }),
      // Estatísticas por tipo
      prisma.upload.groupBy({
        by: ['type'],
        _count: {
          id: true
        },
        _sum: {
          size: true
        }
      }),
      // Uploads recentes (últimos 7 dias)
      prisma.upload.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Formatar estatísticas por tipo
    const typeData = typeStats.reduce((acc, stat) => {
      acc[stat.type] = {
        count: stat._count.id,
        size: stat._sum.size || 0
      };
      return acc;
    }, {} as Record<string, { count: number; size: number }>);

    return c.json({
      success: true,
      data: {
        total: totalUploads,
        totalSize: totalSize._sum.size || 0,
        recent: recentUploads,
        byType: {
          image: typeData.image || { count: 0, size: 0 },
          document: typeData.document || { count: 0, size: 0 },
          spreadsheet: typeData.spreadsheet || { count: 0, size: 0 },
          other: typeData.other || { count: 0, size: 0 }
        }
      }
    });
  })
);

export default uploads;