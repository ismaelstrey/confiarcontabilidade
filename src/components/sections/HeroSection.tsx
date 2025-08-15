'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Users, Award, TrendingUp, Phone } from 'lucide-react'
import Link from 'next/link'

const HeroSection = () => {
  const stats = [
    { icon: Users, label: '500+ Empresas Atendidas', value: '500+' },
    { icon: Award, label: '15+ Anos de Experiência', value: '15+' },
    { icon: TrendingUp, label: '98% de Satisfação', value: '98%' },
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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <Container size="xl" className="relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Content */} 
          <div className="text-white">
            <motion.div variants={itemVariants as any}>
              <Badge variant="outline" className="mb-6 border-white/20 text-white hover:bg-white/10">
                ✨ Contabilidade Estratégica
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants as any}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Transforme sua empresa com{' '}
              <motion.span
                className="text-accent-400 inline-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                contabilidade estratégica
              </motion.span>
            </motion.h1>

            <motion.p
              variants={itemVariants as any}
              className="text-xl text-primary-100 mb-8 leading-relaxed max-w-2xl"
            >
              Mais de 15 anos oferecendo soluções contábeis completas para empresas que querem crescer com segurança e eficiência fiscal.
            </motion.p>

            <motion.div
              variants={itemVariants as any}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Button
                size="lg"
                variant="secondary"
                className="group"
                asChild
              >
                <Link href="/contato">
                  <Phone className="w-5 h-5 mr-2" />
                  Solicite uma Consultoria
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/servicos">
                  Conheça Nossos Serviços
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants as any}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    className="flex items-center space-x-3 text-primary-100"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">{stat.value}</div>
                      <div className="text-sm">{stat.label}</div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          {/* Image/Illustration */}
          <motion.div
            variants={floatingVariants as any}
            animate="animate"
            className="relative"
          >
            <motion.div
              variants={itemVariants as any}
              className="relative z-10"
            >
              {/* Placeholder for professional illustration */}
              <div className="relative w-full h-96 lg:h-[500px] bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center">
                <div className="text-center text-white/80">
                  <Users className="w-16 h-16 mx-auto mb-4 text-accent-400" />
                  <p className="text-lg font-medium">Profissionais Especializados</p>
                  <p className="text-sm text-white/60 mt-2">Ilustração será adicionada aqui</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <Award className="w-8 h-8 text-white" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-success-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  rotate: -360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection