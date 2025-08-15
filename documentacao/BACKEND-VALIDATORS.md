# Validadores do Backend - Contabilidade Igrejinha

Este documento contém exemplos de implementação dos principais validadores para o backend da aplicação Contabilidade Igrejinha, utilizando a biblioteca Zod.

## Estrutura de um Validador

Cada validador segue uma estrutura padrão:

1. Importação da biblioteca Zod
2. Definição dos esquemas de validação
3. Exportação dos validadores

## AuthValidation

```typescript
// src/validators/authValidation.ts
import { z } from 'zod';

export const authValidation = {
  register: z.object({
    body: z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
      email: z.string().email('Email inválido'),
      password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
        .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
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
      password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
        .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
      confirmPassword: z.string(),
    }).refine(data => data.password === data.confirmPassword, {
      message: 'Senhas não conferem',
      path: ['confirmPassword'],
    }),
  }),
  
  updateProfile: z.object({
    body: z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
      phone: z.string().regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Telefone deve estar no formato (99) 99999-9999').optional(),
      company: z.string().optional(),
      position: z.string().optional(),
    }),
  }),
  
  changePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
      newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
        .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
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

## ContactValidation

```typescript
// src/validators/contactValidation.ts
import { z } from 'zod';

export const contactValidation = {
  createContact: z.object({
    body: z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
      email: z.string().email('Email inválido'),
      phone: z.string().regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Telefone deve estar no formato (99) 99999-9999'),
      company: z.string().optional(),
      message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
      service: z.string().optional(),
    }),
  }),
  
  updateContactStatus: z.object({
    body: z.object({
      status: z.enum(['PENDING', 'CONTACTED', 'CONVERTED', 'ARCHIVED'], {
        errorMap: () => ({ message: 'Status inválido' }),
      }),
    }),
  }),
};
```

## ArticleValidation

```typescript
// src/validators/articleValidation.ts
import { z } from 'zod';

export const articleValidation = {
  createArticle: z.object({
    body: z.object({
      title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
      excerpt: z.string().min(10, 'Resumo deve ter pelo menos 10 caracteres'),
      content: z.string().min(100, 'Conteúdo deve ter pelo menos 100 caracteres'),
      author: z.string().min(3, 'Autor deve ter pelo menos 3 caracteres'),
      publishedAt: z.string().datetime({ message: 'Data de publicação inválida' }).optional(),
      category: z.string().min(3, 'Categoria deve ter pelo menos 3 caracteres'),
      tags: z.array(z.string()).min(1, 'Pelo menos uma tag é necessária'),
      featured: z.boolean().optional(),
      readTime: z.number().int().positive('Tempo de leitura deve ser um número positivo'),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
      seoTitle: z.string().max(60, 'Título SEO deve ter no máximo 60 caracteres').optional(),
      seoDesc: z.string().max(160, 'Descrição SEO deve ter no máximo 160 caracteres').optional(),
      seoKeywords: z.array(z.string()).optional(),
    }),
  }),
  
  updateArticle: z.object({
    body: z.object({
      title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').optional(),
      excerpt: z.string().min(10, 'Resumo deve ter pelo menos 10 caracteres').optional(),
      content: z.string().min(100, 'Conteúdo deve ter pelo menos 100 caracteres').optional(),
      author: z.string().min(3, 'Autor deve ter pelo menos 3 caracteres').optional(),
      publishedAt: z.string().datetime({ message: 'Data de publicação inválida' }).optional(),
      updatedAt: z.string().datetime({ message: 'Data de atualização inválida' }).optional(),
      category: z.string().min(3, 'Categoria deve ter pelo menos 3 caracteres').optional(),
      tags: z.array(z.string()).min(1, 'Pelo menos uma tag é necessária').optional(),
      featured: z.boolean().optional(),
      readTime: z.number().int().positive('Tempo de leitura deve ser um número positivo').optional(),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens').optional(),
      seoTitle: z.string().max(60, 'Título SEO deve ter no máximo 60 caracteres').optional(),
      seoDesc: z.string().max(160, 'Descrição SEO deve ter no máximo 160 caracteres').optional(),
      seoKeywords: z.array(z.string()).optional(),
    }),
  }),
};
```

## ServiceValidation

```typescript
// src/validators/serviceValidation.ts
import { z } from 'zod';

export const serviceValidation = {
  createService: z.object({
    body: z.object({
      title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
      description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
      content: z.string().min(100, 'Conteúdo deve ter pelo menos 100 caracteres'),
      icon: z.string().optional(),
      featured: z.boolean().optional(),
      order: z.number().int().nonnegative('Ordem deve ser um número não negativo').optional(),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
      seoTitle: z.string().max(60, 'Título SEO deve ter no máximo 60 caracteres').optional(),
      seoDesc: z.string().max(160, 'Descrição SEO deve ter no máximo 160 caracteres').optional(),
      seoKeywords: z.array(z.string()).optional(),
    }),
  }),
  
  updateService: z.object({
    body: z.object({
      title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').optional(),
      description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').optional(),
      content: z.string().min(100, 'Conteúdo deve ter pelo menos 100 caracteres').optional(),
      icon: z.string().optional(),
      featured: z.boolean().optional(),
      order: z.number().int().nonnegative('Ordem deve ser um número não negativo').optional(),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens').optional(),
      seoTitle: z.string().max(60, 'Título SEO deve ter no máximo 60 caracteres').optional(),
      seoDesc: z.string().max(160, 'Descrição SEO deve ter no máximo 160 caracteres').optional(),
      seoKeywords: z.array(z.string()).optional(),
    }),
  }),
  
  reorderServices: z.object({
    body: z.object({
      serviceIds: z.array(z.string().uuid('ID inválido')).min(1, 'Pelo menos um serviço é necessário'),
    }),
  }),
};
```

## CalculatorValidation

```typescript
// src/validators/calculatorValidation.ts
import { z } from 'zod';

export const calculatorValidation = {
  calculateTaxes: z.object({
    body: z.object({
      revenue: z.number().positive('Receita deve ser um número positivo'),
      employees: z.number().int().nonnegative('Número de funcionários deve ser um número não negativo'),
      businessType: z.enum(['mei', 'simples', 'presumido', 'real'], {
        errorMap: () => ({ message: 'Tipo de negócio inválido' }),
      }),
      hasPartners: z.boolean(),
      email: z.string().email('Email inválido').optional(),
      phone: z.string().regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Telefone deve estar no formato (99) 99999-9999').optional(),
    }),
  }),
};
```

## FAQValidation

```typescript
// src/validators/faqValidation.ts
import { z } from 'zod';

export const faqValidation = {
  createFAQ: z.object({
    body: z.object({
      question: z.string().min(10, 'Pergunta deve ter pelo menos 10 caracteres'),
      answer: z.string().min(10, 'Resposta deve ter pelo menos 10 caracteres'),
      category: z.string().min(3, 'Categoria deve ter pelo menos 3 caracteres'),
      order: z.number().int().nonnegative('Ordem deve ser um número não negativo').optional(),
    }),
  }),
  
  updateFAQ: z.object({
    body: z.object({
      question: z.string().min(10, 'Pergunta deve ter pelo menos 10 caracteres').optional(),
      answer: z.string().min(10, 'Resposta deve ter pelo menos 10 caracteres').optional(),
      category: z.string().min(3, 'Categoria deve ter pelo menos 3 caracteres').optional(),
      order: z.number().int().nonnegative('Ordem deve ser um número não negativo').optional(),
    }),
  }),
  
  reorderFAQs: z.object({
    body: z.object({
      faqIds: z.array(z.string().uuid('ID inválido')).min(1, 'Pelo menos uma FAQ é necessária'),
    }),
  }),
};
```

## TeamValidation

```typescript
// src/validators/teamValidation.ts
import { z } from 'zod';

export const teamValidation = {
  createTeamMember: z.object({
    body: z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
      position: z.string().min(3, 'Cargo deve ter pelo menos 3 caracteres'),
      bio: z.string().min(10, 'Biografia deve ter pelo menos 10 caracteres'),
      socialLinks: z.object({
        linkedin: z.string().url('URL do LinkedIn inválida').optional(),
        twitter: z.string().url('URL do Twitter inválida').optional(),
        instagram: z.string().url('URL do Instagram inválida').optional(),
        facebook: z.string().url('URL do Facebook inválida').optional(),
      }).optional(),
      featured: z.boolean().optional(),
      order: z.number().int().nonnegative('Ordem deve ser um número não negativo').optional(),
    }),
  }),
  
  updateTeamMember: z.object({
    body: z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
      position: z.string().min(3, 'Cargo deve ter pelo menos 3 caracteres').optional(),
      bio: z.string().min(10, 'Biografia deve ter pelo menos 10 caracteres').optional(),
      socialLinks: z.object({
        linkedin: z.string().url('URL do LinkedIn inválida').optional(),
        twitter: z.string().url('URL do Twitter inválida').optional(),
        instagram: z.string().url('URL do Instagram inválida').optional(),
        facebook: z.string().url('URL do Facebook inválida').optional(),
      }).optional(),
      featured: z.boolean().optional(),
      order: z.number().int().nonnegative('Ordem deve ser um número não negativo').optional(),
    }),
  }),
  
  reorderTeamMembers: z.object({
    body: z.object({
      memberIds: z.array(z.string().uuid('ID inválido')).min(1, 'Pelo menos um membro é necessário'),
    }),
  }),
};
```

## TestimonialValidation

```typescript
// src/validators/testimonialValidation.ts
import { z } from 'zod';

export const testimonialValidation = {
  createTestimonial: z.object({
    body: z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
      company: z.string().min(2, 'Empresa deve ter pelo menos 2 caracteres'),
      position: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres'),
      content: z.string().min(20, 'Depoimento deve ter pelo menos 20 caracteres'),
      rating: z.number().int().min(1, 'Avaliação mínima é 1').max(5, 'Avaliação máxima é 5'),
      featured: z.boolean().optional(),
      order: z.number().int().nonnegative('Ordem deve ser um número não negativo').optional(),
    }),
  }),
  
  updateTestimonial: z.object({
    body: z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
      company: z.string().min(2, 'Empresa deve ter pelo menos 2 caracteres').optional(),
      position: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres').optional(),
      content: z.string().min(20, 'Depoimento deve ter pelo menos 20 caracteres').optional(),
      rating: z.number().int().min(1, 'Avaliação mínima é 1').max(5, 'Avaliação máxima é 5').optional(),
      featured: z.boolean().optional(),
      order: z.number().int().nonnegative('Ordem deve ser um número não negativo').optional(),
    }),
  }),
  
  reorderTestimonials: z.object({
    body: z.object({
      testimonialIds: z.array(z.string().uuid('ID inválido')).min(1, 'Pelo menos um depoimento é necessário'),
    }),
  }),
};
```

## NewsletterValidation

```typescript
// src/validators/newsletterValidation.ts
import { z } from 'zod';

export const newsletterValidation = {
  subscribe: z.object({
    body: z.object({
      email: z.string().email('Email inválido'),
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
    }),
  }),
  
  sendNewsletter: z.object({
    body: z.object({
      subject: z.string().min(5, 'Assunto deve ter pelo menos 5 caracteres'),
      content: z.string().min(50, 'Conteúdo deve ter pelo menos 50 caracteres'),
      sendToAll: z.boolean().optional(),
      recipientIds: z.array(z.string().uuid('ID inválido')).optional(),
    }).refine(
      data => data.sendToAll || (data.recipientIds && data.recipientIds.length > 0),
      {
        message: 'Você deve enviar para todos ou especificar pelo menos um destinatário',
        path: ['recipientIds'],
      }
    ),
  }),
};
```

## Validação de Parâmetros de URL

```typescript
// src/validators/commonValidation.ts
import { z } from 'zod';

export const commonValidation = {
  // Validação de parâmetros de URL
  idParam: z.object({
    params: z.object({
      id: z.string().uuid('ID inválido'),
    }),
  }),
  
  slugParam: z.object({
    params: z.object({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
    }),
  }),
  
  categoryParam: z.object({
    params: z.object({
      category: z.string().min(3, 'Categoria inválida'),
    }),
  }),
  
  // Validação de parâmetros de consulta para paginação
  paginationQuery: z.object({
    query: z.object({
      page: z.string().regex(/^\d+$/, 'Página deve ser um número').transform(Number).optional(),
      limit: z.string().regex(/^\d+$/, 'Limite deve ser um número').transform(Number).optional(),
    }),
  }),
  
  // Validação de parâmetros de consulta para ordenação
  sortQuery: z.object({
    query: z.object({
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional(),
    }),
  }),
  
  // Validação de parâmetros de consulta para filtros
  filterQuery: z.object({
    query: z.object({
      featured: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
      category: z.string().optional(),
      tag: z.string().optional(),
      search: z.string().optional(),
    }),
  }),
};
```

## Validação de Datas

```typescript
// src/validators/dateValidation.ts
import { z } from 'zod';

// Função auxiliar para validar datas
const isValidDate = (date: string) => {
  const d = new Date(date);
  return !isNaN(d.getTime());
};

export const dateValidation = {
  // Validação de data no formato ISO
  isoDate: z.string().refine(isValidDate, {
    message: 'Data inválida. Use o formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)',
  }),
  
  // Validação de data no formato brasileiro
  brDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/YYYY').refine(
    (date) => {
      const [day, month, year] = date.split('/').map(Number);
      const d = new Date(year, month - 1, day);
      return d.getDate() === day && d.getMonth() === month - 1 && d.getFullYear() === year;
    },
    {
      message: 'Data inválida',
    }
  ),
  
  // Validação de período
  dateRange: z.object({
    startDate: z.string().refine(isValidDate, { message: 'Data inicial inválida' }),
    endDate: z.string().refine(isValidDate, { message: 'Data final inválida' }),
  }).refine(
    data => new Date(data.startDate) <= new Date(data.endDate),
    {
      message: 'Data inicial deve ser anterior ou igual à data final',
      path: ['startDate'],
    }
  ),
};
```

## Validação de Arquivos

```typescript
// src/validators/fileValidation.ts
import { z } from 'zod';

export const fileValidation = {
  // Validação de imagem
  image: z.object({
    mimetype: z.enum(['image/jpeg', 'image/png', 'image/gif'], {
      errorMap: () => ({ message: 'Formato de imagem inválido. Apenas JPEG, PNG e GIF são permitidos' }),
    }),
    size: z.number().max(5 * 1024 * 1024, 'Tamanho máximo da imagem é 5MB'),
  }),
  
  // Validação de documento
  document: z.object({
    mimetype: z.enum(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], {
      errorMap: () => ({ message: 'Formato de documento inválido. Apenas PDF e DOC/DOCX são permitidos' }),
    }),
    size: z.number().max(10 * 1024 * 1024, 'Tamanho máximo do documento é 10MB'),
  }),
};
```

## Uso dos Validadores com Middleware

```typescript
// Exemplo de uso com middleware de validação
import { Router } from 'express';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authValidation } from '../validators/authValidation';
import { commonValidation } from '../validators/commonValidation';

const router = Router();

// Validação de corpo da requisição
router.post(
  '/register',
  validationMiddleware(authValidation.register),
  authController.register
);

// Validação de parâmetros de URL
router.get(
  '/:id',
  validationMiddleware(commonValidation.idParam),
  userController.getUserById
);

// Validação de parâmetros de consulta
router.get(
  '/',
  validationMiddleware(commonValidation.paginationQuery),
  validationMiddleware(commonValidation.sortQuery),
  validationMiddleware(commonValidation.filterQuery),
  userController.getAllUsers
);

// Combinando múltiplas validações
router.put(
  '/:id',
  validationMiddleware(commonValidation.idParam),
  validationMiddleware(authValidation.updateUser),
  userController.updateUser
);
```

## Conclusão

Estes exemplos de validadores fornecem uma base sólida para o desenvolvimento do backend da aplicação Contabilidade Igrejinha. Eles seguem as melhores práticas de desenvolvimento, incluindo:

- Validação de dados de entrada
- Mensagens de erro personalizadas
- Validação de tipos
- Validação de formatos
- Validação de regras de negócio

Ao implementar estes validadores, você terá uma camada de validação robusta que garantirá a integridade dos dados e melhorará a experiência do usuário ao fornecer mensagens de erro claras e específicas.

---

*Este documento pode ser expandido com mais exemplos conforme necessário durante o desenvolvimento do backend.*