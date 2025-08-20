import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { CacheExampleController } from '../controllers/cacheExampleController';
import { publicCacheMiddleware } from '../middlewares/cache';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CacheResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *         cached:
 *           type: boolean
 *         message:
 *           type: string
 *     CacheManagement:
 *       type: object
 *       properties:
 *         pattern:
 *           type: string
 *           description: Padrao para limpeza de cache
 *         key:
 *           type: string
 *           description: Chave específica para operações de cache
 */

/**
 * @swagger
 * /api/v1/cache/example/{id}:
 *   get:
 *     summary: Exemplo de uso de cache manual
 *     description: Demonstra como usar cache diretamente no controller
 *     tags: [Cache Examples]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item a ser buscado
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CacheResponse'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/example/:id', CacheExampleController.getDataWithCache);

/**
 * @swagger
 * /api/v1/cache/example/{id}:
 *   put:
 *     summary: Exemplo de atualização com invalidação de cache
 *     description: Demonstra como invalidar cache após operações de escrita
 *     tags: [Cache Examples]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dados atualizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CacheResponse'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/example/:id', authenticate, CacheExampleController.updateDataAndInvalidateCache);

/**
 * @swagger
 * /api/v1/cache/dynamic/{type}/{id}:
 *   get:
 *     summary: Exemplo de cache com TTL dinâmico
 *     description: Demonstra como definir TTL baseado no tipo de dados
 *     tags: [Cache Examples]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [static, dynamic, realtime]
 *         description: Tipo de dados (define o TTL)
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/CacheResponse'
 *                 - type: object
 *                   properties:
 *                     ttl:
 *                       type: integer
 *                       description: Tempo de vida do cache em segundos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dynamic/:type/:id', CacheExampleController.getDataWithDynamicTTL);

/**
 * @swagger
 * /api/v1/cache/conditional/{id}:
 *   get:
 *     summary: Exemplo de cache condicional
 *     description: Demonstra como cachear baseado em condições específicas
 *     tags: [Cache Examples]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item
 *       - in: query
 *         name: useCache
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Se deve usar cache ou não
 *       - in: header
 *         name: Cache-Control
 *         schema:
 *           type: string
 *         description: Controle de cache HTTP
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/CacheResponse'
 *                 - type: object
 *                   properties:
 *                     cacheUsed:
 *                       type: boolean
 *                       description: Se o cache foi utilizado
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/conditional/:id', authenticate, CacheExampleController.getDataWithConditionalCache);

/**
 * @swagger
 * /api/v1/cache/manage/{action}:
 *   post:
 *     summary: Gerenciar cache
 *     description: Permite limpar cache, verificar status, etc.
 *     tags: [Cache Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [clear, status, check]
 *         description: Ação a ser executada
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CacheManagement'
 *     responses:
 *       200:
 *         description: Operação executada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 connected:
 *                   type: boolean
 *                   description: Status da conexão Redis (apenas para action=status)
 *                 exists:
 *                   type: boolean
 *                   description: Se a chave existe (apenas para action=check)
 *                 ttl:
 *                   type: integer
 *                   description: TTL da chave em segundos (apenas para action=check)
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/manage/:action', authenticate, authorize('ADMIN'), CacheExampleController.manageCacheEndpoint);

/**
 * @swagger
 * /api/v1/cache/middleware-example:
 *   get:
 *     summary: Exemplo de uso do middleware de cache
 *     description: Demonstra como o middleware de cache funciona automaticamente
 *     tags: [Cache Examples]
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso (pode vir do cache)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     cached:
 *                       type: boolean
 *                 message:
 *                   type: string
 */
router.get('/middleware-example', publicCacheMiddleware(300), (req, res) => {
  // Este endpoint será automaticamente cacheado pelo middleware
  res.json({
    success: true,
    data: {
      message: 'Este endpoint usa middleware de cache automático',
      timestamp: new Date().toISOString(),
      cached: false // Será true quando vier do cache
    },
    message: 'Dados obtidos com sucesso'
  });
});

/**
 * @swagger
 * /api/v1/cache/no-cache-example:
 *   get:
 *     summary: Exemplo sem cache
 *     description: Endpoint que nunca usa cache para comparação
 *     tags: [Cache Examples]
 *     responses:
 *       200:
 *         description: Dados sempre frescos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     cached:
 *                       type: boolean
 *                 message:
 *                   type: string
 */
router.get('/no-cache-example', (req, res) => {
  // Este endpoint nunca usa cache
  res.json({
    success: true,
    data: {
      message: 'Este endpoint nunca usa cache',
      timestamp: new Date().toISOString(),
      cached: false
    },
    message: 'Dados sempre frescos'
  });
});

export default router;