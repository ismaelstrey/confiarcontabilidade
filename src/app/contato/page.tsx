'use client';

import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle,
  User,
  Building,
  MessageSquare,
  Send,
  Facebook,
  Instagram,
  Linkedin,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import { ContactForm } from '@/components/forms/ContactForm';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const contactInfo = [
  {
    icon: MapPin,
    title: 'Endereço',
    content: 'Rua das Empresas, 123 - Sala 456\nCentro Empresarial\nSão Paulo - SP, 01234-567',
    color: 'primary'
  },
  {
    icon: Phone,
    title: 'Telefones',
    content: '(51) 3456-7890\n(51) 99916-0766 (WhatsApp)',
    color: 'accent'
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'contato@contabilidadeigrejinha.com.br\norcamento@contabilidadeigrejinha.com.br',
    color: 'success'
  },
  {
    icon: Clock,
    title: 'Horário de Funcionamento',
    content: 'Segunda a Sexta: 8h às 18h\nSábado: 8h às 12h\nDomingo: Fechado',
    color: 'warning'
  }
];

const socialLinks = [
  {
    icon: Facebook,
    name: 'Facebook',
    url: 'https://facebook.com/contabilpro',
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    icon: Instagram,
    name: 'Instagram',
    url: 'https://instagram.com/contabilpro',
    color: 'bg-pink-600 hover:bg-pink-700'
  },
  {
    icon: Linkedin,
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/contabilpro',
    color: 'bg-blue-700 hover:bg-blue-800'
  }
];

const services = [
  'Contabilidade Empresarial',
  'Consultoria Fiscal',
  'Planejamento Tributário',
  'Abertura de Empresas',
  'Departamento Pessoal',
  'Auditoria Contábil'
];

export default function ContatoPage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <span>Início</span> <span className="mx-2">/</span> <span className="text-primary-600">Contato</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-50 to-accent-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1 
              variants={fadeInUp as any}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Entre em <span className="text-primary-600">Contato</span> Conosco
            </motion.h1>
            <motion.p 
              variants={fadeInUp as any}
              className="text-xl text-gray-600 leading-relaxed"
            >
              Estamos prontos para atender sua empresa com excelência
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp as any}
              className="text-4xl font-bold text-center text-gray-900 mb-16"
            >
              Informações de Contato
            </motion.h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                const colorClasses = {
                  primary: 'bg-primary-100 text-primary-600',
                  accent: 'bg-accent-100 text-accent-600',
                  success: 'bg-success-100 text-success-600',
                  warning: 'bg-warning-100 text-warning-600'
                };
                
                return (
                  <motion.div
                    key={info.title}
                    variants={fadeInUp as any}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center"
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      colorClasses[info.color as keyof typeof colorClasses]
                    }`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{info.content}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <ContactForm />
            
            {/* Map and Additional Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="space-y-8"
            >
              {/* Map */}
              <motion.div variants={fadeInUp as any}>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Nossa Localização</h3>
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>Mapa Interativo</p>
                    <p className="text-sm">Google Maps será integrado aqui</p>
                  </div>
                </div>
                <button className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-300 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Como Chegar
                </button>
              </motion.div>
              
              {/* WhatsApp */}
              <motion.div variants={fadeInUp as any} className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">WhatsApp Business</h4>
                    <p className="text-green-600 font-semibold">(51) 99916-0766</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Atendimento rápido e direto pelo WhatsApp. Clique no botão abaixo para iniciar uma conversa.
                </p>
                <a 
                  href="https://wa.me/5511999998888"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center group"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Conversar no WhatsApp
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </motion.div>
              
              {/* Social Media */}
              <motion.div variants={fadeInUp as any}>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Siga-nos nas Redes Sociais</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors duration-300 ${social.color}`}
                        title={social.name}
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </motion.div>
              
              {/* Business Hours */}
              <motion.div variants={fadeInUp as any} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-primary-600 mr-3" />
                  <h4 className="text-lg font-bold text-gray-900">Horário de Atendimento</h4>
                </div>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Segunda a Sexta:</span>
                    <span className="font-semibold">8h às 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábado:</span>
                    <span className="font-semibold">8h às 12h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingo:</span>
                    <span className="font-semibold text-red-600">Fechado</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}