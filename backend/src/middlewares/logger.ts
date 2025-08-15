import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Criar diretório de logs se não existir
const logDir = process.env.LOG_FILE_PATH || './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuração dos formatos de log
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Formato para console (desenvolvimento)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  }),
);

// Configuração dos transportes
const transports: winston.transport[] = [];

// Console transport (sempre ativo em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'info',
    }),
  );
}

// File transports
transports.push(
  // Log de erros
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: parseInt(process.env.LOG_MAX_SIZE || '20971520'), // 20MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
  }),
  // Log combinado
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: logFormat,
    maxsize: parseInt(process.env.LOG_MAX_SIZE || '20971520'), // 20MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
  }),
  // Log de acesso
  new winston.transports.File({
    filename: path.join(logDir, 'access.log'),
    level: 'http',
    format: logFormat,
    maxsize: parseInt(process.env.LOG_MAX_SIZE || '20971520'), // 20MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
  }),
);

// Criar logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'contabilidade-igrejinha-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports,
  // Não sair em caso de erro
  exitOnError: false,
});

// Adicionar console em produção se necessário
if (process.env.NODE_ENV === 'production' && process.env.VERBOSE_LOGGING === 'true') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'warn',
    }),
  );
}

// Stream para integração com Morgan (se necessário)
export const logStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Função para log de performance
export const logPerformance = (operation: string, startTime: number, metadata?: any) => {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation}`, {
    duration: `${duration}ms`,
    operation,
    ...metadata,
  });
};

// Função para log de database queries (se necessário)
export const logDatabaseQuery = (query: string, duration: number, params?: any) => {
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true') {
    logger.debug('Database Query', {
      query,
      duration: `${duration}ms`,
      params,
    });
  }
};

// Função para log de autenticação
export const logAuth = (action: string, userId?: string, metadata?: any) => {
  logger.info(`Auth: ${action}`, {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};

// Função para log de upload de arquivos
export const logFileUpload = (filename: string, size: number, userId?: string) => {
  logger.info('File Upload', {
    filename,
    size: `${(size / 1024 / 1024).toFixed(2)}MB`,
    userId,
    timestamp: new Date().toISOString(),
  });
};

// Função para log de email
export const logEmail = (action: string, to: string, subject?: string, error?: any) => {
  if (error) {
    logger.error(`Email Error: ${action}`, {
      action,
      to,
      subject,
      error: error.message,
      stack: error.stack,
    });
  } else {
    logger.info(`Email: ${action}`, {
      action,
      to,
      subject,
      timestamp: new Date().toISOString(),
    });
  }
};

// Função para log de cache
export const logCache = (action: string, key: string, hit?: boolean, ttl?: number) => {
  logger.debug(`Cache: ${action}`, {
    action,
    key,
    hit,
    ttl,
    timestamp: new Date().toISOString(),
  });
};

export default logger;