import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, authorize, optionalAuth } from '../middlewares/auth';
import { createError, asyncHandler } from '../middlewares/errorHandler';

const calculator = new Hono();

// Schemas de validação
const calculationSchema = z.object({
  type: z.enum(['SIMPLE_INTEREST', 'COMPOUND_INTEREST', 'LOAN_PAYMENT', 'INVESTMENT_RETURN', 'TAX_CALCULATION', 'DEPRECIATION']),
  parameters: z.record(z.union([z.string(), z.number(), z.boolean()])),
  description: z.string().optional()
});

const querySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)).optional(),
  type: z.enum(['SIMPLE_INTEREST', 'COMPOUND_INTEREST', 'LOAN_PAYMENT', 'INVESTMENT_RETURN', 'TAX_CALCULATION', 'DEPRECIATION']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Funções de cálculo
const calculations = {
  SIMPLE_INTEREST: (params: any) => {
    const { principal, rate, time } = params;
    if (!principal || !rate || !time) {
      throw createError('Parâmetros obrigatórios: principal, rate, time', 400, 'MISSING_PARAMETERS');
    }
    
    const interest = (principal * rate * time) / 100;
    const total = principal + interest;
    
    return {
      principal: parseFloat(principal),
      rate: parseFloat(rate),
      time: parseFloat(time),
      interest,
      total,
      formula: 'I = P × r × t'
    };
  },

  COMPOUND_INTEREST: (params: any) => {
    const { principal, rate, time, compound = 1 } = params;
    if (!principal || !rate || !time) {
      throw createError('Parâmetros obrigatórios: principal, rate, time', 400, 'MISSING_PARAMETERS');
    }
    
    const amount = principal * Math.pow((1 + rate / (100 * compound)), compound * time);
    const interest = amount - principal;
    
    return {
      principal: parseFloat(principal),
      rate: parseFloat(rate),
      time: parseFloat(time),
      compound: parseFloat(compound),
      amount,
      interest,
      formula: 'A = P(1 + r/n)^(nt)'
    };
  },

  LOAN_PAYMENT: (params: any) => {
    const { principal, rate, time } = params;
    if (!principal || !rate || !time) {
      throw createError('Parâmetros obrigatórios: principal, rate, time', 400, 'MISSING_PARAMETERS');
    }
    
    const monthlyRate = rate / (100 * 12);
    const numPayments = time * 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - principal;
    
    return {
      principal: parseFloat(principal),
      rate: parseFloat(rate),
      time: parseFloat(time),
      monthlyPayment,
      totalPayment,
      totalInterest,
      formula: 'PMT = P × [r(1+r)^n] / [(1+r)^n - 1]'
    };
  },

  INVESTMENT_RETURN: (params: any) => {
    const { initialValue, finalValue, time } = params;
    if (!initialValue || !finalValue || !time) {
      throw createError('Parâmetros obrigatórios: initialValue, finalValue, time', 400, 'MISSING_PARAMETERS');
    }
    
    const totalReturn = finalValue - initialValue;
    const returnPercentage = (totalReturn / initialValue) * 100;
    const annualizedReturn = (Math.pow(finalValue / initialValue, 1 / time) - 1) * 100;
    
    return {
      initialValue: parseFloat(initialValue),
      finalValue: parseFloat(finalValue),
      time: parseFloat(time),
      totalReturn,
      returnPercentage,
      annualizedReturn,
      formula: 'Return = (Final - Initial) / Initial × 100'
    };
  },

  TAX_CALCULATION: (params: any) => {
    const { income, taxRate, deductions = 0 } = params;
    if (!income || !taxRate) {
      throw createError('Parâmetros obrigatórios: income, taxRate', 400, 'MISSING_PARAMETERS');
    }
    
    const taxableIncome = Math.max(0, income - deductions);
    const taxAmount = (taxableIncome * taxRate) / 100;
    const netIncome = income - taxAmount;
    
    return {
      income: parseFloat(income),
      taxRate: parseFloat(taxRate),
      deductions: parseFloat(deductions),
      taxableIncome,
      taxAmount,
      netIncome,
      formula: 'Tax = (Income - Deductions) × Tax Rate'
    };
  },

  DEPRECIATION: (params: any) => {
    const { cost, salvageValue = 0, usefulLife, method = 'STRAIGHT_LINE' } = params;
    if (!cost || !usefulLife) {
      throw createError('Parâmetros obrigatórios: cost, usefulLife', 400, 'MISSING_PARAMETERS');
    }
    
    let annualDepreciation;
    let formula;
    
    if (method === 'STRAIGHT_LINE') {
      annualDepreciation = (cost - salvageValue) / usefulLife;
      formula = 'Annual Depreciation = (Cost - Salvage Value) / Useful Life';
    } else {
      // Método de depreciação acelerada (double declining)
      const rate = 2 / usefulLife;
      annualDepreciation = cost * rate;
      formula = 'Annual Depreciation = Cost × (2 / Useful Life)';
    }
    
    const totalDepreciation = annualDepreciation * usefulLife;
    const bookValue = cost - totalDepreciation;
    
    return {
      cost: parseFloat(cost),
      salvageValue: parseFloat(salvageValue),
      usefulLife: parseFloat(usefulLife),
      method,
      annualDepreciation,
      totalDepreciation,
      bookValue,
      formula
    };
  }
};

/**
 * POST /calculator/calculate
 * Realizar cálculo financeiro
 */
calculator.post('/calculate',
  optionalAuth,
  zValidator('json', calculationSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { type, parameters, description } = c.req.valid('json');

    // Realizar cálculo
    const calculationFunction = calculations[type];
    if (!calculationFunction) {
      throw createError('Tipo de cálculo não suportado', 400, 'INVALID_CALCULATION_TYPE');
    }

    let result;
    try {
      result = calculationFunction(parameters);
    } catch (error: any) {
      if (error.code) {
        throw error;
      }
      throw createError('Erro no cálculo: ' + error.message, 400, 'CALCULATION_ERROR');
    }

    // Salvar histórico se usuário estiver logado
    let historyRecord = null;
    if (user) {
      historyRecord = await prisma.calculationHistory.create({
        data: {
          userId: user.id,
          type,
          parameters,
          result,
          description
        },
        select: {
          id: true,
          type: true,
          description: true,
          createdAt: true
        }
      });
    }

    return c.json({
      success: true,
      data: {
        type,
        parameters,
        result,
        description,
        historyId: historyRecord?.id
      }
    });
  })
);

/**
 * GET /calculator/history
 * Obter histórico de cálculos do usuário
 */
calculator.get('/history',
  authMiddleware,
  zValidator('query', querySchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { page = 1, limit = 10, type, sortBy, sortOrder } = c.req.valid('query');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      userId: user.id
    };
    
    if (type) where.type = type;

    // Buscar histórico
    const [history, total] = await Promise.all([
      prisma.calculationHistory.findMany({
        where,
        select: {
          id: true,
          type: true,
          parameters: true,
          result: true,
          description: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.calculationHistory.count({ where })
    ]);

    return c.json({
      success: true,
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

/**
 * GET /calculator/history/:id
 * Obter cálculo específico do histórico
 */
calculator.get('/history/:id',
  authMiddleware,
  asyncHandler(async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    const calculation = await prisma.calculationHistory.findFirst({
      where: {
        id,
        userId: user.id
      },
      select: {
        id: true,
        type: true,
        parameters: true,
        result: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!calculation) {
      throw createError('Cálculo não encontrado', 404, 'CALCULATION_NOT_FOUND');
    }

    return c.json({
      success: true,
      data: calculation
    });
  })
);

/**
 * DELETE /calculator/history/:id
 * Deletar cálculo do histórico
 */
calculator.delete('/history/:id',
  authMiddleware,
  asyncHandler(async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    const calculation = await prisma.calculationHistory.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!calculation) {
      throw createError('Cálculo não encontrado', 404, 'CALCULATION_NOT_FOUND');
    }

    await prisma.calculationHistory.delete({
      where: { id }
    });

    return c.json({
      success: true,
      message: 'Cálculo removido do histórico'
    });
  })
);

/**
 * GET /calculator/types
 * Obter tipos de cálculo disponíveis
 */
calculator.get('/types',
  asyncHandler(async (c) => {
    const types = [
      {
        type: 'SIMPLE_INTEREST',
        name: 'Juros Simples',
        description: 'Cálculo de juros simples',
        parameters: [
          { name: 'principal', type: 'number', required: true, description: 'Valor principal' },
          { name: 'rate', type: 'number', required: true, description: 'Taxa de juros (%)' },
          { name: 'time', type: 'number', required: true, description: 'Tempo (anos)' }
        ]
      },
      {
        type: 'COMPOUND_INTEREST',
        name: 'Juros Compostos',
        description: 'Cálculo de juros compostos',
        parameters: [
          { name: 'principal', type: 'number', required: true, description: 'Valor principal' },
          { name: 'rate', type: 'number', required: true, description: 'Taxa de juros (%)' },
          { name: 'time', type: 'number', required: true, description: 'Tempo (anos)' },
          { name: 'compound', type: 'number', required: false, description: 'Frequência de capitalização (padrão: 1)' }
        ]
      },
      {
        type: 'LOAN_PAYMENT',
        name: 'Pagamento de Empréstimo',
        description: 'Cálculo de parcelas de empréstimo',
        parameters: [
          { name: 'principal', type: 'number', required: true, description: 'Valor do empréstimo' },
          { name: 'rate', type: 'number', required: true, description: 'Taxa de juros anual (%)' },
          { name: 'time', type: 'number', required: true, description: 'Tempo (anos)' }
        ]
      },
      {
        type: 'INVESTMENT_RETURN',
        name: 'Retorno de Investimento',
        description: 'Cálculo de retorno de investimento',
        parameters: [
          { name: 'initialValue', type: 'number', required: true, description: 'Valor inicial' },
          { name: 'finalValue', type: 'number', required: true, description: 'Valor final' },
          { name: 'time', type: 'number', required: true, description: 'Tempo (anos)' }
        ]
      },
      {
        type: 'TAX_CALCULATION',
        name: 'Cálculo de Impostos',
        description: 'Cálculo de impostos sobre renda',
        parameters: [
          { name: 'income', type: 'number', required: true, description: 'Renda bruta' },
          { name: 'taxRate', type: 'number', required: true, description: 'Taxa de imposto (%)' },
          { name: 'deductions', type: 'number', required: false, description: 'Deduções (padrão: 0)' }
        ]
      },
      {
        type: 'DEPRECIATION',
        name: 'Depreciação',
        description: 'Cálculo de depreciação de ativos',
        parameters: [
          { name: 'cost', type: 'number', required: true, description: 'Custo do ativo' },
          { name: 'salvageValue', type: 'number', required: false, description: 'Valor residual (padrão: 0)' },
          { name: 'usefulLife', type: 'number', required: true, description: 'Vida útil (anos)' },
          { name: 'method', type: 'string', required: false, description: 'Método (STRAIGHT_LINE ou DOUBLE_DECLINING)' }
        ]
      }
    ];

    return c.json({
      success: true,
      data: types
    });
  })
);

export default calculator;