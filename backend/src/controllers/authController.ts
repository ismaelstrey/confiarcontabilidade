import { Request, Response } from 'express';
import { authService, RegisterData, LoginCredentials } from '../services/authService';
import { prisma } from '../lib/prisma';
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
      const registerData: RegisterData = req.body;
      
      const result = await authService.register(registerData);

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result
      });
    } catch (error: any) {
      logger.error('Erro ao registrar usuário', { error: error.message });
      
      // Determinar status code baseado no tipo de erro
      let statusCode = 500;
      if (error.message.includes('já existe')) {
        statusCode = 409;
      } else if (error.message.includes('obrigatórios') || 
                 error.message.includes('inválido') || 
                 error.message.includes('senha deve')) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Realiza login do usuário
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginCredentials = req.body;
      
      const result = await authService.login(loginData);

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: result.user,
          token: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken
        }
      });
    } catch (error: any) {
      logger.error('Erro ao fazer login', { error: error.message });
      
      // Determinar status code baseado no tipo de erro
      let statusCode = 500;
      if (error.message.includes('não encontrado') || 
          error.message.includes('inválidas')) {
        statusCode = 401;
      } else if (error.message.includes('obrigatórios') || 
                 error.message.includes('inválido')) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza tokens usando refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenData = req.body;
      
      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens atualizados com sucesso',
        data: {
          token: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error: any) {
      logger.error('Erro ao atualizar tokens', { error: error.message });
      
      // Determinar status code baseado no tipo de erro
      let statusCode = 500;
      if (error.message.includes('obrigatório') || 
          error.message.includes('inválido') ||
          error.message.includes('expirado')) {
        statusCode = 401;
      }

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
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
      if (user) {
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

  /**
   * Obtém informações do usuário logado
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Token de acesso inválido'
        });
        return;
      }

      const user = await authService.getUserById(userId);

      res.status(200).json({
        success: true,
        message: 'Perfil obtido com sucesso',
        data: { user }
      });
    } catch (error: any) {
      logger.error('Erro ao obter perfil', { error: error.message });
      
      let statusCode = 500;
      if (error.message.includes('não encontrado')) {
        statusCode = 404;
      }

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Altera senha do usuário
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Token de acesso inválido'
        });
        return;
      }

      await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error: any) {
      logger.error('Erro ao alterar senha', { error: error.message });
      
      let statusCode = 500;
      if (error.message.includes('obrigatórios') || 
          error.message.includes('senha deve')) {
        statusCode = 400;
      } else if (error.message.includes('atual incorreta')) {
        statusCode = 401;
      } else if (error.message.includes('não encontrado')) {
        statusCode = 404;
      }

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
}

export default AuthController;