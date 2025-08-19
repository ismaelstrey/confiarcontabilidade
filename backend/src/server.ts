import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { setupSwagger } from './docs/swagger';
import { cacheService } from './services/cacheService';

// Importar middlewares personalizados
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './middlewares/logger';
import { requestLogger } from './middlewares/requestLogger';
import {
  corsMiddleware,
  helmetMiddleware,
  generalRateLimit,
  authRateLimit,
  apiRateLimit,
  uploadRateLimit,
  compressionMiddleware,
  customSecurityHeaders,
  securityLogger
} from './middlewares/security';

// Importar rotas
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import articleRoutes from './routes/articleRoutes';
import contactRoutes from './routes/contactRoutes';
import calculatorRoutes from './routes/calculatorRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import uploadRoutes from './routes/uploadRoutes';
import adminRoutes from './routes/adminRoutes';
import cacheRoutes from './routes/cacheRoutes';

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

// Configuração do Swagger será feita através do módulo dedicado

// Middlewares de segurança
app.use(customSecurityHeaders);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);
app.use(generalRateLimit);
app.use(securityLogger);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use(requestLogger);

// Configurar documentação da API
setupSwagger(app);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Verificar conexão com o banco de dados
    await prisma.$queryRaw`SELECT 1`;
    
    // Verificar conexão com o Redis
    const redisStatus = cacheService.isRedisConnected() ? 'connected' : 'disconnected';
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected',
      cache: redisStatus,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// Rotas da API
const apiRouter = express.Router();

// Registrar rotas com rate limiting específico
apiRouter.use('/auth', authRateLimit, authRoutes);
apiRouter.use('/users', apiRateLimit, userRoutes);
apiRouter.use('/articles', apiRateLimit, articleRoutes);
apiRouter.use('/contact', apiRateLimit, contactRoutes);
apiRouter.use('/calculator', apiRateLimit, calculatorRoutes);
apiRouter.use('/newsletter', apiRateLimit, newsletterRoutes);
apiRouter.use('/upload', uploadRateLimit, uploadRoutes);
apiRouter.use('/admin', apiRateLimit, adminRoutes);
apiRouter.use('/cache', apiRateLimit, cacheRoutes);

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

    // Conectar ao Redis (cache)
    try {
      await cacheService.connect();
      logger.info('✅ Redis cache connected successfully');
    } catch (error) {
      logger.warn('⚠️ Redis cache connection failed, continuing without cache:', error);
    }

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
  await cacheService.disconnect();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Recebido SIGTERM. Encerrando servidor graciosamente...');
  await cacheService.disconnect();
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