import express from 'express';
import { setupSwagger } from '../../docs/swagger';
import { requestLogger } from '../../middlewares/requestLogger';
import { errorHandler } from '../../middlewares/errorHandler';
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
} from '../../middlewares/security';

// Importar rotas individuais
import authRoutes from '../../routes/authRoutes';
import userRoutes from '../../routes/userRoutes';
import articleRoutes from '../../routes/articleRoutes';
import contactRoutes from '../../routes/contactRoutes';
import calculatorRoutes from '../../routes/calculatorRoutes';
import newsletterRoutes from '../../routes/newsletterRoutes';
import uploadRoutes from '../../routes/uploadRoutes';
import adminRoutes from '../../routes/adminRoutes';
import cacheRoutes from '../../routes/cacheRoutes';

/**
 * Cria uma instância do aplicativo Express para testes
 * @returns Aplicativo Express configurado
 */
export const createTestServer = () => {
  const app = express();

  // Middlewares de segurança
  app.use(customSecurityHeaders);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(compressionMiddleware);
  app.use(generalRateLimit);
  app.use(securityLogger);

  // Parsing de JSON e URL encoded
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Middleware de logging (apenas para testes de integração)
  if (process.env.TEST_LOGGING === 'true') {
    app.use(requestLogger);
  }

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Documentação Swagger (apenas se não for teste unitário)
  if (process.env.JEST_WORKER_ID === undefined || process.env.TEST_SWAGGER === 'true') {
    setupSwagger(app);
  }

  // Configurar rotas da API com middlewares específicos
  const apiRouter = express.Router();
  
  apiRouter.use('/auth', authRateLimit, authRoutes);
  apiRouter.use('/users', apiRateLimit, userRoutes);
  apiRouter.use('/articles', apiRateLimit, articleRoutes);
  apiRouter.use('/contact', apiRateLimit, contactRoutes);
  apiRouter.use('/calculator', apiRateLimit, calculatorRoutes);
  apiRouter.use('/newsletter', apiRateLimit, newsletterRoutes);
  apiRouter.use('/upload', uploadRateLimit, uploadRoutes);
  apiRouter.use('/admin', apiRateLimit, adminRoutes);
  apiRouter.use('/cache', apiRateLimit, cacheRoutes);
  
  app.use('/api', apiRouter);

  // Middleware de tratamento de erros
  app.use(errorHandler);

  // Rota 404
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Rota não encontrada',
      path: req.originalUrl,
    });
  });

  return app;
};

/**
 * Cria um servidor de teste simplificado para testes unitários
 * @returns Aplicativo Express mínimo
 */
export const createMinimalTestServer = () => {
  const app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  return app;
};