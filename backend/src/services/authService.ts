import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../middlewares/logger';
import { ValidationError } from '../utils/error';

// Interfaces para tipagem
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly JWT_REFRESH_EXPIRES_IN: string;
  private readonly SALT_ROUNDS: number;
  private readonly prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
    this.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    this.prisma = prismaClient || new PrismaClient();
  }

  /**
   * Registra um novo usuário no sistema
   */
  async register(userData: RegisterData): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    try {
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new ValidationError('Formato de email inválido');
      }

      // Validar força da senha
      if (userData.password.length < 8) {
        throw new ValidationError('Senha deve ter pelo menos 8 caracteres');
      }

      // Verificar se o usuário já existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('Usuário já existe com este email');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

      // Criar usuário
      const user = await this.prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role || 'ADMIN'
        }
      });

      // Gerar tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Salvar refresh token no banco
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      logger.info(`Usuário registrado com sucesso: ${user.email}`);

      return {
        user: this.formatUserResponse(user),
        tokens
      };
    } catch (error) {
      logger.error('Erro ao registrar usuário:', error);
      throw error;
    }
  }

  /**
   * Autentica um usuário e retorna tokens
   */
  async login(credentials: LoginCredentials): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    try {
      // Buscar usuário
      const user = await this.prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user) {
        throw new Error('Credenciais inválidas');
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
      }

      // Gerar tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Salvar refresh token no banco
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      logger.info(`Login realizado com sucesso: ${user.email}`);

      return {
        user: this.formatUserResponse(user),
        tokens
      };
    } catch (error) {
      logger.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  /**
   * Renova o access token usando o refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verificar refresh token
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as TokenPayload;

      // Verificar se o refresh token existe no banco
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: payload.userId
        }
      });

      if (!storedToken) {
        throw new Error('Refresh token inválido');
      }

      // Buscar usuário
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Gerar novos tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Remover refresh token antigo e salvar o novo
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id }
      });
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      logger.info(`Token renovado para usuário: ${user.email}`);

      return tokens;
    } catch (error) {
      logger.error('Erro ao renovar token:', error);
      throw error;
    }
  }

  /**
   * Faz logout do usuário removendo o refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });

      logger.info('Logout realizado com sucesso');
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  /**
   * Verifica se um access token é válido
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      return payload;
    } catch (error) {
      logger.error('Token inválido:', error);
      throw new Error('Token inválido');
    }
  }

  /**
   * Busca um usuário pelo ID
   */
  async getUserById(userId: string): Promise<UserResponse | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      return user ? this.formatUserResponse(user) : null;
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  /**
   * Altera a senha do usuário
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Buscar usuário
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Senha atual incorreta');
      }

      // Hash da nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // Atualizar senha
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      // Remover todos os refresh tokens do usuário (forçar novo login)
      await this.prisma.refreshToken.deleteMany({
        where: { userId }
      });

      logger.info(`Senha alterada para usuário: ${user.email}`);
    } catch (error) {
      logger.error('Erro ao alterar senha:', error);
      throw error;
    }
  }

  /**
   * Gera tokens de acesso e refresh
   */
  private generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(
      payload as object,
      this.JWT_SECRET as jwt.Secret,
      {
        expiresIn: this.JWT_EXPIRES_IN
      } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      payload as object,
      this.JWT_REFRESH_SECRET as jwt.Secret,
      {
        expiresIn: this.JWT_REFRESH_EXPIRES_IN
      } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Salva o refresh token no banco de dados
   */
  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt
      }
    });
  }

  /**
   * Formata a resposta do usuário removendo dados sensíveis
   */
  private formatUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}

// Exportar instância singleton
export const authService = new AuthService();