import { PrismaClient, User, Prisma } from '@prisma/client';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        // Excluir senha da consulta
        password: false,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // Métodos de profile removidos - modelo Profile não existe no schema atual

  // Métodos de reset token removidos - campos resetToken e resetTokenExpiry não existem no schema atual
  
  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });
  }

  async countUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  async countActiveUsers(): Promise<number> {
    // Como não temos campo isActive, retornamos contagem total de usuários
    return this.prisma.user.count();
  }

  async countUsersByRole(): Promise<Record<string, number>> {
    const users = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    return users.reduce((acc, user) => {
      acc[user.role] = user._count.role;
      return acc;
    }, {} as Record<string, number>);
  }
}