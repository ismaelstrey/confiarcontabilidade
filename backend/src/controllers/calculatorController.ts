import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Interface para dados de cálculo fiscal
interface TaxCalculationRequest {
  income: number;
  deductions: number;
  taxYear: number;
  dependents?: number;
  medicalExpenses?: number;
  educationExpenses?: number;
  pensionContributions?: number;
}

interface TaxCalculationResult {
  grossIncome: number;
  taxableIncome: number;
  incomeTax: number;
  socialSecurity: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  marginalRate: number;
  breakdown: {
    federalTax: number;
    stateTax: number;
    municipalTax: number;
  };
}

/**
 * Controller responsável pelos cálculos fiscais
 */
export class CalculatorController {
  /**
   * Calcula impostos com base nos dados fornecidos
   */
  async calculateTaxes(req: Request, res: Response): Promise<void> {
    try {
      const {
        income,
        deductions,
        taxYear,
        dependents = 0,
        medicalExpenses = 0,
        educationExpenses = 0,
        pensionContributions = 0
      }: TaxCalculationRequest = req.body;

      // Validações básicas
      if (income < 0 || deductions < 0) {
        res.status(400).json({
          success: false,
          message: 'Renda e deduções devem ser valores positivos'
        });
        return;
      }

      if (taxYear < 2020 || taxYear > 2030) {
        res.status(400).json({
          success: false,
          message: 'Ano fiscal deve estar entre 2020 e 2030'
        });
        return;
      }

      // Cálculo da renda tributável
      const totalDeductions = deductions + medicalExpenses + educationExpenses + pensionContributions;
      const dependentDeduction = dependents * 2275.08; // Valor para 2024
      const taxableIncome = Math.max(0, income - totalDeductions - dependentDeduction);

      // Cálculo do Imposto de Renda (tabela progressiva 2024)
      let incomeTax = 0;
      if (taxableIncome > 22847.76) {
        if (taxableIncome <= 33919.80) {
          incomeTax = (taxableIncome - 22847.76) * 0.075;
        } else if (taxableIncome <= 45012.60) {
          incomeTax = (33919.80 - 22847.76) * 0.075 + (taxableIncome - 33919.80) * 0.15;
        } else if (taxableIncome <= 55976.16) {
          incomeTax = (33919.80 - 22847.76) * 0.075 + (45012.60 - 33919.80) * 0.15 + (taxableIncome - 45012.60) * 0.225;
        } else {
          incomeTax = (33919.80 - 22847.76) * 0.075 + (45012.60 - 33919.80) * 0.15 + (55976.16 - 45012.60) * 0.225 + (taxableIncome - 55976.16) * 0.275;
        }
      }

      // Cálculo da Previdência Social (INSS)
      let socialSecurity = 0;
      const inssLimit = 7507.49; // Teto INSS 2024
      const inssBase = Math.min(income, inssLimit);
      
      if (inssBase <= 1412.00) {
        socialSecurity = inssBase * 0.075;
      } else if (inssBase <= 2666.68) {
        socialSecurity = 1412.00 * 0.075 + (inssBase - 1412.00) * 0.09;
      } else if (inssBase <= 4000.03) {
        socialSecurity = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (inssBase - 2666.68) * 0.12;
      } else {
        socialSecurity = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (4000.03 - 2666.68) * 0.12 + (inssBase - 4000.03) * 0.14;
      }

      // Estimativa de impostos estaduais e municipais (valores aproximados)
      const stateTax = taxableIncome * 0.02; // ICMS estimado
      const municipalTax = taxableIncome * 0.005; // ISS estimado
      const federalTax = incomeTax;

      const totalTax = incomeTax + socialSecurity + stateTax + municipalTax;
      const netIncome = income - totalTax;
      const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
      const marginalRate = this.calculateMarginalRate(taxableIncome);

      const result: TaxCalculationResult = {
        grossIncome: income,
        taxableIncome,
        incomeTax,
        socialSecurity,
        totalTax,
        netIncome,
        effectiveRate: Math.round(effectiveRate * 100) / 100,
        marginalRate,
        breakdown: {
          federalTax,
          stateTax,
          municipalTax
        }
      };

      // Salvar histórico do cálculo
      try {
        await prisma.calculationHistory.create({
          data: {
            income,
            deductions: totalDeductions,
            taxYear,
            dependents,
            result: JSON.stringify(result),
            ipAddress: req.ip || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown'
          }
        });
      } catch (error) {
        logger.warn('Erro ao salvar histórico de cálculo:', error);
      }

      res.status(200).json({
        success: true,
        message: 'Cálculo realizado com sucesso',
        data: result
      });

    } catch (error) {
      logger.error('Erro no cálculo de impostos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Calcula a alíquota marginal
   */
  private calculateMarginalRate(taxableIncome: number): number {
    if (taxableIncome <= 22847.76) return 0;
    if (taxableIncome <= 33919.80) return 7.5;
    if (taxableIncome <= 45012.60) return 15;
    if (taxableIncome <= 55976.16) return 22.5;
    return 27.5;
  }

  /**
   * Obtém histórico de cálculos (Admin)
   */
  async getCalculationHistory(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [calculations, total] = await Promise.all([
        prisma.calculationHistory.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            income: true,
            deductions: true,
            taxYear: true,
            dependents: true,
            result: true,
            createdAt: true,
            ipAddress: true
          }
        }),
        prisma.calculationHistory.count()
      ]);

      const formattedCalculations = calculations.map(calc => ({
        ...calc,
        result: JSON.parse(calc.result as string)
      }));

      res.status(200).json({
        success: true,
        message: 'Histórico obtido com sucesso',
        data: {
          calculations: formattedCalculations,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao obter histórico de cálculos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém estatísticas de cálculos (Admin)
   */
  async getCalculationStatistics(req: Request, res: Response): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [totalCalculations, recentCalculations, avgIncome] = await Promise.all([
        prisma.calculationHistory.count(),
        prisma.calculationHistory.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        }),
        prisma.calculationHistory.aggregate({
          _avg: {
            income: true
          }
        })
      ]);

      // Estatísticas por ano fiscal
      const yearlyStats = await prisma.calculationHistory.groupBy({
        by: ['taxYear'],
        _count: {
          id: true
        },
        _avg: {
          income: true
        },
        orderBy: {
          taxYear: 'desc'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: {
          totalCalculations,
          recentCalculations,
          averageIncome: avgIncome._avg.income || 0,
          yearlyStatistics: yearlyStats.map(stat => ({
            year: stat.taxYear,
            calculations: stat._count.id,
            averageIncome: stat._avg.income || 0
          }))
        }
      });

    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Calcula impostos para pessoa jurídica
   */
  async calculateCompanyTax(req: Request, res: Response): Promise<void> {
    try {
      const { revenue, expenses, regime, employees } = req.body;

      if (!revenue || revenue < 0) {
        res.status(400).json({
          success: false,
          message: 'Receita deve ser um valor positivo'
        });
        return;
      }

      const profit = revenue - (expenses || 0);
      let taxes = 0;
      let breakdown = {};

      switch (regime) {
        case 'simples':
          taxes = revenue * 0.06; // Aproximação Simples Nacional
          breakdown = { simplesNacional: taxes };
          break;
        case 'lucro_presumido':
          const irpj = profit * 0.15;
          const csll = profit * 0.09;
          const pis = revenue * 0.0065;
          const cofins = revenue * 0.03;
          taxes = irpj + csll + pis + cofins;
          breakdown = { irpj, csll, pis, cofins };
          break;
        case 'lucro_real':
          const irpjReal = profit * 0.25;
          const csllReal = profit * 0.09;
          const pisReal = revenue * 0.0165;
          const cofinsReal = revenue * 0.076;
          taxes = irpjReal + csllReal + pisReal + cofinsReal;
          breakdown = { irpj: irpjReal, csll: csllReal, pis: pisReal, cofins: cofinsReal };
          break;
        default:
          taxes = profit * 0.15;
          breakdown = { estimado: taxes };
      }

      res.status(200).json({
        success: true,
        message: 'Cálculo de impostos PJ realizado com sucesso',
        data: {
          revenue,
          expenses: expenses || 0,
          profit,
          taxes,
          netProfit: profit - taxes,
          effectiveRate: revenue > 0 ? (taxes / revenue) * 100 : 0,
          breakdown
        }
      });

    } catch (error) {
      logger.error('Erro no cálculo de impostos PJ:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Calcula folha de pagamento
   */
  async calculatePayroll(req: Request, res: Response): Promise<void> {
    try {
      const { salary, benefits, employees } = req.body;

      if (!salary || salary < 0) {
        res.status(400).json({
          success: false,
          message: 'Salário deve ser um valor positivo'
        });
        return;
      }

      const employeeCount = employees || 1;
      const totalSalary = salary * employeeCount;
      const totalBenefits = (benefits || 0) * employeeCount;
      
      // Cálculos de encargos
      const inss = totalSalary * 0.20; // INSS patronal
      const fgts = totalSalary * 0.08;
      const rat = totalSalary * 0.02; // Risco de Acidente de Trabalho
      const salarioEducacao = totalSalary * 0.025;
      const incra = totalSalary * 0.002;
      const sebrae = totalSalary * 0.006;
      const sesi = totalSalary * 0.015;
      const senai = totalSalary * 0.01;
      
      const totalEncargos = inss + fgts + rat + salarioEducacao + incra + sebrae + sesi + senai;
      const totalCost = totalSalary + totalBenefits + totalEncargos;

      res.status(200).json({
        success: true,
        message: 'Cálculo de folha de pagamento realizado com sucesso',
        data: {
          employees: employeeCount,
          grossSalary: totalSalary,
          benefits: totalBenefits,
          encargos: {
            inss,
            fgts,
            rat,
            salarioEducacao,
            incra,
            sebrae,
            sesi,
            senai,
            total: totalEncargos
          },
          totalCost,
          costPerEmployee: totalCost / employeeCount
        }
      });

    } catch (error) {
      logger.error('Erro no cálculo de folha de pagamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Calcula Simples Nacional
   */
  async calculateSimplesNacional(req: Request, res: Response): Promise<void> {
    try {
      const { revenue, activity, last12Months } = req.body;

      if (!revenue || revenue < 0) {
        res.status(400).json({
          success: false,
          message: 'Receita deve ser um valor positivo'
        });
        return;
      }

      const annualRevenue = last12Months || revenue * 12;
      let aliquota = 0;
      let anexo = 'I';

      // Determinar anexo e alíquota baseado na atividade e faturamento
      if (activity === 'comercio') {
        anexo = 'I';
        if (annualRevenue <= 180000) aliquota = 4.0;
        else if (annualRevenue <= 360000) aliquota = 7.3;
        else if (annualRevenue <= 720000) aliquota = 9.5;
        else if (annualRevenue <= 1800000) aliquota = 10.7;
        else if (annualRevenue <= 3600000) aliquota = 14.3;
        else aliquota = 19.0;
      } else if (activity === 'industria') {
        anexo = 'II';
        if (annualRevenue <= 180000) aliquota = 4.5;
        else if (annualRevenue <= 360000) aliquota = 7.8;
        else if (annualRevenue <= 720000) aliquota = 10.0;
        else if (annualRevenue <= 1800000) aliquota = 11.2;
        else if (annualRevenue <= 3600000) aliquota = 14.7;
        else aliquota = 30.0;
      } else {
        anexo = 'III';
        if (annualRevenue <= 180000) aliquota = 6.0;
        else if (annualRevenue <= 360000) aliquota = 11.2;
        else if (annualRevenue <= 720000) aliquota = 13.5;
        else if (annualRevenue <= 1800000) aliquota = 16.0;
        else if (annualRevenue <= 3600000) aliquota = 21.0;
        else aliquota = 33.0;
      }

      const tax = revenue * (aliquota / 100);
      const netRevenue = revenue - tax;

      res.status(200).json({
        success: true,
        message: 'Cálculo Simples Nacional realizado com sucesso',
        data: {
          revenue,
          annualRevenue,
          activity,
          anexo,
          aliquota,
          tax,
          netRevenue,
          effectiveRate: aliquota
        }
      });

    } catch (error) {
      logger.error('Erro no cálculo Simples Nacional:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Calcula depreciação de ativos
   */
  async calculateDepreciation(req: Request, res: Response): Promise<void> {
    try {
      const { assetValue, assetType, usefulLife, method } = req.body;

      if (!assetValue || assetValue < 0) {
        res.status(400).json({
          success: false,
          message: 'Valor do ativo deve ser positivo'
        });
        return;
      }

      let years = usefulLife;
      if (!years) {
        // Vida útil padrão por tipo de ativo
        switch (assetType) {
          case 'veiculo': years = 5; break;
          case 'equipamento': years = 10; break;
          case 'movel': years = 10; break;
          case 'imovel': years = 25; break;
          case 'computador': years = 5; break;
          default: years = 10;
        }
      }

      let annualDepreciation = 0;
      let monthlyDepreciation = 0;
      let schedule = [];

      if (method === 'acelerada') {
        // Depreciação acelerada (dobro da taxa normal)
        annualDepreciation = (assetValue / years) * 2;
        monthlyDepreciation = annualDepreciation / 12;
        years = Math.ceil(years / 2);
      } else {
        // Depreciação linear (método padrão)
        annualDepreciation = assetValue / years;
        monthlyDepreciation = annualDepreciation / 12;
      }

      // Gerar cronograma de depreciação
      let remainingValue = assetValue;
      for (let year = 1; year <= years; year++) {
        const yearDepreciation = Math.min(annualDepreciation, remainingValue);
        remainingValue -= yearDepreciation;
        schedule.push({
          year,
          depreciation: yearDepreciation,
          accumulatedDepreciation: assetValue - remainingValue,
          remainingValue
        });
      }

      res.status(200).json({
        success: true,
        message: 'Cálculo de depreciação realizado com sucesso',
        data: {
          assetValue,
          assetType,
          usefulLife: years,
          method: method || 'linear',
          annualDepreciation,
          monthlyDepreciation,
          totalDepreciation: assetValue,
          schedule
        }
      });

    } catch (error) {
      logger.error('Erro no cálculo de depreciação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Calcula financiamento/empréstimo
   */
  async calculateLoan(req: Request, res: Response): Promise<void> {
    try {
      const { principal, interestRate, months, type } = req.body;

      if (!principal || principal <= 0) {
        res.status(400).json({
          success: false,
          message: 'Valor principal deve ser positivo'
        });
        return;
      }

      if (!interestRate || interestRate < 0) {
        res.status(400).json({
          success: false,
          message: 'Taxa de juros deve ser positiva'
        });
        return;
      }

      if (!months || months <= 0) {
        res.status(400).json({
          success: false,
          message: 'Número de parcelas deve ser positivo'
        });
        return;
      }

      const monthlyRate = interestRate / 100 / 12;
      let monthlyPayment = 0;
      let totalInterest = 0;
      let schedule = [];

      if (type === 'sac') {
        // Sistema de Amortização Constante (SAC)
        const amortization = principal / months;
        let balance = principal;
        
        for (let month = 1; month <= months; month++) {
          const interest = balance * monthlyRate;
          const payment = amortization + interest;
          balance -= amortization;
          totalInterest += interest;
          
          schedule.push({
            month,
            payment: Math.round(payment * 100) / 100,
            principal: Math.round(amortization * 100) / 100,
            interest: Math.round(interest * 100) / 100,
            balance: Math.round(balance * 100) / 100
          });
        }
        
        monthlyPayment = schedule[0]?.payment || 0;
      } else {
        // Sistema Price (parcelas fixas)
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        let balance = principal;
        
        for (let month = 1; month <= months; month++) {
          const interest = balance * monthlyRate;
          const principalPayment = monthlyPayment - interest;
          balance -= principalPayment;
          totalInterest += interest;
          
          schedule.push({
            month,
            payment: Math.round(monthlyPayment * 100) / 100,
            principal: Math.round(principalPayment * 100) / 100,
            interest: Math.round(interest * 100) / 100,
            balance: Math.round(Math.max(0, balance) * 100) / 100
          });
        }
      }

      const totalAmount = principal + totalInterest;

      res.status(200).json({
        success: true,
        message: 'Cálculo de financiamento realizado com sucesso',
        data: {
          principal,
          interestRate,
          months,
          type: type || 'price',
          monthlyPayment: Math.round(monthlyPayment * 100) / 100,
          totalInterest: Math.round(totalInterest * 100) / 100,
          totalAmount: Math.round(totalAmount * 100) / 100,
          schedule
        }
      });

    } catch (error) {
      logger.error('Erro no cálculo de financiamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

// Instância do controller
export const calculatorController = new CalculatorController();