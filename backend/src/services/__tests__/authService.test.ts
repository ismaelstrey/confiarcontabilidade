import { AuthService } from '../authService';
import { PrismaClient } from '@prisma/client';
import { AuthenticationError, ValidationError } from '../../utils/error';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger';

// Mock das dependências
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../utils/logger');
jest.mock('@prisma/client');

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Mock do PrismaClient
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

(PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma as any);

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    authService = new AuthService(mockPrisma as any);
  });

  describe('register', () => {
    const validUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'USER' as const,
    };

    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'USER' as const,
      };

      const hashedPassword = 'hashedpassword';
      const createdUser = {
        id: '1',
        ...userData,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockPrisma.user.create.mockResolvedValue(createdUser as any);
      mockJwt.sign.mockReturnValue('access_token' as never);
      mockPrisma.refreshToken.create.mockResolvedValue({} as any);
      
      // Act
      const result = await authService.register(userData);
      
      // Assert
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(userData.email);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
        },
      });
    });

    it('should throw an error if user already exists', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'Password123!',
        role: 'USER' as const,
      };

      const existingUser = {
        id: '1',
        email: userData.email,
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser as any);
      
      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Usuário já existe');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid email format', async () => {
      const invalidUserData = {
        ...validUserData,
        email: 'invalid-email',
      };

      await expect(authService.register(invalidUserData))
        .rejects
        .toThrow(ValidationError);
    });

    it('should throw ValidationError for weak password', async () => {
      const weakPasswordData = {
        ...validUserData,
        password: '123',
      };

      await expect(authService.register(weakPasswordData))
        .rejects
        .toThrow(ValidationError);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const existingUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'USER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser as any);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue('access_token' as never);
      mockPrisma.refreshToken.create.mockResolvedValue({} as any);
      
      // Act
      const result = await authService.login(credentials);
      
      // Assert
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(credentials.email);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: credentials.email },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(credentials.password, existingUser.password);
    });

    it('should throw an error with invalid email', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow('Credenciais inválidas');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: credentials.email },
      });
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw an error with invalid password', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser as any);
      mockBcrypt.compare.mockResolvedValue(false as never);
      
      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow('Credenciais inválidas');
      expect(mockBcrypt.compare).toHaveBeenCalledWith(credentials.password, existingUser.password);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      const refreshTokenValue = 'valid_refresh_token';
      const tokenPayload = {
        userId: '1',
        email: 'test@example.com',
        role: 'USER',
      };
      
      const storedToken = {
        id: 'token_id',
        token: refreshTokenValue,
        userId: '1',
      };
      
      const user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
        isActive: true,
        tokenVersion: 1,
      };
      
      mockJwt.verify.mockReturnValue(tokenPayload as never);
      mockPrisma.refreshToken.findFirst.mockResolvedValue(storedToken as any);
      mockPrisma.user.findUnique.mockResolvedValue(user as any);
      mockJwt.sign.mockReturnValue('new_access_token' as never);
      mockPrisma.refreshToken.delete.mockResolvedValue({} as any);
      mockPrisma.refreshToken.create.mockResolvedValue({} as any);
      
      // Act
      const result = await authService.refreshToken(refreshTokenValue);
      
      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockJwt.verify).toHaveBeenCalledWith(refreshTokenValue, expect.any(String));
      expect(mockPrisma.refreshToken.findFirst).toHaveBeenCalledWith({
        where: {
          token: refreshTokenValue,
          userId: tokenPayload.userId
        }
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: tokenPayload.userId },
      });
    });

    it('should throw error for invalid refresh token', async () => {
      // Arrange
      const invalidToken = 'invalid_token';
      
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Act & Assert
      await expect(authService.refreshToken(invalidToken))
        .rejects
        .toThrow();
      expect(mockJwt.verify).toHaveBeenCalledWith(invalidToken, expect.any(String));
    });

    it('should throw error for user not found', async () => {
      // Arrange
      const refreshTokenValue = 'valid_refresh_token';
      const tokenPayload = { userId: '999', tokenVersion: 1 };
      
      mockJwt.verify.mockReturnValue(tokenPayload as never);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      // Act & Assert
      await expect(authService.refreshToken(refreshTokenValue))
        .rejects
        .toThrow();
    });
  });
});