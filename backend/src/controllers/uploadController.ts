import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import sharp from 'sharp';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Interface para dados de arquivo
interface FileData {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  type: 'IMAGE' | 'DOCUMENT' | 'OTHER';
  // metadata removido pois não existe no modelo Upload
}

// Interface para filtros de busca
interface FileFilters {
  type?: string;
  mimetype?: string;
  search?: string;
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'originalName' | 'size';
  sortOrder?: 'asc' | 'desc';
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Filtros de arquivo
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos permitidos
  const allowedMimes = [
    // Imagens
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
  }
};

// Configuração do multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Máximo 5 arquivos por vez
  }
});

/**
 * Controller responsável pelo gerenciamento de uploads
 */
export class UploadController {
  /**
   * Middleware do multer para upload único
   */
  static uploadSingle = upload.single('file');

  /**
   * Middleware do multer para múltiplos uploads
   */
  static uploadMultiple = upload.array('files', 5);

  /**
   * Determina o tipo de arquivo baseado no mimetype
   */
  private static getFileType(mimetype: string): 'IMAGE' | 'DOCUMENT' | 'OTHER' {
    if (mimetype.startsWith('image/')) {
      return 'IMAGE';
    }
    if (
      mimetype.includes('pdf') ||
      mimetype.includes('document') ||
      mimetype.includes('spreadsheet') ||
      mimetype.includes('text')
    ) {
      return 'DOCUMENT';
    }
    return 'OTHER';
  }

  /**
   * Processa imagem (redimensionamento e otimização)
   */
  private static async processImage(filePath: string, mimetype: string): Promise<any> {
    try {
      if (!mimetype.startsWith('image/') || mimetype === 'image/svg+xml') {
        return null;
      }

      const image = sharp(filePath);
      const metadata = await image.metadata();

      // Criar versões redimensionadas
      const sizes = [
        { name: 'thumbnail', width: 150, height: 150 },
        { name: 'small', width: 300, height: 300 },
        { name: 'medium', width: 600, height: 600 },
        { name: 'large', width: 1200, height: 1200 }
      ];

      const versions: any = {};
      const dir = path.dirname(filePath);
      const name = path.parse(filePath).name;

      for (const size of sizes) {
        if (metadata.width && metadata.width > size.width) {
          const resizedPath = path.join(dir, `${name}_${size.name}.webp`);
          await image
            .resize(size.width, size.height, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toFile(resizedPath);

          versions[size.name] = {
            path: resizedPath,
            url: `/uploads/${path.basename(resizedPath)}`,
            width: size.width,
            height: size.height
          };
        }
      }

      return {
        original: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        },
        versions
      };
    } catch (error) {
      logger.error('Erro ao processar imagem', { error, filePath });
      return null;
    }
  }

  /**
   * Upload de arquivo único
   */
  static async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = (req as any).user;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
        return;
      }

      const fileType = UploadController.getFileType(file.mimetype);
      const fileUrl = `/uploads/${file.filename}`;

      // Processar imagem se necessário
      let metadata = null;
      if (fileType === 'IMAGE') {
        metadata = await UploadController.processImage(file.path, file.mimetype);
      }

      // Salvar informações no banco
      const uploadedFile = await prisma.upload.create({
        data: {
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: fileUrl,
          type: fileType,
          // Campo metadata removido pois não existe no modelo Upload
          userId: currentUser.id
        }
      });

      // Log da ação
      logger.info('Arquivo enviado', {
        fileId: uploadedFile.id,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        type: fileType,
        uploadedBy: currentUser.id
      });

      res.status(201).json({
        success: true,
        message: 'Arquivo enviado com sucesso',
        data: {
          file: {
            id: uploadedFile.id,
            originalName: uploadedFile.originalName,
            filename: uploadedFile.filename,
            url: uploadedFile.url,
            type: uploadedFile.type,
            size: uploadedFile.size,
            mimetype: uploadedFile.mimetype,
            // metadata removido pois não existe no modelo Upload
            createdAt: uploadedFile.createdAt
          }
        }
      });
    } catch (error) {
      logger.error('Erro ao fazer upload de arquivo', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Upload de múltiplos arquivos
   */
  static async uploadMultipleFiles(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = (req as any).user;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
        return;
      }

      const uploadedFiles = [];

      for (const file of files) {
        const fileType = UploadController.getFileType(file.mimetype);
        const fileUrl = `/uploads/${file.filename}`;

        // Processar imagem se necessário
        let metadata = null;
        if (fileType === 'IMAGE') {
          metadata = await UploadController.processImage(file.path, file.mimetype);
        }

        // Salvar informações no banco
        const uploadedFile = await prisma.upload.create({
          data: {
            originalName: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            url: fileUrl,
            type: fileType,
            // Campo metadata removido pois não existe no modelo Upload
            userId: currentUser.id
          }
        });

        uploadedFiles.push({
          id: uploadedFile.id,
          originalName: uploadedFile.originalName,
          filename: uploadedFile.filename,
          url: uploadedFile.url,
          type: uploadedFile.type,
          size: uploadedFile.size,
          mimetype: uploadedFile.mimetype,
          // metadata removido pois não existe no modelo Upload
          createdAt: uploadedFile.createdAt
        });
      }

      // Log da ação
      logger.info('Múltiplos arquivos enviados', {
        count: uploadedFiles.length,
        uploadedBy: currentUser.id,
        files: uploadedFiles.map(f => ({ id: f.id, name: f.originalName }))
      });

      res.status(201).json({
        success: true,
        message: `${uploadedFiles.length} arquivos enviados com sucesso`,
        data: { files: uploadedFiles }
      });
    } catch (error) {
      logger.error('Erro ao fazer upload de múltiplos arquivos', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Lista arquivos com paginação e filtros
   */
  static async getFiles(req: Request, res: Response): Promise<void> {
    try {
      const {
        type,
        mimetype,
        search,
        uploadedBy,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      }: FileFilters = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Construir filtros
      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (mimetype) {
        where.mimetype = mimetype;
      }

      if (search) {
        where.OR = [
          { originalName: { contains: search, mode: 'insensitive' } },
          { filename: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (uploadedBy) {
        where.userId = uploadedBy;
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

      // Buscar arquivos
      const [files, total] = await Promise.all([
        prisma.upload.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          skip,
          take,
          orderBy
        }),
        prisma.upload.count({ where })
      ]);

      const totalPages = Math.ceil(total / take);

      // Estatísticas
      const stats = await prisma.upload.groupBy({
        by: ['type'],
        _count: true,
        _sum: { size: true }
      });

      const statistics = {
        total,
        totalSize: stats.reduce((acc, stat) => acc + (stat._sum.size || 0), 0),
        byType: stats.reduce((acc, stat) => {
          acc[stat.type] = {
            count: stat._count,
            size: stat._sum.size || 0
          };
          return acc;
        }, {} as any)
      };

      res.status(200).json({
        success: true,
        message: 'Arquivos listados com sucesso',
        data: {
          files: files.map(file => ({
            ...file,
            // Campo metadata removido pois não existe no modelo Upload
          })),
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
      logger.error('Erro ao listar arquivos', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca arquivo por ID
   */
  static async getFileById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do arquivo é obrigatório'
        });
        return;
      }

      const file = await prisma.upload.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!file) {
        res.status(404).json({
          success: false,
          message: 'Arquivo não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Arquivo encontrado',
        data: {
          file: {
            ...file,
            // Campo metadata removido pois não existe no modelo Upload
          }
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar arquivo', { error, fileId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Remove um arquivo
   */
  static async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do arquivo é obrigatório'
        });
        return;
      }

      const file = await prisma.upload.findUnique({
        where: { id }
      });

      if (!file) {
        res.status(404).json({
          success: false,
          message: 'Arquivo não encontrado'
        });
        return;
      }

      // Verificar permissões (proprietário ou admin)
      if (currentUser.role !== 'ADMIN' && file.userId !== currentUser.id) {
        res.status(403).json({
          success: false,
          message: 'Sem permissão para deletar este arquivo'
        });
        return;
      }

      // Remover arquivo físico
      try {
        await fs.unlink(file.path);
        
        // TODO: Implementar remoção de versões redimensionadas quando o modelo Upload for atualizado para suportar metadata
        // Código removido pois o campo metadata não existe no modelo Upload
      } catch (error) {
        logger.warn('Erro ao remover arquivo físico', { path: file.path, error });
      }

      // Remover registro do banco
      await prisma.upload.delete({
        where: { id }
      });

      // Log da ação
      logger.info('Arquivo deletado', {
        fileId: id,
        filename: file.filename,
        originalName: file.originalName,
        deletedBy: currentUser.id
      });

      res.status(200).json({
        success: true,
        message: 'Arquivo deletado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao deletar arquivo', { error, fileId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Remove múltiplos arquivos
   */
  static async deleteMultipleFiles(req: Request, res: Response): Promise<void> {
    try {
      const { fileIds }: { fileIds: string[] } = req.body;
      const currentUser = (req as any).user;

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Lista de IDs de arquivos é obrigatória'
        });
        return;
      }

      if (fileIds.length > 50) {
        res.status(400).json({
          success: false,
          message: 'Máximo de 50 arquivos por vez'
        });
        return;
      }

      // Buscar arquivos
      const files = await prisma.upload.findMany({
        where: {
          id: { in: fileIds },
          // Apenas admin pode deletar arquivos de outros usuários
          ...(currentUser.role !== 'ADMIN' && { uploadedById: currentUser.id })
        }
      });

      if (files.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Nenhum arquivo encontrado ou sem permissão'
        });
        return;
      }

      // Remover arquivos físicos
      for (const file of files) {
        try {
          await fs.unlink(file.path);
          
          // TODO: Implementar remoção de versões redimensionadas quando necessário
        } catch (error) {
          logger.warn('Erro ao remover arquivo físico', { path: file.path, error });
        }
      }

      // Remover registros do banco
      const result = await prisma.upload.deleteMany({
        where: {
          id: { in: files.map(f => f.id) }
        }
      });

      // Log da ação
      logger.info('Múltiplos arquivos deletados', {
        count: result.count,
        deletedBy: currentUser.id,
        files: files.map(f => ({ id: f.id, name: f.originalName }))
      });

      res.status(200).json({
        success: true,
        message: `${result.count} arquivos deletados com sucesso`,
        data: { deletedCount: result.count }
      });
    } catch (error) {
      logger.error('Erro ao deletar múltiplos arquivos', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém estatísticas de arquivos
   */
  static async getFileStats(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30' } = req.query;
      const periodDays = Number(period);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - periodDays);

      const [totalStats, periodStats, sizeStats] = await Promise.all([
        // Estatísticas gerais
        prisma.upload.groupBy({
          by: ['type'],
          _count: true,
          _sum: { size: true }
        }),
        // Estatísticas do período
        prisma.upload.groupBy({
          by: ['type'],
          where: {
            createdAt: { gte: dateLimit }
          },
          _count: true,
          _sum: { size: true }
        }),
        // Estatísticas de tamanho
        prisma.upload.aggregate({
          _sum: { size: true },
          _avg: { size: true },
          _count: true
        })
      ]);

      const statistics = {
        total: {
          files: sizeStats._count,
          size: sizeStats._sum.size || 0,
          averageSize: sizeStats._avg.size || 0,
          byType: totalStats.reduce((acc, stat) => {
            acc[stat.type] = {
              count: stat._count,
              size: stat._sum.size || 0
            };
            return acc;
          }, {} as any)
        },
        period: {
          days: periodDays,
          byType: periodStats.reduce((acc, stat) => {
            acc[stat.type] = {
              count: stat._count,
              size: stat._sum.size || 0
            };
            return acc;
          }, {} as any)
        }
      };

      res.status(200).json({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: { statistics }
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de arquivos', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export default UploadController;