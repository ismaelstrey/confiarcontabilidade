'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  Building,
  Percent,
  PiggyBank,
  ArrowRight,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/ui/container'

interface CalculationResult {
  total: number
  breakdown: { label: string; value: number; percentage?: number }[]
  recommendations?: string[]
}

export default function CalculadoraPage() {
  const [activeTab, setActiveTab] = useState('simples-nacional')
  const [results, setResults] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Simples Nacional Calculator
  const [simplesData, setSimplesData] = useState({
    faturamento: '',
    anexo: '',
    aliquota: ''
  })

  // Folha de Pagamento Calculator
  const [folhaData, setFolhaData] = useState({
    salario: '',
    dependentes: '',
    valeTransporte: false,
    valeRefeicao: ''
  })

  // Lucro Presumido Calculator
  const [lucroData, setLucroData] = useState({
    faturamento: '',
    atividade: '',
    despesas: ''
  })

  const anexosSimples = [
    { value: 'anexo1', label: 'Anexo I - Comércio', aliquota: 4.0 },
    { value: 'anexo2', label: 'Anexo II - Indústria', aliquota: 4.5 },
    { value: 'anexo3', label: 'Anexo III - Serviços', aliquota: 6.0 },
    { value: 'anexo4', label: 'Anexo IV - Serviços', aliquota: 4.5 },
    { value: 'anexo5', label: 'Anexo V - Serviços', aliquota: 15.5 }
  ]

  const calculateSimples = async () => {
    setIsCalculating(true)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simula cálculo
    
    const faturamento = parseFloat(simplesData.faturamento) || 0
    const anexoSelecionado = anexosSimples.find(a => a.value === simplesData.anexo)
    const aliquota = anexoSelecionado?.aliquota || 0
    
    const impostoTotal = (faturamento * aliquota) / 100
    const irpj = impostoTotal * 0.25
    const csll = impostoTotal * 0.15
    const pis = impostoTotal * 0.10
    const cofins = impostoTotal * 0.30
    const inss = impostoTotal * 0.20
    
    setResults({
      total: impostoTotal,
      breakdown: [
        { label: 'IRPJ', value: irpj, percentage: 25 },
        { label: 'CSLL', value: csll, percentage: 15 },
        { label: 'PIS', value: pis, percentage: 10 },
        { label: 'COFINS', value: cofins, percentage: 30 },
        { label: 'INSS', value: inss, percentage: 20 }
      ],
      recommendations: [
        'Mantenha o faturamento dentro do limite do Simples Nacional',
        'Considere o planejamento tributário para otimizar a carga fiscal',
        'Acompanhe mensalmente o faturamento acumulado'
      ]
    })
    setIsCalculating(false)
  }

  const calculateFolha = async () => {
    setIsCalculating(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const salario = parseFloat(folhaData.salario) || 0
    const dependentes = parseInt(folhaData.dependentes) || 0
    const valeRefeicao = parseFloat(folhaData.valeRefeicao) || 0
    
    const inss = Math.min(salario * 0.11, 751.99)
    const irrf = Math.max((salario - inss - (dependentes * 189.59)) * 0.075 - 142.80, 0)
    const fgts = salario * 0.08
    const valeTransporte = folhaData.valeTransporte ? salario * 0.06 : 0
    
    const totalDescontos = inss + irrf + valeTransporte
    const salarioLiquido = salario - totalDescontos + valeRefeicao
    
    setResults({
      total: salarioLiquido,
      breakdown: [
        { label: 'Salário Bruto', value: salario },
        { label: 'INSS', value: -inss },
        { label: 'IRRF', value: -irrf },
        { label: 'Vale Transporte', value: -valeTransporte },
        { label: 'Vale Refeição', value: valeRefeicao },
        { label: 'FGTS (Empresa)', value: fgts }
      ],
      recommendations: [
        'Verifique os limites de desconto do vale transporte',
        'Considere benefícios fiscais para otimizar a folha',
        'Mantenha documentação atualizada dos funcionários'
      ]
    })
    setIsCalculating(false)
  }

  const calculateLucro = async () => {
    setIsCalculating(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const faturamento = parseFloat(lucroData.faturamento) || 0
    const despesas = parseFloat(lucroData.despesas) || 0
    
    const lucroPresumido = faturamento * 0.32 // 32% para serviços
    const irpj = lucroPresumido * 0.15
    const csll = lucroPresumido * 0.09
    const pis = faturamento * 0.0065
    const cofins = faturamento * 0.03
    
    const totalImpostos = irpj + csll + pis + cofins
    const lucroLiquido = faturamento - totalImpostos - despesas
    
    setResults({
      total: lucroLiquido,
      breakdown: [
        { label: 'Faturamento', value: faturamento },
        { label: 'IRPJ', value: -irpj },
        { label: 'CSLL', value: -csll },
        { label: 'PIS', value: -pis },
        { label: 'COFINS', value: -cofins },
        { label: 'Despesas', value: -despesas }
      ],
      recommendations: [
        'Compare com o Simples Nacional para verificar vantagens',
        'Mantenha controle rigoroso das despesas dedutíveis',
        'Considere investimentos para reduzir a base de cálculo'
      ]
    })
    setIsCalculating(false)
  }

  const calculators = [
    {
      id: 'simples-nacional',
      title: 'Simples Nacional',
      description: 'Calcule os impostos do Simples Nacional',
      icon: Building,
      color: 'bg-blue-500'
    },
    {
      id: 'folha-pagamento',
      title: 'Folha de Pagamento',
      description: 'Calcule salário líquido e encargos',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      id: 'lucro-presumido',
      title: 'Lucro Presumido',
      description: 'Calcule impostos no Lucro Presumido',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ]

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
              <h1 className="text-4xl font-bold">Calculadora Fiscal</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Ferramentas gratuitas para cálculos fiscais e trabalhistas
            </p>
            <div className="flex items-center justify-center mt-6 space-x-6">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Cálculos Precisos
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Atualizados 2024
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                100% Gratuito
              </Badge>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container size="xl" padding="md">
        <div className="py-12">
          {/* Calculator Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {calculators.map((calc, index) => (
              <motion.div
                key={calc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 ${
                    activeTab === calc.id 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    setActiveTab(calc.id)
                    setResults(null)
                  }}
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${calc.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <calc.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{calc.title}</CardTitle>
                    <CardDescription>{calc.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calculator Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {(() => {
                        const activeCalculator = calculators.find(c => c.id === activeTab)
                        if (activeCalculator) {
                          const IconComponent = activeCalculator.icon
                          return <IconComponent className="h-6 w-6 mr-2 text-blue-600" />
                        }
                        return null
                      })()}
                      {calculators.find(c => c.id === activeTab)?.title}
                    </CardTitle>
                    <CardDescription>
                      Preencha os campos abaixo para realizar o cálculo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <AnimatePresence mode="wait">
                      {activeTab === 'simples-nacional' && (
                        <motion.div
                          key="simples"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="faturamento">Faturamento Mensal (R$)</Label>
                            <Input
                              id="faturamento"
                              type="number"
                              placeholder="Ex: 50000"
                              value={simplesData.faturamento}
                              onChange={(e) => setSimplesData({...simplesData, faturamento: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="anexo">Anexo do Simples Nacional</Label>
                            <Select value={simplesData.anexo} onValueChange={(value) => setSimplesData({...simplesData, anexo: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o anexo" />
                              </SelectTrigger>
                              <SelectContent>
                                {anexosSimples.map((anexo) => (
                                  <SelectItem key={anexo.value} value={anexo.value}>
                                    {anexo.label} - {anexo.aliquota}%
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            onClick={calculateSimples} 
                            className="w-full" 
                            disabled={!simplesData.faturamento || !simplesData.anexo || isCalculating}
                          >
                            {isCalculating ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-4 w-4 mr-2"
                              >
                                <Calculator className="h-4 w-4" />
                              </motion.div>
                            ) : (
                              <Calculator className="h-4 w-4 mr-2" />
                            )}
                            {isCalculating ? 'Calculando...' : 'Calcular Impostos'}
                          </Button>
                        </motion.div>
                      )}

                      {activeTab === 'folha-pagamento' && (
                        <motion.div
                          key="folha"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="salario">Salário Bruto (R$)</Label>
                            <Input
                              id="salario"
                              type="number"
                              placeholder="Ex: 3000"
                              value={folhaData.salario}
                              onChange={(e) => setFolhaData({...folhaData, salario: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dependentes">Número de Dependentes</Label>
                            <Input
                              id="dependentes"
                              type="number"
                              placeholder="Ex: 2"
                              value={folhaData.dependentes}
                              onChange={(e) => setFolhaData({...folhaData, dependentes: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="vale-refeicao">Vale Refeição (R$)</Label>
                            <Input
                              id="vale-refeicao"
                              type="number"
                              placeholder="Ex: 400"
                              value={folhaData.valeRefeicao}
                              onChange={(e) => setFolhaData({...folhaData, valeRefeicao: e.target.value})}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="vale-transporte"
                              checked={folhaData.valeTransporte}
                              onChange={(e) => setFolhaData({...folhaData, valeTransporte: e.target.checked})}
                              className="rounded"
                            />
                            <Label htmlFor="vale-transporte">Desconto Vale Transporte (6%)</Label>
                          </div>
                          <Button 
                            onClick={calculateFolha} 
                            className="w-full" 
                            disabled={!folhaData.salario || isCalculating}
                          >
                            {isCalculating ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-4 w-4 mr-2"
                              >
                                <Users className="h-4 w-4" />
                              </motion.div>
                            ) : (
                              <Users className="h-4 w-4 mr-2" />
                            )}
                            {isCalculating ? 'Calculando...' : 'Calcular Folha'}
                          </Button>
                        </motion.div>
                      )}

                      {activeTab === 'lucro-presumido' && (
                        <motion.div
                          key="lucro"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="faturamento-lucro">Faturamento Trimestral (R$)</Label>
                            <Input
                              id="faturamento-lucro"
                              type="number"
                              placeholder="Ex: 150000"
                              value={lucroData.faturamento}
                              onChange={(e) => setLucroData({...lucroData, faturamento: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="atividade">Tipo de Atividade</Label>
                            <Select value={lucroData.atividade} onValueChange={(value) => setLucroData({...lucroData, atividade: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a atividade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="servicos">Serviços - 32%</SelectItem>
                                <SelectItem value="comercio">Comércio - 8%</SelectItem>
                                <SelectItem value="industria">Indústria - 8%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="despesas">Despesas Dedutíveis (R$)</Label>
                            <Input
                              id="despesas"
                              type="number"
                              placeholder="Ex: 20000"
                              value={lucroData.despesas}
                              onChange={(e) => setLucroData({...lucroData, despesas: e.target.value})}
                            />
                          </div>
                          <Button 
                            onClick={calculateLucro} 
                            className="w-full" 
                            disabled={!lucroData.faturamento || !lucroData.atividade || isCalculating}
                          >
                            {isCalculating ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-4 w-4 mr-2"
                              >
                                <TrendingUp className="h-4 w-4" />
                              </motion.div>
                            ) : (
                              <TrendingUp className="h-4 w-4 mr-2" />
                            )}
                            {isCalculating ? 'Calculando...' : 'Calcular Impostos'}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Results */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="shadow-lg sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-6 w-6 mr-2 text-green-600" />
                      Resultado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence>
                      {results ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="space-y-4"
                        >
                          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">
                              {activeTab === 'folha-pagamento' ? 'Salário Líquido' : 
                               activeTab === 'lucro-presumido' ? 'Lucro Líquido' : 'Total de Impostos'}
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(results.total)}
                            </p>
                          </div>

                          <div className="border-t border-gray-200 my-4" />

                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900">Detalhamento:</h4>
                            {results.breakdown.map((item, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex justify-between items-center p-2 rounded bg-gray-50"
                              >
                                <span className="text-sm text-gray-700">{item.label}</span>
                                <div className="text-right">
                                  <span className={`font-medium ${
                                    item.value >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL'
                                    }).format(Math.abs(item.value))}
                                  </span>
                                  {item.percentage && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      ({item.percentage}%)
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {results.recommendations && (
                            <>
                              <div className="border-t border-gray-200 my-4" />
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 flex items-center">
                                  <Info className="h-4 w-4 mr-2 text-blue-600" />
                                  Recomendações:
                                </h4>
                                {results.recommendations.map((rec, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="flex items-start space-x-2 text-sm text-gray-600"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{rec}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </>
                          )}

                          <div className="pt-4">
                            <Button variant="outline" className="w-full" asChild>
                              <a href="/contato">
                                Fale com um Especialista
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </a>
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Preencha os campos ao lado para ver o resultado</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-2">Importante:</p>
                    <p>
                      Os cálculos apresentados são estimativas baseadas na legislação vigente e 
                      devem ser utilizados apenas como referência. Para cálculos oficiais e 
                      planejamento tributário, consulte sempre um contador qualificado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Container>
    </div>
  )
}