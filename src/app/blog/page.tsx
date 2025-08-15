'use client';

import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowRight,
  Search,
  Tag,
  TrendingUp,
  FileText,
  Calculator,
  Shield,
  Building,
  Users
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const fadeInUp  = {
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

const categories = [
  { name: 'Todos', count: 12, color: 'primary', icon: FileText },
  { name: 'Planejamento Tributário', count: 4, color: 'accent', icon: Calculator },
  { name: 'Compliance', count: 3, color: 'success', icon: Shield },
  { name: 'Gestão Empresarial', count: 3, color: 'warning', icon: Building },
  { name: 'Recursos Humanos', count: 2, color: 'primary', icon: Users }
];

const blogPosts = [
  {
    id: 1,
    title: 'Como Escolher o Regime Tributário Ideal para sua Empresa em 2024',
    excerpt: 'Entenda as diferenças entre Simples Nacional, Lucro Presumido e Lucro Real para tomar a melhor decisão para seu negócio.',
    category: 'Planejamento Tributário',
    author: 'João Silva',
    date: '2024-01-15',
    readTime: '8 min',
    image: '/images/blog/regime-tributario.jpg',
    featured: true,
    tags: ['Tributação', 'Simples Nacional', 'Lucro Real']
  },
  {
    id: 2,
    title: 'eSocial 2024: Principais Mudanças e Como se Preparar',
    excerpt: 'Conheça as principais alterações do eSocial para 2024 e saiba como adequar sua empresa às novas exigências.',
    category: 'Compliance',
    author: 'Maria Santos',
    date: '2024-01-12',
    readTime: '6 min',
    image: '/images/blog/esocial-2024.jpg',
    featured: false,
    tags: ['eSocial', 'Compliance', 'RH']
  },
  {
    id: 3,
    title: 'Gestão Financeira: 5 Indicadores que Todo Empresário Deve Acompanhar',
    excerpt: 'Descubra os principais KPIs financeiros que podem transformar a gestão da sua empresa e aumentar a lucratividade.',
    category: 'Gestão Empresarial',
    author: 'Carlos Oliveira',
    date: '2024-01-10',
    readTime: '10 min',
    image: '/images/blog/indicadores-financeiros.jpg',
    featured: true,
    tags: ['Gestão', 'KPIs', 'Finanças']
  },
  {
    id: 4,
    title: 'Planejamento Sucessório: Protegendo o Futuro da sua Empresa Familiar',
    excerpt: 'Estratégias essenciais para garantir a continuidade do negócio familiar através de um planejamento sucessório eficiente.',
    category: 'Planejamento Tributário',
    author: 'Lucia Ferreira',
    date: '2024-01-08',
    readTime: '12 min',
    image: '/images/blog/planejamento-sucessorio.jpg',
    featured: false,
    tags: ['Sucessão', 'Empresa Familiar', 'Planejamento']
  },
  {
    id: 5,
    title: 'Folha de Pagamento Digital: Benefícios e Implementação',
    excerpt: 'Como a digitalização da folha de pagamento pode reduzir custos e aumentar a eficiência do seu departamento pessoal.',
    category: 'Recursos Humanos',
    author: 'Ana Costa',
    date: '2024-01-05',
    readTime: '7 min',
    image: '/images/blog/folha-digital.jpg',
    featured: false,
    tags: ['Folha de Pagamento', 'Digital', 'RH']
  },
  {
    id: 6,
    title: 'Auditoria Interna: Por que sua Empresa Precisa Implementar',
    excerpt: 'Entenda a importância da auditoria interna para identificar riscos, melhorar processos e garantir compliance.',
    category: 'Compliance',
    author: 'Roberto Alves',
    date: '2024-01-03',
    readTime: '9 min',
    image: '/images/blog/auditoria-interna.jpg',
    featured: false,
    tags: ['Auditoria', 'Riscos', 'Processos']
  }
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Todos' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <span>Início</span> <span className="mx-2">/</span> <span className="text-primary-600">Blog</span>
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
              Blog <span className="text-primary-600">ContabilPro</span>
            </motion.h1>
            <motion.p 
              variants={fadeInUp  as any}
              className="text-xl text-gray-600 leading-relaxed mb-8"
            >
              Insights e dicas sobre contabilidade e gestão empresarial
            </motion.p>
            
            {/* Search Bar */}
            <motion.div variants={fadeInUp  as any} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar artigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp  as any} className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isActive = selectedCategory === category.name;
                const colorClasses = {
                  primary: isActive ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700 hover:bg-primary-200',
                  accent: isActive ? 'bg-accent-600 text-white' : 'bg-accent-100 text-accent-700 hover:bg-accent-200',
                  success: isActive ? 'bg-success-600 text-white' : 'bg-success-100 text-success-700 hover:bg-success-200',
                  warning: isActive ? 'bg-warning-600 text-white' : 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                };
                
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center px-4 py-2 rounded-full font-semibold transition-colors duration-300 ${
                      colorClasses[category.color as keyof typeof colorClasses]
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {category.name} ({category.count})
                  </button>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {selectedCategory === 'Todos' && (
        <section className="pb-12 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.h2 
                variants={fadeInUp  as any}
                className="text-3xl font-bold text-center text-gray-900 mb-12"
              >
                Artigos em Destaque
              </motion.h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {featuredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    variants={fadeInUp  as any}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-primary-100 to-accent-100 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-16 h-16 text-primary-300" />
                      </div>
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-20">
                        {post.category}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      
                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {post.author}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(post.date)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {post.readTime}
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* Read More */}
                      <Link 
                        href={`/blog/${post.id}`}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold group"
                      >
                        Ler artigo completo
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="pb-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp  as any} className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory === 'Todos' ? 'Todos os Artigos' : selectedCategory}
              </h2>
              <div className="text-gray-600">
                {filteredPosts.length} artigo{filteredPosts.length !== 1 ? 's' : ''} encontrado{filteredPosts.length !== 1 ? 's' : ''}
              </div>
            </motion.div>
            
            {filteredPosts.length === 0 ? (
              <motion.div variants={fadeInUp  as any} className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum artigo encontrado</h3>
                <p className="text-gray-500">Tente ajustar os filtros ou termo de pesquisa.</p>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    variants={fadeInUp  as any}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {post.category}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      
                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {post.author}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* Read More */}
                      <Link 
                        href={`/blog/${post.id}`}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-sm group"
                      >
                        Ler mais
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {filteredPosts.length > 6 && (
              <motion.div variants={fadeInUp  as any} className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                    Anterior
                  </button>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                    1
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                    2
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                    3
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                    Próximo
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-primary-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.h2 
              variants={fadeInUp  as any}
              className="text-3xl font-bold text-white mb-4"
            >
              Receba nossos artigos por email
            </motion.h2>
            <motion.p 
              variants={fadeInUp  as any}
              className="text-primary-100 mb-8"
            >
              Cadastre-se em nossa newsletter e receba semanalmente conteúdos exclusivos sobre contabilidade e gestão empresarial.
            </motion.p>
            
            <motion.div variants={fadeInUp  as any} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
              <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center">
                Inscrever-se
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}