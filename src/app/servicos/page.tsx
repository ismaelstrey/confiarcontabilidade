'use client';

import { motion } from 'framer-motion';
import { 
  Calculator, 
  FileText, 
  TrendingUp, 
  Building, 
  Users, 
  Shield,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  User,
  MessageSquare
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

const services = [
  {
    icon: Calculator,
    title: 'Contabilidade Empresarial',
    description: 'Escrituração completa e demonstrações financeiras precisas',
    features: [
      'Escrituração contábil',
      'Demonstrações financeiras',
      'Conciliações bancárias',
      'Análise de resultados'
    ],
    color: 'primary'
  },
  {
    icon: Shield,
    title: 'Consultoria Fiscal',
    description: 'Compliance tributário e orientação especializada',
    features: [
      'Compliance tributário',
      'Revisão de obrigações',
      'Defesa em fiscalizações',
      'Orientação preventiva'
    ],
    color: 'accent'
  },
  {
    icon: TrendingUp,
    title: 'Planejamento Tributário',
    description: 'Otimização fiscal legal e estratégica',
    features: [
      'Análise de regime tributário',
      'Elisão fiscal',
      'Reorganização societária',
      'Simulações tributárias'
    ],
    color: 'success'
  },
  {
    icon: Building,
    title: 'Abertura de Empresas',
    description: 'Constituição societária completa e eficiente',
    features: [
      'Constituição societária',
      'Registro em órgãos',
      'Licenças e alvarás',
      'Orientação inicial'
    ],
    color: 'warning'
  },
  {
    icon: Users,
    title: 'Departamento Pessoal',
    description: 'Gestão completa de recursos humanos',
    features: [
      'Folha de pagamento',
      'Admissões e demissões',
      'Obrigações trabalhistas',
      'eSocial e FGTS'
    ],
    color: 'primary'
  },
  {
    icon: FileText,
    title: 'Auditoria Contábil',
    description: 'Auditoria independente e due diligence',
    features: [
      'Auditoria independente',
      'Due diligence',
      'Revisão de processos',
      'Relatórios especializados'
    ],
    color: 'accent'
  }
];

const processSteps = [
  {
    number: '01',
    title: 'Análise Inicial',
    description: 'Avaliamos sua situação atual e necessidades específicas'
  },
  {
    number: '02',
    title: 'Proposta Personalizada',
    description: 'Elaboramos uma solução sob medida para sua empresa'
  },
  {
    number: '03',
    title: 'Implementação',
    description: 'Executamos os serviços com excelência e agilidade'
  },
  {
    number: '04',
    title: 'Acompanhamento',
    description: 'Monitoramos resultados e oferecemos suporte contínuo'
  }
];

export default function ServicosPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    servico: '',
    mensagem: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Solicitação enviada com sucesso! Entraremos em contato em breve.');
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
      servico: '',
      mensagem: ''
    });
    setIsSubmitting(false);
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
            <span>Início</span> <span className="mx-2">/</span> <span className="text-primary-600">Serviços</span>
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
              variants={fadeInUp  as any}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Soluções Contábeis <span className="text-primary-600">Completas</span>
            </motion.h1>
            <motion.p 
              variants={fadeInUp  as any}
              className="text-xl text-gray-600 leading-relaxed"
            >
              Serviços especializados para cada necessidade da sua empresa
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp  as any}
              className="text-4xl font-bold text-center text-gray-900 mb-16"
            >
              Nossos Serviços
            </motion.h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                const colorClasses = {
                  primary: 'bg-primary-100 text-primary-600 border-primary-200 hover:border-primary-300',
                  accent: 'bg-accent-100 text-accent-600 border-accent-200 hover:border-accent-300',
                  success: 'bg-success-100 text-success-600 border-success-200 hover:border-success-300',
                  warning: 'bg-warning-100 text-warning-600 border-warning-200 hover:border-warning-300'
                };
                
                return (
                  <motion.div
                    key={service.title}
                    variants={fadeInUp  as any}
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                    className={`bg-white p-8 rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                      colorClasses[service.color as keyof typeof colorClasses]
                    }`}
                  >
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mr-4 ${
                        service.color === 'primary' ? 'bg-primary-100' :
                        service.color === 'accent' ? 'bg-accent-100' :
                        service.color === 'success' ? 'bg-success-100' :
                        'bg-warning-100'
                      }`}>
                        <IconComponent className={`w-8 h-8 ${
                          service.color === 'primary' ? 'text-primary-600' :
                          service.color === 'accent' ? 'text-accent-600' :
                          service.color === 'success' ? 'text-success-600' :
                          'text-warning-600'
                        }`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    
                    <ul className="space-y-2 mb-8">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-success-600 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center group ${
                      service.color === 'primary' ? 'bg-primary-600 hover:bg-primary-700 text-white' :
                      service.color === 'accent' ? 'bg-accent-600 hover:bg-accent-700 text-white' :
                      service.color === 'success' ? 'bg-success-600 hover:bg-success-700 text-white' :
                      'bg-warning-600 hover:bg-warning-700 text-white'
                    }`}>
                      Solicitar Orçamento
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp  as any}
              className="text-4xl font-bold text-center text-gray-900 mb-16"
            >
              Como Trabalhamos
            </motion.h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={fadeInUp  as any}
                  className="text-center relative"
                >
                  <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  
                  {/* Arrow for desktop */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-8 h-8 transform -translate-x-4">
                      <ArrowRight className="w-6 h-6 text-primary-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section with Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp  as any} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Solicite seu Orçamento
              </h2>
              <p className="text-xl text-gray-600">
                Preencha o formulário e receba uma proposta personalizada
              </p>
            </motion.div>
            
            <motion.form 
              variants={fadeInUp  as any}
              onSubmit={handleSubmit}
              className="bg-gray-50 p-8 rounded-xl shadow-lg"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
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
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
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
              
              <div className="mb-6">
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
                    <option key={service.title} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-8">
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
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 resize-none"
                    placeholder="Descreva suas necessidades ou dúvidas..."
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
                    Solicitar Orçamento
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}