# Prompt: Setup Inicial do Projeto Next.js

## 🎯 Objetivo
Configurar um projeto Next.js 15.4.6 moderno com todas as dependências necessárias para um site institucional de contabilidade com animações avançadas e design impactante.

## 📋 Prompt para IA

```
Crie um projeto Next.js 15.4.6 completo para um site institucional de uma empresa de contabilidade. O projeto deve incluir:

**CONFIGURAÇÃO INICIAL:**
1. Use `npx create-next-app@15.4.6 contabil-site --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
2. Configure o projeto com App Router (não Pages Router)
3. Use TypeScript em modo strict
4. Configure Tailwind CSS com configurações customizadas

**DEPENDÊNCIAS OBRIGATÓRIAS (Compatíveis com Next.js 15.4.6):**

```bash
# Criar projeto Next.js 15.4.6 com configurações otimizadas
npx create-next-app@15.4.6 contabil-site \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd contabil-site

# Dependências principais compatíveis com Next.js 15.4.6
npm install \
  framer-motion@^11.11.17 \
  gsap@^3.12.5 \
  @radix-ui/react-accordion@^1.2.1 \
  @radix-ui/react-dialog@^1.1.2 \
  @radix-ui/react-dropdown-menu@^2.1.2 \
  @radix-ui/react-navigation-menu@^1.2.1 \
  @radix-ui/react-select@^2.1.2 \
  @radix-ui/react-toast@^1.2.2 \
  @radix-ui/react-tooltip@^1.1.3 \
  react-hook-form@^7.54.0 \
  @hookform/resolvers@^3.9.1 \
  zod@^3.24.1 \
  next-seo@^6.6.0 \
  nodemailer@^6.9.16 \
  @types/nodemailer@^6.4.19 \
  lucide-react@^0.468.0 \
  class-variance-authority@^0.7.1 \
  clsx@^2.1.1 \
  tailwind-merge@^2.5.4

# Dependências de desenvolvimento compatíveis com Next.js 15.4.6
npm install -D \
  @types/node@^22.10.2 \
  @types/react@^19.0.2 \
  @types/react-dom@^19.0.2 \
  autoprefixer@^10.4.20 \
  postcss@^8.5.11 \
  tailwindcss@^3.4.17 \
  eslint@^9.17.0 \
  eslint-config-next@^15.4.6 \
  typescript@^5.7.2
```

Animações e Interações:
- framer-motion (animações React)
- gsap (animações avançadas)

UI e Componentes:
- @radix-ui/react-* (componentes acessíveis)
- lucide-react (ícones modernos)
- clsx (conditional classes)
- tailwind-merge (merge classes)
- class-variance-authority (variantes de componentes)

Formulários:
- react-hook-form (gerenciamento de forms)
- @hookform/resolvers (validação)
- zod (schema validation)

SEO e Performance:
- next-seo (SEO otimizado)
- nodemailer (envio de emails)

**ESTRUTURA DE PASTAS:**
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── sobre/
│   ├── servicos/
│   ├── equipe/
│   ├── contato/
│   ├── blog/
│   └── api/
├── components/
│   ├── ui/           # Componentes base (Button, Card, Input)
│   ├── layout/       # Header, Footer, Navigation
│   ├── sections/     # Hero, Services, About, etc.
│   ├── forms/        # Formulários específicos
│   └── animations/   # Componentes de animação
├── lib/
│   ├── utils.ts      # Utilitários gerais
│   ├── validations.ts # Schemas Zod
│   ├── constants.ts  # Constantes do projeto
│   └── animations.ts # Configurações de animação
├── styles/
│   └── globals.css   # Estilos globais
├── types/
│   └── index.ts      # Definições TypeScript
└── data/
    ├── services.ts   # Dados dos serviços
    ├── team.ts       # Dados da equipe
    └── content.ts    # Conteúdo estático
```

**CONFIGURAÇÕES ESPECÍFICAS:**

1. **tailwind.config.js** - Configure com:
   - Cores customizadas (azul corporativo, verde sucesso, dourado premium)
   - Fontes (Inter + Playfair Display)
   - Animações customizadas
   - Breakpoints responsivos

2. **next.config.js** - Configure com Next.js 15.4.6:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  compress: true,
}

module.exports = nextConfig
```

3. **tsconfig.json** - Configure com:
   - Strict mode habilitado
   - Path mapping para imports
   - Configurações otimizadas

4. **globals.css** - Inclua:
   - Reset CSS
   - Variáveis CSS customizadas
   - Estilos base para tipografia
   - Animações globais

**COMPONENTES INICIAIS:**
Crie os seguintes componentes base:
- Button (com variantes primary, secondary, success)
- Card (com hover effects)
- Input (com validação visual)
- Loading (com animação)
- Container (wrapper responsivo)

**CONFIGURAÇÃO DE DESENVOLVIMENTO:**
- ESLint com regras específicas para Next.js
- Prettier para formatação
- Husky para git hooks (opcional)
- Scripts npm otimizados

**PALETA DE CORES:**
Use estas cores no Tailwind:
- Primary: Azul corporativo (#1E40AF e variações)
- Success: Verde estabilidade (#059669 e variações)
- Accent: Dourado premium (#D97706 e variações)
- Neutral: Escala de cinzas moderna

**REQUISITOS IMPORTANTES:**
- Todas as animações devem ser suaves (60fps)
- Design mobile-first obrigatório
- Acessibilidade WCAG 2.1 AA
- Performance otimizada (Lighthouse > 95)
- SEO-friendly desde o início

Crie também um README.md detalhado explicando como rodar o projeto e suas funcionalidades.
```

## ✅ Critérios de Validação

Após executar este prompt, verifique se:
- [ ] Projeto Next.js 15.4.6 criado com App Router
- [ ] Todas as dependências instaladas sem conflitos
- [ ] Estrutura de pastas organizada
- [ ] Tailwind configurado com cores customizadas
- [ ] TypeScript funcionando em modo strict
- [ ] Componentes base criados e funcionais
- [ ] Projeto roda sem erros (`npm run dev`)
- [ ] Build de produção funciona (`npm run build`)

## 🔄 Próximos Passos

Após completar este setup:
1. Execute o prompt "02-components-base.md"
2. Configure o sistema de animações
3. Implemente o layout principal
4. Desenvolva as páginas principais

---

*Este prompt estabelece a base sólida para todo o desenvolvimento posterior.*