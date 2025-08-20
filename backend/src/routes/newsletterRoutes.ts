import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { NewsletterController } from '../controllers/newsletterController';
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Newsletter:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         isActive:
 *           type: boolean
 *         preferences:
 *           type: object
 *           properties:
 *             frequency:
 *               type: string
 *               enum: [DAILY, WEEKLY, MONTHLY]
 *             categories:
 *               type: array
 *               items:
 *                 type: string
 *             topics:
 *               type: array
 *               items:
 *                 type: string
 *         source:
 *           type: string
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 *         confirmedAt:
 *           type: string
 *           format: date-time
 *         unsubscribedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     NewsletterSubscription:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email para inscrição
 *         name:
 *           type: string
 *           description: Nome do assinante (opcional)
 *         preferences:
 *           type: object
 *           properties:
 *             frequency:
 *               type: string
 *               enum: [DAILY, WEEKLY, MONTHLY]
 *               default: WEEKLY
 *               description: Frequência de envio
 *             categories:
 *               type: array
 *               items:
 *                 type: string
 *               description: Categorias de interesse
 *             topics:
 *               type: array
 *               items:
 *                 type: string
 *               description: Tópicos de interesse
 *         source:
 *           type: string
 *           description: Origem da inscrição (opcional)
 *     NewsletterCampaign:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         subject:
 *           type: string
 *         content:
 *           type: string
 *         htmlContent:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, SCHEDULED, SENDING, SENT, CANCELLED]
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         sentAt:
 *           type: string
 *           format: date-time
 *         recipientCount:
 *           type: integer
 *         openCount:
 *           type: integer
 *         clickCount:
 *           type: integer
 *         unsubscribeCount:
 *           type: integer
 *         bounceCount:
 *           type: integer
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/newsletter/subscribe:
 *   post:
 *     summary: Inscrever-se na newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewsletterSubscription'
 *     responses:
 *       201:
 *         description: Inscrição realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     confirmationRequired:
 *                       type: boolean
 *                     subscriptionId:
 *                       type: string
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já inscrito
 *       429:
 *         description: Muitas tentativas - tente novamente mais tarde
 */
router.post('/subscribe', NewsletterController.subscribeValidation, NewsletterController.subscribe);

/**
 * @swagger
 * /api/v1/newsletter/confirm/{token}:
 *   get:
 *     summary: Confirmar inscrição na newsletter
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de confirmação
 *     responses:
 *       200:
 *         description: Inscrição confirmada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Token inválido ou expirado
 *       404:
 *         description: Inscrição não encontrada
 */
router.get('/confirm/:token', NewsletterController.confirmSubscription);

/**
 * @swagger
 * /api/v1/newsletter/unsubscribe/{token}:
 *   get:
 *     summary: Cancelar inscrição na newsletter
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de cancelamento
 *     responses:
 *       200:
 *         description: Inscrição cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Token inválido
 *       404:
 *         description: Inscrição não encontrada
 */
router.get('/unsubscribe/:token', NewsletterController.unsubscribe);

/**
 * @swagger
 * /api/v1/newsletter/preferences/{token}:
 *   get:
 *     summary: Obter preferências do assinante
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token do assinante
 *     responses:
 *       200:
 *         description: Preferências do assinante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Newsletter'
 *       400:
 *         description: Token inválido
 *       404:
 *         description: Assinante não encontrado
 */
router.get('/preferences/:token', NewsletterController.getPreferences);

/**
 * @swagger
 * /api/v1/newsletter/preferences/{token}:
 *   put:
 *     summary: Atualizar preferências do assinante
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token do assinante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do assinante
 *               preferences:
 *                 type: object
 *                 properties:
 *                   frequency:
 *                     type: string
 *                     enum: [DAILY, WEEKLY, MONTHLY]
 *                   categories:
 *                     type: array
 *                     items:
 *                       type: string
 *                   topics:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Preferências atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Newsletter'
 *       400:
 *         description: Dados inválidos ou token inválido
 *       404:
 *         description: Assinante não encontrado
 */
router.put('/preferences/:token', NewsletterController.updatePreferences);

// Rotas administrativas

/**
 * @swagger
 * /api/v1/newsletter/subscribers:
 *   get:
 *     summary: Listar assinantes (Admin)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
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
 *           default: 20
 *         description: Itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, unconfirmed]
 *         description: Filtrar por status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por email ou nome
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, email, name, confirmedAt]
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
 *         description: Lista de assinantes
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
 *                     subscribers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Newsletter'
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
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         inactive:
 *                           type: integer
 *                         unconfirmed:
 *                           type: integer
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 */
router.get('/subscribers', authenticate, authorize('ADMIN', 'EDITOR'), NewsletterController.getSubscribers);

/**
 * @swagger
 * /api/v1/newsletter/campaigns:
 *   get:
 *     summary: Listar campanhas (Admin)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
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
 *           maximum: 50
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, SCHEDULED, SENDING, SENT, CANCELLED]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de campanhas
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
 *                     campaigns:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NewsletterCampaign'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 */
router.get('/campaigns', authenticate, authorize('ADMIN', 'EDITOR'), NewsletterController.getCampaigns);

/**
 * @swagger
 * /api/v1/newsletter/campaigns:
 *   post:
 *     summary: Criar nova campanha (Admin)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - subject
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 description: Título da campanha
 *               subject:
 *                 type: string
 *                 minLength: 5
 *                 description: Assunto do email
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 description: Conteúdo da campanha
 *               htmlContent:
 *                 type: string
 *                 description: Conteúdo HTML (opcional)
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: Data de agendamento (opcional)
 *     responses:
 *       201:
 *         description: Campanha criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 */
router.post('/campaigns', authenticate, authorize('ADMIN', 'EDITOR'), NewsletterController.campaignValidation, NewsletterController.createCampaign);

/**
 * @swagger
 * /api/v1/newsletter/campaigns/{id}/send:
 *   post:
 *     summary: Enviar campanha (Admin)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha
 *     responses:
 *       200:
 *         description: Campanha enviada com sucesso
 *       400:
 *         description: Campanha não pode ser enviada
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Campanha não encontrada
 */
router.post('/campaigns/:id/send', authenticate, authorize('ADMIN'), NewsletterController.sendCampaignToSubscribers);

export default router;