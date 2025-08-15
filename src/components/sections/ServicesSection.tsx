'use client'

import { motion } from 'framer-motion'
import { Container, Section } from '@/components/ui/container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Calculator, 
  FileText, 
  TrendingUp, 
  Shield, 
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const ServicesSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const services = [
    {
      icon: Building2,
      title: 'Contabilidade Empresarial',
      description: 'Gestão contábil completa para sua empresa com relatórios gerenciais e análises financeiras detalhadas.',
      features: ['Balanços e DRE', 'Conciliações bancárias', 'Relatórios gerenciais', 'Análise de custos'],
      href: '/servicos/contabilidade-empresarial',
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: Calculator,
      title: 'Planejamento Tributário',
      description: 'Otimização da carga tributária através de estratégias fiscais inteligentes e dentro da legalidade.',
      features: ['Análise de regime tributário', 'Elisão fiscal', 'Recuperação de tributos', 'Consultoria fiscal'],
      href: '/servicos/planejamento-tributario',
      color: 'from-accent-500 to-accent-600'
    },
    {
      icon: FileText,
      title: 'Departamento Pessoal',
      description: 'Gestão completa de recursos humanos, folha de pagamento e obrigações trabalhistas.',
      features: ['Folha de pagamento', 'eSocial e FGTS', 'Admissões e demissões', 'Consultoria trabalhista'],
      href: '/servicos/departamento-pessoal',
      color: 'from-success-500 to-success-600'
    },
    {
      icon: TrendingUp,
      title: 'Consultoria Financeira',
      description: 'Assessoria estratégica para tomada de decisões e crescimento sustentável do seu negócio.',
      features: ['Análise de viabilidade', 'Fluxo de caixa', 'Orçamento empresarial', 'Indicadores financeiros'],
      href: '/servicos/consultoria-financeira',
      color: 'from-warning-500 to-warning-600'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return (
    <Section background="gray" spacing="xl" ref={ref}>
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Nossos <span className="text-primary-600">Serviços</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Oferecemos soluções contábeis completas e personalizadas para empresas de todos os portes, 
            sempre com foco na excelência e resultados.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-8"
        >
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div 
                key={service.title} 
                variants={cardVariants as any}
              >
                <Card 
                  variant="elevated" 
                  className="h-full group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden"
                >
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${service.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="p-2 rounded-full bg-gray-100 group-hover:bg-primary-50 transition-colors duration-300"
                      >
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-primary-600" />
                      </motion.div>
                    </div>
                    
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                      {service.title}
                    </CardTitle>
                    
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ delay: 0.1 * featureIndex + 0.3 * index }}
                          className="flex items-center space-x-3"
                        >
                          <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all duration-300"
                      asChild
                    >
                      <Link href={service.href}>
                        Saiba Mais
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Precisa de uma solução personalizada?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Nossa equipe de especialistas está pronta para desenvolver a estratégia contábil ideal para o seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contato">
                  Fale com um Especialista
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sobre">
                  Conheça Nossa Equipe
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}

export default ServicesSection