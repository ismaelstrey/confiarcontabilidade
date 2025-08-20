import { Context, Next } from 'hono';
import { z, ZodSchema } from 'zod';
import { createError } from './errorHandler';

/**
 * Tipo para esquemas de validação
 */
export type ValidationSchema = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

/**
 * Middleware para validação de dados de entrada usando Zod
 */
export const validate = (schema: ValidationSchema) => {
  return async (c: Context, next: Next) => {
    try {
      // Validar body
      if (schema.body) {
        const body = await c.req.json().catch(() => ({}));
        const validatedBody = schema.body.parse(body);
        c.set('validatedBody', validatedBody);
      }

      // Validar query parameters
      if (schema.query) {
        const query = c.req.query();
        const validatedQuery = schema.query.parse(query);
        c.set('validatedQuery', validatedQuery);
      }

      // Validar route parameters
      if (schema.params) {
        const params = c.req.param();
        const validatedParams = schema.params.parse(params);
        c.set('validatedParams', validatedParams);
      }

      await next();
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const formattedErrors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        throw createError(
          'Dados de entrada inválidos',
          400,
          'VALIDATION_ERROR',
          formattedErrors
        );
      }
      throw error;
    }
  };
};

/**
 * Schemas de validação comuns
 */
export const commonSchemas = {
  // Validação de ID
  id: z.object({
    id: z.string().uuid('ID deve ser um UUID válido')
  }),

  // Validação de paginação
  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    search: z.string().optional()
  }),

  // Validação de email
  email: z.object({
    email: z.string().email('Email deve ter um formato válido')
  }),

  // Validação de senha
  password: z.object({
    password: z.string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
  }),

  // Validação de data
  dateRange: z.object({
    startDate: z.string().datetime('Data de início deve ser uma data válida').optional(),
    endDate: z.string().datetime('Data de fim deve ser uma data válida').optional()
  })
};

/**
 * Helper para obter dados validados do contexto
 */
export const getValidatedData = (c: Context) => {
  return {
    body: c.get('validatedBody'),
    query: c.get('validatedQuery'),
    params: c.get('validatedParams')
  };
};

/**
 * Middleware para validação de upload de arquivos
 */
export const validateFileUpload = (options: {
  maxSize?: number; // em bytes
  allowedTypes?: string[];
  required?: boolean;
}) => {
  return async (c: Context, next: Next) => {
    try {
      const formData = await c.req.formData().catch(() => null);
      
      if (!formData && options.required) {
        throw createError('Arquivo é obrigatório', 400, 'FILE_REQUIRED');
      }

      if (formData) {
        const file = formData.get('file') as File;
        
        if (!file && options.required) {
          throw createError('Arquivo é obrigatório', 400, 'FILE_REQUIRED');
        }

        if (file) {
          // Validar tamanho
          if (options.maxSize && file.size > options.maxSize) {
            throw createError(
              `Arquivo muito grande. Tamanho máximo: ${options.maxSize / 1024 / 1024}MB`,
              400,
              'FILE_TOO_LARGE'
            );
          }

          // Validar tipo
          if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
            throw createError(
              `Tipo de arquivo não permitido. Tipos aceitos: ${options.allowedTypes.join(', ')}`,
              400,
              'INVALID_FILE_TYPE'
            );
          }

          c.set('uploadedFile', file);
        }
      }

      await next();
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createError('Erro ao processar upload', 400, 'UPLOAD_ERROR');
    }
  };
};