'use client'

import { useState } from 'react'
import { apiService } from '@/lib/api'

interface CalculatorData {
  revenue: number
  employees: number
  businessType: 'mei' | 'simples' | 'presumido' | 'real'
  hasPartners: boolean
}

interface TaxCalculatorData {
  revenue: number
  businessType: 'SIMPLES_NACIONAL' | 'FOLHA_PAGAMENTO' | 'LUCRO_PRESUMIDO'
  employees: number
  anexo?: string
  dependentes?: number
  valeTransporte?: boolean
  valeRefeicao?: number
  atividade?: string
  despesas?: number
}

interface CalculationResult {
  businessType: string
  monthlyTax: number
  annualTax: number
  taxRate: number
  savings?: number
  recommendations: string[]
  breakdown: {
    federal: number
    state: number
    municipal: number
  }
}

interface TaxCalculationResult {
  total: number
  breakdown: { label: string; value: number; percentage?: number }[]
  recommendations?: string[]
}

interface UseCalculatorReturn {
  result: TaxCalculationResult | null
  isLoading: boolean
  error: string | null
  calculate: (data: CalculatorData) => Promise<CalculationResult>
  calculateTax: (data: TaxCalculatorData) => Promise<TaxCalculationResult>
  clearResult: () => void
  clearError: () => void
}

export function useCalculator(): UseCalculatorReturn {
  const [result, setResult] = useState<TaxCalculationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para calcular impostos
  const calculate = async (data: CalculatorData): Promise<CalculationResult> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.calculator.calculate(data)
      
      if (response.data.success && response.data.data) {
        const calculationResult = response.data.data
        setResult(calculationResult)
        return calculationResult
      } else {
        throw new Error(response.data.message || 'Erro ao calcular impostos')
      }
    } catch (err: any) {
      console.error('Erro ao calcular impostos:', err)
      const errorMessage = err.response?.data?.message || 'Erro ao calcular impostos'
      setError(errorMessage)
      setResult(null)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para calcular impostos específicos (nova implementação)
  const calculateTax = async (data: TaxCalculatorData): Promise<TaxCalculationResult> => {
    try {
      setIsLoading(true)
      setError(null)
      
      let result: TaxCalculationResult
      
      switch (data.businessType) {
        case 'SIMPLES_NACIONAL':
          result = calculateSimplesNacional(data)
          break
        case 'FOLHA_PAGAMENTO':
          result = calculateFolhaPagamento(data)
          break
        case 'LUCRO_PRESUMIDO':
          result = calculateLucroPresumido(data)
          break
        default:
          throw new Error('Tipo de negócio não suportado')
      }
      
      setResult(result)
      return result
    } catch (err: any) {
      console.error('Erro ao calcular impostos:', err)
      const errorMessage = err.message || 'Erro ao calcular impostos'
      setError(errorMessage)
      setResult(null)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para calcular Simples Nacional
  const calculateSimplesNacional = (data: TaxCalculatorData): TaxCalculationResult => {
    const { revenue, anexo } = data
    
    // Alíquotas por anexo
    const aliquotas: Record<string, { rate: number; label: string }> = {
      'anexo1': { rate: 4.0, label: 'Anexo I - Comércio' },
      'anexo2': { rate: 4.5, label: 'Anexo II - Indústria' },
      'anexo3': { rate: 6.0, label: 'Anexo III - Serviços' },
      'anexo4': { rate: 4.5, label: 'Anexo IV - Serviços' },
      'anexo5': { rate: 15.5, label: 'Anexo V - Serviços' }
    }
    
    const anexoInfo = aliquotas[anexo || 'anexo1']
    const taxRate = anexoInfo.rate / 100
    const total = revenue * taxRate
    
    return {
      total,
      breakdown: [
        { label: 'IRPJ', value: total * 0.25, percentage: 25 },
        { label: 'CSLL', value: total * 0.15, percentage: 15 },
        { label: 'PIS', value: total * 0.10, percentage: 10 },
        { label: 'COFINS', value: total * 0.30, percentage: 30 },
        { label: 'ICMS/ISS', value: total * 0.20, percentage: 20 }
      ],
      recommendations: [
        `Regime: ${anexoInfo.label}`,
        `Alíquota aplicada: ${anexoInfo.rate}%`,
        'Mantenha o faturamento dentro dos limites do Simples Nacional',
        'Considere a distribuição de lucros para otimização tributária'
      ]
    }
  }

  // Função para calcular Folha de Pagamento
  const calculateFolhaPagamento = (data: TaxCalculatorData): TaxCalculationResult => {
    const { revenue: salario, dependentes = 0, valeTransporte = false, valeRefeicao = 0 } = data
    
    // Cálculo do INSS
    let inss = 0
    if (salario <= 1320) {
      inss = salario * 0.075
    } else if (salario <= 2571.29) {
      inss = salario * 0.09
    } else if (salario <= 3856.94) {
      inss = salario * 0.12
    } else {
      inss = salario * 0.14
    }
    
    // Cálculo do IRRF
    const baseIRRF = salario - inss - (dependentes * 189.59)
    let irrf = 0
    if (baseIRRF > 1903.98) {
      if (baseIRRF <= 2826.65) {
        irrf = baseIRRF * 0.075 - 142.80
      } else if (baseIRRF <= 3751.05) {
        irrf = baseIRRF * 0.15 - 354.80
      } else if (baseIRRF <= 4664.68) {
        irrf = baseIRRF * 0.225 - 636.13
      } else {
        irrf = baseIRRF * 0.275 - 869.36
      }
    }
    
    const valeTransporteValue = valeTransporte ? salario * 0.06 : 0
    const total = inss + irrf + valeTransporteValue + valeRefeicao
    
    return {
      total,
      breakdown: [
        { label: 'INSS', value: inss, percentage: (inss / total) * 100 },
        { label: 'IRRF', value: irrf, percentage: (irrf / total) * 100 },
        { label: 'Vale Transporte', value: valeTransporteValue, percentage: (valeTransporteValue / total) * 100 },
        { label: 'Vale Refeição', value: valeRefeicao, percentage: (valeRefeicao / total) * 100 }
      ],
      recommendations: [
        'Verifique se há benefícios fiscais disponíveis',
        'Considere planos de previdência privada para redução do IR',
        'Mantenha comprovantes de dependentes atualizados'
      ]
    }
  }

  // Função para calcular Lucro Presumido
  const calculateLucroPresumido = (data: TaxCalculatorData): TaxCalculationResult => {
    const { revenue, atividade = 'servicos', despesas = 0 } = data
    
    // Percentuais de presunção por atividade
    const presumptionRates: Record<string, number> = {
      'comercio': 0.08,
      'industria': 0.08,
      'servicos': 0.32,
      'transporte': 0.08,
      'construcao': 0.32
    }
    
    const presumptionRate = presumptionRates[atividade] || 0.32
    const presumedProfit = revenue * presumptionRate
    
    // Cálculo dos impostos
    const irpj = presumedProfit * 0.15
    const csll = presumedProfit * 0.09
    const pis = revenue * 0.0065
    const cofins = revenue * 0.03
    
    const total = irpj + csll + pis + cofins
    
    return {
      total,
      breakdown: [
        { label: 'IRPJ', value: irpj, percentage: (irpj / total) * 100 },
        { label: 'CSLL', value: csll, percentage: (csll / total) * 100 },
        { label: 'PIS', value: pis, percentage: (pis / total) * 100 },
        { label: 'COFINS', value: cofins, percentage: (cofins / total) * 100 }
      ],
      recommendations: [
        `Atividade: ${atividade}`,
        `Taxa de presunção: ${(presumptionRate * 100)}%`,
        'Mantenha controle rigoroso das receitas',
        'Considere migrar para Lucro Real se as despesas forem altas',
        'Avalie periodicamente a eficiência tributária'
      ]
    }
  }

  // Função para limpar resultado
  const clearResult = () => {
    setResult(null)
  }

  // Função para limpar erro
  const clearError = () => {
    setError(null)
  }

  return {
    result,
    isLoading,
    error,
    calculate,
    calculateTax,
    clearResult,
    clearError,
  }
}

// Hook para validação de dados da calculadora
export function useCalculatorValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateCalculatorData = (data: Partial<CalculatorData>): boolean => {
    const newErrors: Record<string, string> = {}

    // Validar receita
    if (!data.revenue || data.revenue <= 0) {
      newErrors.revenue = 'Receita mensal é obrigatória e deve ser maior que zero'
    } else if (data.revenue > 100000000) {
      newErrors.revenue = 'Receita mensal muito alta'
    }

    // Validar número de funcionários
    if (data.employees === undefined || data.employees < 0) {
      newErrors.employees = 'Número de funcionários deve ser zero ou maior'
    } else if (data.employees > 10000) {
      newErrors.employees = 'Número de funcionários muito alto'
    }

    // Validar tipo de negócio
    if (!data.businessType) {
      newErrors.businessType = 'Tipo de negócio é obrigatório'
    } else if (!['mei', 'simples', 'presumido', 'real'].includes(data.businessType)) {
      newErrors.businessType = 'Tipo de negócio inválido'
    }

    // Validar se tem sócios
    if (data.hasPartners === undefined) {
      newErrors.hasPartners = 'Informe se a empresa possui sócios'
    }

    // Validações específicas por tipo de negócio
    if (data.businessType === 'mei' && data.revenue && data.revenue > 81000) {
      newErrors.revenue = 'MEI tem limite de receita anual de R$ 81.000'
    }

    if (data.businessType === 'mei' && data.employees && data.employees > 1) {
      newErrors.employees = 'MEI pode ter no máximo 1 funcionário'
    }

    if (data.businessType === 'simples' && data.revenue && data.revenue * 12 > 4800000) {
      newErrors.revenue = 'Simples Nacional tem limite de receita anual de R$ 4.8 milhões'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const clearErrors = () => {
    setErrors({})
  }

  const getFieldError = (field: keyof CalculatorData): string | undefined => {
    return errors[field]
  }

  return {
    errors,
    validateCalculatorData,
    clearErrors,
    getFieldError,
    hasErrors: Object.keys(errors).length > 0,
  }
}