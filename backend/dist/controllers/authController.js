"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middlewares/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, role = 'USER' } = req.body;
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
                    isActive: true
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
            const tokens = (0, auth_1.generateTokens)({
                id: user.id,
                email: user.email,
                role: user.role
            });
            logger_1.default.info('Novo usuário registrado', {
                userId: user.id,
                email: user.email,
                role: user.role
            });
            res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso',
                data: {
                    user,
                    tokens
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao registrar usuário', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email e senha são obrigatórios'
                });
                return;
            }
            const user = await prisma.user.findUnique({
                where: { email }
            });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
                return;
            }
            if (!user.isActive) {
                res.status(401).json({
                    success: false,
                    message: 'Conta desativada. Entre em contato com o administrador'
                });
                return;
            }
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
                return;
            }
            const tokens = (0, auth_1.generateTokens)({
                id: user.id,
                email: user.email,
                role: user.role
            });
            logger_1.default.info('Usuário fez login', {
                userId: user.id,
                email: user.email
            });
            res.status(200).json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        isActive: user.isActive
                    },
                    tokens
                }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao fazer login', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token é obrigatório'
                });
                return;
            }
            const decoded = (0, auth_1.verifyRefreshToken)(refreshToken);
            if (!decoded) {
                res.status(401).json({
                    success: false,
                    message: 'Refresh token inválido ou expirado'
                });
                return;
            }
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });
            if (!user || !user.isActive) {
                res.status(401).json({
                    success: false,
                    message: 'Usuário não encontrado ou inativo'
                });
                return;
            }
            const tokens = (0, auth_1.generateTokens)({
                id: user.id,
                email: user.email,
                role: user.role
            });
            res.status(200).json({
                success: true,
                message: 'Token renovado com sucesso',
                data: { tokens }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao renovar token', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async logout(req, res) {
        try {
            const userId = req.user?.id;
            if (userId) {
                logger_1.default.info('Usuário fez logout', { userId });
            }
            res.status(200).json({
                success: true,
                message: 'Logout realizado com sucesso'
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao fazer logout', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async verifyToken(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Token inválido'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Token válido',
                data: { user }
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao verificar token', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({
                    success: false,
                    message: 'Email é obrigatório'
                });
                return;
            }
            const user = await prisma.user.findUnique({
                where: { email }
            });
            if (user && user.isActive) {
                logger_1.default.info('Solicitação de reset de senha', {
                    userId: user.id,
                    email: user.email
                });
            }
            res.status(200).json({
                success: true,
                message: 'Se o email existir, você receberá instruções para reset da senha'
            });
        }
        catch (error) {
            logger_1.default.error('Erro ao solicitar reset de senha', { error });
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}
exports.AuthController = AuthController;
exports.default = AuthController;
//# sourceMappingURL=authController.js.map