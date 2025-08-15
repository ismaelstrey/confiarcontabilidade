# Prompt: Otimização, SEO e Deploy

## 🎯 Objetivo
Implementar otimizações avançadas de performance, SEO técnico completo, configurações de produção e preparar o site para deploy com máxima eficiência e visibilidade nos motores de busca.

## 📋 Prompt para IA

```
Implemente todas as otimizações de performance, SEO técnico avançado e configurações de produção para o site de contabilidade, garantindo Core Web Vitals excelentes e máxima visibilidade nos motores de busca.

**OTIMIZAÇÕES DE PERFORMANCE:**

## 1. CONFIGURAÇÃO NEXT.JS 15.4.6 OTIMIZADA
Atualize `next.config.js` com:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features para Next.js 15.4.6
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization para Next.js 15.4.6
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'contabilpro.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compression
  compress: true,
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  
  // Rewrites para SEO
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ]
  },
}

module.exports = nextConfig
```

## 2. OTIMIZAÇÃO DE IMAGENS
Crie `src/components/ui/OptimizedImage.tsx`:

```typescript
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f6f7f8" offset="20%" />
          <stop stop-color="#edeef1" offset="50%" />
          <stop stop-color="#f6f7f8" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#f6f7f8" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>
  `

  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str)

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Imagem não encontrada</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0.7 : 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={
          blurDataURL || `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`
        }
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        className="transition-opacity duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </motion.div>
  )
}

export { OptimizedImage }
```

## 3. LAZY LOADING AVANÇADO
Crie `src/components/ui/LazySection.tsx`:

```typescript
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface LazySectionProps {
  children: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
}

const LazySection = ({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '50px'
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin, hasLoaded])

  return (
    <div ref={ref} className={className}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}

export { LazySection }
```

**SEO TÉCNICO AVANÇADO:**

## 4. SITEMAP DINÂMICO
Crie `src/app/api/sitemap/route.ts`:

```typescript
import { NextResponse } from 'next/server'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://contabilpro.com'

const staticPages = [
  { url: '', priority: 1.0, changefreq: 'daily' },
  { url: '/sobre', priority: 0.8, changefreq: 'monthly' },
  { url: '/servicos', priority: 0.9, changefreq: 'weekly' },
  { url: '/equipe', priority: 0.7, changefreq: 'monthly' },
  { url: '/contato', priority: 0.8, changefreq: 'monthly' },
  { url: '/blog', priority: 0.8, changefreq: 'daily' },
]

const servicePages = [
  'contabilidade',
  'consultoria',
  'planejamento',
  'abertura',
  'departamento-pessoal',
  'auditoria'
].map(service => ({
  url: `/servicos/${service}`,
  priority: 0.7,
  changefreq: 'monthly'
}))

export async function GET() {
  const allPages = [...staticPages, ...servicePages]
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate'
    }
  })
}
```

## 5. ROBOTS.TXT DINÂMICO
Crie `src/app/robots.txt/route.ts`:

```typescript
import { NextResponse } from 'next/server'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://contabilpro.com'

export function GET() {
  const robotsTxt = `User-agent: *
Allow: /

Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

Sitemap: ${baseUrl}/sitemap.xml`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
```

## 6. SCHEMA MARKUP
Crie `src/components/seo/SchemaMarkup.tsx`:

```typescript
interface SchemaMarkupProps {
  type: 'organization' | 'localBusiness' | 'article' | 'service'
  data: any
}

const SchemaMarkup = ({ type, data }: SchemaMarkupProps) => {
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
    }

    switch (type) {
      case 'organization':
        return {
          ...baseSchema,
          '@type': 'Organization',
          name: 'ContabilPro',
          url: 'https://contabilpro.com',
          logo: 'https://contabilpro.com/logo.png',
          description: 'Empresa de contabilidade especializada em soluções estratégicas para empresas.',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Rua das Empresas, 123',
            addressLocality: 'São Paulo',
            addressRegion: 'SP',
            postalCode: '01234-567',
            addressCountry: 'BR'
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+55-11-99999-9999',
            contactType: 'customer service',
            availableLanguage: 'Portuguese'
          },
          sameAs: [
            'https://www.linkedin.com/company/contabilpro',
            'https://www.facebook.com/contabilpro',
            'https://www.instagram.com/contabilpro'
          ],
          ...data
        }

      case 'localBusiness':
        return {
          ...baseSchema,
          '@type': 'ProfessionalService',
          name: 'ContabilPro',
          image: 'https://contabilpro.com/images/office.jpg',
          '@id': 'https://contabilpro.com',
          url: 'https://contabilpro.com',
          telephone: '+55-11-99999-9999',
          priceRange: '$$',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Rua das Empresas, 123',
            addressLocality: 'São Paulo',
            addressRegion: 'SP',
            postalCode: '01234-567',
            addressCountry: 'BR'
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: -23.5505,
            longitude: -46.6333
          },
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday'
            ],
            opens: '08:00',
            closes: '18:00'
          },
          ...data
        }

      case 'article':
        return {
          ...baseSchema,
          '@type': 'Article',
          ...data
        }

      case 'service':
        return {
          ...baseSchema,
          '@type': 'Service',
          ...data
        }

      default:
        return baseSchema
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSchema())
      }}
    />
  )
}

export { SchemaMarkup }
```

## 7. SEO COMPONENT AVANÇADO
Crie `src/components/seo/SEOHead.tsx`:

```typescript
import Head from 'next/head'
import { SchemaMarkup } from './SchemaMarkup'

interface SEOHeadProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  article?: {
    publishedTime: string
    modifiedTime?: string
    author: string
    section: string
    tags: string[]
  }
  noindex?: boolean
  schema?: {
    type: 'organization' | 'localBusiness' | 'article' | 'service'
    data: any
  }
}

const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = '/images/og-default.jpg',
  ogType = 'website',
  article,
  noindex = false,
  schema
}: SEOHeadProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://contabilpro.com'
  const fullTitle = title.includes('ContabilPro') ? title : `${title} | ContabilPro`
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : baseUrl
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="ContabilPro" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Article specific */}
      {article && ogType === 'article' && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          <meta property="article:author" content={article.author} />
          <meta property="article:section" content={article.section} />
          {article.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Additional SEO */}
      <meta name="author" content="ContabilPro" />
      <meta name="publisher" content="ContabilPro" />
      <meta name="language" content="pt-BR" />
      <meta name="geo.region" content="BR-SP" />
      <meta name="geo.placename" content="São Paulo" />
      
      {/* Favicons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Schema Markup */}
      {schema && <SchemaMarkup type={schema.type} data={schema.data} />}
    </Head>
  )
}

export { SEOHead }
```

**CONFIGURAÇÕES DE PRODUÇÃO:**

## 8. MIDDLEWARE DE SEGURANÇA
Crie `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rate limiting básico
  const ip = request.ip ?? '127.0.0.1'
  
  // Headers de segurança
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  
  // CSP Header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://connect.facebook.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://www.google-analytics.com;
    frame-src 'self' https://www.google.com;
  `
  
  response.headers.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim())
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

## 9. CONFIGURAÇÃO DE ANALYTICS
Crie `src/lib/analytics.ts`:

```typescript
// Google Analytics 4
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    fbq: (...args: any[]) => void
  }
}

// GA4 Events
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters)
  }
}

// Conversion tracking
export const trackConversion = (conversionType: string, value?: number) => {
  trackEvent('conversion', {
    event_category: 'engagement',
    event_label: conversionType,
    value: value
  })
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', { content_name: conversionType })
  }
}

// Form submissions
export const trackFormSubmission = (formName: string) => {
  trackEvent('form_submit', {
    form_name: formName,
    event_category: 'engagement'
  })
}

// Page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}
```

## 10. CONFIGURAÇÃO DE DEPLOY
Crie `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["gru1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    },
    {
      "source": "/robots.txt",
      "destination": "/api/robots"
    }
  ]
}
```

## 11. SCRIPTS DE BUILD OTIMIZADOS
Atualize `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "build:analyze": "ANALYZE=true npm run build",
    "build:production": "NODE_ENV=production npm run build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**CHECKLIST DE DEPLOY:**

## 12. PRÉ-DEPLOY CHECKLIST

### Performance:
- [ ] Lighthouse Score > 95 em todas as métricas
- [ ] Imagens otimizadas (WebP/AVIF)
- [ ] Lazy loading implementado
- [ ] Bundle size otimizado
- [ ] Code splitting configurado

### SEO:
- [ ] Meta tags em todas as páginas
- [ ] Sitemap.xml funcionando
- [ ] Robots.txt configurado
- [ ] Schema markup implementado
- [ ] URLs amigáveis
- [ ] Breadcrumbs funcionando

### Segurança:
- [ ] Headers de segurança configurados
- [ ] CSP implementado
- [ ] Rate limiting ativo
- [ ] Formulários protegidos com reCAPTCHA
- [ ] Validação server-side

### Funcionalidade:
- [ ] Todos os formulários funcionando
- [ ] Emails sendo enviados
- [ ] Analytics configurado
- [ ] WhatsApp integration ativa
- [ ] Responsividade em todos os dispositivos

### Monitoramento:
- [ ] Google Analytics configurado
- [ ] Google Search Console configurado
- [ ] Error tracking implementado
- [ ] Performance monitoring ativo

**COMANDOS DE DEPLOY:**

```bash
# Build de produção
npm run build:production

# Análise de bundle
npm run build:analyze

# Deploy Vercel
npx vercel --prod

# Deploy Netlify
npx netlify deploy --prod --dir=.next
```
```

## ✅ Critérios de Validação Final

Após executar este prompt, verifique se:
- [ ] Lighthouse Score > 95 em todas as métricas
- [ ] Core Web Vitals todos verdes
- [ ] SEO score > 90
- [ ] Todas as funcionalidades funcionam em produção
- [ ] Analytics estão trackando corretamente
- [ ] Formulários enviam emails
- [ ] Site é totalmente responsivo
- [ ] Performance está otimizada
- [ ] Segurança implementada
- [ ] Monitoramento ativo

## 🎉 Conclusão do Projeto

Após completar todos os prompts:
1. Site institucional moderno e profissional ✅
2. Animações suaves e impactantes ✅
3. Performance otimizada ✅
4. SEO técnico completo ✅
5. Formulários funcionais ✅
6. Integrações ativas ✅
7. Deploy em produção ✅

---

*Com todas essas otimizações, o site estará pronto para atrair e converter clientes de forma eficiente.*