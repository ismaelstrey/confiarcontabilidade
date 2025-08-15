# 🏢 Site Institucional - Empresa de Contabilidade

> **Documentação completa e prompts para IA para criação de um site institucional moderno, animado e otimizado para conversão.**

## 📋 Sobre o Projeto

Este repositório contém toda a documentação e prompts necessários para desenvolver um site institucional profissional para uma empresa de contabilidade, utilizando as mais modernas tecnologias web e focado em performance, SEO e conversão de leads.

## 🎯 Características Principais

- ✨ **Design Moderno:** Interface limpa e profissional com animações suaves
- 🚀 **Performance Otimizada:** Lighthouse Score > 95 em todas as métricas
- 📱 **Totalmente Responsivo:** Funciona perfeitamente em todos os dispositivos
- 🔍 **SEO Avançado:** Otimizado para motores de busca com Schema Markup
- 📧 **Formulários Funcionais:** Integração com email e reCAPTCHA
- 📊 **Analytics Integrado:** Google Analytics 4 e Facebook Pixel
- ♿ **Acessibilidade:** Seguindo padrões WCAG 2.1
- 🔒 **Segurança:** Headers de segurança e proteção contra ataques

## 🛠️ Stack Tecnológica

### Frontend
- **Framework:** Next.js 15.4.6 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Animações:** Framer Motion + GSAP
- **Componentes:** Radix UI
- **Formulários:** React Hook Form + Zod

### Backend & Integrações
- **API Routes:** Next.js API Routes
- **Email:** Nodemailer
- **Validação:** reCAPTCHA v3
- **Analytics:** Google Analytics 4
- **Social:** Facebook Pixel
- **Comunicação:** WhatsApp Integration

### Deploy & Performance
- **Hospedagem:** Vercel (recomendado)
- **CDN:** Vercel Edge Network
- **Imagens:** Next.js Image Optimization
- **SEO:** Next SEO + Schema Markup

## 📁 Estrutura da Documentação

```
contabil/
├── README.md                           # Este arquivo
├── ROADMAP.md                          # Plano estratégico do projeto
├── REQUIREMENTS.md                     # Requisitos funcionais e técnicos
├── DESIGN-SYSTEM.md                    # Especificações visuais
└── ai-prompts/                         # Prompts para implementação
    ├── 00-guia-implementacao.md        # Guia completo de implementação
    ├── 01-setup-project.md             # Configuração inicial
    ├── 02-components-base.md            # Componentes base
    ├── 03-layout-navigation.md          # Layout e navegação
    ├── 04-hero-landing.md               # Landing page
    ├── 05-pages-internas.md             # Páginas internas
    ├── 06-formularios-integracao.md     # Formulários e integrações
    └── 07-otimizacao-seo.md             # Otimizações e deploy
```

## 🚀 Como Usar

### Opção 1: Implementação com IA (Recomendado)

1. **Leia a documentação base:**
   - `ROADMAP.md` - Entenda o projeto completo
   - `REQUIREMENTS.md` - Conheça todos os requisitos
   - `DESIGN-SYSTEM.md` - Veja as especificações visuais

2. **Execute os prompts em ordem:**
   - Comece com `00-guia-implementacao.md` para visão geral
   - Execute os prompts de `01` a `07` sequencialmente
   - Use sua IA preferida (ChatGPT, Claude, etc.)

3. **Configure o ambiente:**
   ```bash
   # Crie o arquivo .env.local
   NEXT_PUBLIC_BASE_URL=https://seudominio.com
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=sua_chave
   # ... outras variáveis
   ```

### Opção 2: Implementação Manual

1. **Clone e configure:**
   ```bash
   npx create-next-app@15.4.6 contabil-site --typescript --tailwind --eslint --app
   cd contabil-site
   ```

2. **Instale dependências:**
   ```bash
   npm install framer-motion @radix-ui/react-* react-hook-form @hookform/resolvers zod
   ```

3. **Siga a documentação:**
   - Use os arquivos de documentação como referência
   - Implemente componente por componente
   - Teste cada funcionalidade

## 📊 Páginas e Funcionalidades

### Páginas Principais
- 🏠 **Home:** Landing page com hero, serviços, estatísticas, depoimentos
- 👥 **Sobre Nós:** História, missão, visão, valores, timeline, equipe
- 💼 **Serviços:** Grid de serviços com páginas individuais detalhadas
- 👨‍💼 **Equipe:** Apresentação dos profissionais e especializações
- 📞 **Contato:** Formulário, informações, mapa, redes sociais
- 📝 **Blog:** Artigos sobre contabilidade e gestão empresarial

### Funcionalidades Especiais
- 📋 **Formulário de Contato:** Com validação e envio de email
- 📧 **Newsletter:** Cadastro para receber conteúdos
- 💰 **Calculadoras:** Simples Nacional, rescisão trabalhista
- 📅 **Agendamento:** Sistema para marcar consultorias
- 💬 **WhatsApp:** Botão flutuante para contato direto
- 🔍 **Busca:** Sistema de busca no blog e serviços

## 🎨 Design System

### Paleta de Cores
```css
/* Cores Primárias */
--primary-50: #f0f9ff;   /* Azul muito claro */
--primary-500: #3b82f6;  /* Azul principal */
--primary-600: #2563eb;  /* Azul escuro */
--primary-900: #1e3a8a;  /* Azul muito escuro */

/* Cores de Destaque */
--accent-500: #f59e0b;   /* Dourado */
--accent-600: #d97706;   /* Dourado escuro */

/* Cores Neutras */
--gray-50: #f9fafb;
--gray-900: #111827;
```

### Tipografia
- **Primária:** Inter (textos gerais)
- **Secundária:** Playfair Display (títulos importantes)
- **Escala:** 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px, 60px

### Componentes Base
- Buttons (Primary, Secondary, Outline, Ghost)
- Cards (Default, Hover, Featured)
- Forms (Input, Textarea, Select, Checkbox)
- Navigation (Header, Footer, Breadcrumb)
- Feedback (Loading, Success, Error)

## 📈 Métricas de Performance

### Targets de Performance
- **Lighthouse Performance:** > 95
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Time to Interactive:** < 3.5s

### SEO Targets
- **Lighthouse SEO:** > 95
- **Core Web Vitals:** Todos verdes
- **Mobile Usability:** 100%
- **Structured Data:** Sem erros

## 🔧 Configuração de Desenvolvimento

### Pré-requisitos
- Node.js 20+
- npm ou yarn
- Git

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Análise de bundle
npm run build:analyze

# Testes
npm run test

# Lint
npm run lint
```

### Variáveis de Ambiente
```env
# Base
NEXT_PUBLIC_BASE_URL=https://seudominio.com

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=123456789

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=sua_chave_publica
RECAPTCHA_SECRET_KEY=sua_chave_secreta

# Email
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=.next
```

## 📞 Suporte e Contribuição

### Recursos Úteis
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/)

### Contribuindo
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎉 Resultado Final

Após seguir toda a documentação, você terá:

- ✅ Site institucional moderno e profissional
- ✅ Performance excepcional (Lighthouse > 95)
- ✅ SEO otimizado para atrair clientes
- ✅ Formulários funcionais com integração
- ✅ Design responsivo e acessível
- ✅ Sistema de analytics configurado
- ✅ Pronto para produção e conversão de leads

---

**🚀 Transforme sua presença digital e atraia mais clientes com um site que realmente converte!**

---

*Desenvolvido com ❤️ para empresas de contabilidade que querem se destacar no mercado digital.*