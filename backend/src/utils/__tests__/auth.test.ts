import { hashPassword, comparePassword, generateToken, verifyToken } from '../auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mock do bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock do jsonwebtoken
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variables
    process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
    process.env.JWT_REFRESH_SECRET = 'your-super-secret-refresh-jwt-key-change-this-in-production';
    process.env.BCRYPT_SALT_ROUNDS = '12';
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'test123';
      const hashedPassword = '$2b$10$hashedpassword';
      
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
    });

    it('should throw error if hashing fails', async () => {
      const password = 'test123';
      const error = new Error('Hashing failed');
      
      (mockBcrypt.hash as jest.Mock).mockRejectedValue(error);

      await expect(hashPassword(password)).rejects.toThrow('Hashing failed');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'test123';
      const hashedPassword = '$2b$10$hashedpassword';
      
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await comparePassword(password, hashedPassword);

      expect(result).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return false for non-matching password', async () => {
      const password = 'test123';
      const wrongPassword = 'wrong123';
      const hashedPassword = '$2b$10$hashedpassword';
      
      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await comparePassword(wrongPassword, hashedPassword);

      expect(result).toBe(false);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(wrongPassword, hashedPassword);
    });

    it('should throw error if comparison fails', async () => {
      const password = 'test123';
      const hashedPassword = '$2b$10$hashedpassword';
      const error = new Error('Comparison failed');
      
      (mockBcrypt.compare as jest.Mock).mockRejectedValue(error);

      await expect(comparePassword(password, hashedPassword)).rejects.toThrow('Comparison failed');
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT access token', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'CLIENT' as const,
        tokenVersion: 1,
      };
      const expectedToken = 'generated_jwt_token';
      
      mockJwt.sign.mockReturnValue(expectedToken as never);

      const result = generateToken(user);

      expect(result).toBe(expectedToken);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        user,
        'test-jwt-secret',
        { expiresIn: '1h' }
      );
    });

    it('should generate a valid JWT token with custom expiration', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'CLIENT' as const,
      };
      const expectedToken = 'generated_jwt_token_custom';
      
      mockJwt.sign.mockReturnValue(expectedToken as never);

      const result = generateToken(user, '2h');

      expect(result).toBe(expectedToken);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        user,
        'test-jwt-secret',
        { expiresIn: '2h' }
      );
    });

    it('should throw error if token generation fails', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'CLIENT' as const,
        tokenVersion: 1,
      };
      const error = new Error('Token generation failed');
      
      mockJwt.sign.mockImplementation(() => {
        throw error;
      });

      expect(() => generateToken(user)).toThrow();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid access token', () => {
      const token = 'valid_jwt_token';
      const decodedPayload = {
        userId: '1',
        email: 'test@example.com',
        role: 'CLIENT',
        iat: 1234567890,
        exp: 1234571490,
      };
      
      mockJwt.verify.mockReturnValue(decodedPayload as never);

      const result = verifyToken(token);

      expect(result).toEqual(decodedPayload);
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret');
    });

    it('should verify a valid refresh token', () => {
      const refreshToken = 'valid_refresh_token';
      const decodedPayload = {
        userId: '1',
        tokenVersion: 1,
        iat: 1234567890,
        exp: 1234571490,
      };
      
      mockJwt.verify.mockReturnValue(decodedPayload as never);

      const result = verifyToken(refreshToken);

      expect(result).toEqual(decodedPayload);
      expect(mockJwt.verify).toHaveBeenCalledWith(refreshToken, 'test-jwt-secret');
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid_token';
      const error = new Error('Invalid token');
      
      mockJwt.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => verifyToken(token)).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      const token = 'expired_token';
      const error = new Error('Token expired');
      
      mockJwt.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => verifyToken(token)).toThrow('Token expired');
    });

    it('should use default token type as access', () => {
      const token = 'valid_jwt_token';
      const decodedPayload = {
        userId: '1',
        email: 'test@example.com',
        role: 'CLIENT',
      };
      
      mockJwt.verify.mockReturnValue(decodedPayload as never);

      verifyToken(token);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret');
    });
  });

  describe('edge cases', () => {
    it('should handle empty password in hashPassword', async () => {
      const password = '';
      const hashedPassword = '$2b$10$emptyhash';
      
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
    });

    it('should handle special characters in password', async () => {
      const password = 'P@ssw0rd!#$%';
      const hashedPassword = '$2b$10$specialcharhash';
      
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
    });

    it('should handle missing environment variables gracefully', () => {
      delete process.env.JWT_SECRET;
      
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'CLIENT' as const,
        tokenVersion: 1,
      };

      expect(() => generateToken(user)).toThrow();
    });
  });
});