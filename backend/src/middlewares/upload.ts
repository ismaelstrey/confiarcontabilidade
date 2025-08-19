import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Configurações de upload
const UPLOAD_CONFIG = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocumentTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    uploadDir: path.join(process.cwd(), 'uploads'),
    tempDir: path.join(process.cwd(), 'uploads', 'temp')
};

// Criar diretórios se não existirem
const createUploadDirs = () => {
    [UPLOAD_CONFIG.uploadDir, UPLOAD_CONFIG.tempDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Configuração do storage do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_CONFIG.tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// Filtro de arquivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
        ...UPLOAD_CONFIG.allowedImageTypes,
        ...UPLOAD_CONFIG.allowedDocumentTypes
    ];

    if (allowedTypes.includes(file.mimetype)) {
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
        fileSize: UPLOAD_CONFIG.maxFileSize,
        files: 5 // Máximo 5 arquivos por upload
    }
});

// Interface para arquivo processado
export interface ProcessedFile {
    fieldname: string;
    originalname: string;
    filename: string;
    path: string;
    size: number;
    mimetype: string;
    url: string;
    thumbnailUrl?: string;
}

// Middleware para processar imagens
export const processImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files) {
            return next();
        }

        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        const processedFiles: ProcessedFile[] = [];

        for (const file of files) {
            const isImage = UPLOAD_CONFIG.allowedImageTypes.includes(file.mimetype);

            if (isImage) {
                // Processar imagem com sharp
                const processedPath = path.join(UPLOAD_CONFIG.uploadDir, 'images', file.filename);
                const thumbnailPath = path.join(UPLOAD_CONFIG.uploadDir, 'thumbnails', `thumb_${file.filename}`);

                // Criar diretórios se não existirem
                [path.dirname(processedPath), path.dirname(thumbnailPath)].forEach(dir => {
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                });

                // Otimizar imagem principal
                await sharp(file.path)
                    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 85 })
                    .toFile(processedPath);

                // Criar thumbnail
                await sharp(file.path)
                    .resize(300, 300, { fit: 'cover' })
                    .jpeg({ quality: 80 })
                    .toFile(thumbnailPath);

                // Remover arquivo temporário
                fs.unlinkSync(file.path);

                processedFiles.push({
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    filename: file.filename,
                    path: processedPath,
                    size: fs.statSync(processedPath).size,
                    mimetype: 'image/jpeg',
                    url: `/uploads/images/${file.filename}`,
                    thumbnailUrl: `/uploads/thumbnails/thumb_${file.filename}`
                });
            } else {
                // Mover documento para pasta final
                const finalPath = path.join(UPLOAD_CONFIG.uploadDir, 'documents', file.filename);
                const documentsDir = path.dirname(finalPath);

                if (!fs.existsSync(documentsDir)) {
                    fs.mkdirSync(documentsDir, { recursive: true });
                }

                fs.renameSync(file.path, finalPath);

                processedFiles.push({
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    filename: file.filename,
                    path: finalPath,
                    size: file.size,
                    mimetype: file.mimetype,
                    url: `/uploads/documents/${file.filename}`
                });
            }
        }

        // Adicionar arquivos processados ao request
        req.processedFiles = processedFiles;

        logger.info('Arquivos processados com sucesso', {
            count: processedFiles.length,
            files: processedFiles.map(f => ({ name: f.originalname, size: f.size }))
        });

        next();
    } catch (error) {
        logger.error('Erro ao processar arquivos', { error });

        // Limpar arquivos temporários em caso de erro
        if (req.files) {
            const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
            files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao processar arquivos',
            error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
    }
};

// Middleware para validar upload
export const validateUpload = (req: Request, res: Response, next: NextFunction) => {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({
            success: false,
            message: 'Nenhum arquivo foi enviado',
            error: 'Nenhum arquivo foi enviado'
        });
    }

    return next();
};

// Middleware para limpar arquivos temporários
export const cleanupTempFiles = (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        if (req.files) {
            const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
            files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
    });
    next();
};

// Exportar configurações de upload
export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 5);
export const uploadFields = upload.fields([
    { name: 'images', maxCount: 3 },
    { name: 'documents', maxCount: 2 }
]);

export { UPLOAD_CONFIG };

// Estender o tipo Request para incluir processedFiles
declare global {
    namespace Express {
        interface Request {
            processedFiles?: ProcessedFile[];
        }
    }
}