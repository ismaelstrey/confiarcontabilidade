# Repositórios do Backend - Contabilidade Igrejinha

Este documento contém exemplos de implementação dos principais repositórios para o backend da aplicação Contabilidade Igrejinha.

## Estrutura de um Repositório

Cada repositório segue uma estrutura padrão:

1. Importação de dependências
2. Definição da classe do repositório
3. Injeção do cliente Prisma via construtor
4. Métodos para operações CRUD
5. Métodos para consultas específicas

## UserRepository

```typescript
// src/repositories/userRepository.ts
import { PrismaClient, User, Prisma } from '@prisma/client';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async createProfile(userId: string, data: Prisma.ProfileCreateInput): Promise<Prisma.ProfileGetPayload<{}>> {
    return this.prisma.profile.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async updateProfile(userId: string, data: Prisma.ProfileUpdateInput): Promise<Prisma.ProfileGetPayload<{}>> {
    return this.prisma.profile.update({
      where: {
        userId,
      },
      data,
    });
  }
}
```

## ContactRepository

```typescript
// src/repositories/contactRepository.ts
import { PrismaClient, Contact, Prisma } from '@prisma/client';

interface FindContactsOptions {
  status?: 'PENDING' | 'CONTACTED' | 'CONVERTED' | 'ARCHIVED';
  limit?: number;
  offset?: number;
}

export class ContactRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.ContactCreateInput): Promise<Contact> {
    return this.prisma.contact.create({
      data,
    });
  }

  async findAll(options: FindContactsOptions = {}): Promise<Contact[]> {
    const { status, limit, offset } = options;
    
    return this.prisma.contact.findMany({
      where: status ? { status } : undefined,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async count(options: FindContactsOptions = {}): Promise<number> {
    const { status } = options;
    
    return this.prisma.contact.count({
      where: status ? { status } : undefined,
    });
  }

  async findById(id: string): Promise<Contact | null> {
    return this.prisma.contact.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.ContactUpdateInput): Promise<Contact> {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Contact> {
    return this.prisma.contact.delete({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Contact | null> {
    return this.prisma.contact.findFirst({
      where: { email },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByPhone(phone: string): Promise<Contact | null> {
    return this.prisma.contact.findFirst({
      where: { phone },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
```

## ArticleRepository

```typescript
// src/repositories/articleRepository.ts
import { PrismaClient, Article, Prisma } from '@prisma/client';

interface FindArticlesOptions {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export class ArticleRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.ArticleCreateInput): Promise<Article> {
    return this.prisma.article.create({
      data,
    });
  }

  async findAll(options: FindArticlesOptions = {}): Promise<Article[]> {
    const { category, featured, limit, offset } = options;
    
    return this.prisma.article.findMany({
      where: {
        category: category ? { equals: category } : undefined,
        featured: featured !== undefined ? { equals: featured } : undefined,
      },
      take: limit,
      skip: offset,
      orderBy: {
        publishedAt: 'desc',
      },
    });
  }

  async count(options: FindArticlesOptions = {}): Promise<number> {
    const { category, featured } = options;
    
    return this.prisma.article.count({
      where: {
        category: category ? { equals: category } : undefined,
        featured: featured !== undefined ? { equals: featured } : undefined,
      },
    });
  }

  async findById(id: string): Promise<Article | null> {
    return this.prisma.article.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Article | null> {
    return this.prisma.article.findUnique({
      where: { slug },
    });
  }

  async update(id: string, data: Prisma.ArticleUpdateInput): Promise<Article> {
    return this.prisma.article.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Article> {
    return this.prisma.article.delete({
      where: { id },
    });
  }

  async findRelatedArticles(articleId: string, category: string, limit = 3): Promise<Article[]> {
    return this.prisma.article.findMany({
      where: {
        id: { not: articleId },
        category: { equals: category },
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
    });
  }

  async findFeaturedArticles(limit = 5): Promise<Article[]> {
    return this.prisma.article.findMany({
      where: {
        featured: true,
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
    });
  }
}
```

## ServiceRepository

```typescript
// src/repositories/serviceRepository.ts
import { PrismaClient, Service, Prisma } from '@prisma/client';

export class ServiceRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.ServiceCreateInput): Promise<Service> {
    return this.prisma.service.create({
      data,
    });
  }

  async findAll(): Promise<Service[]> {
    return this.prisma.service.findMany({
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findById(id: string): Promise<Service | null> {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Service | null> {
    return this.prisma.service.findUnique({
      where: { slug },
    });
  }

  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Service> {
    return this.prisma.service.delete({
      where: { id },
    });
  }

  async findFeaturedServices(): Promise<Service[]> {
    return this.prisma.service.findMany({
      where: {
        featured: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async reorderServices(serviceIds: string[]): Promise<void> {
    // Usar transação para garantir que todas as atualizações sejam feitas ou nenhuma
    await this.prisma.$transaction(
      serviceIds.map((id, index) => 
        this.prisma.service.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }
}
```

## CalculatorRepository

```typescript
// src/repositories/calculatorRepository.ts
import { PrismaClient, TaxCalculation, Prisma } from '@prisma/client';

export class CalculatorRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.TaxCalculationCreateInput): Promise<TaxCalculation> {
    return this.prisma.taxCalculation.create({
      data,
    });
  }

  async findAll(): Promise<TaxCalculation[]> {
    return this.prisma.taxCalculation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<TaxCalculation | null> {
    return this.prisma.taxCalculation.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<TaxCalculation[]> {
    return this.prisma.taxCalculation.findMany({
      where: { email },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async delete(id: string): Promise<TaxCalculation> {
    return this.prisma.taxCalculation.delete({
      where: { id },
    });
  }

  async getStatistics(): Promise<{
    totalCalculations: number;
    byBusinessType: Record<string, number>;
    averageRevenue: number;
  }> {
    // Total de cálculos
    const totalCalculations = await this.prisma.taxCalculation.count();
    
    // Contagem por tipo de negócio
    const businessTypeCounts = await this.prisma.taxCalculation.groupBy({
      by: ['businessType'],
      _count: {
        businessType: true,
      },
    });
    
    // Média de receita
    const revenueAvg = await this.prisma.taxCalculation.aggregate({
      _avg: {
        revenue: true,
      },
    });
    
    // Formatar resultados
    const byBusinessType: Record<string, number> = {};
    businessTypeCounts.forEach((item) => {
      byBusinessType[item.businessType] = item._count.businessType;
    });
    
    return {
      totalCalculations,
      byBusinessType,
      averageRevenue: revenueAvg._avg.revenue || 0,
    };
  }
}
```

## FAQRepository

```typescript
// src/repositories/faqRepository.ts
import { PrismaClient, FAQ, Prisma } from '@prisma/client';

export class FAQRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.FAQCreateInput): Promise<FAQ> {
    return this.prisma.faq.create({
      data,
    });
  }

  async findAll(): Promise<FAQ[]> {
    return this.prisma.faq.findMany({
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findById(id: string): Promise<FAQ | null> {
    return this.prisma.faq.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.FAQUpdateInput): Promise<FAQ> {
    return this.prisma.faq.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<FAQ> {
    return this.prisma.faq.delete({
      where: { id },
    });
  }

  async findByCategory(category: string): Promise<FAQ[]> {
    return this.prisma.faq.findMany({
      where: {
        category,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async reorderFAQs(faqIds: string[]): Promise<void> {
    // Usar transação para garantir que todas as atualizações sejam feitas ou nenhuma
    await this.prisma.$transaction(
      faqIds.map((id, index) => 
        this.prisma.faq.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }
}
```

## TeamMemberRepository

```typescript
// src/repositories/teamMemberRepository.ts
import { PrismaClient, TeamMember, Prisma } from '@prisma/client';

export class TeamMemberRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.TeamMemberCreateInput): Promise<TeamMember> {
    return this.prisma.teamMember.create({
      data,
    });
  }

  async findAll(): Promise<TeamMember[]> {
    return this.prisma.teamMember.findMany({
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findById(id: string): Promise<TeamMember | null> {
    return this.prisma.teamMember.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.TeamMemberUpdateInput): Promise<TeamMember> {
    return this.prisma.teamMember.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<TeamMember> {
    return this.prisma.teamMember.delete({
      where: { id },
    });
  }

  async findFeaturedMembers(): Promise<TeamMember[]> {
    return this.prisma.teamMember.findMany({
      where: {
        featured: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async reorderTeamMembers(memberIds: string[]): Promise<void> {
    // Usar transação para garantir que todas as atualizações sejam feitas ou nenhuma
    await this.prisma.$transaction(
      memberIds.map((id, index) => 
        this.prisma.teamMember.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }
}
```

## TestimonialRepository

```typescript
// src/repositories/testimonialRepository.ts
import { PrismaClient, Testimonial, Prisma } from '@prisma/client';

export class TestimonialRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.TestimonialCreateInput): Promise<Testimonial> {
    return this.prisma.testimonial.create({
      data,
    });
  }

  async findAll(): Promise<Testimonial[]> {
    return this.prisma.testimonial.findMany({
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findById(id: string): Promise<Testimonial | null> {
    return this.prisma.testimonial.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.TestimonialUpdateInput): Promise<Testimonial> {
    return this.prisma.testimonial.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Testimonial> {
    return this.prisma.testimonial.delete({
      where: { id },
    });
  }

  async findFeaturedTestimonials(limit = 3): Promise<Testimonial[]> {
    return this.prisma.testimonial.findMany({
      where: {
        featured: true,
      },
      take: limit,
      orderBy: {
        order: 'asc',
      },
    });
  }

  async reorderTestimonials(testimonialIds: string[]): Promise<void> {
    // Usar transação para garantir que todas as atualizações sejam feitas ou nenhuma
    await this.prisma.$transaction(
      testimonialIds.map((id, index) => 
        this.prisma.testimonial.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }
}
```

## NewsletterRepository

```typescript
// src/repositories/newsletterRepository.ts
import { PrismaClient, Newsletter, Prisma } from '@prisma/client';

export class NewsletterRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.NewsletterCreateInput): Promise<Newsletter> {
    return this.prisma.newsletter.create({
      data,
    });
  }

  async findAll(): Promise<Newsletter[]> {
    return this.prisma.newsletter.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<Newsletter | null> {
    return this.prisma.newsletter.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Newsletter | null> {
    return this.prisma.newsletter.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: Prisma.NewsletterUpdateInput): Promise<Newsletter> {
    return this.prisma.newsletter.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Newsletter> {
    return this.prisma.newsletter.delete({
      where: { id },
    });
  }

  async unsubscribe(email: string): Promise<Newsletter> {
    return this.prisma.newsletter.update({
      where: { email },
      data: { active: false },
    });
  }

  async findActiveSubscribers(): Promise<Newsletter[]> {
    return this.prisma.newsletter.findMany({
      where: {
        active: true,
      },
    });
  }
}
```

## Transações e Operações em Lote

O Prisma oferece suporte a transações e operações em lote, que são úteis para garantir a integridade dos dados:

```typescript
// Exemplo de transação
async function transferPoints(fromUserId: string, toUserId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    // Verificar se o usuário de origem tem pontos suficientes
    const fromUser = await tx.user.findUnique({
      where: { id: fromUserId },
      select: { points: true },
    });
    
    if (!fromUser || fromUser.points < amount) {
      throw new Error('Pontos insuficientes');
    }
    
    // Atualizar pontos do usuário de origem
    await tx.user.update({
      where: { id: fromUserId },
      data: { points: { decrement: amount } },
    });
    
    // Atualizar pontos do usuário de destino
    await tx.user.update({
      where: { id: toUserId },
      data: { points: { increment: amount } },
    });
    
    // Registrar a transação
    return tx.pointTransaction.create({
      data: {
        fromUserId,
        toUserId,
        amount,
        createdAt: new Date(),
      },
    });
  });
}

// Exemplo de operação em lote
async function createManyContacts(contacts: Prisma.ContactCreateInput[]) {
  return prisma.contact.createMany({
    data: contacts,
    skipDuplicates: true, // Opcional: pular registros duplicados
  });
}
```

## Conclusão

Estes exemplos de repositórios fornecem uma base sólida para o desenvolvimento do backend da aplicação Contabilidade Igrejinha. Eles seguem as melhores práticas de desenvolvimento, incluindo:

- Separação de responsabilidades
- Uso eficiente do Prisma ORM
- Métodos para operações CRUD padrão
- Métodos para consultas específicas
- Suporte a transações e operações em lote

Ao implementar estes repositórios, você terá uma camada de acesso a dados robusta e bem estruturada que atenderá às necessidades dos serviços e controladores do backend.

---

*Este documento pode ser expandido com mais exemplos conforme necessário durante o desenvolvimento do backend.*