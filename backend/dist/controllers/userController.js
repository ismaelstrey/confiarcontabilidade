"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class UserController {
    static async getUsers(req, res) {
        try {
            const { search, role, isActive, page = 1, limit = 10 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (role) {
                where.role = role;
            }
            if (isActive !== undefined) {
                where.isActive = typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive);
            }
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true
                    },
                    skip,
                    take,
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.user.count({ where })
            ]);
            const totalPages = Math.ceil(total / take);
            res.status(200).json({
                success: true,
                message: 'Usuários listados com sucesso',
                data: {
                    users,
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
            logger_1.default.error('Erro ao listar usuários', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID do usuário é obrigatório'
                });
                return;
            }
            const user = await prisma.user.findUnique({
                where: { id },
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
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Usuário encontrado',
                data: { user }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao buscar usuário', { error, userId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async createUser(req, res) {
        try {
            const { name, email, password, role = 'USER', isActive = true } = req.body;
            if (!name || !email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Nome, email e senha são obrigatórios'
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
            if (password.length < 6) {
                res.status(400).json({
                    success: false,
                    message: 'A senha deve ter pelo menos 6 caracteres'
                });
                return;
            }
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: 'Usuário já existe com este email'
                });
                return;
            }
            const saltRounds = 12;
            const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role,
                    isActive
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true
                }
            });
            const currentUser = req.user;
            logger_1.default.info('Usuário criado', {
                newUserId: user.id,
                newUserEmail: user.email,
                createdBy: currentUser?.id
            });
            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso',
                data: { user }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao criar usuário', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { name, email, password, role, isActive } = req.body;
            const currentUser = req.user;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID do usuário é obrigatório'
                });
                return;
            }
            const existingUser = await prisma.user.findUnique({
                where: { id }
            });
            if (!existingUser) {
                res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
                return;
            }
            if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
                res.status(403).json({
                    success: false,
                    message: 'Sem permissão para editar este usuário'
                });
                return;
            }
            const updateData = {};
            if (name)
                updateData.name = name;
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    res.status(400).json({
                        success: false,
                        message: 'Formato de email inválido'
                    });
                    return;
                }
                const emailInUse = await prisma.user.findFirst({
                    where: {
                        email,
                        id: { not: id }
                    }
                });
                if (emailInUse) {
                    res.status(409).json({
                        success: false,
                        message: 'Email já está em uso por outro usuário'
                    });
                    return;
                }
                updateData.email = email;
            }
            if (password) {
                if (password.length < 6) {
                    res.status(400).json({
                        success: false,
                        message: 'A senha deve ter pelo menos 6 caracteres'
                    });
                    return;
                }
                const saltRounds = 12;
                updateData.password = await bcrypt_1.default.hash(password, saltRounds);
            }
            if (currentUser.role === 'ADMIN') {
                if (role !== undefined)
                    updateData.role = role;
                if (isActive !== undefined)
                    updateData.isActive = isActive;
            }
            updateData.updatedAt = new Date();
            const updatedUser = await prisma.user.update({
                where: { id },
                data: updateData,
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
            logger_1.default.info('Usuário atualizado', {
                userId: id,
                updatedBy: currentUser.id,
                changes: Object.keys(updateData)
            });
            res.status(200).json({
                success: true,
                message: 'Usuário atualizado com sucesso',
                data: { user: updatedUser }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao atualizar usuário', { error, userId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID do usuário é obrigatório'
                });
                return;
            }
            const existingUser = await prisma.user.findUnique({
                where: { id }
            });
            if (!existingUser) {
                res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
                return;
            }
            if (currentUser.id === id) {
                res.status(400).json({
                    success: false,
                    message: 'Não é possível deletar sua própria conta'
                });
                return;
            }
            await prisma.user.update({
                where: { id },
                data: {
                    isActive: false,
                    updatedAt: new Date()
                }
            });
            logger_1.default.info('Usuário desativado', {
                userId: id,
                deletedBy: currentUser.id
            });
            res.status(200).json({
                success: true,
                message: 'Usuário desativado com sucesso'
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao deletar usuário', { error, userId: req.params.id });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async getProfile(req, res) {
        try {
            const currentUser = req.user;
            const user = await prisma.user.findUnique({
                where: { id: currentUser.id },
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
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Perfil obtido com sucesso',
                data: { user }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao obter perfil', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async updateProfile(req, res) {
        try {
            const currentUser = req.user;
            const { name, email, password } = req.body;
            const updateData = {};
            if (name)
                updateData.name = name;
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    res.status(400).json({
                        success: false,
                        message: 'Formato de email inválido'
                    });
                    return;
                }
                const emailInUse = await prisma.user.findFirst({
                    where: {
                        email,
                        id: { not: currentUser.id }
                    }
                });
                if (emailInUse) {
                    res.status(409).json({
                        success: false,
                        message: 'Email já está em uso'
                    });
                    return;
                }
                updateData.email = email;
            }
            if (password) {
                if (password.length < 6) {
                    res.status(400).json({
                        success: false,
                        message: 'A senha deve ter pelo menos 6 caracteres'
                    });
                    return;
                }
                const saltRounds = 12;
                updateData.password = await bcrypt_1.default.hash(password, saltRounds);
            }
            updateData.updatedAt = new Date();
            const updatedUser = await prisma.user.update({
                where: { id: currentUser.id },
                data: updateData,
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
            logger_1.default.info('Perfil atualizado', {
                userId: currentUser.id,
                changes: Object.keys(updateData)
            });
            res.status(200).json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                data: { user: updatedUser }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao atualizar perfil', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}
exports.UserController = UserController;
exports.default = UserController;
//# sourceMappingURL=userController.js.map