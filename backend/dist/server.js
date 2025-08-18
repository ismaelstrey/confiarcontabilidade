"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_1 = require("./middlewares/logger");
const requestLogger_1 = require("./middlewares/requestLogger");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const articleRoutes_1 = __importDefault(require("./routes/articleRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const calculatorRoutes_1 = __importDefault(require("./routes/calculatorRoutes"));
const newsletterRoutes_1 = __importDefault(require("./routes/newsletterRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
exports.prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';
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
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        error: 'Muitas tentativas de acesso. Tente novamente em alguns minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger_1.requestLogger);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
app.get('/health', async (req, res) => {
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            version: process.env.SWAGGER_VERSION || '1.0.0',
            database: 'Connected',
        });
    }
    catch (error) {
        logger_1.logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: 'Disconnected',
            error: 'Database connection failed',
        });
    }
});
const apiRouter = express_1.default.Router();
apiRouter.use('/auth', authRoutes_1.default);
apiRouter.use('/users', userRoutes_1.default);
apiRouter.use('/articles', articleRoutes_1.default);
apiRouter.use('/contact', contactRoutes_1.default);
apiRouter.use('/calculator', calculatorRoutes_1.default);
apiRouter.use('/newsletter', newsletterRoutes_1.default);
apiRouter.use('/upload', uploadRoutes_1.default);
apiRouter.use('/admin', adminRoutes_1.default);
app.use(`/api/${API_VERSION}`, apiRouter);
app.get('/', (req, res) => {
    res.json({
        message: 'Contabilidade Igrejinha API',
        version: process.env.SWAGGER_VERSION || '1.0.0',
        documentation: `/api-docs`,
        health: '/health',
        timestamp: new Date().toISOString(),
    });
});
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
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await exports.prisma.$connect();
        logger_1.logger.info('Conectado ao banco de dados PostgreSQL');
        app.listen(PORT, () => {
            logger_1.logger.info(`🚀 Servidor rodando na porta ${PORT}`);
            logger_1.logger.info(`📚 Documentação disponível em http://localhost:${PORT}/api-docs`);
            logger_1.logger.info(`🏥 Health check disponível em http://localhost:${PORT}/health`);
            logger_1.logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Erro ao inicializar o servidor:', error);
        process.exit(1);
    }
};
process.on('SIGINT', async () => {
    logger_1.logger.info('Recebido SIGINT. Encerrando servidor graciosamente...');
    await exports.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    logger_1.logger.info('Recebido SIGTERM. Encerrando servidor graciosamente...');
    await exports.prisma.$disconnect();
    process.exit(0);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Erro não capturado:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Promise rejeitada não tratada:', { reason, promise });
    process.exit(1);
});
if (require.main === module) {
    startServer();
}
exports.default = app;
//# sourceMappingURL=server.js.map