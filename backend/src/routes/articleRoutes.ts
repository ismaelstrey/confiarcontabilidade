import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         excerpt:
 *           type: string
 *         content:
 *           type: string
 *         featuredImage:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         readTime:
 *           type: integer
 *         views:
 *           type: integer
 *         likes:
 *           type: integer
 *         seoTitle:
 *           type: string
 *         seoDescription:
 *           type: string
 *         seoKeywords:
 *           type: string
 *         author:
 *           $ref: '#/components/schemas/User'
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         color:
 *           type: string
 *         icon:
 *           type: string
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         color:
 *           type: string
 *     CreateArticleRequest:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           description: Título do artigo
 *         excerpt:
 *           type: string
 *           description: Resumo do artigo
 *         content:
 *           type: string
 *           minLength: 10
 *           description: Conteúdo do artigo
 *         featuredImage:
 *           type: string
 *           description: URL da imagem destacada
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED]
 *           default: DRAFT
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Data de publicação (opcional)
 *         seoTitle:
 *           type: string
 *           description: Título SEO
 *         seoDescription:
 *           type: string
 *           description: Descrição SEO
 *         seoKeywords:
 *           type: string
 *           description: Palavras-chave SEO
 *         categoryIds:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs das categorias
 *         tagIds:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs das tags
 */

/**
 * @swagger
 * /api/v1/articles:
 *   get:
 *     summary: Listar artigos
 *     tags: [Artigos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         description: Filtrar por status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoria (slug)
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filtrar por tag (slug)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por título ou conteúdo
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filtrar por autor (ID)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, publishedAt, title, views, likes]
 *           default: createdAt
 *         description: Campo para ordenação
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordem da classificação
 *     responses:
 *       200:
 *         description: Lista de artigos
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
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Article'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/', (req, res) => {
  // TODO: Implementar controller para listar artigos
  res.status(501).json({
    success: false,
    message: 'Endpoint não implementado ainda',
    endpoint: 'GET /articles',
  });
});

/**
 * @swagger
 * /api/v1/articles/{slug}:
 *   get:
 *     summary: Obter artigo por slug
 *     tags: [Artigos]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug do artigo
 *     responses:
 *       200:
 *         description: Dados do artigo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       404:
 *         description: Artigo não encontrado
 */
router.get('/:slug', (req, res) => {
  // TODO: Implementar controller para obter artigo por slug
  res.status(501).json({
    success: false,
    message: 'Endpoint não implementado ainda',
    endpoint: 'GET /articles/:slug',
  });
});

/**
 * @swagger
 * /api/v1/articles:
 *   post:
 *     summary: Criar novo artigo
 *     tags: [Artigos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateArticleRequest'
 *     responses:
 *       201:
 *         description: Artigo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 */
router.post('/', authenticate, authorize('ADMIN', 'EDITOR'), (req, res) => {
  // TODO: Implementar controller para criar artigo
  res.status(501).json({
    success: false,
    message: 'Endpoint não implementado ainda',
    endpoint: 'POST /articles',
  });
});

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   put:
 *     summary: Atualizar artigo
 *     tags: [Artigos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do artigo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateArticleRequest'
 *     responses:
 *       200:
 *         description: Artigo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Artigo não encontrado
 */
router.put('/:id', authenticate, authorize('ADMIN', 'EDITOR'), (req, res) => {
  // TODO: Implementar controller para atualizar artigo
  res.status(501).json({
    success: false,
    message: 'Endpoint não implementado ainda',
    endpoint: 'PUT /articles/:id',
  });
});

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   delete:
 *     summary: Excluir artigo
 *     tags: [Artigos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do artigo
 *     responses:
 *       200:
 *         description: Artigo excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Artigo não encontrado
 */
router.delete('/:id', authenticate, authorize('ADMIN', 'EDITOR'), (req, res) => {
  // TODO: Implementar controller para excluir artigo
  res.status(501).json({
    success: false,
    message: 'Endpoint não implementado ainda',
    endpoint: 'DELETE /articles/:id',
  });
});

/**
 * @swagger
 * /api/v1/articles/{id}/like:
 *   post:
 *     summary: Curtir/descurtir artigo
 *     tags: [Artigos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do artigo
 *     responses:
 *       200:
 *         description: Like processado com sucesso
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
 *                     liked:
 *                       type: boolean
 *                     totalLikes:
 *                       type: integer
 *                 message:
 *                   type: string
 *       404:
 *         description: Artigo não encontrado
 */
router.post('/:id/like', (req, res) => {
  // TODO: Implementar controller para curtir artigo
  res.status(501).json({
    success: false,
    message: 'Endpoint não implementado ainda',
    endpoint: 'POST /articles/:id/like',
  });
});

/**
 * @swagger
 * /api/v1/articles/{id}/comments:
 *   get:
 *     summary: Listar comentários do artigo
 *     tags: [Artigos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do artigo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de comentários
 *       404:
 *         description: Artigo não encontrado
 */
router.get('/:id/comments', (req, res) => {
  // TODO: Implementar controller para listar comentários
  res.status(501).json({
    success: false,
    message: 'Endpoint não implementado ainda',
    endpoint: 'GET /articles/:id/comments',
  });
});

/**
 * @swagger
 * /api/v1/articles/{id}/comments:
 *   post:
 *     summary: Adicionar comentário ao artigo
 *     tags: [Artigos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do artigo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - authorName
 *               - authorEmail
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 3
 *                 description: Conteúdo do comentário
 *               authorName:
 *                 type: string
 *                 minLength: 2
 *                 description: Nome do autor
 *               authorEmail:
 *                 type: string
 *                 format: email
 *                 description: Email do autor
 *               parentId:
 *                 type: string
 *                 description: ID do comentário pai (para respostas)
 *     responses:
 *       201:
 *         description: Comentário adicionado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Artigo não encontrado
 */
router.post('/:id/comments', (req, res) => {
  // TODO: Implementar controller para adicionar comentário
  res.status(501).json({
    success: false,
    message: 'Endpoint não implementado ainda',
    endpoint: 'POST /articles/:id/comments',
  });
});

export default router;