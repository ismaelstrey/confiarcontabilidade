# Documentação da API com Swagger - Contabilidade Igrejinha

Este documento contém exemplos de implementação da documentação da API com Swagger para o backend da aplicação Contabilidade Igrejinha.

## Configuração do Swagger

### Instalação das Dependências

```bash
pnpm add swagger-ui-express swagger-jsdoc
pnpm add -D @types/swagger-ui-express @types/swagger-jsdoc
```

### Configuração Básica

```typescript
// src/docs/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { version } from '../../package.json';

// Opções básicas do Swagger
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Contabilidade Igrejinha',
      version,
      description: 'Documentação da API do sistema Contabilidade Igrejinha',
      contact: {
        name: 'Suporte Contabilidade Igrejinha',
        email: 'suporte@contabilidadeigrejinha.com.br',
        url: 'https://contabilidadeigrejinha.com.br',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'https://api.contabilidadeigrejinha.com.br/api',
        description: 'Servidor de Produção',
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
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.ts', './src/docs/schemas/*.ts'],
};

// Gera a especificação do Swagger
const specs = swaggerJsdoc(options);

/**
 * Configura o Swagger na aplicação Express
 * @param app Instância do Express
 */
export const setupSwagger = (app: Express) => {
  // Rota para a documentação do Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Contabilidade Igrejinha',
  }));
  
  // Rota para a especificação OpenAPI em formato JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  
  console.log('Swagger configurado com sucesso!');
};
```

### Integração com o Aplicativo Express

```typescript
// src/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { setupSwagger } from './docs/swagger';
import { setupRoutes } from './routes';
import { errorMiddleware } from './middlewares/errorMiddleware';

/**
 * Configura a aplicação Express
 * @returns Aplicação Express configurada
 */
export const setupApp = async (): Promise<Express> => {
  const app = express();
  
  // Middlewares básicos
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Configura as rotas da API
  setupRoutes(app);
  
  // Configura o Swagger
  setupSwagger(app);
  
  // Middleware de tratamento de erros (deve ser o último)
  app.use(errorMiddleware);
  
  return app;
};
```

## Definição de Esquemas

### Esquemas Básicos

```typescript
// src/docs/schemas/common.ts
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
 *         message:
 *           type: string
 *           example: Ocorreu um erro ao processar a solicitação
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Campo 'email' é obrigatório", "Senha deve ter pelo menos 8 caracteres"]
 *     
 *     ApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, error]
 *           example: success
 *         message:
 *           type: string
 *           example: Operação realizada com sucesso
 *         data:
 *           type: object
 *     
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalItems:
 *           type: integer
 *           example: 100
 *         totalPages:
 *           type: integer
 *           example: 10
 *         hasNext:
 *           type: boolean
 *           example: true
 *         hasPrev:
 *           type: boolean
 *           example: false
 */
```

### Esquemas de Autenticação

```typescript
// src/docs/schemas/auth.ts
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
 *           example: João Silva
 *         email:
 *           type: string
 *           format: email
 *           example: joao@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: Senha123!
 *         confirmPassword:
 *           type: string
 *           format: password
 *           example: Senha123!
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
 *         password:
 *           type: string
 *           format: password
 *           example: Senha123!
 *     
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
 *           example: Senha123!
 *         newPassword:
 *           type: string
 *           format: password
 *           example: NovaSenha123!
 *         confirmPassword:
 *           type: string
 *           format: password
 *           example: NovaSenha123!
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
 *     
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - password
 *         - confirmPassword
 *       properties:
 *         token:
 *           type: string
 *           example: 123456
 *         password:
 *           type: string
 *           format: password
 *           example: NovaSenha123!
 *         confirmPassword:
 *           type: string
 *           format: password
 *           example: NovaSenha123!
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             refreshToken:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             user:
 *               $ref: '#/components/schemas/User'
 *     
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         name:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           format: email
 *           example: joao@example.com
 *         role:
 *           type: string
 *           enum: [CLIENT, ADMIN]
 *           example: CLIENT
 *         active:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00Z
 */
```

### Esquemas de Contato

```typescript
// src/docs/schemas/contact.ts
/**
 * @swagger
 * components:
 *   schemas:
 *     ContactRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           format: email
 *           example: joao@example.com
 *         phone:
 *           type: string
 *           example: (11) 98765-4321
 *         message:
 *           type: string
 *           example: Gostaria de obter mais informações sobre os serviços de contabilidade para MEI.
 *         service:
 *           type: string
 *           example: Contabilidade para MEI
 *     
 *     ContactStatusUpdateRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, CONTACTED, CONVERTED, CLOSED]
 *           example: CONTACTED
 *         notes:
 *           type: string
 *           example: Cliente foi contatado por telefone e demonstrou interesse.
 *     
 *     Contact:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         name:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           format: email
 *           example: joao@example.com
 *         phone:
 *           type: string
 *           example: (11) 98765-4321
 *         message:
 *           type: string
 *           example: Gostaria de obter mais informações sobre os serviços de contabilidade para MEI.
 *         service:
 *           type: string
 *           example: Contabilidade para MEI
 *         status:
 *           type: string
 *           enum: [PENDING, CONTACTED, CONVERTED, CLOSED]
 *           example: PENDING
 *         notes:
 *           type: string
 *           example: ""
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00Z
 *     
 *     ContactResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             contact:
 *               $ref: '#/components/schemas/Contact'
 *     
 *     ContactListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             contacts:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 */
```

### Esquemas de Calculadora

```typescript
// src/docs/schemas/calculator.ts
/**
 * @swagger
 * components:
 *   schemas:
 *     TaxCalculationRequest:
 *       type: object
 *       required:
 *         - revenue
 *         - expenses
 *         - taxRegime
 *         - businessType
 *       properties:
 *         revenue:
 *           type: number
 *           format: float
 *           example: 100000
 *         expenses:
 *           type: number
 *           format: float
 *           example: 30000
 *         employees:
 *           type: integer
 *           example: 2
 *         taxRegime:
 *           type: string
 *           enum: [SIMPLES_NACIONAL, LUCRO_PRESUMIDO, LUCRO_REAL, MEI]
 *           example: SIMPLES_NACIONAL
 *         businessType:
 *           type: string
 *           enum: [COMERCIO, SERVICOS, INDUSTRIA, MISTO]
 *           example: SERVICOS
 *         saveResult:
 *           type: boolean
 *           example: false
 *     
 *     TaxCalculationResult:
 *       type: object
 *       properties:
 *         totalTax:
 *           type: number
 *           format: float
 *           example: 15000
 *         netProfit:
 *           type: number
 *           format: float
 *           example: 55000
 *         taxBreakdown:
 *           type: object
 *           properties:
 *             simples:
 *               type: number
 *               format: float
 *               example: 10000
 *             irpj:
 *               type: number
 *               format: float
 *               example: 0
 *             csll:
 *               type: number
 *               format: float
 *               example: 0
 *             pis:
 *               type: number
 *               format: float
 *               example: 0
 *             cofins:
 *               type: number
 *               format: float
 *               example: 0
 *             iss:
 *               type: number
 *               format: float
 *               example: 5000
 *             inss:
 *               type: number
 *               format: float
 *               example: 0
 *             fgts:
 *               type: number
 *               format: float
 *               example: 0
 *         taxRate:
 *           type: number
 *           format: float
 *           example: 15
 *         profitMargin:
 *           type: number
 *           format: float
 *           example: 55
 *     
 *     SavedCalculation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         revenue:
 *           type: number
 *           format: float
 *           example: 100000
 *         expenses:
 *           type: number
 *           format: float
 *           example: 30000
 *         employees:
 *           type: integer
 *           example: 2
 *         taxRegime:
 *           type: string
 *           enum: [SIMPLES_NACIONAL, LUCRO_PRESUMIDO, LUCRO_REAL, MEI]
 *           example: SIMPLES_NACIONAL
 *         businessType:
 *           type: string
 *           enum: [COMERCIO, SERVICOS, INDUSTRIA, MISTO]
 *           example: SERVICOS
 *         result:
 *           $ref: '#/components/schemas/TaxCalculationResult'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00Z
 *     
 *     CalculatorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             result:
 *               $ref: '#/components/schemas/TaxCalculationResult'
 *             savedCalculation:
 *               $ref: '#/components/schemas/SavedCalculation'
 *     
 *     SavedCalculationListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             calculations:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SavedCalculation'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 */
```

## Documentação das Rotas

### Rotas de Autenticação

```typescript
// src/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authValidation } from '../validators/authValidation';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email já está em uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  validationMiddleware(authValidation.register),
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login de um usuário
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  validationMiddleware(authValidation.login),
  authController.login
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Atualiza o token de acesso usando o refresh token
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Refresh token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/refresh-token',
  validationMiddleware(authValidation.refreshToken),
  authController.refreshToken
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Realiza logout de um usuário
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Logout realizado com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Altera a senha do usuário logado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado ou senha atual incorreta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/change-password',
  authMiddleware,
  validationMiddleware(authValidation.changePassword),
  authController.changePassword
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicita redefinição de senha
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Email de redefinição enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Email de redefinição enviado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Email não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/forgot-password',
  validationMiddleware(authValidation.forgotPassword),
  authController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefine a senha usando o token recebido por email
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Senha redefinida com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/reset-password',
  validationMiddleware(authValidation.resetPassword),
  authController.resetPassword
);

export const authRoutes = router;
```

### Rotas de Contato

```typescript
// src/routes/contactRoutes.ts
import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { contactValidation } from '../validators/contactValidation';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();
const contactController = new ContactController();

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Cria um novo contato
 *     tags: [Contatos]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *     responses:
 *       201:
 *         description: Contato criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  validationMiddleware(contactValidation.create),
  contactController.create
);

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Lista todos os contatos (apenas admin)
 *     tags: [Contatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONTACTED, CONVERTED, CLOSED]
 *         description: Filtrar por status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou email
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name, status]
 *           default: createdAt
 *         description: Campo para ordenação
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordem de classificação
 *     responses:
 *       200:
 *         description: Lista de contatos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactListResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  contactController.findAll
);

/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     summary: Obtém um contato pelo ID (apenas admin)
 *     tags: [Contatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do contato
 *     responses:
 *       200:
 *         description: Contato encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Contato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(contactValidation.getById),
  contactController.findById
);

/**
 * @swagger
 * /contacts/{id}/status:
 *   put:
 *     summary: Atualiza o status de um contato (apenas admin)
 *     tags: [Contatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do contato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactStatusUpdateRequest'
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Contato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(contactValidation.updateStatus),
  contactController.updateStatus
);

export const contactRoutes = router;
```

### Rotas de Calculadora

```typescript
// src/routes/calculatorRoutes.ts
import { Router } from 'express';
import { CalculatorController } from '../controllers/calculatorController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { calculatorValidation } from '../validators/calculatorValidation';
import { authMiddleware } from '../middlewares/authMiddleware';
import { optionalAuthMiddleware } from '../middlewares/optionalAuthMiddleware';

const router = Router();
const calculatorController = new CalculatorController();

/**
 * @swagger
 * /calculator/tax:
 *   post:
 *     summary: Calcula impostos com base nos dados fornecidos
 *     tags: [Calculadora]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaxCalculationRequest'
 *     responses:
 *       200:
 *         description: Cálculo realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalculatorResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado (apenas se saveResult=true)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/tax',
  optionalAuthMiddleware,
  validationMiddleware(calculatorValidation.calculate),
  calculatorController.calculate
);

/**
 * @swagger
 * /calculator/saved:
 *   get:
 *     summary: Lista todos os cálculos salvos do usuário
 *     tags: [Calculadora]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de itens por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, revenue, taxRegime]
 *           default: createdAt
 *         description: Campo para ordenação
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordem de classificação
 *     responses:
 *       200:
 *         description: Lista de cálculos salvos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavedCalculationListResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/saved',
  authMiddleware,
  calculatorController.findAllSaved
);

/**
 * @swagger
 * /calculator/saved/{id}:
 *   get:
 *     summary: Obtém um cálculo salvo pelo ID
 *     tags: [Calculadora]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cálculo salvo
 *     responses:
 *       200:
 *         description: Cálculo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     calculation:
 *                       $ref: '#/components/schemas/SavedCalculation'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cálculo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/saved/:id',
  authMiddleware,
  validationMiddleware(calculatorValidation.getById),
  calculatorController.findSavedById
);

/**
 * @swagger
 * /calculator/saved/{id}:
 *   delete:
 *     summary: Remove um cálculo salvo
 *     tags: [Calculadora]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cálculo salvo
 *     responses:
 *       200:
 *         description: Cálculo removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Cálculo removido com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cálculo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/saved/:id',
  authMiddleware,
  validationMiddleware(calculatorValidation.getById),
  calculatorController.removeSaved
);

export const calculatorRoutes = router;
```

## Configuração das Rotas

```typescript
// src/routes/index.ts
import { Express } from 'express';
import { authRoutes } from './authRoutes';
import { contactRoutes } from './contactRoutes';
import { calculatorRoutes } from './calculatorRoutes';
import { userRoutes } from './userRoutes';
import { serviceRoutes } from './serviceRoutes';
import { articleRoutes } from './articleRoutes';
import { faqRoutes } from './faqRoutes';
import { testimonialRoutes } from './testimonialRoutes';
import { teamRoutes } from './teamRoutes';
import { newsletterRoutes } from './newsletterRoutes';

/**
 * Configura todas as rotas da API
 * @param app Instância do Express
 */
export const setupRoutes = (app: Express) => {
  // Prefixo base para todas as rotas da API
  const apiPrefix = '/api';
  
  // Configura as rotas
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/contacts`, contactRoutes);
  app.use(`${apiPrefix}/calculator`, calculatorRoutes);
  app.use(`${apiPrefix}/users`, userRoutes);
  app.use(`${apiPrefix}/services`, serviceRoutes);
  app.use(`${apiPrefix}/articles`, articleRoutes);
  app.use(`${apiPrefix}/faqs`, faqRoutes);
  app.use(`${apiPrefix}/testimonials`, testimonialRoutes);
  app.use(`${apiPrefix}/team`, teamRoutes);
  app.use(`${apiPrefix}/newsletter`, newsletterRoutes);
  
  // Rota de verificação de saúde da API
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'API está funcionando corretamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });
};
```

## Conclusão

Este documento fornece exemplos de implementação da documentação da API com Swagger para o backend da aplicação Contabilidade Igrejinha. A documentação da API é essencial para facilitar o desenvolvimento, testes e integração com o frontend.

Com o Swagger, os desenvolvedores podem visualizar e interagir com a API de forma intuitiva, entender os endpoints disponíveis, os parâmetros necessários e as respostas esperadas. Isso acelera o desenvolvimento e reduz erros de integração.

A documentação da API também serve como referência para novos membros da equipe, facilitando a compreensão do sistema e a manutenção do código.