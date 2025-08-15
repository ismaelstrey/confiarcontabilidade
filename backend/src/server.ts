import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Importar middlewares personalizados
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './middlewares/logger';
import { requestLogger } from './middlewares/requestLogger';

// Importar rotas
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import articleRoutes from './routes/articleRoutes';
import contactRoutes from './routes/contactRoutes';
import calculatorRoutes from './routes/calculatorRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import uploadRoutes from './routes/uploadRoutes';
import adminRoutes from './routes/adminRoutes';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.SWAGGER_TITLE || 'Contabilidade Igrejinha API',
      version: process.env.SWAGGER_VERSION || '1.0.0',
      description: process.env.SWAGGER_DESCRIPTION || 'API para sistema de contabilidade especializado em organizações religiosas',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Configuração CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas de acesso. Tente novamente em alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use(requestLogger);

// Documentação da API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', async (req, res) => {
  try {
    // Verificar conexão com o banco de dados
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.SWAGGER_VERSION || '1.0.0',
      database: 'Connected',
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: 'Database connection failed',
    });
  }
});

// Rotas da API
const apiRouter = express.Router();

// Registrar rotas
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/articles', articleRoutes);
apiRouter.use('/contact', contactRoutes);
apiRouter.use('/calculator', calculatorRoutes);
apiRouter.use('/newsletter', newsletterRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/admin', adminRoutes);

// Usar o roteador da API
app.use(`/api/${API_VERSION}`, apiRouter);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Contabilidade Igrejinha API',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    documentation: `/api-docs`,
    health: '/health',
    timestamp: new Date().toISOString(),
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe nesta API`,
    availableRoutes: {
      documentation: '/api-docs',
      health: '/health',
      api: `/api/${API_VERSION}`,
    },
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Função para inicializar o servidor
const startServer = async () => {
  try {
    // Conectar ao banco de dados
    await prisma.$connect();
    logger.info('Conectado ao banco de dados PostgreSQL');

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📚 Documentação disponível em http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health check disponível em http://localhost:${PORT}/health`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Erro ao inicializar o servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais de encerramento
process.on('SIGINT', async () => {
  logger.info('Recebido SIGINT. Encerrando servidor graciosamente...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Recebido SIGTERM. Encerrando servidor graciosamente...');
  await prisma.$disconnect();
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada:', { reason, promise });
  process.exit(1);
});

// Inicializar servidor
if (require.main === module) {
  startServer();
}

export default app;
export { app };