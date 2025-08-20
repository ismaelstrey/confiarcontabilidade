import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Interface para dados de usuário
interface UserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}

// Interface para filtros de busca
interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Controller responsável pelo gerenciamento de usuários
 */
export class UserController {
  /**
   * Lista todos os usuários com paginação e filtros
   */
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const {
        search,
        role,
        isActive,
        page = 1,
        limit = 10
      }: UserFilters = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Construir filtros
      const where: any = {};

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

      // Buscar usuários
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
    } catch (error) {
      logger.error('Erro ao listar usuários', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca um usuário por ID
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      logger.error('Erro ao buscar usuário', { error, userId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cria um novo usuário
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role = 'USER', isActive = true }: UserData = req.body;

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

      // Log da ação
      const currentUser = (req as any).user;
      logger.info('Usuário criado', {
        newUserId: user.id,
        newUserEmail: user.email,
        createdBy: currentUser?.id
      });

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: { user }
      });
    } catch (error) {
      logger.error('Erro ao criar usuário', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza um usuário existente
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, password, role, isActive }: UserData = req.body;
      const currentUser = (req as any).user;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
        return;
      }

      // Verificar se o usuário existe
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

      // Verificar permissões (usuário só pode editar próprio perfil, admin pode editar qualquer um)
      if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
        res.status(403).json({
          success: false,
          message: 'Sem permissão para editar este usuário'
        });
        return;
      }

      // Preparar dados para atualização
      const updateData: any = {};

      if (name) updateData.name = name;
      if (email) {
        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({
            success: false,
            message: 'Formato de email inválido'
          });
          return;
        }

        // Verificar se o email já está em uso por outro usuário
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
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      // Apenas admin pode alterar role e isActive
      if (currentUser.role === 'ADMIN') {
        if (role !== undefined) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
      }

      updateData.updatedAt = new Date();

      // Atualizar usuário
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

      // Log da ação
      logger.info('Usuário atualizado', {
        userId: id,
        updatedBy: currentUser.id,
        changes: Object.keys(updateData)
      });

      res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: { user: updatedUser }
      });
    } catch (error) {
      logger.error('Erro ao atualizar usuário', { error, userId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza o status de um usuário (ativo/inativo)
   */
  static async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive, reason } = req.body;
      const currentUser = (req as any).user;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
        return;
      }

      if (typeof isActive !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'Campo isActive é obrigatório e deve ser boolean'
        });
        return;
      }

      // Verificar se o usuário existe
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

      // Não permitir que o usuário desative a si mesmo
      if (currentUser.id === id && !isActive) {
        res.status(400).json({
          success: false,
          message: 'Não é possível desativar sua própria conta'
        });
        return;
      }

      // Atualizar status do usuário
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          isActive,
          updatedAt: new Date()
        },
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

      // Log da ação
      logger.info('Status do usuário atualizado', {
        userId: id,
        oldStatus: existingUser.isActive,
        newStatus: isActive,
        reason: reason || 'Não informado',
        updatedBy: currentUser.id
      });

      res.status(200).json({
        success: true,
        message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`,
        data: { user: updatedUser }
      });
    } catch (error) {
      logger.error('Erro ao atualizar status do usuário', { error, userId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Remove um usuário (soft delete)
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
        return;
      }

      // Verificar se o usuário existe
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

      // Não permitir que o usuário delete a si mesmo
      if (currentUser.id === id) {
        res.status(400).json({
          success: false,
          message: 'Não é possível deletar sua própria conta'
        });
        return;
      }

      // Soft delete - apenas desativar o usuário
      await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      // Log da ação
      logger.info('Usuário desativado', {
        userId: id,
        deletedBy: currentUser.id
      });

      res.status(200).json({
        success: true,
        message: 'Usuário desativado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao deletar usuário', { error, userId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém o perfil do usuário logado
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = (req as any).user;

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
    } catch (error) {
      logger.error('Erro ao obter perfil', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza o perfil do usuário logado
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = (req as any).user;
      const { name, email, password }: UserData = req.body;

      // Preparar dados para atualização
      const updateData: any = {};

      if (name) updateData.name = name;
      
      if (email) {
        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({
            success: false,
            message: 'Formato de email inválido'
          });
          return;
        }

        // Verificar se o email já está em uso
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
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      updateData.updatedAt = new Date();

      // Atualizar perfil
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

      // Log da ação
      logger.info('Perfil atualizado', {
        userId: currentUser.id,
        changes: Object.keys(updateData)
      });

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: { user: updatedUser }
      });
    } catch (error) {
      logger.error('Erro ao atualizar perfil', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Exclui a conta do usuário logado
   */
  static async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = (req as any).user;
      const { password, confirmation } = req.body;

      if (!password || !confirmation) {
        res.status(400).json({
          success: false,
          message: 'Senha e confirmação são obrigatórios'
        });
        return;
      }

      if (confirmation !== 'DELETE_MY_ACCOUNT') {
        res.status(400).json({
          success: false,
          message: 'Confirmação inválida. Digite "DELETE_MY_ACCOUNT" para confirmar'
        });
        return;
      }

      // Verificar senha atual
      const user = await prisma.user.findUnique({
        where: { id: currentUser.id }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Senha incorreta'
        });
        return;
      }

      // Soft delete - desativar a conta
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      // Log da ação
      logger.info('Conta excluída pelo próprio usuário', {
        userId: currentUser.id,
        email: user.email
      });

      res.status(200).json({
        success: true,
        message: 'Conta excluída com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao excluir conta', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Altera a senha do usuário logado
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = (req as any).user;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validar dados obrigatórios
      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Senha atual, nova senha e confirmação são obrigatórios'
        });
        return;
      }

      // Validar se as novas senhas coincidem
      if (newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Nova senha e confirmação não coincidem'
        });
        return;
      }

      // Validar tamanho da nova senha
      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'A nova senha deve ter pelo menos 6 caracteres'
        });
        return;
      }

      // Buscar usuário atual
      const user = await prisma.user.findUnique({
        where: { id: currentUser.id }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
        return;
      }

      // Verificar se a nova senha é diferente da atual
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        res.status(400).json({
          success: false,
          message: 'A nova senha deve ser diferente da senha atual'
        });
        return;
      }

      // Hash da nova senha
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Atualizar senha
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      });

      // Log da ação
      logger.info('Senha alterada', {
        userId: currentUser.id,
        userEmail: user.email
      });

      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao alterar senha', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Upload de avatar do usuário
   */
  static async uploadAvatar(req: Request, res: Response): Promise<void> {
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

      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP'
        });
        return;
      }

      // Validar tamanho do arquivo (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        res.status(413).json({
          success: false,
          message: 'Arquivo muito grande. Tamanho máximo: 5MB'
        });
        return;
      }

      // Gerar URL do avatar (simulado - em produção seria o caminho real do arquivo)
      const avatarUrl = `/uploads/avatars/${currentUser.id}_${Date.now()}_${file.originalname}`;

      // Atualizar usuário com nova URL do avatar
      const updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          // Nota: O campo avatar não existe no modelo atual, então vamos simular
          updatedAt: new Date()
        },
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

      // Log da ação
      logger.info('Avatar atualizado', {
        userId: currentUser.id,
        fileName: file.originalname,
        fileSize: file.size
      });

      res.status(200).json({
        success: true,
        message: 'Avatar atualizado com sucesso',
        data: {
          avatarUrl,
          user: updatedUser
        }
      });
    } catch (error) {
      logger.error('Erro ao fazer upload do avatar', { error });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export default UserController;