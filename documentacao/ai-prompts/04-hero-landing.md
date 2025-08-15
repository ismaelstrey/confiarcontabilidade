# Prompt: Hero Section e Landing Page Principal

## 🎯 Objetivo
Implementar uma landing page impactante com hero section animado, seções de serviços, depoimentos, estatísticas e CTAs estratégicos que convertam visitantes em leads qualificados.

## 📋 Prompt para IA

```
Crie uma landing page completa e impactante para a empresa de contabilidade com hero section moderno, animações profissionais e seções estratégicas para conversão. A página deve ser visualmente impressionante e otimizada para performance.

**SEÇÕES OBRIGATÓRIAS DA LANDING PAGE:**

## 1. HERO SECTION
Crie `src/components/sections/HeroSection.tsx` com:

**Elementos Visuais:**
- Background gradiente azul corporativo com padrão geométrico sutil
- Título principal impactante com animação typewriter
- Subtítulo explicativo
- Dois CTAs: "Fale Conosco" (primário) e "Nossos Serviços" (secundário)
- Imagem/ilustração de profissionais contábeis (placeholder por enquanto)
- Indicadores de confiança (anos de experiência, clientes atendidos)

**Animações:**
- Fade in escalonado dos elementos
- Typewriter effect no título principal
- Floating animation na imagem
- Parallax sutil no background
- Hover effects nos botões

**Conteúdo Sugerido:**
```
Título: "Transforme sua empresa com contabilidade estratégica"
Subtítulo: "Mais de 15 anos oferecendo soluções contábeis completas para empresas que querem crescer com segurança e eficiência fiscal."
CTAs: "Solicite uma Consultoria" | "Conheça Nossos Serviços"
Indicadores: "500+ Empresas Atendidas" | "15+ Anos de Experiência" | "98% de Satisfação"
```

## 2. SEÇÃO DE SERVIÇOS
Crie `src/components/sections/ServicesSection.tsx` com:

**Layout:**
- Grid responsivo 2x2 (desktop) / 1 coluna (mobile)
- Cards com ícones, título, descrição e link "Saiba mais"
- Hover effects com elevação e mudança de cor
- Animação de entrada ao scroll

**Serviços Principais:**
1. **Contabilidade Empresarial**
   - Ícone: Building2
   - Descrição: "Gestão contábil completa para sua empresa"

2. **Consultoria Fiscal**
   - Ícone: Calculator
   - Descrição: "Otimização tributária e compliance fiscal"

3. **Planejamento Tributário**
   - Ícone: TrendingUp
   - Descrição: "Estratégias para redução legal de impostos"

4. **Abertura de Empresas**
   - Ícone: Rocket
   - Descrição: "Processo completo de constituição empresarial"

## 3. SEÇÃO DE ESTATÍSTICAS
Crie `src/components/sections/StatsSection.tsx` com:

**Elementos:**
- Background escuro com padrão sutil
- 4 estatísticas principais com contadores animados
- Ícones representativos
- Animação de contagem ao scroll

**Estatísticas:**
- 500+ Empresas Atendidas
- 15+ Anos de Experiência
- R$ 50M+ Economizados em Impostos
- 98% Taxa de Satisfação

## 4. SEÇÃO SOBRE NÓS (RESUMO)
Crie `src/components/sections/AboutSection.tsx` com:

**Layout:**
- Duas colunas: texto à esquerda, imagem à direita
- Título, descrição, lista de diferenciais
- CTA "Conheça Nossa História"
- Animações de entrada laterais

**Conteúdo:**
```
Título: "Sua parceira em crescimento empresarial"
Descrição: "Somos uma empresa de contabilidade moderna, focada em oferecer soluções estratégicas que impulsionam o crescimento dos nossos clientes."
Diferenciais:
- Atendimento personalizado
- Tecnologia de ponta
- Equipe especializada
- Suporte completo
```

## 5. SEÇÃO DE DEPOIMENTOS
Crie `src/components/sections/TestimonialsSection.tsx` com:

**Funcionalidades:**
- Carrossel de depoimentos (Swiper.js)
- Cards com foto, nome, empresa e depoimento
- Navegação por dots e setas
- Auto-play com pause no hover
- Animações suaves de transição

**Depoimentos Exemplo:**
```
1. "A ContabilPro transformou nossa gestão fiscal. Economizamos 30% em impostos no primeiro ano."
   - João Silva, CEO da TechStart

2. "Profissionalismo e agilidade excepcionais. Recomendo para qualquer empresa."
   - Maria Santos, Diretora da InovaCorp

3. "Suporte incrível e sempre disponíveis. Nossa parceria já dura 5 anos."
   - Carlos Oliveira, Sócio da LogisTech
```

## 6. SEÇÃO CTA FINAL
Crie `src/components/sections/CTASection.tsx` com:

**Elementos:**
- Background gradiente impactante
- Título chamativo
- Descrição persuasiva
- Formulário de contato rápido (nome, email, telefone, mensagem)
- Botão de envio destacado
- Informações de contato alternativas

**IMPLEMENTAÇÃO TÉCNICA DETALHADA:**

## HERO SECTION CÓDIGO:

```typescript
import { motion } from 'framer-motion'
import { ArrowRight, Play, Users, Award, TrendingUp } from 'lucide-react'
import { Button, Container } from '@/components/ui'
import { TypewriterText } from '@/components/animations'

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const stats = [
    { icon: Users, value: '500+', label: 'Empresas Atendidas' },
    { icon: Award, value: '15+', label: 'Anos de Experiência' },
    { icon: TrendingUp, value: '98%', label: 'Satisfação' }
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Content */}
          <div className="text-white">
            <motion.div variants={itemVariants}>
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                ✨ Contabilidade Estratégica
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl lg:text-6xl font-bold leading-tight mb-6"
            >
              <TypewriterText 
                text="Transforme sua empresa com contabilidade estratégica"
                speed={50}
              />
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl text-blue-100 mb-8 leading-relaxed"
            >
              Mais de 15 anos oferecendo soluções contábeis completas para empresas 
              que querem crescer com segurança e eficiência fiscal.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Button 
                size="lg" 
                variant="success"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="bg-white text-primary-900 hover:bg-gray-100"
              >
                Solicite uma Consultoria
              </Button>
              <Button 
                size="lg" 
                variant="ghost"
                leftIcon={<Play className="w-5 h-5" />}
                className="text-white border-white hover:bg-white/10"
              >
                Conheça Nossos Serviços
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-3 gap-6"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                )
              })}
            </motion.div>
          </div>

          {/* Image/Illustration */}
          <motion.div 
            variants={itemVariants}
            className="relative"
          >
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              {/* Placeholder for professional illustration */}
              <div className="w-full h-96 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="text-center text-white/60">
                  <Users className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-lg">Ilustração Profissional</p>
                  <p className="text-sm">Equipe Contábil</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ 
                x: [0, 10, 0],
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -right-4 w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg"
            >
              15+
            </motion.div>

            <motion.div
              animate={{ 
                x: [0, -15, 0],
                y: [0, 10, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-success-500 rounded-full flex items-center justify-center text-white font-bold"
            >
              98%
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export { HeroSection }
```

## TYPEWRITER COMPONENT:

```typescript
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
}

const TypewriterText = ({ text, speed = 100, className }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed])

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-1 h-[1em] bg-current ml-1"
      />
    </span>
  )
}

export { TypewriterText }
```

**PÁGINA PRINCIPAL (app/page.tsx):**

```typescript
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { CTASection } from '@/components/sections/CTASection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <AboutSection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
```

**OTIMIZAÇÕES OBRIGATÓRIAS:**
- Lazy loading das seções abaixo da dobra
- Imagens otimizadas com next/image
- Preload de recursos críticos
- Intersection Observer para animações
- Debounce em scroll listeners
- Memoização de componentes pesados

**SEO:**
- Meta tags otimizadas
- Schema markup para empresa local
- Open Graph tags
- Structured data

**PERFORMANCE:**
- Core Web Vitals otimizados
- Lazy loading de componentes
- Code splitting
- Prefetch de páginas importantes
```

## ✅ Critérios de Validação

Após executar este prompt, verifique se:
- [ ] Hero section é visualmente impactante
- [ ] Animações são suaves e profissionais
- [ ] Typewriter effect funciona corretamente
- [ ] Todas as seções são responsivas
- [ ] CTAs estão bem posicionados
- [ ] Performance está otimizada (Lighthouse > 90)
- [ ] Animações ao scroll funcionam
- [ ] Carrossel de depoimentos funciona

## 🔄 Próximos Passos

Após completar a landing page:
1. Execute o prompt "05-pages-internas.md"
2. Implemente formulários de contato
3. Configure analytics e tracking
4. Otimize para conversão

---

*A landing page é o primeiro contato do cliente - deve causar uma excelente primeira impressão.*