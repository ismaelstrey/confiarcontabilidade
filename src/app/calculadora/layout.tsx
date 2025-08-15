import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora Fiscal Gratuita | Simples Nacional, Folha de Pagamento e Lucro Presumido',
  description: 'Calculadoras fiscais gratuitas e atualizadas para 2024. Calcule impostos do Simples Nacional, folha de pagamento e Lucro Presumido de forma rápida e precisa.',
  keywords: 'calculadora fiscal, simples nacional, folha de pagamento, lucro presumido, impostos, cálculo tributário, contabilidade',
  openGraph: {
    title: 'Calculadora Fiscal Gratuita | Ferramentas Contábeis',
    description: 'Ferramentas gratuitas para cálculos fiscais e trabalhistas. Simples Nacional, Folha de Pagamento e Lucro Presumido.',
    type: 'website',
    locale: 'pt_BR'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Fiscal Gratuita',
    description: 'Calcule impostos e folha de pagamento gratuitamente'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function CalculadoraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}