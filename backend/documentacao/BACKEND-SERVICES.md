# Serviços do Backend - Contabilidade Igrejinha

Este documento contém exemplos de implementação dos principais serviços para o backend da aplicação Contabilidade Igrejinha.

## Estrutura de um Serviço

Cada serviço segue uma estrutura padrão:

1. Importação de dependências
2. Definição da classe do serviço
3. Injeção de dependências via construtor
4. Métodos para operações de negócio
5. Lógica de negócio encapsulada

## AuthService

```typescript
// src/services/authService.ts
import { UserRepository } from '../repositories/userRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    // Verificar se o usuário já existe
    const existingUser = await this.userRepository.findByEmail(email);
    
    if (existingUser) {
      throw new Error('Email já está em uso');
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Criar usuário
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: 'CLIENT',
    });
    
    // Gerar tokens
    const token = this.generateAccessToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    
    const refreshToken = this.generateRefreshToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    // Buscar usuário pelo email
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    
    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      throw new Error('Credenciais inválidas');
    }
    
    // Gerar tokens
    const token = this.generateAccessToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    
    const refreshToken = this.generateRefreshToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as TokenPayload;
      
      // Buscar usuário
      const user = await this.userRepository.findById(decoded.id);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Gerar novo token de acesso
      const token = this.generateAccessToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      
      return { token };
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    // Remover senha do objeto retornado
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }

  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
  }

  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
  }
}
```

## ContactService

```typescript
// src/services/contactService.ts
import { ContactRepository } from '../repositories/contactRepository';
import nodemailer from 'nodemailer';

interface ContactData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  service?: string;
}

export class ContactService {
  private transporter: nodemailer.Transporter;

  constructor(private contactRepository: ContactRepository) {
    // Configurar transporter do nodemailer
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async createContact(contactData: ContactData) {
    // Criar contato no banco de dados
    const contact = await this.contactRepository.create({
      ...contactData,
      status: 'PENDING',
    });
    
    // Enviar email de notificação
    await this.sendNotificationEmail(contactData);
    
    // Enviar email de confirmação para o cliente
    await this.sendConfirmationEmail(contactData);
    
    return contact;
  }

  async findAllContacts() {
    return this.contactRepository.findAll();
  }

  async findContactById(id: string) {
    return this.contactRepository.findById(id);
  }

  async updateContactStatus(id: string, status: 'PENDING' | 'CONTACTED' | 'CONVERTED' | 'ARCHIVED') {
    return this.contactRepository.update(id, { status });
  }

  async deleteContact(id: string) {
    return this.contactRepository.delete(id);
  }

  private async sendNotificationEmail(contactData: ContactData) {
    const { name, email, phone, company, message, service } = contactData;
    
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_NOTIFICATION,
      subject: `Novo contato recebido: ${name}`,
      html: `
        <h1>Novo contato recebido</h1>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone}</p>
        ${company ? `<p><strong>Empresa:</strong> ${company}</p>` : ''}
        ${service ? `<p><strong>Serviço:</strong> ${service}</p>` : ''}
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
      `,
    });
  }

  private async sendConfirmationEmail(contactData: ContactData) {
    const { name, email } = contactData;
    
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Recebemos seu contato - Confiar Contabilidade',
      html: `
        <h1>Olá, ${name}!</h1>
        <p>Recebemos seu contato e agradecemos pelo interesse em nossos serviços.</p>
        <p>Um de nossos especialistas entrará em contato com você em breve.</p>
        <p>Atenciosamente,</p>
        <p><strong>Equipe Confiar Contabilidade</strong></p>
      `,
    });
  }
}
```

## ArticleService

```typescript
// src/services/articleService.ts
import { ArticleRepository } from '../repositories/articleRepository';

interface ArticleData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string | Date;
  updatedAt?: string | Date;
  category: string;
  tags: string[];
  featured?: boolean;
  readTime: number;
  slug: string;
  seoTitle?: string;
  seoDesc?: string;
  seoKeywords?: string[];
}

interface FindArticlesOptions {
  category?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
}

export class ArticleService {
  constructor(private articleRepository: ArticleRepository) {}

  async createArticle(articleData: ArticleData) {
    // Formatar a data de publicação
    const publishedAt = new Date(articleData.publishedAt);
    
    // Formatar a data de atualização, se fornecida
    const updatedAt = articleData.updatedAt ? new Date(articleData.updatedAt) : undefined;
    
    // Criar artigo
    return this.articleRepository.create({
      ...articleData,
      publishedAt,
      updatedAt,
      seoTitle: articleData.seoTitle || articleData.title,
      seoDesc: articleData.seoDesc || articleData.excerpt,
      seoKeywords: articleData.seoKeywords || [],
    });
  }

  async findAllArticles(options: FindArticlesOptions = {}) {
    const { category, featured, limit = 10, page = 1 } = options;
    
    // Calcular offset para paginação
    const offset = (page - 1) * limit;
    
    // Buscar artigos com filtros
    const articles = await this.articleRepository.findAll({
      category,
      featured,
      limit,
      offset,
    });
    
    // Contar total de artigos para paginação
    const total = await this.articleRepository.count({
      category,
      featured,
    });
    
    // Calcular total de páginas
    const totalPages = Math.ceil(total / limit);
    
    return {
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findArticleBySlug(slug: string) {
    return this.articleRepository.findBySlug(slug);
  }

  async findArticleById(id: string) {
    return this.articleRepository.findById(id);
  }

  async updateArticle(id: string, articleData: Partial<ArticleData>) {
    // Formatar a data de publicação, se fornecida
    const publishedAt = articleData.publishedAt ? new Date(articleData.publishedAt) : undefined;
    
    // Formatar a data de atualização, se fornecida
    const updatedAt = articleData.updatedAt ? new Date(articleData.updatedAt) : new Date();
    
    // Atualizar artigo
    return this.articleRepository.update(id, {
      ...articleData,
      publishedAt,
      updatedAt,
    });
  }

  async deleteArticle(id: string) {
    return this.articleRepository.delete(id);
  }
}
```

## CalculatorService

```typescript
// src/services/calculatorService.ts
import { CalculatorRepository } from '../repositories/calculatorRepository';

interface CalculationData {
  revenue: number;
  employees: number;
  businessType: 'mei' | 'simples' | 'presumido' | 'real';
  hasPartners: boolean;
  email?: string;
  phone?: string;
}

interface TaxCalculationResult {
  businessType: string;
  monthlyTax: number;
  annualTax: number;
  taxRate: number;
  savings?: number;
  recommendations: string[];
  breakdown: {
    federal: number;
    state: number;
    municipal: number;
  };
}

export class CalculatorService {
  constructor(private calculatorRepository: CalculatorRepository) {}

  async calculateTaxes(data: CalculationData): Promise<TaxCalculationResult> {
    const { revenue, employees, businessType, hasPartners } = data;
    
    // Lógica de cálculo de impostos baseada no tipo de empresa
    let monthlyTax = 0;
    let taxRate = 0;
    let federalTax = 0;
    let stateTax = 0;
    let municipalTax = 0;
    const recommendations: string[] = [];
    
    switch (businessType) {
      case 'mei':
        // MEI tem valor fixo
        monthlyTax = 70.60; // Valor base em 2023
        taxRate = (monthlyTax * 12) / (revenue * 12) * 100;
        federalTax = monthlyTax * 0.8;
        municipalTax = monthlyTax * 0.2;
        
        // Recomendações
        if (revenue > 81000) {
          recommendations.push('Sua receita excede o limite do MEI. Considere migrar para o Simples Nacional.');
        }
        if (employees > 1) {
          recommendations.push('MEI pode ter apenas 1 funcionário. Considere outra forma de tributação.');
        }
        break;
        
      case 'simples':
        // Simples Nacional - cálculo simplificado
        if (revenue <= 180000) {
          taxRate = 4.5;
        } else if (revenue <= 360000) {
          taxRate = 7.8;
        } else if (revenue <= 720000) {
          taxRate = 10.0;
        } else if (revenue <= 1800000) {
          taxRate = 14.0;
        } else if (revenue <= 3600000) {
          taxRate = 19.0;
        } else {
          taxRate = 22.0;
        }
        
        monthlyTax = (revenue * taxRate) / 100;
        federalTax = monthlyTax * 0.5;
        stateTax = monthlyTax * 0.3;
        municipalTax = monthlyTax * 0.2;
        
        // Recomendações
        if (revenue > 4800000) {
          recommendations.push('Sua receita está próxima do limite do Simples Nacional. Considere planejar uma transição para o Lucro Presumido.');
        }
        break;
        
      case 'presumido':
        // Lucro Presumido - cálculo simplificado
        taxRate = 11.33; // Taxa média para serviços
        monthlyTax = (revenue * taxRate) / 100;
        federalTax = monthlyTax * 0.65;
        stateTax = monthlyTax * 0.2;
        municipalTax = monthlyTax * 0.15;
        
        // Recomendações
        if (revenue > 78000000) {
          recommendations.push('Considere uma análise detalhada entre Lucro Presumido e Lucro Real.');
        }
        if (!hasPartners && revenue < 4800000) {
          recommendations.push('Você poderia economizar optando pelo Simples Nacional.');
        }
        break;
        
      case 'real':
        // Lucro Real - cálculo simplificado (estimativa)
        taxRate = 14.53; // Taxa média para serviços
        monthlyTax = (revenue * taxRate) / 100;
        federalTax = monthlyTax * 0.7;
        stateTax = monthlyTax * 0.2;
        municipalTax = monthlyTax * 0.1;
        
        // Recomendações
        if (revenue < 78000000 && !hasPartners) {
          recommendations.push('Avalie se o Lucro Presumido não seria mais vantajoso para sua empresa.');
        }
        break;
    }
    
    // Calcular economia potencial
    let savings: number | undefined;
    if (businessType === 'presumido' && revenue < 4800000) {
      // Estimativa de economia migrando para Simples Nacional
      const simplesRate = revenue <= 180000 ? 4.5 : revenue <= 360000 ? 7.8 : revenue <= 720000 ? 10.0 : revenue <= 1800000 ? 14.0 : 19.0;
      const simplesTax = (revenue * simplesRate) / 100;
      savings = monthlyTax - simplesTax;
    }
    
    // Adicionar recomendações gerais
    if (employees > 5) {
      recommendations.push('Com seu número de funcionários, considere implementar um sistema de departamento pessoal.');
    }
    
    // Calcular imposto anual
    const annualTax = monthlyTax * 12;
    
    // Salvar cálculo no banco de dados
    await this.calculatorRepository.create({
      revenue,
      employees,
      businessType,
      hasPartners,
      monthlyTax,
      annualTax,
      taxRate,
      recommendations,
      federalTax,
      stateTax,
      municipalTax,
      email: data.email,
      phone: data.phone,
    });
    
    return {
      businessType,
      monthlyTax,
      annualTax,
      taxRate,
      savings,
      recommendations,
      breakdown: {
        federal: federalTax,
        state: stateTax,
        municipal: municipalTax,
      },
    };
  }

  async getCalculationHistory() {
    return this.calculatorRepository.findAll();
  }
}
```

## Injeção de Dependências

Para facilitar a injeção de dependências e a organização do código, você pode criar um arquivo de fábrica para os serviços:

```typescript
// src/factories/serviceFactory.ts
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

// Instância do Prisma
const prisma = new PrismaClient();

// Repositories
const userRepository = new UserRepository(prisma);
const contactRepository = new ContactRepository(prisma);
const articleRepository = new ArticleRepository(prisma);
const calculatorRepository = new CalculatorRepository(prisma);

// Services
export const authService = new AuthService(userRepository);
export const contactService = new ContactService(contactRepository);
export const articleService = new ArticleService(articleRepository);
export const calculatorService = new CalculatorService(calculatorRepository);
```

## Tratamento de Erros

Para um tratamento de erros mais robusto nos serviços, você pode criar uma classe de erro personalizada:

```typescript
// src/utils/appError.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 400, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Exemplo de uso no serviço
import { AppError } from '../utils/appError';

// No método do serviço
if (!user) {
  throw new AppError('Usuário não encontrado', 404);
}
```

## Logging

Para melhorar o monitoramento e debugging, você pode implementar um serviço de logging:

```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;

// Exemplo de uso no serviço
import logger from '../utils/logger';

// No método do serviço
logger.info('Usuário autenticado com sucesso', { userId: user.id });
```

## Conclusão

Estes exemplos de serviços fornecem uma base sólida para o desenvolvimento do backend da aplicação Contabilidade Igrejinha. Eles seguem as melhores práticas de desenvolvimento, incluindo:

- Separação de responsabilidades
- Injeção de dependências
- Tratamento adequado de erros
- Logging para monitoramento

Ao implementar estes serviços, você terá uma camada de negócios robusta e bem estruturada que atenderá às necessidades do frontend existente.

---

*Este documento pode ser expandido com mais exemplos conforme necessário durante o desenvolvimento do backend.*