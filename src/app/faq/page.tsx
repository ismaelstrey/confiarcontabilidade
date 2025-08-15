'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

import { Card, CardContent } from '@/components/ui/card'

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Serviços Gerais
  {
    id: '1',
    question: 'Quais serviços contábeis vocês oferecem?',
    answer: 'Oferecemos uma gama completa de serviços contábeis: abertura de empresas, contabilidade mensal, planejamento tributário, folha de pagamento, declarações fiscais, consultoria empresarial, regularização fiscal e muito mais. Nossa equipe está preparada para atender desde microempresas até grandes corporações.',
    category: 'servicos'
  },
  {
    id: '2',
    question: 'Como funciona o processo de abertura de empresa?',
    answer: 'O processo é simples e rápido: 1) Consulta inicial para definir o tipo de empresa ideal; 2) Preparação da documentação necessária; 3) Registro nos órgãos competentes (Junta Comercial, Receita Federal, etc.); 4) Obtenção do CNPJ e licenças necessárias. Todo o processo leva em média 15 a 30 dias úteis.',
    category: 'servicos'
  },
  {
    id: '3',
    question: 'Vocês atendem empresas de todos os portes?',
    answer: 'Sim! Atendemos desde MEI (Microempreendedor Individual) até grandes empresas. Nossos serviços são personalizados conforme o porte e necessidades específicas de cada cliente, garantindo soluções eficientes e econômicas.',
    category: 'servicos'
  },
  
  // Custos e Preços
  {
    id: '4',
    question: 'Como são calculados os honorários contábeis?',
    answer: 'Nossos honorários são calculados com base no porte da empresa, complexidade das operações, regime tributário e serviços contratados. Oferecemos pacotes mensais fixos para maior previsibilidade de custos. Solicite um orçamento personalizado sem compromisso.',
    category: 'custos'
  },
  {
    id: '5',
    question: 'Existe taxa de adesão ou multa por cancelamento?',
    answer: 'Não cobramos taxa de adesão. Nossos contratos são transparentes e não possuem multas por cancelamento. Acreditamos em manter nossos clientes pela qualidade dos serviços, não por amarras contratuais.',
    category: 'custos'
  },
  {
    id: '6',
    question: 'Quais são as formas de pagamento aceitas?',
    answer: 'Aceitamos diversas formas de pagamento: boleto bancário, PIX, transferência bancária, cartão de crédito e débito automático. O pagamento pode ser mensal, trimestral, semestral ou anual, com descontos progressivos para pagamentos antecipados.',
    category: 'custos'
  },
  
  // Prazos e Processos
  {
    id: '7',
    question: 'Quais são os prazos para entrega das obrigações?',
    answer: 'Cumprimos rigorosamente todos os prazos legais: DCTF até o 15º dia útil, DEFIS até 31/03, DIRF até o último dia de fevereiro, entre outros. Nosso sistema de controle garante que nenhuma obrigação seja perdida, evitando multas e juros.',
    category: 'prazos'
  },
  {
    id: '8',
    question: 'Em quanto tempo posso ter acesso aos relatórios contábeis?',
    answer: 'Os relatórios mensais ficam disponíveis até o 10º dia útil do mês seguinte. Relatórios gerenciais e demonstrativos podem ser gerados a qualquer momento através do nosso portal do cliente ou mediante solicitação.',
    category: 'prazos'
  },
  {
    id: '9',
    question: 'Como é feito o acompanhamento mensal da minha empresa?',
    answer: 'Realizamos um acompanhamento completo: análise das movimentações financeiras, conciliação bancária, apuração de impostos, geração de relatórios gerenciais e reuniões periódicas para discussão dos resultados e planejamento estratégico.',
    category: 'prazos'
  },
  
  // Segurança e Conformidade
  {
    id: '10',
    question: 'Como vocês garantem a segurança dos meus dados?',
    answer: 'Utilizamos as mais avançadas tecnologias de segurança: criptografia de dados, backups automáticos, servidores seguros, acesso restrito por senha e certificação digital. Todos os colaboradores assinam termo de confidencialidade e seguimos a LGPD rigorosamente.',
    category: 'seguranca'
  },
  {
    id: '11',
    question: 'Vocês estão em conformidade com a LGPD?',
    answer: 'Sim, estamos 100% em conformidade com a Lei Geral de Proteção de Dados (LGPD). Temos políticas claras de privacidade, processos de tratamento de dados documentados e um DPO (Data Protection Officer) responsável pela proteção dos dados dos nossos clientes.',
    category: 'seguranca'
  },
  {
    id: '12',
    question: 'O que acontece se houver erro na contabilidade?',
    answer: 'Assumimos total responsabilidade por nossos serviços. Caso ocorra algum erro, corrigimos imediatamente sem custo adicional e, se necessário, arcamos com eventuais multas ou juros decorrentes de nossa responsabilidade. Possuímos seguro de responsabilidade civil profissional.',
    category: 'seguranca'
  },
  
  // Suporte e Atendimento
  {
    id: '13',
    question: 'Como posso entrar em contato para tirar dúvidas?',
    answer: 'Oferecemos múltiplos canais de atendimento: telefone, WhatsApp, e-mail, chat online e portal do cliente. Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Para emergências, temos plantão nos finais de semana.',
    category: 'suporte'
  },
  {
    id: '14',
    question: 'Vocês oferecem consultoria além dos serviços básicos?',
    answer: 'Sim! Além dos serviços contábeis tradicionais, oferecemos consultoria empresarial, planejamento tributário, análise de viabilidade de projetos, reestruturação societária, due diligence e assessoria em fusões e aquisições.',
    category: 'suporte'
  },
  {
    id: '15',
    question: 'É possível agendar uma reunião presencial?',
    answer: 'Claro! Agendamos reuniões presenciais em nosso escritório ou, quando necessário, visitamos sua empresa. Também oferecemos videoconferências para maior comodidade. Entre em contato para agendar um horário que seja conveniente para você.',
    category: 'suporte'
  }
]

const categories = [
  { id: 'todos', name: 'Todas as Perguntas', icon: QuestionMarkCircleIcon },
  { id: 'servicos', name: 'Serviços', icon: DocumentTextIcon },
  { id: 'custos', name: 'Custos e Preços', icon: CurrencyDollarIcon },
  { id: 'prazos', name: 'Prazos e Processos', icon: ClockIcon },
  { id: 'seguranca', name: 'Segurança', icon: ShieldCheckIcon },
  { id: 'suporte', name: 'Suporte', icon: PhoneIcon }
]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState<string[]>([])

  const filteredFAQs = faqData.filter(item => {
    const matchesCategory = activeCategory === 'todos' || item.category === activeCategory
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Container className="py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encontre respostas para as principais dúvidas sobre nossos serviços contábeis.
            Não encontrou o que procura? Entre em contato conosco!
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <Input
            type="text"
            placeholder="Pesquisar perguntas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 text-lg"
          />
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'primary' : 'outline'}
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center gap-2 h-12 px-6"
              >
                <IconComponent className="w-5 h-5" />
                {category.name}
              </Button>
            )
          })}
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {filteredFAQs.map((item, index) => {
              const isOpen = openItems.includes(item.id)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="mb-4"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">
                          {item.question}
                        </h3>
                        <div className="flex-shrink-0">
                          {isOpen ? (
                            <ChevronUpIcon className="w-5 h-5 text-blue-600" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-0">
                              <div className="h-px bg-gray-200 mb-4" />
                              <p className="text-gray-700 leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredFAQs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <QuestionMarkCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhuma pergunta encontrada
              </h3>
              <p className="text-gray-500">
                Tente ajustar sua pesquisa ou selecionar uma categoria diferente.
              </p>
            </motion.div>
          )}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-8">
              <PhoneIcon className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-4">
                Não encontrou sua resposta?
              </h3>
              <p className="text-blue-100 mb-6">
                Nossa equipe está pronta para esclarecer todas as suas dúvidas.
                Entre em contato conosco!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  className="bg-white text-blue-600 hover:bg-blue-50 border-white"
                >
                  Falar no WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600"
                >
                  Solicitar Orçamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </div>
  )
}