import { Request, Response } from 'express';
import { AuthService, RegisterData, LoginData } from '../services/authService';
import logger from '../utils/logger';

// Interface para refresh token
interface RefreshTokenData {
  refreshToken: string;
}

/**
 * Controller responsável pela autenticação de usuários
 */
export class AuthController {
  /**
   * Registra um novo usuário no sistema
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role = 'USER' }: RegisterData = req.body;

      // Validações básicas
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Nome, email e senha são obrigatórios'
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

      // Validar força da senha
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'A senha deve ter pelo menos 6 caracteres'
        });
        return;
      }

      // Verificar se o usuário já existe
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

      // Hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role as any,
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

      // Gerar tokens
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Log da ação
      logger.info('Novo usuário registrado', {
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
    } catch (error) {
      logger.error('Erro ao registrar usuário', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Realiza login do usuário
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginData = req.body;

      // Validações básicas
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
        return;
      }

      // Buscar usuário
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

      // Verificar se o usuário está ativo
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Conta desativada. Entre em contato com o administrador'
        });
        return;
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
        return;
      }

      // Gerar tokens
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // TODO: Implementar campo lastLoginAt no schema do Prisma se necessário
      // await prisma.user.update({
      //   where: { id: user.id },
      //   data: { lastLoginAt: new Date() }
      // });

      // Log da ação
      logger.info('Usuário fez login', {
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
    } catch (error) {
      logger.error('Erro ao fazer login', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Renova o token de acesso usando refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenData = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token é obrigatório'
        });
        return;
      }

      // Verificar refresh token
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        res.status(401).json({
          success: false,
          message: 'Refresh token inválido ou expirado'
        });
        return;
      }

      // Buscar usuário
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

      // Gerar novos tokens
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role
      });

      res.status(200).json({
        success: true,
        message: 'Token renovado com sucesso',
        data: { tokens }
      });
    } catch (error) {
      logger.error('Erro ao renovar token', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Realiza logout do usuário
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Em uma implementação mais robusta, você poderia:
      // 1. Adicionar o token a uma blacklist
      // 2. Invalidar refresh tokens no banco
      // 3. Limpar sessões ativas
      
      const userId = (req as any).user?.id;
      
      if (userId) {
        logger.info('Usuário fez logout', { userId });
      }

      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao fazer logout', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verifica se o token é válido
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
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
    } catch (error) {
      logger.error('Erro ao verificar token', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Solicita reset de senha
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
        return;
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // Por segurança, sempre retornamos sucesso mesmo se o email não existir
      if (user && user.isActive) {
        // Aqui você implementaria o envio de email com token de reset
        // Por enquanto, apenas logamos a ação
        logger.info('Solicitação de reset de senha', {
          userId: user.id,
          email: user.email
        });
      }

      res.status(200).json({
        success: true,
        message: 'Se o email existir, você receberá instruções para reset da senha'
      });
    } catch (error) {
      logger.error('Erro ao solicitar reset de senha', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export default AuthController;