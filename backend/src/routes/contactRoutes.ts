import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import ContactController from '../controllers/contactController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         subject:
 *           type: string
 *         message:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         assignedTo:
 *           type: string
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *     ContactRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - subject
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           description: Nome completo
 *         email:
 *           type: string
 *           format: email
 *           description: Email para contato
 *         phone:
 *           type: string
 *           description: Telefone (opcional)
 *         subject:
 *           type: string
 *           minLength: 5
 *           description: Assunto da mensagem
 *         message:
 *           type: string
 *           minLength: 10
 *           description: Mensagem detalhada
 *         company:
 *           type: string
 *           description: Empresa (opcional)
 *         website:
 *           type: string
 *           description: Website (opcional)
 */

/**
 * @swagger
 * /api/v1/contact:
 *   post:
 *     summary: Enviar mensagem de contato
 *     tags: [Contato]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *     responses:
 *       201:
 *         description: Mensagem enviada com sucesso
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
 *                     id:
 *                       type: string
 *                     ticketNumber:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       429:
 *         description: Muitas tentativas - tente novamente mais tarde
 */
router.post('/', (req, res) => ContactController.createContact(req, res));

/**
 * @swagger
 * /api/v1/contact:
 *   get:
 *     summary: Listar mensagens de contato (Admin)
 *     tags: [Contato]
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
 *           enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *         description: Filtrar por status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: Filtrar por prioridade
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filtrar por responsável
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome, email ou assunto
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
 *           enum: [createdAt, updatedAt, priority, status]
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
 *         description: Lista de mensagens de contato
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
 *                     contacts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Contact'
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
 *                         pending:
 *                           type: integer
 *                         inProgress:
 *                           type: integer
 *                         resolved:
 *                           type: integer
 *                         closed:
 *                           type: integer
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 */
router.get('/', authenticate, authorize('ADMIN', 'EDITOR'), ContactController.getContacts);

/**
 * @swagger
 * /api/v1/contact/{id}:
 *   get:
 *     summary: Obter mensagem de contato por ID (Admin)
 *     tags: [Contato]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da mensagem
 *     responses:
 *       200:
 *         description: Dados da mensagem de contato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Mensagem não encontrada
 */
router.get('/:id', authenticate, authorize('ADMIN', 'EDITOR'), ContactController.getContactById);

/**
 * @swagger
 * /api/v1/contact/{id}/status:
 *   patch:
 *     summary: Atualizar status da mensagem (Admin)
 *     tags: [Contato]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da mensagem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *                 description: Novo status
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 description: Nova prioridade (opcional)
 *               assignedTo:
 *                 type: string
 *                 description: ID do usuário responsável (opcional)
 *               notes:
 *                 type: string
 *                 description: Notas internas (opcional)
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Mensagem não encontrada
 */
router.patch('/:id/status', authenticate, authorize('ADMIN', 'EDITOR'), (req, res) => ContactController.updateContactStatus(req, res));

/**
 * @swagger
 * /api/v1/contact/{id}/reply:
 *   post:
 *     summary: Responder mensagem de contato (Admin)
 *     tags: [Contato]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da mensagem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *                 minLength: 5
 *                 description: Assunto da resposta
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 description: Mensagem de resposta
 *               template:
 *                 type: string
 *                 description: Template de email (opcional)
 *     responses:
 *       200:
 *         description: Resposta enviada com sucesso
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
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Mensagem não encontrada
 */
router.post('/:id/reply', authenticate, authorize('ADMIN', 'EDITOR'), ContactController.replyToContact);

/**
 * @swagger
 * /api/v1/contact/{id}:
 *   delete:
 *     summary: Excluir mensagem de contato (Admin)
 *     tags: [Contato]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da mensagem
 *     responses:
 *       200:
 *         description: Mensagem excluída com sucesso
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
 *         description: Mensagem não encontrada
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ContactController.deleteContact);

export default router;