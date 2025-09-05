import { sign, verify } from 'hono/jwt';
import { JWTPayload } from 'hono/utils/jwt/types';

/**
 * Interface para dados do usuário no token
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Interface para resposta de tokens
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Configurações de JWT
 */
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

/**
 * Converter tempo de expiração para segundos
 */
const parseExpirationTime = (time: string): number => {
  const unit = time.slice(-1);
  const value = parseInt(time.slice(0, -1));

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return 900; // 15 minutos padrão
  }
};

/**
 * Gerar token de acesso JWT
 */
export const generateAccessToken = async (payload: TokenPayload): Promise<string> => {
  const expirationTime = parseExpirationTime(JWT_CONFIG.expiresIn);
  const now = Math.floor(Date.now() / 1000);

  const jwtPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expirationTime
  };

  return await sign(jwtPayload, JWT_CONFIG.secret);
};

/**
 * Gerar token de refresh JWT
 */
export const generateRefreshToken = async (payload: TokenPayload): Promise<string> => {
  const expirationTime = parseExpirationTime(JWT_CONFIG.refreshExpiresIn);
  const now = Math.floor(Date.now() / 1000);

  const jwtPayload: JWTPayload = {
    ...payload,
    type: 'refresh',
    iat: now,
    exp: now + expirationTime
  };

  return await sign(jwtPayload, JWT_CONFIG.refreshSecret);
};

/**
 * Gerar par de tokens (access + refresh)
 */
export const generateTokenPair = async (payload: TokenPayload): Promise<TokenResponse> => {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload)
  ]);

  return {
    accessToken,
    refreshToken,
    expiresIn: parseExpirationTime(JWT_CONFIG.expiresIn)
  };
};

/**
 * Verificar token de acesso
 */
export const verifyAccessToken = async (token: string): Promise<TokenPayload> => {
  try {
    const payload = await verify(token, JWT_CONFIG.secret) as JWTPayload & TokenPayload;

    if (!payload.userId || !payload.email || !payload.role) {
      throw new Error('Token payload inválido');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    throw new Error('Token de acesso inválido ou expirado');
  }
};

/**
 * Verificar token de refresh
 */
export const verifyRefreshToken = async (token: string): Promise<TokenPayload> => {
  try {
    const payload = await verify(token, JWT_CONFIG.refreshSecret) as JWTPayload & TokenPayload & { type?: string };

    if (payload.type !== 'refresh') {
      throw new Error('Tipo de token inválido');
    }

    if (!payload.userId || !payload.email || !payload.role) {
      throw new Error('Token payload inválido');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    throw new Error('Token de refresh inválido ou expirado');
  }
};

/**
 * Hash de senha usando Bun's built-in crypto
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await Bun.password.hash(password, {
    algorithm: 'bcrypt',
    cost: 12
  });
};

/**
 * Verificar senha
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await Bun.password.verify(password, hash);
};

/**
 * Gerar token aleatório para reset de senha, etc.
 */
export const generateRandomToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * Extrair token do header Authorization
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
};

/**
 * Verificar se o token está próximo do vencimento
 */
export const isTokenNearExpiry = (token: string, thresholdMinutes: number = 5): boolean => {
  try {
    // Decodificar sem verificar assinatura para obter exp
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;

    if (!exp) return true;

    const now = Math.floor(Date.now() / 1000);
    const threshold = thresholdMinutes * 60;

    return (exp - now) <= threshold;
  } catch (error) {
    return true;
  }
};