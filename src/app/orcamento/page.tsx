'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  Building,
  Users,
  FileText,
  DollarSign,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Award
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/ui/container'

interface FormData {
  // Etapa 1: Informações da Empresa
  nomeEmpresa: string
  cnpj: string
  tipoEmpresa: string
  porte: string
  segmento: string
  faturamentoMensal: string
  numeroFuncionarios: string
  
  // Etapa 2: Serviços
  servicos: string[]
  regimeTributario: string
  necessidadeUrgente: boolean
  observacoes: string
  
  // Etapa 3: Contato
  nomeContato: string
  email: string
  telefone: string
  cargo: string
  melhorHorario: string
  comoConheceu: string
}

const initialFormData: FormData = {
  nomeEmpresa: '',
  cnpj: '',
  tipoEmpresa: '',
  porte: '',
  segmento: '',
  faturamentoMensal: '',
  numeroFuncionarios: '',
  servicos: [],
  regimeTributario: '',
  necessidadeUrgente: false,
  observacoes: '',
  nomeContato: '',
  email: '',
  telefone: '',
  cargo: '',
  melhorHorario: '',
  comoConheceu: ''
}

const servicosDisponiveis = [
  { id: 'abertura-empresa', nome: 'Abertura de Empresa', preco: 'A partir de R$ 299' },
  { id: 'contabilidade-mensal', nome: 'Contabilidade Mensal', preco: 'A partir de R$ 199/mês' },
  { id: 'planejamento-tributario', nome: 'Planejamento Tributário', preco: 'A partir de R$ 399/mês' },
  { id: 'departamento-pessoal', nome: 'Departamento Pessoal', preco: 'A partir de R$ 25/funcionário' },
  { id: 'fiscal-tributario', nome: 'Fiscal e Tributário', preco: 'A partir de R$ 149/mês' },
  { id: 'consultoria', nome: 'Consultoria Empresarial', preco: 'A partir de R$ 599/mês' },
  { id: 'auditoria', nome: 'Auditoria Contábil', preco: 'Sob consulta' },
  { id: 'recuperacao-judicial', nome: 'Recuperação Judicial', preco: 'Sob consulta' }
]

const beneficios = [
  {
    icon: Shield,
    titulo: 'Segurança Total',
    descricao: 'Seus dados protegidos com criptografia de ponta'
  },
  {
    icon: Zap,
    titulo: 'Resposta Rápida',
    descricao: 'Orçamento personalizado em até 24 horas'
  },
  {
    icon: Target,
    titulo: 'Solução Personalizada',
    descricao: 'Proposta adequada ao seu perfil empresarial'
  },
  {
    icon: Award,
    titulo: 'Expertise Comprovada',
    descricao: 'Mais de 15 anos de experiência no mercado'
  }
]

export default function OrcamentoPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalSteps = 3

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Remove error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const toggleServico = (servicoId: string) => {
    setFormData(prev => ({
      ...prev,
      servicos: prev.servicos.includes(servicoId)
        ? prev.servicos.filter(s => s !== servicoId)
        : [...prev.servicos, servicoId]
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.nomeEmpresa) newErrors.nomeEmpresa = 'Nome da empresa é obrigatório'
      if (!formData.tipoEmpresa) newErrors.tipoEmpresa = 'Tipo de empresa é obrigatório'
      if (!formData.porte) newErrors.porte = 'Porte da empresa é obrigatório'
      if (!formData.segmento) newErrors.segmento = 'Segmento é obrigatório'
    }

    if (step === 2) {
      if (formData.servicos.length === 0) newErrors.servicos = 'Selecione pelo menos um serviço'
    }

    if (step === 3) {
      if (!formData.nomeContato) newErrors.nomeContato = 'Nome é obrigatório'
      if (!formData.email) newErrors.email = 'E-mail é obrigatório'
      if (!formData.telefone) newErrors.telefone = 'Telefone é obrigatório'
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'E-mail inválido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    
    // Simula envio do formulário
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Informações da Empresa'
      case 2: return 'Serviços Desejados'
      case 3: return 'Dados de Contato'
      default: return ''
    }
  }

  const getProgress = () => (currentStep / totalSteps) * 100

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Container size="md" padding="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="shadow-2xl border-0">
              <CardContent className="pt-12 pb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Orçamento Enviado com Sucesso!
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Recebemos sua solicitação e nossa equipe entrará em contato em até 24 horas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span>Resposta em 24h</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Phone className="h-5 w-5" />
                    <span>Contato personalizado</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <Button size="lg" className="w-full" asChild>
                    <Link href="/">
                      Voltar ao Início
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <a href="/servicos">
                      Conhecer Nossos Serviços
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <Container size="xl" padding="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <Calculator className="h-12 w-12 mr-4" />
              <h1 className="text-4xl font-bold">Solicite seu Orçamento</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Receba uma proposta personalizada para os serviços contábeis da sua empresa
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-200">Progresso</span>
                <span className="text-sm text-blue-200">{currentStep}/{totalSteps}</span>
              </div>
              <div className="w-full bg-blue-700 rounded-full h-2">
                <motion.div
                  className="bg-white rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container size="xl" padding="md">
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Benefícios */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Por que escolher a ContabilPro?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {beneficios.map((beneficio, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <beneficio.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">{beneficio.titulo}</h4>
                          <p className="text-xs text-gray-600 mt-1">{beneficio.descricao}</p>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {currentStep}
                      </span>
                      {getStepTitle(currentStep)}
                    </CardTitle>
                    <CardDescription>
                      {currentStep === 1 && 'Conte-nos sobre sua empresa para personalizarmos nossa proposta'}
                      {currentStep === 2 && 'Selecione os serviços que sua empresa precisa'}
                      {currentStep === 3 && 'Seus dados de contato para enviarmos o orçamento'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence mode="wait">
                      {/* Etapa 1: Informações da Empresa */}
                      {currentStep === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
                              <Input
                                id="nomeEmpresa"
                                placeholder="Ex: Minha Empresa Ltda"
                                value={formData.nomeEmpresa}
                                onChange={(e) => updateFormData('nomeEmpresa', e.target.value)}
                                className={errors.nomeEmpresa ? 'border-red-500' : ''}
                              />
                              {errors.nomeEmpresa && (
                                <p className="text-red-500 text-sm mt-1">{errors.nomeEmpresa}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="cnpj">CNPJ</Label>
                              <Input
                                id="cnpj"
                                placeholder="00.000.000/0000-00"
                                value={formData.cnpj}
                                onChange={(e) => updateFormData('cnpj', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="tipoEmpresa">Tipo de Empresa *</Label>
                              <Select value={formData.tipoEmpresa} onValueChange={(value) => updateFormData('tipoEmpresa', value)}>
                                <SelectTrigger className={errors.tipoEmpresa ? 'border-red-500' : ''}>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mei">MEI</SelectItem>
                                  <SelectItem value="ltda">Ltda</SelectItem>
                                  <SelectItem value="sa">S.A.</SelectItem>
                                  <SelectItem value="eireli">EIRELI</SelectItem>
                                  <SelectItem value="outros">Outros</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.tipoEmpresa && (
                                <p className="text-red-500 text-sm mt-1">{errors.tipoEmpresa}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="porte">Porte da Empresa *</Label>
                              <Select value={formData.porte} onValueChange={(value) => updateFormData('porte', value)}>
                                <SelectTrigger className={errors.porte ? 'border-red-500' : ''}>
                                  <SelectValue placeholder="Selecione o porte" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="micro">Microempresa</SelectItem>
                                  <SelectItem value="pequena">Pequena Empresa</SelectItem>
                                  <SelectItem value="media">Média Empresa</SelectItem>
                                  <SelectItem value="grande">Grande Empresa</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.porte && (
                                <p className="text-red-500 text-sm mt-1">{errors.porte}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="segmento">Segmento de Atuação *</Label>
                            <Select value={formData.segmento} onValueChange={(value) => updateFormData('segmento', value)}>
                              <SelectTrigger className={errors.segmento ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Selecione o segmento" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="comercio">Comércio</SelectItem>
                                <SelectItem value="servicos">Serviços</SelectItem>
                                <SelectItem value="industria">Indústria</SelectItem>
                                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                                <SelectItem value="saude">Saúde</SelectItem>
                                <SelectItem value="educacao">Educação</SelectItem>
                                <SelectItem value="construcao">Construção Civil</SelectItem>
                                <SelectItem value="alimentacao">Alimentação</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.segmento && (
                              <p className="text-red-500 text-sm mt-1">{errors.segmento}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="faturamentoMensal">Faturamento Mensal</Label>
                              <Select value={formData.faturamentoMensal} onValueChange={(value) => updateFormData('faturamentoMensal', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a faixa" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ate-10k">Até R$ 10.000</SelectItem>
                                  <SelectItem value="10k-50k">R$ 10.000 - R$ 50.000</SelectItem>
                                  <SelectItem value="50k-100k">R$ 50.000 - R$ 100.000</SelectItem>
                                  <SelectItem value="100k-500k">R$ 100.000 - R$ 500.000</SelectItem>
                                  <SelectItem value="acima-500k">Acima de R$ 500.000</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="numeroFuncionarios">Número de Funcionários</Label>
                              <Select value={formData.numeroFuncionarios} onValueChange={(value) => updateFormData('numeroFuncionarios', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a quantidade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Nenhum</SelectItem>
                                  <SelectItem value="1-5">1 - 5</SelectItem>
                                  <SelectItem value="6-10">6 - 10</SelectItem>
                                  <SelectItem value="11-50">11 - 50</SelectItem>
                                  <SelectItem value="acima-50">Acima de 50</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Etapa 2: Serviços */}
                      {currentStep === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div>
                            <Label>Serviços Desejados *</Label>
                            <p className="text-sm text-gray-600 mb-4">Selecione todos os serviços que sua empresa precisa</p>
                            {errors.servicos && (
                              <p className="text-red-500 text-sm mb-4">{errors.servicos}</p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {servicosDisponiveis.map((servico) => (
                                <motion.div
                                  key={servico.id}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Card 
                                    className={`cursor-pointer transition-all duration-200 ${
                                      formData.servicos.includes(servico.id)
                                        ? 'ring-2 ring-blue-500 bg-blue-50'
                                        : 'hover:shadow-md'
                                    }`}
                                    onClick={() => toggleServico(servico.id)}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-start space-x-3">
                                        <Checkbox
                                          checked={formData.servicos.includes(servico.id)}
                                          onChange={() => toggleServico(servico.id)}
                                          className="mt-1"
                                        />
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900">{servico.nome}</h4>
                                          <p className="text-sm text-blue-600 font-medium">{servico.preco}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="regimeTributario">Regime Tributário Atual</Label>
                            <Select value={formData.regimeTributario} onValueChange={(value) => updateFormData('regimeTributario', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o regime" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="simples">Simples Nacional</SelectItem>
                                <SelectItem value="presumido">Lucro Presumido</SelectItem>
                                <SelectItem value="real">Lucro Real</SelectItem>
                                <SelectItem value="nao-sei">Não sei</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="necessidadeUrgente"
                              checked={formData.necessidadeUrgente}
                              onCheckedChange={(checked) => updateFormData('necessidadeUrgente', checked)}
                            />
                            <Label htmlFor="necessidadeUrgente" className="text-sm">
                              Tenho necessidade urgente destes serviços
                            </Label>
                          </div>

                          <div>
                            <Label htmlFor="observacoes">Observações Adicionais</Label>
                            <Textarea
                              id="observacoes"
                              placeholder="Conte-nos mais sobre suas necessidades específicas..."
                              value={formData.observacoes}
                              onChange={(e) => updateFormData('observacoes', e.target.value)}
                              rows={4}
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Etapa 3: Contato */}
                      {currentStep === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="nomeContato">Nome Completo *</Label>
                              <Input
                                id="nomeContato"
                                placeholder="Seu nome completo"
                                value={formData.nomeContato}
                                onChange={(e) => updateFormData('nomeContato', e.target.value)}
                                className={errors.nomeContato ? 'border-red-500' : ''}
                              />
                              {errors.nomeContato && (
                                <p className="text-red-500 text-sm mt-1">{errors.nomeContato}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="cargo">Cargo na Empresa</Label>
                              <Input
                                id="cargo"
                                placeholder="Ex: CEO, Sócio, Gerente"
                                value={formData.cargo}
                                onChange={(e) => updateFormData('cargo', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="email">E-mail *</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={formData.email}
                                onChange={(e) => updateFormData('email', e.target.value)}
                                className={errors.email ? 'border-red-500' : ''}
                              />
                              {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
                              <Input
                                id="telefone"
                                placeholder="(11) 99999-9999"
                                value={formData.telefone}
                                onChange={(e) => updateFormData('telefone', e.target.value)}
                                className={errors.telefone ? 'border-red-500' : ''}
                              />
                              {errors.telefone && (
                                <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="melhorHorario">Melhor Horário para Contato</Label>
                              <Select value={formData.melhorHorario} onValueChange={(value) => updateFormData('melhorHorario', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o horário" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="manha">Manhã (8h às 12h)</SelectItem>
                                  <SelectItem value="tarde">Tarde (12h às 18h)</SelectItem>
                                  <SelectItem value="noite">Noite (18h às 20h)</SelectItem>
                                  <SelectItem value="qualquer">Qualquer horário</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="comoConheceu">Como nos conheceu?</Label>
                              <Select value={formData.comoConheceu} onValueChange={(value) => updateFormData('comoConheceu', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="google">Google</SelectItem>
                                  <SelectItem value="indicacao">Indicação</SelectItem>
                                  <SelectItem value="redes-sociais">Redes Sociais</SelectItem>
                                  <SelectItem value="site">Site</SelectItem>
                                  <SelectItem value="outros">Outros</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Seus dados estão seguros</p>
                                <p>Utilizamos criptografia de ponta para proteger suas informações e não compartilhamos seus dados com terceiros.</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-8 border-t mt-4">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="flex items-center"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Anterior
                      </Button>

                      {currentStep < totalSteps ? (
                        <Button onClick={nextStep} className="flex items-center">
                          Próximo
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="flex items-center bg-green-600 hover:bg-green-700"
                        >
                          {isSubmitting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-4 w-4 mr-2"
                            >
                              <Calculator className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {isSubmitting ? 'Enviando...' : 'Solicitar Orçamento'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}