import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

/**
 * Gera um hash da senha usando bcrypt
 * @param password - Senha em texto plano
 * @returns Promise com o hash da senha
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compara uma senha em texto plano com um hash
 * @param password - Senha em texto plano
 * @param hash - Hash da senha
 * @returns Promise com resultado da comparação
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Gera um token JWT
 * @param payload - Dados a serem incluídos no token
 * @param expiresIn - Tempo de expiração do token (padrão: 1h)
 * @returns Token JWT
 */
export const generateToken = (payload: object, expiresIn: string = '1h'): string => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Verifica e decodifica um token JWT
 * @param token - Token JWT a ser verificado
 * @returns Payload decodificado do token
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Gera um refresh token JWT
 * @param payload - Dados a serem incluídos no token
 * @returns Refresh token JWT
 */
export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: '7d' } as jwt.SignOptions);
};

/**
 * Verifica um refresh token JWT
 * @param token - Refresh token a ser verificado
 * @returns Payload decodificado do refresh token
 */
export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

/**
 * Valida a força de uma senha
 * @param password - Senha a ser validada
 * @returns true se a senha for forte, false caso contrário
 */
export const validatePasswordStrength = (password: string): boolean => {
  // Mínimo 8 caracteres, pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Valida formato de email
 * @param email - Email a ser validado
 * @returns true se o email for válido, false caso contrário
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};