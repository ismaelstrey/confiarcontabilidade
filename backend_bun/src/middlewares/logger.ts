/**
 * Middleware de logging para registrar requisições e respostas
 * Inclui informações detalhadas sobre performance e erros
 */

import { writeFile, appendFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  requestBody?: any;
  responseBody?: any;
}

export interface LoggerOptions {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logToFile: boolean;
  logToConsole: boolean;
  logDirectory: string;
  includeRequestBody: boolean;
  includeResponseBody: boolean;
  maxLogFileSize: number; // em MB
}

class Logger {
  private options: LoggerOptions;
  private logDirectory: string;

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = {
      logLevel: 'info',
      logToFile: true,
      logToConsole: true,
      logDirectory: 'logs',
      includeRequestBody: false,
      includeResponseBody: false,
      maxLogFileSize: 10, // 10MB
      ...options
    };

    this.logDirectory = join(process.cwd(), this.options.logDirectory);
    this.ensureLogDirectory();
  }

  /**
   * Garantir que o diretório de logs existe
   */
  private ensureLogDirectory(): void {
    if (!existsSync(this.logDirectory)) {
      mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  /**
   * Formatar entrada de log
   */
  private formatLogEntry(entry: LogEntry): string {
    const {
      timestamp,
      method,
      url,
      userAgent,
      ip,
      userId,
      statusCode,
      responseTime,
      error,
      requestBody,
      responseBody
    } = entry;

    let logMessage = `[${timestamp}] ${method} ${url}`;
    
    if (ip) logMessage += ` - IP: ${ip}`;
    if (userId) logMessage += ` - User: ${userId}`;
    if (userAgent) logMessage += ` - UA: ${userAgent}`;
    if (statusCode) logMessage += ` - Status: ${statusCode}`;
    if (responseTime) logMessage += ` - Time: ${responseTime}ms`;
    if (error) logMessage += ` - Error: ${error}`;
    
    if (this.options.includeRequestBody && requestBody) {
      logMessage += `\n  Request Body: ${JSON.stringify(requestBody, null, 2)}`;
    }
    
    if (this.options.includeResponseBody && responseBody) {
      logMessage += `\n  Response Body: ${JSON.stringify(responseBody, null, 2)}`;
    }

    return logMessage;
  }

  /**
   * Escrever log no console
   */
  private logToConsole(level: string, message: string): void {
    if (!this.options.logToConsole) return;

    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m'  // Red
    };

    const reset = '\x1b[0m';
    const color = colors[level as keyof typeof colors] || colors.info;
    
    console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`);
  }

  /**
   * Escrever log em arquivo
   */
  private async logToFile(level: string, message: string): Promise<void> {
    if (!this.options.logToFile) return;

    const date = new Date().toISOString().split('T')[0];
    const filename = `${level}-${date}.log`;
    const filepath = join(this.logDirectory, filename);
    
    try {
      await appendFile(filepath, message + '\n', 'utf8');
    } catch (error) {
      console.error('Erro ao escrever log em arquivo:', error);
    }
  }

  /**
   * Registrar entrada de log
   */
  async log(level: 'debug' | 'info' | 'warn' | 'error', entry: LogEntry): Promise<void> {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.options.logLevel];
    const entryLevel = levels[level];

    if (entryLevel < currentLevel) return;

    const message = this.formatLogEntry(entry);
    
    this.logToConsole(level, message);
    await this.logToFile(level, message);
  }

  /**
   * Log de debug
   */
  async debug(entry: LogEntry): Promise<void> {
    await this.log('debug', entry);
  }

  /**
   * Log de informação
   */
  async info(entry: LogEntry): Promise<void> {
    await this.log('info', entry);
  }

  /**
   * Log de aviso
   */
  async warn(entry: LogEntry): Promise<void> {
    await this.log('warn', entry);
  }

  /**
   * Log de erro
   */
  async error(entry: LogEntry): Promise<void> {
    await this.log('error', entry);
  }
}

// Instância global do logger
export const logger = new Logger();

/**
 * Middleware de logging para Bun
 * @param options - Opções de configuração do logger
 * @returns Função middleware
 */
export function requestLogger(options: Partial<LoggerOptions> = {}) {
  const loggerInstance = new Logger(options);

  return async (request: Request, context?: any): Promise<void> => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = new URL(request.url).pathname + new URL(request.url).search;
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    let requestBody: any;
    if (options.includeRequestBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          requestBody = await request.clone().json();
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const formData = await request.clone().formData();
          requestBody = Object.fromEntries(formData.entries());
        }
      } catch (error) {
        requestBody = 'Erro ao ler corpo da requisição';
      }
    }

    const logEntry: LogEntry = {
      timestamp,
      method,
      url,
      userAgent,
      ip,
      userId: context?.user?.id,
      requestBody
    };

    // Log da requisição
    await loggerInstance.info(logEntry);

    // Adicionar função para log da resposta no contexto
    if (context) {
      context.logResponse = async (response: Response, error?: string) => {
        const responseTime = Date.now() - startTime;
        const responseLogEntry: LogEntry = {
          ...logEntry,
          statusCode: response.status,
          responseTime,
          error
        };

        if (options.includeResponseBody && response.body) {
          try {
            const responseClone = response.clone();
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              responseLogEntry.responseBody = await responseClone.json();
            }
          } catch (err) {
            responseLogEntry.responseBody = 'Erro ao ler corpo da resposta';
          }
        }

        const level = error ? 'error' : response.status >= 400 ? 'warn' : 'info';
        await loggerInstance.log(level, responseLogEntry);
      };
    }
  };
}

/**
 * Configuração de logger para desenvolvimento
 */
export const developmentLogger = requestLogger({
  logLevel: 'debug',
  logToConsole: true,
  logToFile: true,
  includeRequestBody: true,
  includeResponseBody: false
});

/**
 * Configuração de logger para produção
 */
export const productionLogger = requestLogger({
  logLevel: 'info',
  logToConsole: false,
  logToFile: true,
  includeRequestBody: false,
  includeResponseBody: false
});