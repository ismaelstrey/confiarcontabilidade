'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Award, Users, Target, Eye, Heart } from 'lucide-react';
import Image from 'next/image';

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
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const timelineEvents = [
  {
    year: '2008',
    title: 'Fundação',
    description: 'Início das atividades com foco em pequenas e médias empresas'
  },
  {
    year: '2012',
    title: 'Expansão',
    description: 'Ampliação da equipe e abertura de nova sede'
  },
  {
    year: '2018',
    title: 'Digitalização',
    description: 'Implementação de sistemas digitais e atendimento online'
  },
  {
    year: '2023',
    title: 'Inovação',
    description: 'Lançamento de soluções tecnológicas avançadas'
  }
];

const values = [
  {
    icon: CheckCircle,
    title: 'Transparência',
    description: 'Comunicação clara e honesta em todos os processos'
  },
  {
    icon: Award,
    title: 'Excelência',
    description: 'Busca constante pela qualidade superior em nossos serviços'
  },
  {
    icon: Users,
    title: 'Compromisso',
    description: 'Dedicação total ao sucesso dos nossos clientes'
  },
  {
    icon: Target,
    title: 'Inovação',
    description: 'Sempre à frente com as melhores práticas do mercado'
  },
  {
    icon: Eye,
    title: 'Ética',
    description: 'Conduta profissional íntegra e responsável'
  },
  {
    icon: Heart,
    title: 'Humanização',
    description: 'Relacionamento próximo e personalizado com cada cliente'
  }
];

const certifications = [
  { name: 'CRC - Conselho Regional de Contabilidade', image: '/images/crc-logo.svg' },
  { name: 'SESCON - Sindicato das Empresas de Serviços Contábeis', image: '/images/sescon-logo.svg' },
  { name: 'ISO 9001 - Gestão da Qualidade', image: '/images/iso-logo.svg' },
  { name: 'Certificação Digital ICP-Brasil', image: '/images/icp-logo.svg' }
];

const team = [
  {
    name: 'João Silva',
    position: 'Diretor Geral',
    credential: 'CRC 123456',
    image: '/images/team/joao-silva.jpg',
    bio: 'Mais de 20 anos de experiência em contabilidade empresarial e consultoria fiscal.',
    linkedin: 'https://linkedin.com/in/joao-silva'
  },
  {
    name: 'Maria Santos',
    position: 'Diretora Técnica',
    credential: 'CRC 789012',
    image: '/images/team/maria-santos.jpg',
    bio: 'Especialista em planejamento tributário e auditoria contábil.',
    linkedin: 'https://linkedin.com/in/maria-santos'
  }
];

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <span>Início</span> <span className="mx-2">/</span> <span className="text-primary-600">Sobre Nós</span>
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
              Nossa História de <span className="text-primary-600">Excelência</span>
            </motion.h1>
            <motion.p 
              variants={fadeInUp as any}
              className="text-xl text-gray-600 leading-relaxed"
            >
              15 anos transformando empresas através da contabilidade estratégica
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.h2 
              variants={fadeInUp as any}
              className="text-4xl font-bold text-center text-gray-900 mb-16"
            >
              Nossa Trajetória
            </motion.h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary-200"></div>
              
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={event.year}
                  variants={fadeInUp as any}
                  className={`relative flex items-center mb-12 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                      <div className="text-2xl font-bold text-primary-600 mb-2">{event.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-gray-50">
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
              Missão, Visão e Valores
            </motion.h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <motion.div variants={fadeInUp as any} className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Missão</h3>
                <p className="text-gray-600 leading-relaxed">
                  Oferecer soluções contábeis estratégicas que impulsionem o crescimento sustentável dos nossos clientes.
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp as any} className="text-center">
                <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Visão</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ser referência em contabilidade empresarial, reconhecida pela excelência e inovação.
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp as any} className="text-center">
                <div className="bg-success-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-success-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Valores</h3>
                <p className="text-gray-600 leading-relaxed">
                  Transparência, Excelência, Inovação, Compromisso e Ética em tudo que fazemos.
                </p>
              </motion.div>
            </div>
            
            {/* Values Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    variants={fadeInUp as any}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                        <IconComponent className="w-6 h-6 text-primary-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">{value.title}</h4>
                    </div>
                    <p className="text-gray-600">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h2 
              variants={fadeInUp as any}
              className="text-4xl font-bold text-gray-900 mb-16"
            >
              Certificações e Reconhecimentos
            </motion.h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.name}
                  variants={fadeInUp as any}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="bg-gray-50 p-8 rounded-lg hover:bg-gray-100 transition-colors duration-300 cursor-pointer"
                >
                  <div className="w-16 h-16 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center shadow-sm">
                    <Award className="w-8 h-8 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">{cert.name}</h4>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h2 
              variants={fadeInUp as any}
              className="text-4xl font-bold text-gray-900 mb-16"
            >
              Equipe Executiva
            </motion.h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  variants={fadeInUp as any}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-primary-600 font-semibold mb-1">{member.position}</p>
                  <p className="text-gray-500 text-sm mb-4">{member.credential}</p>
                  <p className="text-gray-600 mb-6">{member.bio}</p>
                  <a 
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Ver LinkedIn →
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}