/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *           description: Status da resposta
 *         message:
 *           type: string
 *           example: Ocorreu um erro ao processar a solicitação
 *           description: Mensagem de erro principal
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Campo 'email' é obrigatório", "Senha deve ter pelo menos 8 caracteres"]
 *           description: Lista detalhada de erros de validação
 *         code:
 *           type: string
 *           example: VALIDATION_ERROR
 *           description: Código específico do erro
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *           description: Timestamp do erro
 *     
 *     ApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, error]
 *           example: success
 *           description: Status da operação
 *         message:
 *           type: string
 *           example: Operação realizada com sucesso
 *           description: Mensagem descritiva
 *         data:
 *           type: object
 *           description: Dados da resposta (varia conforme endpoint)
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *           description: Timestamp da resposta
 *     
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *           description: Página atual
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *           description: Itens por página
 *         totalItems:
 *           type: integer
 *           example: 100
 *           description: Total de itens
 *         totalPages:
 *           type: integer
 *           example: 10
 *           description: Total de páginas
 *         hasNext:
 *           type: boolean
 *           example: true
 *           description: Indica se há próxima página
 *         hasPrev:
 *           type: boolean
 *           example: false
 *           description: Indica se há página anterior
 *     
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Dados recuperados com sucesso
 *         data:
 *           type: array
 *           items:
 *             type: object
 *           description: Array de itens da página atual
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *     
 *     HealthCheck:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: OK
 *           description: Status geral do sistema
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *         uptime:
 *           type: number
 *           example: 3600.5
 *           description: Tempo de atividade em segundos
 *         environment:
 *           type: string
 *           example: development
 *           description: Ambiente atual
 *         version:
 *           type: string
 *           example: 1.0.0
 *           description: Versão da API
 *         database:
 *           type: string
 *           example: Connected
 *           description: Status da conexão com banco de dados
 *     
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
 *           maxLength: 100
 *           example: Maria Santos
 *           description: Nome completo do contato
 *         email:
 *           type: string
 *           format: email
 *           example: maria@example.com
 *           description: Email para resposta
 *         phone:
 *           type: string
 *           example: (11) 99999-9999
 *           description: Telefone (opcional)
 *         subject:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           example: Dúvida sobre serviços contábeis
 *           description: Assunto da mensagem
 *         message:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           example: Gostaria de saber mais sobre os serviços oferecidos para igrejas.
 *           description: Mensagem detalhada
 *         company:
 *           type: string
 *           maxLength: 100
 *           example: Igreja Batista Central
 *           description: Empresa/Organização (opcional)
 *         website:
 *           type: string
 *           format: uri
 *           example: https://igrejabatistacentral.com.br
 *           description: Website (opcional)
 *     
 *     ContactResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Mensagem enviada com sucesso
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: clm123abc456
 *               description: ID único da mensagem
 *             ticketNumber:
 *               type: string
 *               example: TICKET-2024-001
 *               description: Número do ticket para acompanhamento
 *             estimatedResponse:
 *               type: string
 *               example: 24 horas
 *               description: Tempo estimado para resposta
 */

// Este arquivo contém apenas definições de esquemas Swagger
// Não há código TypeScript executável aqui
export {};