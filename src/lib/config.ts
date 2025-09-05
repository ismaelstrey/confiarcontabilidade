import { SiteConfig } from '@/types'

export const siteConfig: SiteConfig = {
  name: 'Contabilidade Igrejinha',
  description: 'Soluções completas em contabilidade para empresas de todos os portes. Abertura de empresa, contabilidade mensal, planejamento tributário e consultoria especializada.',
  url: 'https://contabilidadeigrejinha.com.br',
  ogImage: '/images/og-image.jpg',
  contact:{
    whatsapp:"(51) 9 9916-0766"
  },
  links: {
    whatsapp: 'https://wa.me/5551999160766?text=Olá! Gostaria de saber mais sobre os serviços de contabilidade.',
    email: 'contato@contabilidadeigrejinha.com.br',
    phone: '(51) 9 9916-0766',
    address: 'Estrada Geraldo Meneger, 12 - Voluntária Baixa, Igrejinha - RS',
    social: {
      facebook: 'https://facebook.com/contabilidadeigrejinha',
      instagram: 'https://instagram.com/contabilidadeigrejinha',
      linkedin: 'https://linkedin.com/company/contabilidadeigrejinha',
      youtube: 'https://youtube.com/@contabilidadeigrejinha'
    }
  },
  business: {
    cnpj: '55.324.886/0001-10',
    crc: 'CRC-RS 123456/O-7',
    email: 'contato@contabilidadeigrejinha.com.br',
    address: {
      street: 'Estrada Geraldo Meneger, 12 - Voluntária Baixa, Igrejinha - RS',
      city: 'Igrejinha',
      state: 'RS',
      zip: '38400-000'
    }
  }
}

// Configurações de navegação
export const mainNav = [
  {
    title: 'Início',
    href: '/'
  },
  {
    title: 'Sobre',
    href: '/sobre'
  },
  {
    title: 'Serviços',
    href: '/servicos'
  },
  {
    title: 'Calculadora',
    href: '/calculadora'
  },
  {
    title: 'Orçamento',
    href: '/orcamento'
  },
  {
    title: 'FAQ',
    href: '/faq'
  },
  {
    title: 'Equipe',
    href: '/equipe'
  },
  {
    title: 'Blog',
    href: '/blog'
  },
  {
    title: 'Contato',
    href: '/contato'
  }
]

// Configurações de serviços
export const services = [
  {
    id: 'abertura-empresa',
    title: 'Abertura de Empresa',
    description: 'Processo completo para abertura da sua empresa com agilidade e segurança.',
    icon: 'building',
    features: [
      'Consulta de viabilidade',
      'Registro na Junta Comercial',
      'Inscrições fiscais',
      'Alvará de funcionamento',
      'Suporte completo'
    ],
    price: {
      from: 299,
      period: 'único' as const
    }
  },
  {
    id: 'contabilidade-mensal',
    title: 'Contabilidade Mensal',
    description: 'Gestão completa da contabilidade da sua empresa com relatórios mensais.',
    icon: 'calculator',
    features: [
      'Escrituração contábil',
      'Balancetes mensais',
      'Demonstrações financeiras',
      'Conciliação bancária',
      'Suporte especializado'
    ],
    price: {
      from: 199,
      period: 'mensal' as const
    },
    popular: true
  },
  {
    id: 'planejamento-tributario',
    title: 'Planejamento Tributário',
    description: 'Otimização da carga tributária com estratégias personalizadas.',
    icon: 'trending-down',
    features: [
      'Análise tributária',
      'Enquadramento fiscal',
      'Simulações de economia',
      'Acompanhamento mensal',
      'Relatórios de economia'
    ],
    price: {
      from: 399,
      period: 'mensal' as const
    }
  },
  {
    id: 'consultoria',
    title: 'Consultoria Empresarial',
    description: 'Consultoria especializada para tomada de decisões estratégicas.',
    icon: 'users',
    features: [
      'Análise financeira',
      'Consultoria fiscal',
      'Orientação empresarial',
      'Reuniões mensais',
      'Relatórios personalizados'
    ],
    price: {
      from: 599,
      period: 'mensal' as const
    }
  },
  {
    id: 'departamento-pessoal',
    title: 'Departamento Pessoal',
    description: 'Gestão completa de recursos humanos e folha de pagamento.',
    icon: 'user-check',
    features: [
      'Folha de pagamento',
      'Admissões e demissões',
      'Obrigações trabalhistas',
      'eSocial e FGTS',
      'Consultoria trabalhista'
    ],
    price: {
      from: 25,
      period: 'mensal' as const
    }
  },
  {
    id: 'fiscal-tributario',
    title: 'Fiscal e Tributário',
    description: 'Gestão de todas as obrigações fiscais e tributárias da empresa.',
    icon: 'file-text',
    features: [
      'Apuração de impostos',
      'Declarações fiscais',
      'Obrigações acessórias',
      'Acompanhamento de prazos',
      'Defesa fiscal'
    ],
    price: {
      from: 149,
      period: 'mensal' as const
    }
  }
]

// Configurações de depoimentos
export const testimonials = [
  {
    id: '1',
    name: 'Maria Silva',
    company: 'Silva & Associados',
    role: 'CEO',
    content: 'A ContabilPro transformou a gestão financeira da nossa empresa. Profissionais competentes e sempre disponíveis para esclarecer dúvidas.',
    rating: 5,
    avatar: '/images/testimonials/maria-silva.jpg'
  },
  {
    id: '2',
    name: 'João Santos',
    company: 'TechStart',
    role: 'Fundador',
    content: 'Excelente atendimento desde a abertura da empresa. O planejamento tributário nos ajudou a economizar significativamente.',
    rating: 5,
    avatar: '/images/testimonials/joao-santos.jpg'
  },
  {
    id: '3',
    name: 'Ana Costa',
    company: 'Boutique Ana',
    role: 'Proprietária',
    content: 'Profissionais dedicados que realmente se importam com o sucesso do nosso negócio. Recomendo sem hesitar!',
    rating: 5,
    avatar: '/images/testimonials/ana-costa.jpg'
  }
]

// Configurações de FAQ
export const faqs = [
  {
    id: '1',
    question: 'Quanto tempo leva para abrir uma empresa?',
    answer: 'O processo de abertura de empresa leva em média de 15 a 30 dias úteis, dependendo do tipo de empresa e da documentação fornecida.',
    category: 'abertura'
  },
  {
    id: '2',
    question: 'Quais documentos preciso para a contabilidade mensal?',
    answer: 'Você precisa fornecer notas fiscais de entrada e saída, extratos bancários, comprovantes de pagamentos e recebimentos, e demais documentos fiscais.',
    category: 'contabilidade'
  },
  {
    id: '3',
    question: 'Como funciona o planejamento tributário?',
    answer: 'Analisamos sua empresa e identificamos oportunidades de economia fiscal legal, como mudança de regime tributário ou reorganização societária.',
    category: 'tributario'
  },
  {
    id: '4',
    question: 'Vocês atendem empresas de todos os portes?',
    answer: 'Sim, atendemos desde MEI até grandes empresas, com soluções personalizadas para cada porte e segmento.',
    category: 'geral'
  },
  {
    id: '5',
    question: 'Como é feito o atendimento?',
    answer: 'Oferecemos atendimento presencial, por telefone, WhatsApp e e-mail. Cada cliente tem um contador responsável dedicado.',
    category: 'atendimento'
  }
]