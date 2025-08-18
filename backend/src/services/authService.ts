import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Interfaces para tipos de dados
export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Serviço responsável pela autenticação e gerenciamento de tokens JWT
 */
export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  /**
   * Gera um par de tokens (access e refresh) para o usuário
   */
  static generateTokens(payload: UserPayload): TokenPair {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets não configurados');
    }

    const accessToken = jwt.sign(
      { userId: payload.id, email: payload.email, role: payload.role },
      jwtSecret,
      { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: payload.id, email: payload.email, role: payload.role },
      jwtRefreshSecret,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verifica e decodifica um refresh token
   */
  static verifyRefreshToken(token: string): UserPayload {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!jwtRefreshSecret) {
      throw new Error('JWT refresh secret não configurado');
    }

    try {
      const decoded = jwt.verify(token, jwtRefreshSecret) as any;
      return {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  /**
   * Verifica e decodifica um access token
   */
  static verifyAccessToken(token: string): UserPayload {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT secret não configurado');
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      return {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      throw new Error('Access token inválido');
    }
  }

  /**
   * Cria hash da senha
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compara senha com hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Valida formato do email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida força da senha
   */
  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
    }

    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'A senha deve conter pelo menos um número' };
    }

    return { isValid: true };
  }

  /**
   * Registra um novo usuário
   */
  static async register(data: RegisterData) {
    const { name, email, password, role = 'USER' } = data;

    // Validações
    if (!name || !email || !password) {
      throw new Error('Nome, email e senha são obrigatórios');
    }

    if (!this.validateEmail(email)) {
      throw new Error('Formato de email inválido');
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message!);
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Usuário já existe com este email');
    }

    // Criar usuário
    const hashedPassword = await this.hashPassword(password);
    
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
    const tokens = this.generateTokens({
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

    return { user, tokens };
  }

  /**
   * Realiza login do usuário
   */
  static async login(data: LoginData) {
    const { email, password } = data;

    // Validações
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new Error('Conta desativada');
    }

    // Verificar senha
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar tokens
    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    // Log da ação
    logger.info('Login realizado', {
      userId: user.id,
      email: user.email
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      tokens
    };
  }

  /**
   * Renova tokens usando refresh token
   */
  static async refreshTokens(refreshToken: string) {
    try {
      // Verificar refresh token
      const payload = this.verifyRefreshToken(refreshToken);

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: payload.id }
      });

      if (!user || !user.isActive) {
        throw new Error('Usuário não encontrado ou inativo');
      }

      // Gerar novos tokens
      const tokens = this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role
      });

      logger.info('Tokens renovados', { userId: user.id });

      return tokens;
    } catch (error) {
      logger.error('Erro ao renovar tokens', { error });
      throw new Error('Refresh token inválido');
    }
  }

  /**
   * Busca usuário por ID
   */
  static async getUserById(id: string) {
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
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Altera senha do usuário
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Validar nova senha
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message!);
    }

    // Atualizar senha
    const hashedNewPassword = await this.hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    logger.info('Senha alterada', { userId });
  }
}