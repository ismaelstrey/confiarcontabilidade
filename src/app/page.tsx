import Link from 'next/link'
import { ArrowRight, CheckCircle, Star, TrendingUp, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Section, Container } from '@/components/ui/container'
import { services, testimonials, siteConfig } from '@/lib/config'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Section background="gradient" spacing="xl">
        <div className="text-center">
          <Badge variant="secondary" size="lg" className="mb-6">
            ✨ Mais de 15 anos de experiência
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
            Contabilidade que
            <span className="block text-accent-400">Impulsiona seu Negócio</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Soluções completas em contabilidade para empresas de todos os portes. 
            Abertura de empresa, planejamento tributário e consultoria especializada.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contato">
                Fale Conosco
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600" asChild>
              <Link href={siteConfig.links.whatsapp} target="_blank">
                WhatsApp Direto
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-sm opacity-80">Empresas Atendidas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">15+</div>
              <div className="text-sm opacity-80">Anos de Experiência</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-sm opacity-80">Satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24h</div>
              <div className="text-sm opacity-80">Suporte</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Services Section */}
      <Section spacing="xl">
        <Container center>
          <div className="text-center mb-16">
            <Badge variant="outline" size="lg" className="mb-4">
              Nossos Serviços
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
              Soluções Completas para sua Empresa
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oferecemos todos os serviços que sua empresa precisa para crescer com segurança e eficiência.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, index) => (
              <Card key={service.id} variant="elevated" hover className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary-100">
                      <CheckCircle className="h-6 w-6 text-primary-600" />
                    </div>
                    {service.popular && (
                      <Badge variant="secondary" size="sm">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-success-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">
                        R$ {service.price?.from}
                      </span>
                      <span className="text-sm text-gray-500">/{service.price?.period}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/contato">
                        Contratar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/servicos">
                Ver Todos os Serviços
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Why Choose Us */}
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

      {/* Testimonials */}
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
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Entre em contato conosco hoje mesmo e descubra como podemos ajudar sua empresa a crescer.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contato">
                  Solicitar Orçamento
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600" asChild>
                <Link href={siteConfig.links.whatsapp} target="_blank">
                  Falar no WhatsApp
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
