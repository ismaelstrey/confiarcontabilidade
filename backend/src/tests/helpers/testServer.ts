import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from '../../docs/swagger';
import routes from '../../routes';
import { requestLogger } from '../../middlewares/requestLogger';
import { errorHandler } from '../../middlewares/errorHandler';

/**
 * Cria uma instância do aplicativo Express para testes
 * @returns Aplicativo Express configurado
 */
export const createTestServer = () => {
  const app = express();

  // Middlewares básicos
  app.use(helmet());
  app.use(compression());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }));

  // Rate limiting mais permissivo para testes
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // Limite alto para testes
    message: 'Muitas requisições deste IP, tente novamente em alguns minutos.',
  });
  app.use(limiter);

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

  // Rotas da API
  app.use('/api', routes);

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