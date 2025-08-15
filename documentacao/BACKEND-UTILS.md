# Utilitários do Backend - Contabilidade Igrejinha

Este documento contém exemplos de implementação dos principais utilitários para o backend da aplicação Contabilidade Igrejinha.

## Estrutura de Utilitários

Os utilitários são organizados em módulos específicos para cada tipo de funcionalidade:

- `src/utils/auth.ts` - Utilitários relacionados à autenticação
- `src/utils/date.ts` - Utilitários para manipulação de datas
- `src/utils/string.ts` - Utilitários para manipulação de strings
- `src/utils/file.ts` - Utilitários para manipulação de arquivos
- `src/utils/logger.ts` - Utilitários para logging
- `src/utils/email.ts` - Utilitários para envio de emails
- `src/utils/validation.ts` - Utilitários para validação
- `src/utils/error.ts` - Utilitários para tratamento de erros
- `src/utils/pagination.ts` - Utilitários para paginação
- `src/utils/tax.ts` - Utilitários para cálculos fiscais

## Utilitários de Autenticação

```typescript
// src/utils/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '@prisma/client';

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'seu_refresh_token_secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Gera um hash para a senha
 * @param password Senha em texto plano
 * @returns Hash da senha
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compara uma senha em texto plano com um hash
 * @param password Senha em texto plano
 * @param hashedPassword Hash da senha
 * @returns Verdadeiro se a senha corresponder ao hash
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Gera um token JWT para o usuário
 * @param user Usuário para o qual o token será gerado
 * @returns Token JWT
 */
export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Gera um token de atualização (refresh token)
 * @param user Usuário para o qual o token será gerado
 * @returns Refresh token
 */
export const generateRefreshToken = (user: User): string => {
  const payload = {
    id: user.id,
    tokenVersion: user.tokenVersion,
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

/**
 * Verifica um token JWT
 * @param token Token JWT
 * @returns Payload do token decodificado ou null se inválido
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verifica um refresh token
 * @param token Refresh token
 * @returns Payload do token decodificado ou null se inválido
 */
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Gera um token para redefinição de senha
 * @returns Token de redefinição de senha
 */
export const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Gera um token para verificação de email
 * @returns Token de verificação de email
 */
export const generateEmailVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
```

## Utilitários de Data

```typescript
// src/utils/date.ts
import { format, parseISO, isValid, differenceInDays, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para o formato brasileiro
 * @param date Data a ser formatada
 * @param formatStr Formato desejado (padrão: dd/MM/yyyy)
 * @returns Data formatada
 */
export const formatDate = (date: Date | string, formatStr = 'dd/MM/yyyy'): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return 'Data inválida';
  return format(parsedDate, formatStr, { locale: ptBR });
};

/**
 * Formata uma data para exibição em artigos
 * @param date Data a ser formatada
 * @returns Data formatada (ex: 01 de janeiro de 2023)
 */
export const formatArticleDate = (date: Date | string): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return 'Data inválida';
  return format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

/**
 * Verifica se uma data é válida
 * @param date Data a ser verificada
 * @returns Verdadeiro se a data for válida
 */
export const isValidDate = (date: string): boolean => {
  return isValid(parseISO(date));
};

/**
 * Calcula a diferença em dias entre duas datas
 * @param startDate Data inicial
 * @param endDate Data final
 * @returns Diferença em dias
 */
export const daysBetween = (startDate: Date | string, endDate: Date | string): number => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInDays(end, start);
};

/**
 * Adiciona dias a uma data
 * @param date Data base
 * @param days Número de dias a adicionar
 * @returns Nova data
 */
export const addDaysToDate = (date: Date | string, days: number): Date => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return addDays(parsedDate, days);
};

/**
 * Subtrai dias de uma data
 * @param date Data base
 * @param days Número de dias a subtrair
 * @returns Nova data
 */
export const subtractDaysFromDate = (date: Date | string, days: number): Date => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return subDays(parsedDate, days);
};

/**
 * Obtém a data atual no formato ISO
 * @returns Data atual no formato ISO
 */
export const getCurrentISODate = (): string => {
  return new Date().toISOString();
};

/**
 * Converte uma data no formato brasileiro para o formato ISO
 * @param brDate Data no formato brasileiro (DD/MM/YYYY)
 * @returns Data no formato ISO ou null se inválida
 */
export const brDateToISO = (brDate: string): string | null => {
  const parts = brDate.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  return isValid(date) ? date.toISOString() : null;
};
```

## Utilitários de String

```typescript
// src/utils/string.ts
import slugify from 'slugify';

/**
 * Gera um slug a partir de um texto
 * @param text Texto para gerar o slug
 * @returns Slug gerado
 */
export const generateSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'pt',
  });
};

/**
 * Trunca um texto para um tamanho máximo
 * @param text Texto a ser truncado
 * @param maxLength Tamanho máximo
 * @param suffix Sufixo a ser adicionado (padrão: '...')
 * @returns Texto truncado
 */
export const truncateText = (text: string, maxLength: number, suffix = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
};

/**
 * Remove acentos de um texto
 * @param text Texto com acentos
 * @returns Texto sem acentos
 */
export const removeAccents = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Formata um número de telefone
 * @param phone Número de telefone
 * @returns Telefone formatado
 */
export const formatPhone = (phone: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Verifica se é um número de telefone válido
  if (cleaned.length !== 11 && cleaned.length !== 10) return phone;
  
  // Formata o número
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
};

/**
 * Formata um CNPJ
 * @param cnpj CNPJ
 * @returns CNPJ formatado
 */
export const formatCNPJ = (cnpj: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Verifica se é um CNPJ válido
  if (cleaned.length !== 14) return cnpj;
  
  // Formata o CNPJ
  return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}.${cleaned.substring(5, 8)}/${cleaned.substring(8, 12)}-${cleaned.substring(12)}`;
};

/**
 * Formata um CPF
 * @param cpf CPF
 * @returns CPF formatado
 */
export const formatCPF = (cpf: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');
  
  // Verifica se é um CPF válido
  if (cleaned.length !== 11) return cpf;
  
  // Formata o CPF
  return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9)}`;
};

/**
 * Formata um valor monetário
 * @param value Valor a ser formatado
 * @returns Valor formatado
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Gera um ID único
 * @returns ID único
 */
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
```

## Utilitários de Arquivo

```typescript
// src/utils/file.ts
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import crypto from 'crypto';

// Promisify fs functions
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

/**
 * Cria um diretório recursivamente se não existir
 * @param dirPath Caminho do diretório
 */
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
};

/**
 * Gera um nome de arquivo único
 * @param originalName Nome original do arquivo
 * @returns Nome de arquivo único
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  return `${baseName}-${timestamp}-${randomString}${extension}`;
};

/**
 * Salva um arquivo no sistema de arquivos
 * @param buffer Buffer do arquivo
 * @param fileName Nome do arquivo
 * @param directory Diretório onde o arquivo será salvo
 * @returns Caminho do arquivo salvo
 */
export const saveFile = async (buffer: Buffer, fileName: string, directory: string): Promise<string> => {
  await ensureDirectoryExists(directory);
  const uniqueFileName = generateUniqueFileName(fileName);
  const filePath = path.join(directory, uniqueFileName);
  
  await writeFile(filePath, buffer);
  return filePath;
};

/**
 * Remove um arquivo do sistema de arquivos
 * @param filePath Caminho do arquivo
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await unlink(filePath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

/**
 * Lê um arquivo do sistema de arquivos
 * @param filePath Caminho do arquivo
 * @returns Buffer do arquivo
 */
export const readFileBuffer = async (filePath: string): Promise<Buffer> => {
  return readFile(filePath);
};

/**
 * Obtém a extensão de um arquivo
 * @param fileName Nome do arquivo
 * @returns Extensão do arquivo
 */
export const getFileExtension = (fileName: string): string => {
  return path.extname(fileName).toLowerCase();
};

/**
 * Verifica se um arquivo é uma imagem
 * @param fileName Nome do arquivo
 * @returns Verdadeiro se o arquivo for uma imagem
 */
export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.includes(getFileExtension(fileName));
};

/**
 * Verifica se um arquivo é um documento
 * @param fileName Nome do arquivo
 * @returns Verdadeiro se o arquivo for um documento
 */
export const isDocumentFile = (fileName: string): boolean => {
  const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
  return documentExtensions.includes(getFileExtension(fileName));
};
```

## Utilitários de Logger

```typescript
// src/utils/logger.ts
import winston from 'winston';
import path from 'path';

// Configuração de níveis de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Configuração de cores para os níveis de log
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Adiciona cores ao winston
winston.addColors(colors);

// Configuração do formato de log
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Configuração dos transportes (destinos) de log
const transports = [
  // Console para todos os logs
  new winston.transports.Console(),
  
  // Arquivo para logs de erro
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),
  
  // Arquivo para todos os logs
  new winston.transports.File({ filename: path.join('logs', 'all.log') }),
];

// Criação do logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});

export default logger;

// Funções auxiliares para logging
export const logError = (message: string, error?: any): void => {
  if (error) {
    logger.error(`${message}: ${error.message}\n${error.stack}`);
  } else {
    logger.error(message);
  }
};

export const logWarning = (message: string): void => {
  logger.warn(message);
};

export const logInfo = (message: string): void => {
  logger.info(message);
};

export const logDebug = (message: string): void => {
  logger.debug(message);
};

export const logHttp = (message: string): void => {
  logger.http(message);
};

// Função para log de requisições HTTP
export const logRequest = (req: any, res: any, next: any): void => {
  const startTime = new Date().getTime();
  
  res.on('finish', () => {
    const duration = new Date().getTime() - startTime;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logWarning(message);
    } else {
      logHttp(message);
    }
  });
  
  next();
};
```

## Utilitários de Email

```typescript
// src/utils/email.ts
import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { logError } from './logger';

// Configuração do transporte de email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Carrega um template de email
 * @param templateName Nome do template
 * @returns Template compilado
 */
const loadTemplate = (templateName: string) => {
  const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`);
  const templateSource = readFileSync(templatePath, 'utf-8');
  return Handlebars.compile(templateSource);
};

/**
 * Envia um email
 * @param to Destinatário
 * @param subject Assunto
 * @param html Conteúdo HTML
 * @param attachments Anexos (opcional)
 * @returns Resultado do envio
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  attachments?: any[]
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
      attachments,
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logError('Erro ao enviar email', error);
    return false;
  }
};

/**
 * Envia um email usando um template
 * @param to Destinatário
 * @param subject Assunto
 * @param templateName Nome do template
 * @param context Contexto para o template
 * @param attachments Anexos (opcional)
 * @returns Resultado do envio
 */
export const sendTemplateEmail = async (
  to: string,
  subject: string,
  templateName: string,
  context: any,
  attachments?: any[]
): Promise<boolean> => {
  try {
    const template = loadTemplate(templateName);
    const html = template(context);
    return sendEmail(to, subject, html, attachments);
  } catch (error) {
    logError(`Erro ao enviar email com template ${templateName}`, error);
    return false;
  }
};

/**
 * Envia um email de boas-vindas
 * @param to Destinatário
 * @param name Nome do usuário
 * @returns Resultado do envio
 */
export const sendWelcomeEmail = async (to: string, name: string): Promise<boolean> => {
  const subject = 'Bem-vindo à Contabilidade Igrejinha';
  return sendTemplateEmail(to, subject, 'welcome', { name });
};

/**
 * Envia um email de redefinição de senha
 * @param to Destinatário
 * @param name Nome do usuário
 * @param resetLink Link para redefinição de senha
 * @returns Resultado do envio
 */
export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetLink: string
): Promise<boolean> => {
  const subject = 'Redefinição de Senha - Contabilidade Igrejinha';
  return sendTemplateEmail(to, subject, 'password-reset', { name, resetLink });
};

/**
 * Envia um email de confirmação de contato
 * @param to Destinatário
 * @param name Nome do usuário
 * @returns Resultado do envio
 */
export const sendContactConfirmationEmail = async (to: string, name: string): Promise<boolean> => {
  const subject = 'Recebemos sua mensagem - Contabilidade Igrejinha';
  return sendTemplateEmail(to, subject, 'contact-confirmation', { name });
};

/**
 * Envia um email de notificação de novo contato
 * @param contactData Dados do contato
 * @returns Resultado do envio
 */
export const sendNewContactNotificationEmail = async (contactData: any): Promise<boolean> => {
  const subject = 'Novo Contato Recebido - Contabilidade Igrejinha';
  const to = process.env.ADMIN_EMAIL || '';
  return sendTemplateEmail(to, subject, 'new-contact-notification', contactData);
};

/**
 * Envia um email de newsletter
 * @param to Destinatário
 * @param subject Assunto
 * @param content Conteúdo
 * @returns Resultado do envio
 */
export const sendNewsletterEmail = async (
  to: string | string[],
  subject: string,
  content: string
): Promise<boolean> => {
  return sendEmail(Array.isArray(to) ? to.join(',') : to, subject, content);
};
```

## Utilitários de Validação

```typescript
// src/utils/validation.ts

/**
 * Valida um CPF
 * @param cpf CPF a ser validado
 * @returns Verdadeiro se o CPF for válido
 */
export const isValidCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanedCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanedCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanedCPF)) return false;
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanedCPF.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanedCPF.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica se os dígitos calculados são iguais aos dígitos informados
  return (
    parseInt(cleanedCPF.charAt(9)) === digit1 &&
    parseInt(cleanedCPF.charAt(10)) === digit2
  );
};

/**
 * Valida um CNPJ
 * @param cnpj CNPJ a ser validado
 * @returns Verdadeiro se o CNPJ for válido
 */
export const isValidCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanedCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanedCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanedCNPJ)) return false;
  
  // Calcula o primeiro dígito verificador
  let size = cleanedCNPJ.length - 2;
  let numbers = cleanedCNPJ.substring(0, size);
  const digits = cleanedCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Calcula o segundo dígito verificador
  size += 1;
  numbers = cleanedCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return result === parseInt(digits.charAt(1));
};

/**
 * Valida um email
 * @param email Email a ser validado
 * @returns Verdadeiro se o email for válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida um número de telefone
 * @param phone Telefone a ser validado
 * @returns Verdadeiro se o telefone for válido
 */
export const isValidPhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanedPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com ou sem DDD)
  return cleanedPhone.length === 10 || cleanedPhone.length === 11;
};

/**
 * Valida uma URL
 * @param url URL a ser validada
 * @returns Verdadeiro se a URL for válida
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Valida uma senha forte
 * @param password Senha a ser validada
 * @returns Verdadeiro se a senha for forte
 */
export const isStrongPassword = (password: string): boolean => {
  // Pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
  return passwordRegex.test(password);
};
```

## Utilitários de Erro

```typescript
// src/utils/error.ts
import { logError } from './logger';

/**
 * Classe base para erros da aplicação
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 400, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de validação
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

/**
 * Erro de autenticação
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Não autenticado') {
    super(message, 401, true);
  }
}

/**
 * Erro de autorização
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Não autorizado') {
    super(message, 403, true);
  }
}

/**
 * Erro de recurso não encontrado
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404, true);
  }
}

/**
 * Erro de conflito
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflito de recursos') {
    super(message, 409, true);
  }
}

/**
 * Erro de serviço indisponível
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Serviço temporariamente indisponível') {
    super(message, 503, true);
  }
}

/**
 * Manipulador global de erros
 * @param error Erro a ser tratado
 * @param req Requisição
 * @param res Resposta
 * @param next Próximo middleware
 */
export const errorHandler = (error: any, req: any, res: any, next: any): void => {
  // Determina o código de status
  const statusCode = error.statusCode || 500;
  
  // Determina se é um erro operacional
  const isOperational = error.isOperational || false;
  
  // Registra o erro
  if (statusCode >= 500) {
    logError(`Erro interno: ${error.message}`, error);
  }
  
  // Formata a resposta de erro
  const errorResponse = {
    status: 'error',
    message: isOperational ? error.message : 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      isOperational,
    }),
  };
  
  // Envia a resposta
  res.status(statusCode).json(errorResponse);
};

/**
 * Captura erros assíncronos em middlewares
 * @param fn Função assíncrona
 * @returns Middleware com tratamento de erro
 */
export const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

## Utilitários de Paginação

```typescript
// src/utils/pagination.ts

/**
 * Interface para parâmetros de paginação
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Interface para resultado paginado
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Calcula os parâmetros de paginação
 * @param params Parâmetros de paginação
 * @returns Parâmetros de paginação processados
 */
export const getPaginationParams = (params: PaginationParams) => {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;
  const skip = (page - 1) * limit;
  const sort = params.sort || 'createdAt';
  const order = params.order || 'desc';
  
  return { page, limit, skip, sort, order };
};

/**
 * Cria um resultado paginado
 * @param data Dados
 * @param total Total de registros
 * @param page Página atual
 * @param limit Limite por página
 * @returns Resultado paginado
 */
export const createPaginatedResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Gera links de paginação para cabeçalhos de resposta
 * @param req Requisição
 * @param page Página atual
 * @param limit Limite por página
 * @param total Total de registros
 * @returns Links de paginação
 */
export const generatePaginationLinks = (req: any, page: number, limit: number, total: number): string => {
  const totalPages = Math.ceil(total / limit);
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  
  // Cria uma cópia dos parâmetros de consulta
  const queryParams = new URLSearchParams(req.query);
  
  // Função para gerar um link com página específica
  const generateLink = (pageNum: number) => {
    queryParams.set('page', pageNum.toString());
    return `<${baseUrl}?${queryParams.toString()}>; rel="${pageNum === page ? 'self' : pageNum < page ? 'prev' : 'next'}"`;
  };
  
  // Gera os links
  const links = [];
  
  // Link para a primeira página
  links.push(`<${baseUrl}?${new URLSearchParams({ ...req.query, page: '1' }).toString()}>; rel="first"`);
  
  // Link para a página anterior
  if (page > 1) {
    links.push(generateLink(page - 1));
  }
  
  // Link para a página atual
  links.push(generateLink(page));
  
  // Link para a próxima página
  if (page < totalPages) {
    links.push(generateLink(page + 1));
  }
  
  // Link para a última página
  links.push(`<${baseUrl}?${new URLSearchParams({ ...req.query, page: totalPages.toString() }).toString()}>; rel="last"`);
  
  return links.join(', ');
};
```

## Utilitários de Cálculos Fiscais

```typescript
// src/utils/tax.ts

/**
 * Interface para parâmetros de cálculo de impostos
 */
export interface TaxCalculationParams {
  revenue: number;
  employees: number;
  businessType: 'mei' | 'simples' | 'presumido' | 'real';
  hasPartners: boolean;
}

/**
 * Interface para resultado de cálculo de impostos
 */
export interface TaxCalculationResult {
  monthlyTax: number;
  yearlyTax: number;
  irpj: number;
  csll: number;
  pis: number;
  cofins: number;
  iss: number;
  inss: number;
  icms?: number;
  ipi?: number;
  taxRate: number;
  businessType: string;
  recommendations: string[];
}

/**
 * Calcula impostos para MEI
 * @param params Parâmetros de cálculo
 * @returns Resultado do cálculo
 */
const calculateMEITaxes = (params: TaxCalculationParams): TaxCalculationResult => {
  // Valores fixos para MEI em 2023
  const monthlyTax = 66.00; // INSS + ISS para MEI de serviços
  const yearlyTax = monthlyTax * 12;
  
  // Verifica se a receita excede o limite do MEI
  const meiLimit = 81000; // Limite anual para MEI em 2023
  const recommendations = [];
  
  if (params.revenue > meiLimit) {
    recommendations.push('Sua receita excede o limite para MEI. Considere migrar para o Simples Nacional.');
  }
  
  if (params.employees > 1) {
    recommendations.push('MEI pode ter apenas um empregado. Considere migrar para o Simples Nacional.');
  }
  
  if (params.hasPartners) {
    recommendations.push('MEI não pode ter sócios. Considere migrar para o Simples Nacional.');
  }
  
  return {
    monthlyTax,
    yearlyTax,
    irpj: 0,
    csll: 0,
    pis: 0,
    cofins: 0,
    iss: 5,
    inss: monthlyTax - 5,
    taxRate: (yearlyTax / params.revenue) * 100,
    businessType: 'Microempreendedor Individual (MEI)',
    recommendations,
  };
};

/**
 * Calcula impostos para Simples Nacional
 * @param params Parâmetros de cálculo
 * @returns Resultado do cálculo
 */
const calculateSimplesTaxes = (params: TaxCalculationParams): TaxCalculationResult => {
  // Alíquotas aproximadas para serviços no Simples Nacional
  let taxRate = 0;
  const recommendations = [];
  
  // Determina a alíquota com base na receita anual
  if (params.revenue <= 180000) {
    taxRate = 6;
  } else if (params.revenue <= 360000) {
    taxRate = 11.2;
  } else if (params.revenue <= 720000) {
    taxRate = 13.5;
  } else if (params.revenue <= 1800000) {
    taxRate = 16;
  } else if (params.revenue <= 3600000) {
    taxRate = 21;
  } else if (params.revenue <= 4800000) {
    taxRate = 33;
  } else {
    taxRate = 33;
    recommendations.push('Sua receita excede o limite para o Simples Nacional. Considere migrar para o Lucro Presumido ou Real.');
  }
  
  const monthlyTax = (params.revenue / 12) * (taxRate / 100);
  const yearlyTax = params.revenue * (taxRate / 100);
  
  // Distribuição aproximada dos impostos no Simples Nacional para serviços
  const irpj = yearlyTax * 0.15;
  const csll = yearlyTax * 0.10;
  const pis = yearlyTax * 0.05;
  const cofins = yearlyTax * 0.15;
  const iss = yearlyTax * 0.25;
  const inss = yearlyTax * 0.30;
  
  return {
    monthlyTax,
    yearlyTax,
    irpj,
    csll,
    pis,
    cofins,
    iss,
    inss,
    taxRate,
    businessType: 'Simples Nacional',
    recommendations,
  };
};

/**
 * Calcula impostos para Lucro Presumido
 * @param params Parâmetros de cálculo
 * @returns Resultado do cálculo
 */
const calculatePresumidoTaxes = (params: TaxCalculationParams): TaxCalculationResult => {
  // Alíquotas para Lucro Presumido (serviços)
  const presumedProfit = params.revenue * 0.32; // Base de cálculo para IRPJ e CSLL (32% para serviços)
  
  // Cálculo dos impostos
  const irpj = presumedProfit * 0.15;
  const irpjAdditional = presumedProfit > 60000 ? (presumedProfit - 60000) * 0.10 : 0;
  const csll = presumedProfit * 0.09;
  const pis = params.revenue * 0.0065;
  const cofins = params.revenue * 0.03;
  const iss = params.revenue * 0.05; // Varia conforme o município
  const inss = params.employees * 2000 * 0.20; // Estimativa simplificada
  
  const monthlyTax = (irpj + irpjAdditional + csll + pis + cofins + iss + inss) / 12;
  const yearlyTax = irpj + irpjAdditional + csll + pis + cofins + iss + inss;
  const taxRate = (yearlyTax / params.revenue) * 100;
  
  const recommendations = [];
  if (params.revenue > 78000000) {
    recommendations.push('Para empresas com receita muito alta, o Lucro Real pode ser mais vantajoso em alguns casos.');
  }
  
  return {
    monthlyTax,
    yearlyTax,
    irpj: irpj + irpjAdditional,
    csll,
    pis,
    cofins,
    iss,
    inss,
    taxRate,
    businessType: 'Lucro Presumido',
    recommendations,
  };
};

/**
 * Calcula impostos para Lucro Real
 * @param params Parâmetros de cálculo
 * @returns Resultado do cálculo
 */
const calculateRealTaxes = (params: TaxCalculationParams): TaxCalculationResult => {
  // Estimativa simplificada para Lucro Real
  // Assumindo uma margem de lucro de 20% para serviços
  const estimatedProfit = params.revenue * 0.20;
  
  // Cálculo dos impostos
  const irpj = estimatedProfit * 0.15;
  const irpjAdditional = estimatedProfit > 240000 ? (estimatedProfit - 240000) * 0.10 : 0;
  const csll = estimatedProfit * 0.09;
  const pis = params.revenue * 0.0165;
  const cofins = params.revenue * 0.076;
  const iss = params.revenue * 0.05; // Varia conforme o município
  const inss = params.employees * 2000 * 0.20; // Estimativa simplificada
  
  const monthlyTax = (irpj + irpjAdditional + csll + pis + cofins + iss + inss) / 12;
  const yearlyTax = irpj + irpjAdditional + csll + pis + cofins + iss + inss;
  const taxRate = (yearlyTax / params.revenue) * 100;
  
  const recommendations = [];
  if (params.revenue < 4800000 && estimatedProfit < params.revenue * 0.32) {
    recommendations.push('Com essa margem de lucro, o Lucro Presumido pode ser mais vantajoso.');
  }
  
  return {
    monthlyTax,
    yearlyTax,
    irpj: irpj + irpjAdditional,
    csll,
    pis,
    cofins,
    iss,
    inss,
    taxRate,
    businessType: 'Lucro Real',
    recommendations,
  };
};

/**
 * Calcula impostos com base nos parâmetros fornecidos
 * @param params Parâmetros de cálculo
 * @returns Resultado do cálculo
 */
export const calculateTaxes = (params: TaxCalculationParams): TaxCalculationResult => {
  switch (params.businessType) {
    case 'mei':
      return calculateMEITaxes(params);
    case 'simples':
      return calculateSimplesTaxes(params);
    case 'presumido':
      return calculatePresumidoTaxes(params);
    case 'real':
      return calculateRealTaxes(params);
    default:
      throw new Error('Tipo de negócio inválido');
  }
};

/**
 * Compara diferentes regimes tributários
 * @param params Parâmetros de cálculo
 * @returns Comparação entre regimes tributários
 */
export const compareTaxRegimes = (params: TaxCalculationParams): {
  mei?: TaxCalculationResult;
  simples: TaxCalculationResult;
  presumido: TaxCalculationResult;
  real: TaxCalculationResult;
  recommended: string;
} => {
  // Calcula impostos para cada regime
  const simples = calculateSimplesTaxes(params);
  const presumido = calculatePresumidoTaxes(params);
  const real = calculateRealTaxes(params);
  
  // Verifica se MEI é uma opção válida
  let mei;
  let recommended;
  
  if (params.revenue <= 81000 && params.employees <= 1 && !params.hasPartners) {
    mei = calculateMEITaxes(params);
    
    // Determina o regime recomendado com base no menor imposto anual
    const regimes = [
      { name: 'mei', value: mei.yearlyTax },
      { name: 'simples', value: simples.yearlyTax },
      { name: 'presumido', value: presumido.yearlyTax },
      { name: 'real', value: real.yearlyTax },
    ];
    
    const lowestTax = regimes.reduce((prev, current) => {
      return prev.value < current.value ? prev : current;
    });
    
    recommended = lowestTax.name;
  } else {
    // Determina o regime recomendado com base no menor imposto anual (excluindo MEI)
    const regimes = [
      { name: 'simples', value: simples.yearlyTax },
      { name: 'presumido', value: presumido.yearlyTax },
      { name: 'real', value: real.yearlyTax },
    ];
    
    const lowestTax = regimes.reduce((prev, current) => {
      return prev.value < current.value ? prev : current;
    });
    
    recommended = lowestTax.name;
  }
  
  return {
    ...(mei && { mei }),
    simples,
    presumido,
    real,
    recommended,
  };
};
```

## Conclusão

Estes exemplos de utilitários fornecem uma base sólida para o desenvolvimento do backend da aplicação Contabilidade Igrejinha. Eles seguem as melhores práticas de desenvolvimento, incluindo:

- Modularização e separação de responsabilidades
- Funções reutilizáveis
- Tratamento de erros
- Logging
- Validação
- Formatação
- Cálculos específicos do domínio

Ao implementar estes utilitários, você terá uma camada de funções auxiliares robusta que facilitará o desenvolvimento e manutenção do backend, garantindo consistência e qualidade no código.

---

*Este documento pode ser expandido com mais exemplos conforme necessário durante o desenvolvimento do backend.*