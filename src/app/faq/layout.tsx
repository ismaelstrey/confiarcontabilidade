import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Perguntas Frequentes | Serviços Contábeis',
  description: 'Encontre respostas para as principais dúvidas sobre nossos serviços contábeis. Abertura de empresa, custos, prazos, segurança e muito mais.',
  keywords: 'FAQ contabilidade, perguntas frequentes, dúvidas contábeis, serviços contábeis, abertura empresa, custos contabilidade, prazos fiscais',
  openGraph: {
    title: 'FAQ - Perguntas Frequentes | ContabilPro',
    description: 'Tire suas dúvidas sobre nossos serviços contábeis. Respostas claras e objetivas para as principais questões.',
    type: 'website',
    locale: 'pt_BR'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ - Perguntas Frequentes',
    description: 'Encontre respostas para suas dúvidas sobre serviços contábeis'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}