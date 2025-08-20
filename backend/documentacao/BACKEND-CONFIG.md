# Configuração do Ambiente Backend - Contabilidade Igrejinha

Este documento contém exemplos de implementação da configuração do ambiente para o backend da aplicação Contabilidade Igrejinha.

## Variáveis de Ambiente

### Arquivo .env

```env
# Configurações do Servidor
NODE_ENV=development
PORT=3000
API_PREFIX=/api
FRONTEND_URL=http://localhost:5173

# Configurações do Banco de Dados
DATABASE_URL=postgresql://postgres:senha@localhost:5432/contabilidade_igrejinha

# Configurações de Autenticação
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=outra_chave_secreta_muito_segura_aqui
JWT_REFRESH_EXPIRES_IN=7d

# Configurações de Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=seu_email@example.com
EMAIL_PASS=sua_senha_de_email
EMAIL_FROM=Contabilidade Igrejinha <contato@contabilidadeigrejinha.com.br>

# Configurações de Segurança
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Configurações de Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Configurações de Cache
CACHE_TTL=3600

# Configurações de Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Configurações de Monitoramento
SENTRY_DSN=https://seu_dsn_do_sentry@sentry.io/123456
```

### Arquivo .env.example

```env
# Configurações do Servidor
NODE_ENV=development
PORT=3000
API_PREFIX=/api
FRONTEND_URL=http://localhost:5173

# Configurações do Banco de Dados
DATABASE_URL=postgresql://postgres:senha@localhost:5432/contabilidade_igrejinha

# Configurações de Autenticação
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=outra_chave_secreta_aqui
JWT_REFRESH_EXPIRES_IN=7d

# Configurações de Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=seu_email@example.com
EMAIL_PASS=sua_senha_de_email
EMAIL_FROM=Contabilidade Igrejinha <contato@contabilidadeigrejinha.com.br>

# Configurações de Segurança
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Configurações de Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Configurações de Cache
CACHE_TTL=3600

# Configurações de Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Configurações de Monitoramento
SENTRY_DSN=https://seu_dsn_do_sentry@sentry.io/123456
```

### Arquivo .env.test

```env
# Configurações do Servidor
NODE_ENV=test
PORT=3001
API_PREFIX=/api
FRONTEND_URL=http://localhost:5173

# Configurações do Banco de Dados
DATABASE_URL=postgresql://postgres:senha@localhost:5432/contabilidade_igrejinha_test

# Configurações de Autenticação
JWT_SECRET=chave_secreta_para_testes
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=outra_chave_secreta_para_testes
JWT_REFRESH_EXPIRES_IN=7d

# Configurações de Email
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=ethereal_user
EMAIL_PASS=ethereal_pass
EMAIL_FROM=Contabilidade Igrejinha <contato@contabilidadeigrejinha.com.br>

# Configurações de Segurança
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Configurações de Upload
UPLOAD_DIR=uploads_test
MAX_FILE_SIZE=5242880

# Configurações de Cache
CACHE_TTL=3600

# Configurações de Logging
LOG_LEVEL=error
LOG_FILE=logs/test.log

# Configurações de Monitoramento
SENTRY_DSN=
```

### Arquivo .env.production

```env
# Configurações do Servidor
NODE_ENV=production
PORT=3000
API_PREFIX=/api
FRONTEND_URL=https://contabilidadeigrejinha.com.br

# Configurações do Banco de Dados
DATABASE_URL=${DATABASE_URL}

# Configurações de Autenticação
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=7d

# Configurações de Email
EMAIL_HOST=${EMAIL_HOST}
EMAIL_PORT=${EMAIL_PORT}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}
EMAIL_FROM=Contabilidade Igrejinha <contato@contabilidadeigrejinha.com.br>

# Configurações de Segurança
CORS_ORIGIN=https://contabilidadeigrejinha.com.br
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Configurações de Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Configurações de Cache
CACHE_TTL=3600

# Configurações de Logging
LOG_LEVEL=warn
LOG_FILE=logs/app.log

# Configurações de Monitoramento
SENTRY_DSN=${SENTRY_DSN}
```

## Configuração do Ambiente

### Configuração do Servidor

```typescript
// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';

// Carrega o arquivo .env apropriado com base no ambiente
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : process.env.NODE_ENV === 'test'
    ? '.env.test'
    : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

/**
 * Configurações do ambiente
 */
export const env = {
  // Configurações do Servidor
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  
  // Configurações do Banco de Dados
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Configurações de Autenticação
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Configurações de Email
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'Contabilidade Igrejinha <contato@contabilidadeigrejinha.com.br>',
  },
  
  // Configurações de Segurança
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  
  // Configurações de Upload
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  },
  
  // Configurações de Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
  },
  
  // Configurações de Logging
  log: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  
  // Configurações de Monitoramento
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
};

/**
 * Valida as configurações do ambiente
 * @throws Error se alguma configuração obrigatória estiver faltando
 */
export const validateEnv = (): void => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];
  
  if (env.isProduction) {
    requiredEnvVars.push(
      'EMAIL_HOST',
      'EMAIL_PORT',
      'EMAIL_USER',
      'EMAIL_PASS',
      'SENTRY_DSN'
    );
  }
  
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`As seguintes variáveis de ambiente são obrigatórias: ${missingEnvVars.join(', ')}`);
  }
};
```

### Configuração do Servidor Express

```typescript
// src/server.ts
import { setupApp } from './app';
import { env, validateEnv } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';

/**
 * Função principal para iniciar o servidor
 */
async function startServer() {
  try {
    // Valida as variáveis de ambiente
    validateEnv();
    
    // Configura o aplicativo Express
    const app = await setupApp();
    
    // Testa a conexão com o banco de dados
    await prisma.$connect();
    logger.info('Conexão com o banco de dados estabelecida com sucesso');
    
    // Inicia o servidor
    const server = app.listen(env.port, () => {
      logger.info(`Servidor iniciado em http://localhost:${env.port}${env.apiPrefix}`);
      logger.info(`Documentação da API disponível em http://localhost:${env.port}/api-docs`);
      logger.info(`Ambiente: ${env.nodeEnv}`);
    });
    
    // Configuração de encerramento gracioso
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} recebido. Encerrando o servidor...`);
      
      server.close(async () => {
        logger.info('Servidor HTTP encerrado');
        
        try {
          await prisma.$disconnect();
          logger.info('Conexão com o banco de dados encerrada');
          process.exit(0);
        } catch (error) {
          logger.error('Erro ao desconectar do banco de dados:', error);
          process.exit(1);
        }
      });
      
      // Força o encerramento após 10 segundos
      setTimeout(() => {
        logger.error('Encerramento forçado após timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Registra os manipuladores de sinais
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Manipulador de exceções não tratadas
    process.on('uncaughtException', (error) => {
      logger.error('Exceção não tratada:', error);
      gracefulShutdown('uncaughtException');
    });
    
    // Manipulador de rejeições não tratadas
    process.on('unhandledRejection', (reason) => {
      logger.error('Rejeição não tratada:', reason);
    });
    
  } catch (error) {
    logger.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Inicia o servidor
startServer();
```

### Configuração do Prisma

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// Configuração de logs do Prisma
const prismaLogOptions = env.isDevelopment
  ? {
      log: ['query', 'info', 'warn', 'error'],
    }
  : env.isTest
    ? { log: ['error'] }
    : { log: ['warn', 'error'] };

// Cria uma instância do PrismaClient com as opções de log
export const prisma = new PrismaClient(prismaLogOptions);

// Middleware para log de tempo de execução das queries
prisma.$use(async (params, next) => {
  const startTime = Date.now();
  const result = await next(params);
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  if (env.isDevelopment && duration > 100) {
    console.log(`Query ${params.model}.${params.action} levou ${duration}ms`);
  }
  
  return result;
});
```

## Configuração de Serviços Externos

### Configuração de Email

```typescript
// src/services/emailService.ts
import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Configuração do transportador de email
 */
const createTransporter = () => {
  // Em ambiente de teste, usa o Ethereal para capturar emails
  if (env.isTest) {
    return nodemailer.createTestAccount().then(account => {
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
    });
  }
  
  // Em ambiente de desenvolvimento ou produção, usa as configurações do .env
  return Promise.resolve(nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: {
      user: env.email.user,
      pass: env.email.pass,
    },
  }));
};

/**
 * Interface para os dados do email
 */
interface EmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Serviço de envio de emails
 */
export class EmailService {
  /**
   * Envia um email
   * @param emailData Dados do email a ser enviado
   * @returns Informações sobre o envio do email
   */
  static async sendEmail(emailData: EmailData) {
    try {
      const transporter = await createTransporter();
      
      const info = await transporter.sendMail({
        from: env.email.from,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        attachments: emailData.attachments,
      });
      
      if (env.isTest) {
        logger.info(`URL de visualização do email: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      logger.info(`Email enviado: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar email');
    }
  }
  
  /**
   * Envia um email de boas-vindas
   * @param to Email do destinatário
   * @param name Nome do destinatário
   */
  static async sendWelcomeEmail(to: string, name: string) {
    const subject = 'Bem-vindo à Contabilidade Igrejinha';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Olá, ${name}!</h2>
        <p>Seja bem-vindo à Contabilidade Igrejinha. Estamos felizes em tê-lo como cliente.</p>
        <p>Nossa equipe está à disposição para ajudá-lo com suas necessidades contábeis.</p>
        <p>Acesse sua conta em <a href="${env.frontendUrl}/login">nosso site</a>.</p>
        <p>Atenciosamente,<br>Equipe Contabilidade Igrejinha</p>
      </div>
    `;
    
    return this.sendEmail({ to, subject, html });
  }
  
  /**
   * Envia um email de redefinição de senha
   * @param to Email do destinatário
   * @param name Nome do destinatário
   * @param token Token de redefinição de senha
   */
  static async sendPasswordResetEmail(to: string, name: string, token: string) {
    const subject = 'Redefinição de Senha - Contabilidade Igrejinha';
    const resetUrl = `${env.frontendUrl}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Olá, ${name}!</h2>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Redefinir Senha</a></p>
        <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
        <p>O link expira em 1 hora.</p>
        <p>Atenciosamente,<br>Equipe Contabilidade Igrejinha</p>
      </div>
    `;
    
    return this.sendEmail({ to, subject, html });
  }
  
  /**
   * Envia um email de confirmação de contato
   * @param to Email do destinatário
   * @param name Nome do destinatário
   */
  static async sendContactConfirmationEmail(to: string, name: string) {
    const subject = 'Recebemos sua mensagem - Contabilidade Igrejinha';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Olá, ${name}!</h2>
        <p>Recebemos sua mensagem e agradecemos pelo contato.</p>
        <p>Nossa equipe analisará sua solicitação e retornaremos em breve.</p>
        <p>Atenciosamente,<br>Equipe Contabilidade Igrejinha</p>
      </div>
    `;
    
    return this.sendEmail({ to, subject, html });
  }
  
  /**
   * Envia um email de notificação de novo contato para a equipe
   * @param contactData Dados do contato recebido
   */
  static async sendNewContactNotificationEmail(contactData: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    service?: string;
  }) {
    const to = env.email.user; // Email da equipe
    const subject = 'Novo Contato Recebido - Contabilidade Igrejinha';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Novo Contato Recebido</h2>
        <p><strong>Nome:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Telefone:</strong> ${contactData.phone || 'Não informado'}</p>
        <p><strong>Serviço:</strong> ${contactData.service || 'Não informado'}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${contactData.message}</p>
      </div>
    `;
    
    return this.sendEmail({ to, subject, html });
  }
}
```

### Configuração de Logging

```typescript
// src/utils/logger.ts
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

// Cria o diretório de logs se não existir
const logDir = path.dirname(env.log.file);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuração do formato de log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Configuração do formato de console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Configuração dos transportes de log
const transports = [
  // Log em arquivo
  new winston.transports.File({
    filename: env.log.file,
    level: env.log.level,
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Adiciona log no console em ambiente de desenvolvimento
if (env.isDevelopment || env.isTest) {
  transports.push(
    new winston.transports.Console({
      level: env.isTest ? 'error' : 'debug',
      format: consoleFormat,
    })
  );
}

// Cria o logger
export const logger = winston.createLogger({
  level: env.log.level,
  format: logFormat,
  defaultMeta: { service: 'api' },
  transports,
  exitOnError: false,
});

// Middleware de log para Express
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 500) {
      logger.error(message, { ip: req.ip, userAgent: req.get('User-Agent') });
    } else if (res.statusCode >= 400) {
      logger.warn(message, { ip: req.ip });
    } else {
      logger.info(message);
    }
  });
  
  next();
};
```

### Configuração de Monitoramento

```typescript
// src/config/sentry.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Express } from 'express';
import { env } from './env';

/**
 * Configura o Sentry para monitoramento de erros
 * @param app Instância do Express
 */
export const setupSentry = (app: Express) => {
  // Só configura o Sentry em produção e se o DSN estiver definido
  if (env.isProduction && env.sentry.dsn) {
    Sentry.init({
      dsn: env.sentry.dsn,
      integrations: [
        // Habilita o rastreamento HTTP
        new Sentry.Integrations.Http({ tracing: true }),
        // Habilita o rastreamento Express
        new Sentry.Integrations.Express({ app }),
        // Habilita o profiling
        new ProfilingIntegration(),
      ],
      // Configura o ambiente
      environment: env.nodeEnv,
      // Habilita o rastreamento de desempenho
      tracesSampleRate: 1.0,
      // Habilita o profiling de desempenho
      profilesSampleRate: 1.0,
    });
    
    // Middleware de rastreamento de requisições
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    
    // Middleware de captura de erros (deve ser registrado após as rotas)
    app.use(Sentry.Handlers.errorHandler());
    
    console.log('Sentry configurado com sucesso!');
  }
};
```

## Configuração do PM2

### Arquivo ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: 'contabilidade-igrejinha-api',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
    },
  ],
};
```

## Scripts do package.json

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:pm2": "pm2 start ecosystem.config.js --env production",
    "stop:pm2": "pm2 stop ecosystem.config.js",
    "restart:pm2": "pm2 restart ecosystem.config.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts",
    "test": "jest --runInBand",
    "test:watch": "jest --watch --runInBand",
    "test:coverage": "jest --coverage --runInBand",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write 'src/**/*.ts'"
  }
}
```

## Conclusão

Este documento fornece exemplos de implementação da configuração do ambiente para o backend da aplicação Contabilidade Igrejinha. A configuração adequada do ambiente é essencial para garantir o funcionamento correto da aplicação em diferentes ambientes (desenvolvimento, teste e produção).

As configurações incluem:

1. **Variáveis de Ambiente**: Configurações para diferentes ambientes (desenvolvimento, teste e produção).
2. **Configuração do Servidor**: Inicialização do servidor Express com tratamento adequado de erros e encerramento gracioso.
3. **Configuração do Prisma**: Configuração do cliente Prisma para acesso ao banco de dados.
4. **Configuração de Serviços Externos**: Configuração de serviços como email e monitoramento.
5. **Configuração de Logging**: Configuração de logs para diferentes ambientes.
6. **Configuração do PM2**: Configuração do gerenciador de processos para produção.
7. **Scripts do package.json**: Scripts para desenvolvimento, build, testes e deploy.

Essas configurações fornecem uma base sólida para o desenvolvimento e implantação do backend da aplicação Contabilidade Igrejinha.