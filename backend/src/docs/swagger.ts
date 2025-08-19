import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Configuração básica do Swagger
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Contabilidade Igrejinha',
      version: '1.0.0',
      description: 'Documentação da API do sistema Contabilidade Igrejinha - Sistema especializado em organizações religiosas',
      contact: {
        name: 'Suporte Contabilidade Igrejinha',
        email: 'suporte@contabilidadeigrejinha.com.br',
        url: 'https://contabilidadeigrejinha.com.br',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'http://localhost:3002/api',
        description: 'Servidor de Desenvolvimento (Alternativo)',
      },
      {
        url: 'https://api.contabilidadeigrejinha.com.br/api',
        description: 'Servidor de Produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação. Formato: Bearer {token}',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Ocorreu um erro ao processar a solicitação',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ["Campo 'email' é obrigatório", "Senha deve ter pelo menos 8 caracteres"],
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success', 'error'],
              example: 'success',
            },
            message: {
              type: 'string',
              example: 'Operação realizada com sucesso',
            },
            data: {
              type: 'object',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            totalItems: {
              type: 'integer',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              example: 10,
            },
            hasNext: {
              type: 'boolean',
              example: true,
            },
            hasPrev: {
              type: 'boolean',
              example: false,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/docs/schemas/*.ts',
  ],
};

// Gera a especificação do Swagger
const specs = swaggerJsdoc(options);

/**
 * Configura o Swagger na aplicação Express
 * @param app Instância do Express
 */
export const setupSwagger = (app: Express): void => {
  // Rota para a documentação do Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
    `,
    customSiteTitle: 'API Contabilidade Igrejinha - Documentação',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  }));
  
  // Rota para a especificação OpenAPI em formato JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  
  console.log('📚 Swagger configurado com sucesso!');
  console.log('📖 Documentação disponível em: /api-docs');
  console.log('📄 Especificação JSON disponível em: /api-docs.json');
};

export { specs };
export default setupSwagger;