import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orçamento Online Gratuito | Serviços Contábeis Personalizados',
  description: 'Solicite seu orçamento personalizado para serviços contábeis. Abertura de empresa, contabilidade mensal, planejamento tributário e mais. Resposta em 24 horas.',
  keywords: 'orçamento contabilidade, orçamento online, serviços contábeis, abertura empresa, planejamento tributário, contabilidade empresarial',
  openGraph: {
    title: 'Orçamento Online Gratuito | ContabilPro',
    description: 'Receba uma proposta personalizada para os serviços contábeis da sua empresa. Processo rápido e seguro.',
    type: 'website',
    locale: 'pt_BR'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orçamento Online Gratuito',
    description: 'Solicite seu orçamento personalizado para serviços contábeis'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function OrcamentoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}