import { Hono } from 'hono';
import { createOpenAPIApp } from '../docs/swagger';

/**
 * Rotas para documentação da API
 */
const docsRoutes = new Hono();

// Criar instância do OpenAPI
const openAPIApp = createOpenAPIApp();

// Redirecionar para a documentação
docsRoutes.get('/', (c) => {
  return c.redirect('/api/docs/ui');
});

// Montar as rotas do OpenAPI
docsRoutes.route('/', openAPIApp);

// Rota de informações da API
docsRoutes.get('/info', (c) => {
  return c.json({
    success: true,
    message: 'Documentação da API Contabilidade Igrejinha',
    data: {
      version: '1.0.0',
      title: 'Contabilidade Igrejinha API',
      description: 'API completa para sistema de contabilidade com gestão de usuários, artigos, contatos e calculadoras.',
      endpoints: {
        documentation: '/api/docs/ui',
        openapi_spec: '/api/docs/doc',
        info: '/api/docs/info'
      },
      contact: {
        name: 'Suporte Técnico',
        email: 'suporte@contabilidadeigrejinha.com.br'
      }
    }
  });
});

export { docsRoutes };