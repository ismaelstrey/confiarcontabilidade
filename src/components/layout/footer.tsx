'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Clock,
  Shield,
  Award,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { siteConfig, mainNav, services } from '@/lib/config'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: 'Facebook',
      href: siteConfig.links.social.facebook,
      icon: Facebook,
      color: 'hover:text-blue-600'
    },
    {
      name: 'Instagram',
      href: siteConfig.links.social.instagram,
      icon: Instagram,
      color: 'hover:text-pink-600'
    },
    {
      name: 'LinkedIn',
      href: siteConfig.links.social.linkedin,
      icon: Linkedin,
      color: 'hover:text-blue-700'
    },
    {
      name: 'YouTube',
      href: siteConfig.links.social.youtube,
      icon: Youtube,
      color: 'hover:text-red-600'
    }
  ]

  const quickLinks = [
    { title: 'Calculadora Fiscal', href: '/calculadora' },
    { title: 'Orçamento Online', href: '/orcamento' },
    { title: 'Portal do Cliente', href: '/portal' },
    { title: 'Dúvidas Frequentes', href: '/faq' },
    { title: 'Política de Privacidade', href: '/privacidade' },
    { title: 'Termos de Uso', href: '/termos' }
  ]

  const certifications = [
    { icon: Shield, text: 'Certificado Digital' },
    { icon: Award, text: 'CRC Ativo' },
    { icon: Users, text: '500+ Clientes' },
    { icon: Clock, text: '15+ Anos' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="border-b border-gray-800">
        <Container size="xl" padding="md">
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-xl">
                    CP
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">ContabilPro</h3>
                    <p className="text-gray-400 text-sm">Contabilidade Empresarial</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                  Há mais de 15 anos oferecendo soluções completas em contabilidade 
                  para empresas de todos os portes. Sua empresa em boas mãos.
                </p>

                {/* Certifications */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {certifications.map((cert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2 text-sm text-gray-300"
                    >
                      <cert.icon className="h-4 w-4 text-accent-400" />
                      <span>{cert.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg bg-gray-800 text-gray-400 transition-all duration-200 ${social.color} hover:bg-gray-700`}
                      aria-label={social.name}
                    >
                      <social.icon className="h-5 w-5" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h4 className="text-lg font-semibold mb-6">Navegação</h4>
                <ul className="space-y-3">
                  {mainNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>

                <h4 className="text-lg font-semibold mb-4 mt-8">Links Úteis</h4>
                <ul className="space-y-3">
                  {quickLinks.slice(0, 3).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-lg font-semibold mb-6">Serviços</h4>
                <ul className="space-y-3">
                  {services.slice(0, 6).map((service) => (
                    <li key={service.id}>
                      <Link
                        href={`/servicos#${service.id}`}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Contact Bar */}
      <div className="bg-primary-600">
        <Container size="xl" padding="md">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2 text-white">
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">{siteConfig.links.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <Mail className="h-5 w-5" />
                  <span className="font-medium">{siteConfig.links.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">{siteConfig.business.address.city}, {siteConfig.business.address.state}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                >
                  <Link href="/contato">
                    <Phone className="h-4 w-4 mr-2" />
                    Ligar Agora
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                  asChild
                >
                  <Link href={siteConfig.links.whatsapp} target="_blank">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950">
        <Container size="xl" padding="md">
          <div className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
                <p>
                  © {currentYear} ContabilPro. Todos os direitos reservados.
                </p>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" size="sm" className="border-gray-600 text-gray-400">
                    CRC: {siteConfig.business.crc}
                  </Badge>
                  <Badge variant="outline" size="sm" className="border-gray-600 text-gray-400">
                    CNPJ: {siteConfig.business.cnpj}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                {quickLinks.slice(3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}