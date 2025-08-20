# Controllers do Backend - Contabilidade Igrejinha

Este documento contém exemplos de implementação dos principais controllers para o backend da aplicação Contabilidade Igrejinha.

## Estrutura de um Controller

Cada controller segue uma estrutura padrão:

1. Importação de dependências
2. Definição da classe do controller
3. Injeção de dependências via construtor
4. Métodos para cada operação (create, findAll, findOne, update, delete)
5. Tratamento de erros

## AuthController

```typescript
// src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = registerSchema.parse(req.body);
      
      const result = await this.authService.register(name, email, password);
      
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const result = await this.authService.login(email, password);
      
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token não fornecido' });
      }
      
      const result = await this.authService.refreshToken(refreshToken);
      
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      
      const user = await this.authService.getUserProfile(userId);
      
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
```

## ContactController

```typescript
// src/controllers/contactController.ts
import { Request, Response } from 'express';
import { ContactService } from '../services/contactService';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  company: z.string().optional(),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres'),
  service: z.string().optional(),
});

const updateContactSchema = z.object({
  status: z.enum(['PENDING', 'CONTACTED', 'CONVERTED', 'ARCHIVED']),
});

export class ContactController {
  constructor(private contactService: ContactService) {}

  async create(req: Request, res: Response) {
    try {
      const contactData = contactSchema.parse(req.body);
      
      const contact = await this.contactService.createContact(contactData);
      
      return res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const contacts = await this.contactService.findAllContacts();
      
      return res.status(200).json(contacts);
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const contact = await this.contactService.findContactById(id);
      
      if (!contact) {
        return res.status(404).json({ message: 'Contato não encontrado' });
      }
      
      return res.status(200).json(contact);
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = updateContactSchema.parse(req.body);
      
      const contact = await this.contactService.updateContactStatus(id, status);
      
      if (!contact) {
        return res.status(404).json({ message: 'Contato não encontrado' });
      }
      
      return res.status(200).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await this.contactService.deleteContact(id);
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
```

## ArticleController

```typescript
// src/controllers/articleController.ts
import { Request, Response } from 'express';
import { ArticleService } from '../services/articleService';
import { z } from 'zod';

const articleSchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
  excerpt: z.string().min(10, 'O resumo deve ter pelo menos 10 caracteres'),
  content: z.string().min(50, 'O conteúdo deve ter pelo menos 50 caracteres'),
  author: z.string(),
  publishedAt: z.string().or(z.date()),
  category: z.string(),
  tags: z.array(z.string()),
  featured: z.boolean().optional(),
  readTime: z.number().int().positive(),
  slug: z.string(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
});

export class ArticleController {
  constructor(private articleService: ArticleService) {}

  async create(req: Request, res: Response) {
    try {
      const articleData = articleSchema.parse(req.body);
      
      // Verificar se o slug já existe
      const existingArticle = await this.articleService.findArticleBySlug(articleData.slug);
      
      if (existingArticle) {
        return res.status(400).json({ message: 'Slug já está em uso' });
      }
      
      const article = await this.articleService.createArticle(articleData);
      
      return res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const { category, featured, limit, page } = req.query;
      
      const articles = await this.articleService.findAllArticles({
        category: category as string,
        featured: featured === 'true',
        limit: limit ? parseInt(limit as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
      });
      
      return res.status(200).json(articles);
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async findBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      
      const article = await this.articleService.findArticleBySlug(slug);
      
      if (!article) {
        return res.status(404).json({ message: 'Artigo não encontrado' });
      }
      
      return res.status(200).json(article);
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const articleData = articleSchema.partial().parse(req.body);
      
      // Se o slug foi atualizado, verificar se já existe
      if (articleData.slug) {
        const existingArticle = await this.articleService.findArticleBySlug(articleData.slug);
        
        if (existingArticle && existingArticle.id !== id) {
          return res.status(400).json({ message: 'Slug já está em uso' });
        }
      }
      
      const article = await this.articleService.updateArticle(id, articleData);
      
      if (!article) {
        return res.status(404).json({ message: 'Artigo não encontrado' });
      }
      
      return res.status(200).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await this.articleService.deleteArticle(id);
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
```

## CalculatorController

```typescript
// src/controllers/calculatorController.ts
import { Request, Response } from 'express';
import { CalculatorService } from '../services/calculatorService';
import { z } from 'zod';

const calculatorSchema = z.object({
  revenue: z.number().positive('A receita deve ser um valor positivo'),
  employees: z.number().int().nonnegative('O número de funcionários não pode ser negativo'),
  businessType: z.enum(['mei', 'simples', 'presumido', 'real'], {
    errorMap: () => ({ message: 'Tipo de empresa inválido' }),
  }),
  hasPartners: z.boolean(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
});

export class CalculatorController {
  constructor(private calculatorService: CalculatorService) {}

  async calculate(req: Request, res: Response) {
    try {
      const calculationData = calculatorSchema.parse(req.body);
      
      const result = await this.calculatorService.calculateTaxes(calculationData);
      
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async getCalculationHistory(req: Request, res: Response) {
    try {
      const calculations = await this.calculatorService.getCalculationHistory();
      
      return res.status(200).json(calculations);
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
```

## Injeção de Dependências

Para facilitar a injeção de dependências e a organização do código, você pode criar um arquivo de fábrica para os controllers:

```typescript
// src/factories/controllerFactory.ts
import { PrismaClient } from '@prisma/client';

// Repositories
import { UserRepository } from '../repositories/userRepository';
import { ContactRepository } from '../repositories/contactRepository';
import { ArticleRepository } from '../repositories/articleRepository';
import { CalculatorRepository } from '../repositories/calculatorRepository';

// Services
import { AuthService } from '../services/authService';
import { ContactService } from '../services/contactService';
import { ArticleService } from '../services/articleService';
import { CalculatorService } from '../services/calculatorService';

// Controllers
import { AuthController } from '../controllers/authController';
import { ContactController } from '../controllers/contactController';
import { ArticleController } from '../controllers/articleController';
import { CalculatorController } from '../controllers/calculatorController';

// Instância do Prisma
const prisma = new PrismaClient();

// Repositories
const userRepository = new UserRepository(prisma);
const contactRepository = new ContactRepository(prisma);
const articleRepository = new ArticleRepository(prisma);
const calculatorRepository = new CalculatorRepository(prisma);

// Services
const authService = new AuthService(userRepository);
const contactService = new ContactService(contactRepository);
const articleService = new ArticleService(articleRepository);
const calculatorService = new CalculatorService(calculatorRepository);

// Controllers
export const authController = new AuthController(authService);
export const contactController = new ContactController(contactService);
export const articleController = new ArticleController(articleService);
export const calculatorController = new CalculatorController(calculatorService);
```

## Uso nas Rotas

Exemplo de como utilizar os controllers nas rotas:

```typescript
// src/routes/authRoutes.ts
import { Router } from 'express';
import { authController } from '../factories/controllerFactory';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.get('/me', authenticate, (req, res) => authController.me(req, res));

export default router;
```

## Tratamento de Erros

Para um tratamento de erros mais robusto, você pode criar um middleware de erro:

```typescript
// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: error.errors,
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Não autorizado',
    });
  }

  return res.status(500).json({
    message: 'Erro interno do servidor',
  });
};
```

## Conclusão

Estes exemplos de controllers fornecem uma base sólida para o desenvolvimento do backend da aplicação Contabilidade Igrejinha. Eles seguem as melhores práticas de desenvolvimento, incluindo:

- Validação de dados com Zod
- Tratamento adequado de erros
- Injeção de dependências
- Separação de responsabilidades

Ao implementar estes controllers, você terá um backend robusto e bem estruturado que atenderá às necessidades do frontend existente.

---

*Este documento pode ser expandido com mais exemplos conforme necessário durante o desenvolvimento do backend.*