'use client'

import { motion } from 'framer-motion'
import { Container, Section } from '@/components/ui/container'
import { 
  Users, 
  Building2, 
  Award, 
  TrendingUp,
  Clock,
  Shield
} from 'lucide-react'
import { useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const StatsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const stats = [
    {
      icon: Users,
      value: 500,
      suffix: '+',
      label: 'Empresas Atendidas',
      description: 'Clientes satisfeitos em diversos segmentos'
    },
    {
      icon: Clock,
      value: 15,
      suffix: '+',
      label: 'Anos de Experiência',
      description: 'Tradição e expertise no mercado contábil'
    },
    {
      icon: Award,
      value: 98,
      suffix: '%',
      label: 'Satisfação dos Clientes',
      description: 'Índice de aprovação e recomendação'
    },
    {
      icon: Building2,
      value: 50,
      suffix: '+',
      label: 'Empresas por Mês',
      description: 'Novos clientes que confiam em nosso trabalho'
    },
    {
      icon: TrendingUp,
      value: 85,
      suffix: '%',
      label: 'Economia Tributária',
      description: 'Média de redução na carga fiscal dos clientes'
    },
    {
      icon: Shield,
      value: 100,
      suffix: '%',
      label: 'Conformidade Legal',
      description: 'Garantia total de compliance fiscal'
    }
  ]

  return (
    <Section background="primary" spacing="xl" ref={ref}>
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Números que <span className="text-accent-400">Falam por Si</span>
          </h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
            Nossa trajetória de sucesso é construída com base na confiança, 
            qualidade e resultados excepcionais para nossos clientes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <StatCard
                key={stat.label}
                stat={stat}
                Icon={Icon}
                index={index}
                isInView={isInView}
              />
            )
          })}
        </div>
      </Container>
    </Section>
  )
}

interface StatCardProps {
  stat: {
    value: number
    suffix: string
    label: string
    description: string
  }
  Icon: any
  index: number
  isInView: boolean
}

const StatCard = ({ stat, Icon, index, isInView }: StatCardProps) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        const duration = 2000 // 2 seconds
        const steps = 60
        const increment = stat.value / steps
        let current = 0
        
        const counter = setInterval(() => {
          current += increment
          if (current >= stat.value) {
            setCount(stat.value)
            clearInterval(counter)
          } else {
            setCount(Math.floor(current))
          }
        }, duration / steps)
        
        return () => clearInterval(counter)
      }, index * 200) // Stagger the animations
      
      return () => clearTimeout(timer)
    }
  }, [isInView, stat.value, index])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: 'easeOut'
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { type: 'spring', stiffness: 300 }
      }}
      className="group"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center h-full">
        {/* Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-accent-500 rounded-2xl mb-6 group-hover:bg-accent-400 transition-colors duration-300"
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Number */}
        <div className="mb-4">
          <motion.span 
            className="text-4xl md:text-5xl font-bold text-white block"
            key={count} // This will trigger re-render when count changes
          >
            {count}{stat.suffix}
          </motion.span>
        </div>

        {/* Label */}
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-accent-400 transition-colors duration-300">
          {stat.label}
        </h3>

        {/* Description */}
        <p className="text-primary-100 text-sm leading-relaxed">
          {stat.description}
        </p>

        {/* Decorative element */}
        <motion.div
          className="w-12 h-1 bg-accent-500 rounded-full mx-auto mt-6 group-hover:w-16 transition-all duration-300"
          initial={{ width: 0 }}
          animate={isInView ? { width: 48 } : { width: 0 }}
          transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
        />
      </div>
    </motion.div>
  )
}

export default StatsSection