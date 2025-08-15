# Rotas do Backend - Contabilidade Igrejinha

Este documento contém exemplos de implementação das principais rotas para o backend da aplicação Contabilidade Igrejinha.

## Estrutura de Rotas

Cada arquivo de rotas segue uma estrutura padrão:

1. Importação de dependências
2. Importação de controladores
3. Importação de middlewares
4. Definição das rotas
5. Exportação do router

## AuthRoutes

```typescript
// src/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimitMiddleware';
import { authValidation } from '../validators/authValidation';

const router = Router();
const authController = new AuthController();

// Rotas públicas
router.post(
  '/register',
  authLimiter,
  validationMiddleware(authValidation.register),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validationMiddleware(authValidation.login),
  authController.login
);

router.post(
  '/refresh-token',
  validationMiddleware(authValidation.refreshToken),
  authController.refreshToken
);

router.post(
  '/forgot-password',
  authLimiter,
  validationMiddleware(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validationMiddleware(authValidation.resetPassword),
  authController.resetPassword
);

// Rotas protegidas
router.get(
  '/profile',
  authMiddleware,
  authController.getProfile
);

router.put(
  '/profile',
  authMiddleware,
  validationMiddleware(authValidation.updateProfile),
  authController.updateProfile
);

router.put(
  '/change-password',
  authMiddleware,
  validationMiddleware(authValidation.changePassword),
  authController.changePassword
);

// Rotas administrativas
router.get(
  '/users',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  authController.getAllUsers
);

router.get(
  '/users/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  authController.getUserById
);

router.put(
  '/users/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(authValidation.updateUser),
  authController.updateUser
);

router.delete(
  '/users/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  authController.deleteUser
);

export default router;
```

## ContactRoutes

```typescript
// src/routes/contactRoutes.ts
import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { contactValidation } from '../validators/contactValidation';

const router = Router();
const contactController = new ContactController();

// Rota pública para envio de contato
router.post(
  '/',
  validationMiddleware(contactValidation.createContact),
  contactController.createContact
);

// Rotas administrativas
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  contactController.getAllContacts
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  contactController.getContactById
);

router.put(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(contactValidation.updateContactStatus),
  contactController.updateContactStatus
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  contactController.deleteContact
);

export default router;
```

## ArticleRoutes

```typescript
// src/routes/articleRoutes.ts
import { Router } from 'express';
import { ArticleController } from '../controllers/articleController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { uploadSingleFile } from '../middlewares/fileUploadMiddleware';
import { cacheMiddleware, clearCacheMiddleware } from '../middlewares/cacheMiddleware';
import { articleValidation } from '../validators/articleValidation';

const router = Router();
const articleController = new ArticleController();

// Rotas públicas
router.get(
  '/',
  cacheMiddleware(300), // Cache por 5 minutos
  articleController.getAllArticles
);

router.get(
  '/:slug',
  cacheMiddleware(300),
  articleController.getArticleBySlug
);

router.get(
  '/category/:category',
  cacheMiddleware(300),
  articleController.getArticlesByCategory
);

// Rotas administrativas
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  uploadSingleFile('image'),
  validationMiddleware(articleValidation.createArticle),
  clearCacheMiddleware(['__express__/api/articles', '__express__/api/articles/featured']),
  articleController.createArticle
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  uploadSingleFile('image'),
  validationMiddleware(articleValidation.updateArticle),
  clearCacheMiddleware(['__express__/api/articles', '__express__/api/articles/featured']),
  articleController.updateArticle
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  clearCacheMiddleware(['__express__/api/articles', '__express__/api/articles/featured']),
  articleController.deleteArticle
);

// Rota para artigos em destaque
router.get(
  '/featured',
  cacheMiddleware(300),
  articleController.getFeaturedArticles
);

export default router;
```

## ServiceRoutes

```typescript
// src/routes/serviceRoutes.ts
import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { uploadSingleFile } from '../middlewares/fileUploadMiddleware';
import { cacheMiddleware, clearCacheMiddleware } from '../middlewares/cacheMiddleware';
import { serviceValidation } from '../validators/serviceValidation';

const router = Router();
const serviceController = new ServiceController();

// Rotas públicas
router.get(
  '/',
  cacheMiddleware(600), // Cache por 10 minutos
  serviceController.getAllServices
);

router.get(
  '/:slug',
  cacheMiddleware(600),
  serviceController.getServiceBySlug
);

// Rotas administrativas
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  uploadSingleFile('image'),
  validationMiddleware(serviceValidation.createService),
  clearCacheMiddleware(['__express__/api/services']),
  serviceController.createService
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  uploadSingleFile('image'),
  validationMiddleware(serviceValidation.updateService),
  clearCacheMiddleware(['__express__/api/services']),
  serviceController.updateService
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  clearCacheMiddleware(['__express__/api/services']),
  serviceController.deleteService
);

router.post(
  '/reorder',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(serviceValidation.reorderServices),
  clearCacheMiddleware(['__express__/api/services']),
  serviceController.reorderServices
);

// Rota para serviços em destaque
router.get(
  '/featured',
  cacheMiddleware(600),
  serviceController.getFeaturedServices
);

export default router;
```

## CalculatorRoutes

```typescript
// src/routes/calculatorRoutes.ts
import { Router } from 'express';
import { CalculatorController } from '../controllers/calculatorController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { calculatorValidation } from '../validators/calculatorValidation';

const router = Router();
const calculatorController = new CalculatorController();

// Rota pública para cálculo de impostos
router.post(
  '/calculate',
  validationMiddleware(calculatorValidation.calculateTaxes),
  calculatorController.calculateTaxes
);

// Rotas administrativas
router.get(
  '/history',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  calculatorController.getCalculationHistory
);

router.get(
  '/statistics',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  calculatorController.getCalculationStatistics
);

export default router;
```

## FAQRoutes

```typescript
// src/routes/faqRoutes.ts
import { Router } from 'express';
import { FAQController } from '../controllers/faqController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { cacheMiddleware, clearCacheMiddleware } from '../middlewares/cacheMiddleware';
import { faqValidation } from '../validators/faqValidation';

const router = Router();
const faqController = new FAQController();

// Rotas públicas
router.get(
  '/',
  cacheMiddleware(600), // Cache por 10 minutos
  faqController.getAllFAQs
);

router.get(
  '/category/:category',
  cacheMiddleware(600),
  faqController.getFAQsByCategory
);

// Rotas administrativas
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(faqValidation.createFAQ),
  clearCacheMiddleware(['__express__/api/faqs']),
  faqController.createFAQ
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(faqValidation.updateFAQ),
  clearCacheMiddleware(['__express__/api/faqs']),
  faqController.updateFAQ
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  clearCacheMiddleware(['__express__/api/faqs']),
  faqController.deleteFAQ
);

router.post(
  '/reorder',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(faqValidation.reorderFAQs),
  clearCacheMiddleware(['__express__/api/faqs']),
  faqController.reorderFAQs
);

export default router;
```

## TeamRoutes

```typescript
// src/routes/teamRoutes.ts
import { Router } from 'express';
import { TeamController } from '../controllers/teamController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { uploadSingleFile } from '../middlewares/fileUploadMiddleware';
import { cacheMiddleware, clearCacheMiddleware } from '../middlewares/cacheMiddleware';
import { teamValidation } from '../validators/teamValidation';

const router = Router();
const teamController = new TeamController();

// Rotas públicas
router.get(
  '/',
  cacheMiddleware(600), // Cache por 10 minutos
  teamController.getAllTeamMembers
);

// Rotas administrativas
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  uploadSingleFile('photo'),
  validationMiddleware(teamValidation.createTeamMember),
  clearCacheMiddleware(['__express__/api/team']),
  teamController.createTeamMember
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  uploadSingleFile('photo'),
  validationMiddleware(teamValidation.updateTeamMember),
  clearCacheMiddleware(['__express__/api/team']),
  teamController.updateTeamMember
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  clearCacheMiddleware(['__express__/api/team']),
  teamController.deleteTeamMember
);

router.post(
  '/reorder',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(teamValidation.reorderTeamMembers),
  clearCacheMiddleware(['__express__/api/team']),
  teamController.reorderTeamMembers
);

// Rota para membros da equipe em destaque
router.get(
  '/featured',
  cacheMiddleware(600),
  teamController.getFeaturedTeamMembers
);

export default router;
```

## TestimonialRoutes

```typescript
// src/routes/testimonialRoutes.ts
import { Router } from 'express';
import { TestimonialController } from '../controllers/testimonialController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { uploadSingleFile } from '../middlewares/fileUploadMiddleware';
import { cacheMiddleware, clearCacheMiddleware } from '../middlewares/cacheMiddleware';
import { testimonialValidation } from '../validators/testimonialValidation';

const router = Router();
const testimonialController = new TestimonialController();

// Rotas públicas
router.get(
  '/',
  cacheMiddleware(600), // Cache por 10 minutos
  testimonialController.getAllTestimonials
);

// Rotas administrativas
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  uploadSingleFile('photo'),
  validationMiddleware(testimonialValidation.createTestimonial),
  clearCacheMiddleware(['__express__/api/testimonials']),
  testimonialController.createTestimonial
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  uploadSingleFile('photo'),
  validationMiddleware(testimonialValidation.updateTestimonial),
  clearCacheMiddleware(['__express__/api/testimonials']),
  testimonialController.updateTestimonial
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  clearCacheMiddleware(['__express__/api/testimonials']),
  testimonialController.deleteTestimonial
);

router.post(
  '/reorder',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(testimonialValidation.reorderTestimonials),
  clearCacheMiddleware(['__express__/api/testimonials']),
  testimonialController.reorderTestimonials
);

// Rota para depoimentos em destaque
router.get(
  '/featured',
  cacheMiddleware(600),
  testimonialController.getFeaturedTestimonials
);

export default router;
```

## NewsletterRoutes

```typescript
// src/routes/newsletterRoutes.ts
import { Router } from 'express';
import { NewsletterController } from '../controllers/newsletterController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { newsletterValidation } from '../validators/newsletterValidation';

const router = Router();
const newsletterController = new NewsletterController();

// Rota pública para inscrição na newsletter
router.post(
  '/subscribe',
  validationMiddleware(newsletterValidation.subscribe),
  newsletterController.subscribe
);

// Rota pública para cancelamento de inscrição
router.get(
  '/unsubscribe/:token',
  newsletterController.unsubscribe
);

// Rotas administrativas
router.get(
  '/subscribers',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  newsletterController.getAllSubscribers
);

router.post(
  '/send',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(newsletterValidation.sendNewsletter),
  newsletterController.sendNewsletter
);

router.delete(
  '/subscribers/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  newsletterController.deleteSubscriber
);

export default router;
```

## Configuração das Rotas na Aplicação

```typescript
// src/app.ts
import express from 'express';
import { corsMiddleware } from './middlewares/corsMiddleware';
import { helmetMiddleware, xssMiddleware, hppMiddleware } from './middlewares/securityMiddleware';
import { compressionMiddleware } from './middlewares/compressionMiddleware';
import { loggingMiddleware } from './middlewares/loggingMiddleware';
import { apiLimiter } from './middlewares/rateLimitMiddleware';
import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware';

// Importar rotas
import authRoutes from './routes/authRoutes';
import contactRoutes from './routes/contactRoutes';
import articleRoutes from './routes/articleRoutes';
import serviceRoutes from './routes/serviceRoutes';
import calculatorRoutes from './routes/calculatorRoutes';
import faqRoutes from './routes/faqRoutes';
import teamRoutes from './routes/teamRoutes';
import testimonialRoutes from './routes/testimonialRoutes';
import newsletterRoutes from './routes/newsletterRoutes';

const app = express();

// Middlewares de segurança e configuração
app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(xssMiddleware);
app.use(hppMiddleware);
app.use(compressionMiddleware);

// Middleware de logging
app.use(loggingMiddleware);

// Middleware de rate limiting
app.use('/api', apiLimiter);

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Middleware para rotas não encontradas
app.use(notFoundMiddleware);

// Middleware para tratamento de erros
app.use(errorMiddleware);

export default app;
```

## Validadores para as Rotas

Exemplo de validador para as rotas de autenticação:

```typescript
// src/validators/authValidation.ts
import { z } from 'zod';

export const authValidation = {
  register: z.object({
    body: z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
      email: z.string().email('Email inválido'),
      password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
      confirmPassword: z.string(),
    }).refine(data => data.password === data.confirmPassword, {
      message: 'Senhas não conferem',
      path: ['confirmPassword'],
    }),
  }),
  
  login: z.object({
    body: z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(1, 'Senha é obrigatória'),
    }),
  }),
  
  refreshToken: z.object({
    body: z.object({
      refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
    }),
  }),
  
  forgotPassword: z.object({
    body: z.object({
      email: z.string().email('Email inválido'),
    }),
  }),
  
  resetPassword: z.object({
    body: z.object({
      token: z.string().min(1, 'Token é obrigatório'),
      password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
      confirmPassword: z.string(),
    }).refine(data => data.password === data.confirmPassword, {
      message: 'Senhas não conferem',
      path: ['confirmPassword'],
    }),
  }),
  
  updateProfile: z.object({
    body: z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      position: z.string().optional(),
    }),
  }),
  
  changePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
      newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
      confirmPassword: z.string(),
    }).refine(data => data.newPassword === data.confirmPassword, {
      message: 'Senhas não conferem',
      path: ['confirmPassword'],
    }),
  }),
  
  updateUser: z.object({
    body: z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
      email: z.string().email('Email inválido').optional(),
      role: z.enum(['CLIENT', 'ADMIN']).optional(),
      active: z.boolean().optional(),
    }),
  }),
};
```

## Conclusão

Estes exemplos de rotas fornecem uma base sólida para o desenvolvimento do backend da aplicação Contabilidade Igrejinha. Eles seguem as melhores práticas de desenvolvimento, incluindo:

- Organização clara e modular
- Validação de dados com Zod
- Autenticação e autorização
- Cache para rotas públicas
- Limpeza de cache após modificações
- Upload de arquivos
- Rate limiting para rotas sensíveis

Ao implementar estas rotas, você terá uma API RESTful bem estruturada que atenderá às necessidades do frontend existente e permitirá a criação de um sistema de white label.

---

*Este documento pode ser expandido com mais exemplos conforme necessário durante o desenvolvimento do backend.*