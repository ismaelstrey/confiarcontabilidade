/**
 * Configurações centralizadas da aplicação
 * Gerencia variáveis de ambiente e configurações do sistema
 */

import { z } from 'zod';

// Schema de validação para variáveis de ambiente
const envSchema = z.object({
  // Servidor
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  API_VERSION: z.string().default('v1'),

  // Banco de dados
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // CORS
  CORS_ORIGIN: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'), // 5MB
  UPLOAD_DIR: z.string().default('uploads'),

  // Email (opcional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_TO_FILE: z.string().transform(val => val === 'true').default('true'),
  LOG_TO_CONSOLE: z.string().transform(val => val === 'true').default('true'),

  // Segurança
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET deve ter pelo menos 32 caracteres').optional(),

  // Cache (Redis - opcional)
  REDIS_URL: z.string().optional(),
  REDIS_TTL: z.string().optional().transform(val => val ? Number(val) : 3600), // 1 hora
});

// Validar e processar variáveis de ambiente
const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  API_VERSION: process.env.API_VERSION,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_TO_FILE: process.env.LOG_TO_FILE,
  LOG_TO_CONSOLE: process.env.LOG_TO_CONSOLE,
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
  SESSION_SECRET: process.env.SESSION_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  REDIS_TTL: process.env.REDIS_TTL,
};

// Validar configurações
let config: z.infer<typeof envSchema>;

try {
  config = envSchema.parse(processEnv);
} catch (error) {
  console.error('❌ Erro na configuração das variáveis de ambiente:');
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

// Configurações derivadas
export const appConfig = {
  // Servidor
  server: {
    port: config.PORT,
    host: '0.0.0.0',
    environment: config.NODE_ENV,
    isDevelopment: config.NODE_ENV === 'development',
    isProduction: config.NODE_ENV === 'production',
    isTest: config.NODE_ENV === 'test',
    apiVersion: config.API_VERSION,
  },

  // Banco de dados
  database: {
    url: config.DATABASE_URL,
  },

  // JWT
  jwt: {
    secret: config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRES_IN,
    refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
  },

  // CORS
  cors: {
    origins: config.CORS_ORIGIN ? config.CORS_ORIGIN.split(',') : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name'
    ],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  },

  // Upload
  upload: {
    maxFileSize: config.MAX_FILE_SIZE,
    uploadDir: config.UPLOAD_DIR,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
  },

  // Email
  email: {
    smtp: {
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
    enabled: !!(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS),
  },

  // Logging
  logging: {
    level: config.LOG_LEVEL,
    toFile: config.LOG_TO_FILE,
    toConsole: config.LOG_TO_CONSOLE,
    directory: 'logs',
  },

  // Segurança
  security: {
    bcryptRounds: config.BCRYPT_ROUNDS,
    sessionSecret: config.SESSION_SECRET,
  },

  // Cache
  cache: {
    redis: {
      url: config.REDIS_URL,
      ttl: config.REDIS_TTL,
      enabled: !!config.REDIS_URL,
    },
  },
};

// Validar configurações críticas no ambiente de produção
if (appConfig.server.isProduction) {
  const criticalConfigs = [
    { key: 'JWT_SECRET', value: config.JWT_SECRET },
    { key: 'DATABASE_URL', value: config.DATABASE_URL },
  ];

  const missingConfigs = criticalConfigs.filter(({ value }) => !value);

  if (missingConfigs.length > 0) {
    console.error('❌ Configurações críticas ausentes em produção:');
    missingConfigs.forEach(({ key }) => {
      console.error(`  - ${key}`);
    });
    process.exit(1);
  }
}

// Log das configurações (sem dados sensíveis)
if (appConfig.server.isDevelopment) {
  console.log('🔧 Configurações carregadas:');
  console.log(`  - Ambiente: ${appConfig.server.environment}`);
  console.log(`  - Porta: ${appConfig.server.port}`);
  console.log(`  - API Version: ${appConfig.server.apiVersion}`);
  console.log(`  - CORS Origins: ${appConfig.cors.origins.join(', ')}`);
  console.log(`  - Rate Limit: ${appConfig.rateLimit.maxRequests} req/${appConfig.rateLimit.windowMs}ms`);
  console.log(`  - Upload Max Size: ${(appConfig.upload.maxFileSize / 1024 / 1024).toFixed(1)}MB`);
  console.log(`  - Email Enabled: ${appConfig.email.enabled}`);
  console.log(`  - Redis Enabled: ${appConfig.cache.redis.enabled}`);
}

export default appConfig;
export { config as rawConfig };