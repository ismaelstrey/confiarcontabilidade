/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - confirmPassword
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: João Silva
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           example: joao@example.com
 *           description: Email válido para login
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: Senha123!
 *           description: Senha com pelo menos 8 caracteres
 *         confirmPassword:
 *           type: string
 *           format: password
 *           example: Senha123!
 *           description: Confirmação da senha (deve ser igual à senha)
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: joao@example.com
 *           description: Email cadastrado
 *         password:
 *           type: string
 *           format: password
 *           example: Senha123!
 *           description: Senha do usuário
 *     
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *           description: Token de renovação válido
 *     
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *         - confirmPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           example: SenhaAtual123!
 *           description: Senha atual do usuário
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: NovaSenha123!
 *           description: Nova senha com pelo menos 8 caracteres
 *         confirmPassword:
 *           type: string
 *           format: password
 *           example: NovaSenha123!
 *           description: Confirmação da nova senha
 *     
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: joao@example.com
 *           description: Email cadastrado para recuperação
 *     
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *         - confirmPassword
 *       properties:
 *         token:
 *           type: string
 *           example: abc123def456
 *           description: Token de recuperação recebido por email
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: NovaSenha123!
 *           description: Nova senha
 *         confirmPassword:
 *           type: string
 *           format: password
 *           example: NovaSenha123!
 *           description: Confirmação da nova senha
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Login realizado com sucesso
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             tokens:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   description: Token de acesso JWT
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   description: Token de renovação
 *                 expiresIn:
 *                   type: number
 *                   example: 3600
 *                   description: Tempo de expiração em segundos
 *     
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clm123abc456
 *           description: ID único do usuário
 *         name:
 *           type: string
 *           example: João Silva
 *           description: Nome completo
 *         email:
 *           type: string
 *           format: email
 *           example: joao@example.com
 *           description: Email do usuário
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           example: USER
 *           description: Papel do usuário no sistema
 *         isActive:
 *           type: boolean
 *           example: true
 *           description: Status ativo do usuário
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *           description: Data da última atualização
 */

// Este arquivo contém apenas definições de esquemas Swagger
// Não há código TypeScript executável aqui
export {};