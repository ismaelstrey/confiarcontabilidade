'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Award, 
  GraduationCap, 
  Briefcase,
  Linkedin,
  Mail,
  Phone,
  X,
  CheckCircle,
  Star
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

const teamMembers = [
  {
    id: 1,
    name: 'João Silva',
    position: 'Diretor Geral',
    credential: 'CRC 123456/SP',
    department: 'Diretoria',
    image: '/images/team/joao-silva.jpg',
    bio: 'Mais de 20 anos de experiência em contabilidade empresarial e consultoria fiscal. Especialista em planejamento tributário para empresas de médio e grande porte. Formado em Ciências Contábeis pela USP com MBA em Gestão Empresarial.',
    specializations: ['Planejamento Tributário', 'Consultoria Empresarial', 'Auditoria', 'Gestão Financeira'],
    education: ['Ciências Contábeis - USP', 'MBA Gestão Empresarial - FGV', 'Pós-graduação em Direito Tributário'],
    certifications: ['CRC Ativo', 'Certificação CVM', 'CNAI - Auditor Independente'],
    linkedin: 'https://linkedin.com/in/joao-silva',
    email: 'joao.silva@contabilidadeigrejinha.com.br',
    phone: '(51) 3456-7890'
  },
  {
    id: 2,
    name: 'Maria Santos',
    position: 'Diretora Técnica',
    credential: 'CRC 789012/SP',
    department: 'Diretoria',
    image: '/images/team/maria-santos.jpg',
    bio: 'Especialista em auditoria contábil e compliance fiscal com 18 anos de experiência. Responsável pela supervisão técnica de todos os trabalhos contábeis da empresa. Reconhecida expertise em normas internacionais de contabilidade.',
    specializations: ['Auditoria Contábil', 'Compliance Fiscal', 'IFRS', 'Due Diligence'],
    education: ['Ciências Contábeis - PUC-SP', 'Mestrado em Controladoria - FEA-USP'],
    certifications: ['CRC Ativo', 'CIA - Certified Internal Auditor', 'Certificação IFRS'],
    linkedin: 'https://linkedin.com/in/maria-santos',
    email: 'maria.santos@contabilidadeigrejinha.com.br',
    phone: '(51) 3456-7891'
  },
  {
    id: 3,
    name: 'Carlos Oliveira',
    position: 'Contador Sênior',
    credential: 'CRC 345678/SP',
    department: 'Contadores',
    image: '/images/team/carlos-oliveira.jpg',
    bio: 'Contador experiente com foco em contabilidade empresarial e demonstrações financeiras. Atua há 12 anos no mercado, sendo responsável por carteira de clientes de diversos segmentos.',
    specializations: ['Contabilidade Empresarial', 'Demonstrações Financeiras', 'Análise Econômica'],
    education: ['Ciências Contábeis - Mackenzie', 'Pós-graduação em Controladoria'],
    certifications: ['CRC Ativo', 'Perito Contábil'],
    linkedin: 'https://linkedin.com/in/carlos-oliveira',
    email: 'carlos.oliveira@contabilidadeigrejinha.com.br',
    phone: '(51) 3456-7892'
  },
  {
    id: 4,
    name: 'Ana Costa',
    position: 'Contadora Pleno',
    credential: 'CRC 456789/SP',
    department: 'Contadores',
    image: '/images/team/ana-costa.jpg',
    bio: 'Contadora com 8 anos de experiência, especializada em pequenas e médias empresas. Expertise em abertura de empresas e regularização fiscal.',
    specializations: ['PMEs', 'Abertura de Empresas', 'Regularização Fiscal'],
    education: ['Ciências Contábeis - UNINOVE', 'Pós-graduação em Direito Empresarial'],
    certifications: ['CRC Ativo', 'Junta Comercial - Habilitada'],
    linkedin: 'https://linkedin.com/in/ana-costa',
    email: 'ana.costa@contabilidadeigrejinha.com.br',
    phone: '(51) 3456-7893'
  },
  {
    id: 5,
    name: 'Pedro Lima',
    position: 'Contador Júnior',
    credential: 'CRC 567890/SP',
    department: 'Contadores',
    image: '/images/team/pedro-lima.jpg',
    bio: 'Jovem contador com 3 anos de experiência, focado em escrituração fiscal e obrigações acessórias. Sempre atualizado com as últimas mudanças na legislação.',
    specializations: ['Escrituração Fiscal', 'Obrigações Acessórias', 'Legislação Tributária'],
    education: ['Ciências Contábeis - FECAP'],
    certifications: ['CRC Ativo'],
    linkedin: 'https://linkedin.com/in/pedro-lima',
    email: 'pedro.lima@contabilidadeigrejinha.com.br',
    phone: '(51) 3456-7894'
  },
  {
    id: 6,
    name: 'Lucia Ferreira',
    position: 'Consultora Fiscal',
    credential: 'CRC 678901/SP',
    department: 'Consultores',
    image: '/images/team/lucia-ferreira.jpg',
    bio: 'Consultora fiscal especializada em planejamento tributário e defesa em processos administrativos. 15 anos de experiência em consultoria empresarial.',
    specializations: ['Planejamento Tributário', 'Defesa Fiscal', 'Processos Administrativos'],
    education: ['Ciências Contábeis - FAAP', 'Direito Tributário - PUC-SP'],
    certifications: ['CRC Ativo', 'OAB/SP', 'Especialista em Direito Tributário'],
    linkedin: 'https://linkedin.com/in/lucia-ferreira',
    email: 'lucia.ferreira@contabilidadeigrejinha.com.br',
    phone: '(51) 3456-7895'
  },
  {
    id: 7,
    name: 'Roberto Alves',
    position: 'Consultor Tributário',
    credential: 'CRC 789012/SP',
    department: 'Consultores',
    image: '/images/team/roberto-alves.jpg',
    bio: 'Consultor tributário com vasta experiência em elisão fiscal e reorganização societária. Atua há 14 anos auxiliando empresas na otimização da carga tributária.',
    specializations: ['Elisão Fiscal', 'Reorganização Societária', 'Holding Empresarial'],
    education: ['Ciências Contábeis - FMU', 'MBA em Gestão Tributária - FGV'],
    certifications: ['CRC Ativo', 'Certificação em Gestão Tributária'],
    linkedin: 'https://linkedin.com/in/roberto-alves',
    email: 'roberto.alves@contabilidadeigrejinha.com.br',
    phone: '(51) 3456-7896'
  },
  {
    id: 8,
    name: 'Fernanda Silva',
    position: 'Analista Contábil',
    credential: 'Técnica em Contabilidade',
    department: 'Suporte',
    image: '/images/team/fernanda-silva.jpg',
    bio: 'Analista contábil responsável pela escrituração e conciliações. 6 anos de experiência em rotinas contábeis e apoio aos contadores.',
    specializations: ['Escrituração Contábil', 'Conciliações', 'Rotinas Fiscais'],
    education: ['Técnico em Contabilidade - ETEC', 'Cursando Ciências Contábeis'],
    certifications: ['Técnica em Contabilidade Registrada'],
    linkedin: 'https://linkedin.com/in/fernanda-silva',
    email: 'fernanda.silva@contabilidadeigrejinha.com.br',
    phone: '(51) 3456-7897'
  }
];

const departments = {
  'Diretoria': { color: 'primary', count: 2 },
  'Contadores': { color: 'accent', count: 3 },
  'Consultores': { color: 'success', count: 2 },
  'Suporte': { color: 'warning', count: 1 }
};

export default function EquipePage() {
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('Todos');

  const filteredMembers = filterDepartment === 'Todos' 
    ? teamMembers 
    : teamMembers.filter(member => member.department === filterDepartment);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <span>Início</span> <span className="mx-2">/</span> <span className="text-primary-600">Equipe</span>
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
              Nossa Equipe <span className="text-primary-600">Especializada</span>
            </motion.h1>
            <motion.p 
              variants={fadeInUp as any}
              className="text-xl text-gray-600 leading-relaxed"
            >
              Profissionais qualificados e experientes ao seu serviço
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Department Filter */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp as any} className="flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={() => setFilterDepartment('Todos')}
                className={`px-6 py-3 rounded-full font-semibold transition-colors duration-300 ${
                  filterDepartment === 'Todos'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos ({teamMembers.length})
              </button>
              {Object.entries(departments).map(([dept, info]) => (
                <button
                  key={dept}
                  onClick={() => setFilterDepartment(dept)}
                  className={`px-6 py-3 rounded-full font-semibold transition-colors duration-300 ${
                    filterDepartment === dept
                      ? `bg-${info.color}-600 text-white`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dept} ({info.count})
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="pb-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredMembers.map((member, index) => {
                const deptInfo = departments[member.department as keyof typeof departments];
                return (
                  <motion.div
                    key={member.id}
                    variants={fadeInUp as any}
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    {/* Photo */}
                    <div className="relative h-64 bg-gray-200 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-20 h-20 text-gray-400" />
                      </div>
                      {/* Department Badge */}
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white z-20 ${
                        deptInfo.color === 'primary' ? 'bg-primary-600' :
                        deptInfo.color === 'accent' ? 'bg-accent-600' :
                        deptInfo.color === 'success' ? 'bg-success-600' :
                        'bg-warning-600'
                      }`}>
                        {member.department}
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-primary-600 font-semibold mb-1">{member.position}</p>
                      <p className="text-gray-500 text-sm mb-4">{member.credential}</p>
                      
                      {/* Specializations */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {member.specializations.slice(0, 2).map((spec, specIndex) => (
                            <span 
                              key={specIndex}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                          {member.specializations.length > 2 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              +{member.specializations.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Contact */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <a 
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                          <a 
                            href={`mailto:${member.email}`}
                            className="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors duration-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                        <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                          Ver Perfil →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      {selectedMember && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedMember.name}</h2>
                  <p className="text-xl text-primary-600 font-semibold mb-1">{selectedMember.position}</p>
                  <p className="text-gray-500 mb-4">{selectedMember.credential}</p>
                  
                  <div className="flex space-x-4">
                    <a 
                      href={selectedMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </a>
                    <a 
                      href={`mailto:${selectedMember.email}`}
                      className="flex items-center text-gray-600 hover:text-gray-700 font-semibold"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                    <a 
                      href={`tel:${selectedMember.phone}`}
                      className="flex items-center text-gray-600 hover:text-gray-700 font-semibold"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Telefone
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Bio */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
                  Biografia Profissional
                </h3>
                <p className="text-gray-600 leading-relaxed">{selectedMember.bio}</p>
              </div>
              
              {/* Specializations */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-primary-600" />
                  Especializações
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.specializations.map((spec, index) => (
                    <span 
                      key={index}
                      className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Education */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
                  Formação Acadêmica
                </h3>
                <ul className="space-y-2">
                  {selectedMember.education.map((edu, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <CheckCircle className="w-4 h-4 text-success-600 mr-2 flex-shrink-0" />
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Certifications */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-primary-600" />
                  Certificações
                </h3>
                <ul className="space-y-2">
                  {selectedMember.certifications.map((cert, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <CheckCircle className="w-4 h-4 text-success-600 mr-2 flex-shrink-0" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}