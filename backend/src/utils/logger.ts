import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

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
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  // Log combinado
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
);

// Criar instância do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  // Não sair em caso de erro
  exitOnError: false,
});

// Função para log de autenticação
export const logAuth = (
  message: string,
  userId?: string,
  metadata?: Record<string, any>
) => {
  logger.info(message, {
    category: 'auth',
    userId,
    ...metadata,
  });
};

// Função para log de requisições
export const logRequest = (
  message: string,
  metadata?: Record<string, any>
) => {
  logger.info(message, {
    category: 'request',
    ...metadata,
  });
};

// Função para log de operações de banco
export const logDatabase = (
  message: string,
  metadata?: Record<string, any>
) => {
  logger.info(message, {
    category: 'database',
    ...metadata,
  });
};

// Função para log de sistema
export const logSystem = (
  message: string,
  metadata?: Record<string, any>
) => {
  logger.info(message, {
    category: 'system',
    ...metadata,
  });
};

export default logger;