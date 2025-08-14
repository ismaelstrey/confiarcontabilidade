// Tipos para navegação
export interface NavItem {
  title: string
  href: string
  description?: string
  external?: boolean
}

// Tipos para formulários
export interface ContactFormData {
  name: string
  email: string
  phone: string
  company?: string
  message: string
  service?: string
  acceptTerms: boolean
}

export interface NewsletterFormData {
  email: string
  name?: string
}

export interface CalculatorFormData {
  revenue: number
  employees: number
  businessType: 'mei' | 'simples' | 'presumido' | 'real'
  hasPartners: boolean
}

// Tipos para serviços
export interface Service {
  id: string
  title: string
  description: string
  icon: string
  features: string[]
  price?: {
    from: number
    to?: number
    period: 'mensal' | 'anual' | 'único'
  }
  popular?: boolean
}

// Tipos para depoimentos
export interface Testimonial {
  id: string
  name: string
  company: string
  role: string
  content: string
  rating: number
  avatar?: string
}

// Tipos para blog/artigos
export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  updatedAt?: string
  category: string
  tags: string[]
  featured?: boolean
  readTime: number
  slug: string
  seo: {
    title: string
    description: string
    keywords: string[]
  }
}

// Tipos para FAQ
export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

// Tipos para equipe
export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  avatar: string
  credentials: string[]
  social?: {
    linkedin?: string
    email?: string
  }
}

// Tipos para SEO
export interface SEOData {
  title: string
  description: string
  keywords: string[]
  canonical?: string
  ogImage?: string
  noindex?: boolean
}

// Tipos para configuração do site
export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    whatsapp: string
    email: string
    phone: string
    address: string
    social: {
      facebook?: string
      instagram?: string
      linkedin?: string
      youtube?: string
    }
  }
  business: {
    cnpj: string
    crc: string
    address: {
      street: string
      city: string
      state: string
      zip: string
    }
  }
}

// Tipos para animações
export interface AnimationConfig {
  duration: number
  delay?: number
  ease?: string
  repeat?: number
}

// Tipos para componentes
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

// Tipos para API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ContactApiResponse extends ApiResponse {
  data?: {
    id: string
    sentAt: string
  }
}

// Tipos para calculadora fiscal
export interface TaxCalculationResult {
  businessType: string
  monthlyTax: number
  annualTax: number
  taxRate: number
  savings?: number
  recommendations: string[]
  breakdown: {
    federal: number
    state: number
    municipal: number
  }
}

// Tipos para métricas e analytics
export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
}

export interface PageMetrics {
  views: number
  uniqueVisitors: number
  bounceRate: number
  avgTimeOnPage: number
  conversions: number
}