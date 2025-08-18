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
exports.UploadController = void 0;
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const crypto = __importStar(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
const storage = multer_1.default.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        try {
            await fs.access(uploadDir);
        }
        catch {
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
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
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
    }
    else {
        cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5
    }
});
class UploadController {
    static uploadSingle = upload.single('file');
    static uploadMultiple = upload.array('files', 5);
    static getFileType(mimetype) {
        if (mimetype.startsWith('image/')) {
            return 'IMAGE';
        }
        if (mimetype.includes('pdf') ||
            mimetype.includes('document') ||
            mimetype.includes('spreadsheet') ||
            mimetype.includes('text')) {
            return 'DOCUMENT';
        }
        return 'OTHER';
    }
    static async processImage(filePath, mimetype) {
        try {
            if (!mimetype.startsWith('image/') || mimetype === 'image/svg+xml') {
                return null;
            }
            const image = (0, sharp_1.default)(filePath);
            const metadata = await image.metadata();
            const sizes = [
                { name: 'thumbnail', width: 150, height: 150 },
                { name: 'small', width: 300, height: 300 },
                { name: 'medium', width: 600, height: 600 },
                { name: 'large', width: 1200, height: 1200 }
            ];
            const versions = {};
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
        }
        catch (error) {
            logger_1.default.error('Erro ao processar imagem', { error, filePath });
            return null;
        }
    }
    static async uploadFile(req, res) {
        try {
            const currentUser = req.user;
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
            let metadata = null;
            if (fileType === 'IMAGE') {
                metadata = await UploadController.processImage(file.path, file.mimetype);
            }
            const uploadedFile = await prisma.upload.create({
                data: {
                    originalName: file.originalname,
                    filename: file.filename,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                    url: fileUrl,
                    type: fileType,
                    userId: currentUser.id
                }
            });
            logger_1.default.info('Arquivo enviado', {
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
                        createdAt: uploadedFile.createdAt
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao fazer upload de arquivo', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async uploadMultipleFiles(req, res) {
        try {
            const currentUser = req.user;
            const files = req.files;
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
                let metadata = null;
                if (fileType === 'IMAGE') {
                    metadata = await UploadController.processImage(file.path, file.mimetype);
                }
                const uploadedFile = await prisma.upload.create({
                    data: {
                        originalName: file.originalname,
                        filename: file.filename,
                        mimetype: file.mimetype,
                        size: file.size,
                        path: file.path,
                        url: fileUrl,
                        type: fileType,
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
                    createdAt: uploadedFile.createdAt
                });
            }
            logger_1.default.info('Múltiplos arquivos enviados', {
                count: uploadedFiles.length,
                uploadedBy: currentUser.id,
                files: uploadedFiles.map(f => ({ id: f.id, name: f.originalName }))
            });
            res.status(201).json({
                success: true,
                message: `${uploadedFiles.length} arquivos enviados com sucesso`,
                data: { files: uploadedFiles }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao fazer upload de múltiplos arquivos', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getFiles(req, res) {
        try {
            const { type, mimetype, search, uploadedBy, dateFrom, dateTo, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {};
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
            const orderBy = {};
            orderBy[sortBy] = sortOrder;
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
                }, {})
            };
            res.status(200).json({
                success: true,
                message: 'Arquivos listados com sucesso',
                data: {
                    files: files.map(file => ({
                        ...file,
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
        }
        catch (error) {
            logger_1.default.error('Erro ao listar arquivos', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getFileById(req, res) {
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
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao buscar arquivo', { error, fileId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async deleteFile(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
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
            if (currentUser.role !== 'ADMIN' && file.userId !== currentUser.id) {
                res.status(403).json({
                    success: false,
                    message: 'Sem permissão para deletar este arquivo'
                });
                return;
            }
            try {
                await fs.unlink(file.path);
            }
            catch (error) {
                logger_1.default.warn('Erro ao remover arquivo físico', { path: file.path, error });
            }
            await prisma.upload.delete({
                where: { id }
            });
            logger_1.default.info('Arquivo deletado', {
                fileId: id,
                filename: file.filename,
                originalName: file.originalName,
                deletedBy: currentUser.id
            });
            res.status(200).json({
                success: true,
                message: 'Arquivo deletado com sucesso'
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao deletar arquivo', { error, fileId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async deleteMultipleFiles(req, res) {
        try {
            const { fileIds } = req.body;
            const currentUser = req.user;
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
            const files = await prisma.upload.findMany({
                where: {
                    id: { in: fileIds },
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
            for (const file of files) {
                try {
                    await fs.unlink(file.path);
                }
                catch (error) {
                    logger_1.default.warn('Erro ao remover arquivo físico', { path: file.path, error });
                }
            }
            const result = await prisma.upload.deleteMany({
                where: {
                    id: { in: files.map(f => f.id) }
                }
            });
            logger_1.default.info('Múltiplos arquivos deletados', {
                count: result.count,
                deletedBy: currentUser.id,
                files: files.map(f => ({ id: f.id, name: f.originalName }))
            });
            res.status(200).json({
                success: true,
                message: `${result.count} arquivos deletados com sucesso`,
                data: { deletedCount: result.count }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao deletar múltiplos arquivos', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getFileStats(req, res) {
        try {
            const { period = '30' } = req.query;
            const periodDays = Number(period);
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - periodDays);
            const [totalStats, periodStats, sizeStats] = await Promise.all([
                prisma.upload.groupBy({
                    by: ['type'],
                    _count: true,
                    _sum: { size: true }
                }),
                prisma.upload.groupBy({
                    by: ['type'],
                    where: {
                        createdAt: { gte: dateLimit }
                    },
                    _count: true,
                    _sum: { size: true }
                }),
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
                    }, {})
                },
                period: {
                    days: periodDays,
                    byType: periodStats.reduce((acc, stat) => {
                        acc[stat.type] = {
                            count: stat._count,
                            size: stat._sum.size || 0
                        };
                        return acc;
                    }, {})
                }
            };
            res.status(200).json({
                success: true,
                message: 'Estatísticas obtidas com sucesso',
                data: { statistics }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao obter estatísticas de arquivos', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}
exports.UploadController = UploadController;
exports.default = UploadController;
//# sourceMappingURL=uploadController.js.map