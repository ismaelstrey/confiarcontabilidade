import HeroSection from '@/components/sections/HeroSection'
import ServicesSection from '@/components/sections/ServicesSection'
import StatsSection from '@/components/sections/StatsSection'
import { Section, Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { siteConfig, testimonials } from '@/lib/config'
import { ArrowRight, CheckCircle, Star, Phone, Mail, TrendingUp, Users, Shield } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <HeroSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Why Choose Us Section */}
      <Section background="gray" spacing="xl">
        <Container center>
          <div className="text-center mb-16">
            <Badge variant="outline" size="lg" className="mb-4">
              Por que nos escolher?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
              Sua empresa merece o melhor
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Segurança Total</h3>
              <p className="text-gray-600">
                Certificado digital, backup em nuvem e total conformidade com as normas do CFC.
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 rounded-full bg-accent-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Economia Garantida</h3>
              <p className="text-gray-600">
                Planejamento tributário que pode reduzir até 40% da sua carga fiscal.
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 rounded-full bg-success-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Atendimento Personalizado</h3>
              <p className="text-gray-600">
                Cada cliente tem um contador dedicado e suporte via WhatsApp.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section spacing="xl">
        <Container center>
          <div className="text-center mb-16">
            <Badge variant="outline" size="lg" className="mb-4">
              Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
              O que nossos clientes dizem
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} variant="elevated" className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-accent-500 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <span className="font-semibold text-primary-600">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">
                        {testimonial.role} - {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section background="primary" spacing="lg">
        <Container center>
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Entre em contato conosco hoje mesmo e descubra como podemos ajudar sua empresa a crescer.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contato">
                  <Phone className="w-5 h-5 mr-2" />
                  Solicitar Consultoria
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                <Link href={`mailto:${siteConfig.business.email || 'contato@contabil.com'}`}>
                  <Mail className="w-5 h-5 mr-2" />
                  Enviar E-mail
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
