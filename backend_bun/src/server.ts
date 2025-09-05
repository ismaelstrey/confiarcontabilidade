import { serve } from 'bun';
import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import { rateLimiters } from './middlewares/advancedRateLimit';

// Importar rotas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import articleRoutes from './routes/articles';
import contactRoutes from './routes/contacts';
import calculatorRoutes from './routes/calculator';
import newsletterRoutes from './routes/newsletter';
import uploadRoutes from './routes/uploads';
import adminRoutes from './routes/admin';
import { docsRoutes } from './routes/docs';

// Importar middlewares customizados
import {
  errorHandler,
  rateLimitConfigs,
  rateLimit
} from './middlewares';

// Importar configurações
import appConfig from './config';

// Configurações
const { server, cors: corsConfig } = appConfig;

// Criar aplicação Hono
const app = new Hono();

// Configurar ambiente
const isDevelopment = server.isDevelopment;

// Middlewares globais
app.use('*', timing());
app.use('*', prettyJSON());
app.use('*', secureHeaders());

// Rate limiting global para todas as rotas da API
app.use('/api/*', rateLimiters.general);

// CORS customizado baseado no ambiente
app.use('*', async (c, next) => {
  const origin = c.req.header('origin');
  const method = c.req.method;

  // Definir origens permitidas baseado no ambiente
  const allowedOrigins = isDevelopment
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002', 'http://127.0.0.1:3003', 'http://127.0.0.1:3004']
    : corsConfig.origins.filter(o => o.startsWith('https://'));

  // Verificar se a origem é permitida
  const isOriginAllowed = !origin || allowedOrigins.includes(origin) || isDevelopment;

  // Headers CORS
  if (isOriginAllowed) {
    c.header('Access-Control-Allow-Origin', origin || '*');
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name');
    c.header('Access-Control-Max-Age', '86400');
  }

  // Responder a requisições OPTIONS (preflight)
  if (method === 'OPTIONS') {
    return c.text('', { status: 200 });
  }

  await next();
});

// Rate limiting global
app.use('*', rateLimit(rateLimitConfigs.general));

// Logging customizado
app.use('*', async (c, next) => {
  const startTime = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const userAgent = c.req.header('user-agent');
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

  if (isDevelopment) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip}`);
  }

  await next();

  const responseTime = Date.now() - startTime;
  if (isDevelopment) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${c.res.status} (${responseTime}ms)`);
  }
});

// Health check
app.get('/health', async (c) => {
  try {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: server.environment,
      apiVersion: server.apiVersion
    });
  } catch (error) {
    return c.json({ status: 'error', message: 'Health check failed' }, 500);
  }
});

// Rotas da API
const api = new Hono();

// Registrar rotas
api.route('/auth', authRoutes);
api.route('/users', userRoutes);
api.route('/articles', articleRoutes);
api.route('/contacts', contactRoutes);
api.route('/calculator', calculatorRoutes);
api.route('/newsletter', newsletterRoutes);
api.route('/uploads', uploadRoutes);
api.route('/admin', adminRoutes);

// Montar API com versionamento
app.route(`/api/${server.apiVersion}`, api);

// Documentação da API
app.route('/api/docs', docsRoutes);

// Rota raiz
app.get('/', (c) => {
  return c.json({
    message: 'Contabilidade Igrejinha API - Bun Version',
    version: server.apiVersion,
    documentation: `/api/${server.apiVersion}/docs`,
    health: '/health'
  });
});

// Rota 404
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Endpoint não encontrado',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

// Error handler
app.onError(errorHandler);

// Iniciar servidor
const bunServer = serve({
  port: server.port,
  hostname: server.host,
  fetch: app.fetch,
});

console.log(`🚀 Servidor rodando na porta ${server.port}`);
console.log(`📚 API disponível em http://localhost:${server.port}/api/${server.apiVersion}`);
console.log(`🏥 Health check em http://localhost:${server.port}/health`);
console.log(`🌍 Ambiente: ${server.environment}`);
console.log(`🔒 CORS Origins: ${corsConfig.origins.join(', ')}`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  bunServer.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidor...');
  bunServer.stop();
  process.exit(0);
});

export default app;
export { bunServer as server };