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
    content: '(11) 3456-7890\n(11) 99999-8888 (WhatsApp)',
    color: 'accent'
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'contato@contabilpro.com.br\norcamento@contabilpro.com.br',
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
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    servico: '',
    mensagem: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowSuccess(true);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
      servico: '',
      mensagem: ''
    });
    setIsSubmitting(false);
    
    // Esconder mensagem de sucesso após 5 segundos
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp as any} className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Envie sua Mensagem
                </h2>
                <p className="text-gray-600">
                  Preencha o formulário abaixo e nossa equipe entrará em contato em até 24 horas.
                </p>
              </motion.div>
              
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-lg mb-6 flex items-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Mensagem enviada com sucesso! Entraremos em contato em breve.
                </motion.div>
              )}
              
              <motion.form 
                variants={fadeInUp as any}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="empresa" className="block text-sm font-semibold text-gray-700 mb-2">
                      Empresa
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="empresa"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                        placeholder="Nome da sua empresa"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="servico" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Serviço *
                  </label>
                  <select
                    id="servico"
                    name="servico"
                    value={formData.servico}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="mensagem" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensagem *
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      id="mensagem"
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 resize-none"
                      placeholder="Descreva suas necessidades, dúvidas ou como podemos ajudar sua empresa..."
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 px-8 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </button>
              </motion.form>
            </motion.div>
            
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
                    <p className="text-green-600 font-semibold">(11) 99999-8888</p>
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