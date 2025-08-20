import { Router } from 'express';
import { calculatorController } from '../controllers/calculatorController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TaxCalculationRequest:
 *       type: object
 *       required:
 *         - income
 *         - deductions
 *         - taxYear
 *       properties:
 *         income:
 *           type: number
 *           minimum: 0
 *           description: Renda bruta anual
 *         deductions:
 *           type: number
 *           minimum: 0
 *           description: Deduções totais
 *         taxYear:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *           description: Ano fiscal
 *         dependents:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Número de dependentes
 *         medicalExpenses:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Gastos médicos
 *         educationExpenses:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Gastos com educação
 *         pensionContributions:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Contribuições previdenciárias
 *     TaxCalculationResult:
 *       type: object
 *       properties:
 *         grossIncome:
 *           type: number
 *           description: Renda bruta
 *         taxableIncome:
 *           type: number
 *           description: Renda tributável
 *         totalDeductions:
 *           type: number
 *           description: Total de deduções
 *         incomeTax:
 *           type: number
 *           description: Imposto de renda devido
 *         netIncome:
 *           type: number
 *           description: Renda líquida
 *         effectiveRate:
 *           type: number
 *           description: Alíquota efetiva (%)
 *         marginalRate:
 *           type: number
 *           description: Alíquota marginal (%)
 *         breakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               bracket:
 *                 type: string
 *               rate:
 *                 type: number
 *               taxableAmount:
 *                 type: number
 *               tax:
 *                 type: number
 *         deductionsBreakdown:
 *           type: object
 *           properties:
 *             standard:
 *               type: number
 *             dependents:
 *               type: number
 *             medical:
 *               type: number
 *             education:
 *               type: number
 *             pension:
 *               type: number
 *             other:
 *               type: number
 *     CompanyTaxRequest:
 *       type: object
 *       required:
 *         - revenue
 *         - expenses
 *         - companyType
 *       properties:
 *         revenue:
 *           type: number
 *           minimum: 0
 *           description: Receita bruta
 *         expenses:
 *           type: number
 *           minimum: 0
 *           description: Despesas operacionais
 *         companyType:
 *           type: string
 *           enum: [MEI, SIMPLES, LUCRO_PRESUMIDO, LUCRO_REAL]
 *           description: Tipo de empresa
 *         employees:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Número de funcionários
 *         sector:
 *           type: string
 *           description: Setor de atividade
 *     PayrollCalculationRequest:
 *       type: object
 *       required:
 *         - grossSalary
 *         - position
 *       properties:
 *         grossSalary:
 *           type: number
 *           minimum: 0
 *           description: Salário bruto
 *         position:
 *           type: string
 *           description: Cargo do funcionário
 *         dependents:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Número de dependentes
 *         transportVoucher:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Vale transporte
 *         mealVoucher:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Vale refeição
 *         healthInsurance:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Plano de saúde
 *         lifeInsurance:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Seguro de vida
 */

/**
 * @swagger
 * /api/v1/calculator/income-tax:
 *   post:
 *     summary: Calcular imposto de renda pessoa física
 *     tags: [Calculadora]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaxCalculationRequest'
 *     responses:
 *       200:
 *         description: Cálculo realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TaxCalculationResult'
 *                 calculatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos para cálculo
 */
router.post('/income-tax', (req, res) => calculatorController.calculateTaxes(req, res));

/**
 * @swagger
 * /api/v1/calculator/company-tax:
 *   post:
 *     summary: Calcular impostos para pessoa jurídica
 *     tags: [Calculadora]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyTaxRequest'
 *     responses:
 *       200:
 *         description: Cálculo realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: number
 *                     expenses:
 *                       type: number
 *                     profit:
 *                       type: number
 *                     taxes:
 *                       type: object
 *                       properties:
 *                         irpj:
 *                           type: number
 *                         csll:
 *                           type: number
 *                         pis:
 *                           type: number
 *                         cofins:
 *                           type: number
 *                         iss:
 *                           type: number
 *                         total:
 *                           type: number
 *                     netProfit:
 *                       type: number
 *                     effectiveRate:
 *                       type: number
 *                 calculatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos para cálculo
 */
router.post('/company-tax', (req, res) => calculatorController.calculateCompanyTax(req, res));

/**
 * @swagger
 * /api/v1/calculator/payroll:
 *   post:
 *     summary: Calcular folha de pagamento
 *     tags: [Calculadora]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayrollCalculationRequest'
 *     responses:
 *       200:
 *         description: Cálculo realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     grossSalary:
 *                       type: number
 *                     deductions:
 *                       type: object
 *                       properties:
 *                         inss:
 *                           type: number
 *                         irrf:
 *                           type: number
 *                         transportVoucher:
 *                           type: number
 *                         healthInsurance:
 *                           type: number
 *                         lifeInsurance:
 *                           type: number
 *                         other:
 *                           type: number
 *                         total:
 *                           type: number
 *                     benefits:
 *                       type: object
 *                       properties:
 *                         mealVoucher:
 *                           type: number
 *                         transportVoucher:
 *                           type: number
 *                         familyAllowance:
 *                           type: number
 *                         total:
 *                           type: number
 *                     netSalary:
 *                       type: number
 *                     employerCosts:
 *                       type: object
 *                       properties:
 *                         inss:
 *                           type: number
 *                         fgts:
 *                           type: number
 *                         rat:
 *                           type: number
 *                         salarioEducacao:
 *                           type: number
 *                         total:
 *                           type: number
 *                     totalCost:
 *                       type: number
 *                 calculatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos para cálculo
 */
router.post('/payroll', (req, res) => calculatorController.calculatePayroll(req, res));

/**
 * @swagger
 * /api/v1/calculator/simples-nacional:
 *   post:
 *     summary: Calcular impostos do Simples Nacional
 *     tags: [Calculadora]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - revenue
 *               - annex
 *             properties:
 *               revenue:
 *                 type: number
 *                 minimum: 0
 *                 description: Receita bruta mensal
 *               annex:
 *                 type: string
 *                 enum: [I, II, III, IV, V]
 *                 description: Anexo do Simples Nacional
 *               accumulatedRevenue:
 *                 type: number
 *                 minimum: 0
 *                 description: Receita acumulada nos últimos 12 meses
 *     responses:
 *       200:
 *         description: Cálculo realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: number
 *                     annex:
 *                       type: string
 *                     bracket:
 *                       type: string
 *                     rate:
 *                       type: number
 *                     tax:
 *                       type: number
 *                     netRevenue:
 *                       type: number
 *                     breakdown:
 *                       type: object
 *                       properties:
 *                         irpj:
 *                           type: number
 *                         csll:
 *                           type: number
 *                         pis:
 *                           type: number
 *                         cofins:
 *                           type: number
 *                         cpp:
 *                           type: number
 *                         icms:
 *                           type: number
 *                         iss:
 *                           type: number
 *                 calculatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos para cálculo
 */
router.post('/simples-nacional', (req, res) => calculatorController.calculateSimplesNacional(req, res));

/**
 * @swagger
 * /api/v1/calculator/depreciation:
 *   post:
 *     summary: Calcular depreciação de bens
 *     tags: [Calculadora]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assetValue
 *               - assetType
 *               - acquisitionDate
 *             properties:
 *               assetValue:
 *                 type: number
 *                 minimum: 0
 *                 description: Valor do bem
 *               assetType:
 *                 type: string
 *                 enum: [BUILDING, MACHINERY, VEHICLE, FURNITURE, COMPUTER, OTHER]
 *                 description: Tipo do bem
 *               acquisitionDate:
 *                 type: string
 *                 format: date
 *                 description: Data de aquisição
 *               residualValue:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *                 description: Valor residual
 *               method:
 *                 type: string
 *                 enum: [LINEAR, ACCELERATED, SUM_OF_YEARS]
 *                 default: LINEAR
 *                 description: Método de depreciação
 *     responses:
 *       200:
 *         description: Cálculo realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     assetValue:
 *                       type: number
 *                     residualValue:
 *                       type: number
 *                     depreciableValue:
 *                       type: number
 *                     usefulLife:
 *                       type: integer
 *                     annualDepreciation:
 *                       type: number
 *                     monthlyDepreciation:
 *                       type: number
 *                     accumulatedDepreciation:
 *                       type: number
 *                     currentValue:
 *                       type: number
 *                     schedule:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           year:
 *                             type: integer
 *                           depreciation:
 *                             type: number
 *                           accumulated:
 *                             type: number
 *                           bookValue:
 *                             type: number
 *                 calculatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos para cálculo
 */
router.post('/depreciation', (req, res) => calculatorController.calculateDepreciation(req, res));

/**
 * @swagger
 * /api/v1/calculator/loan:
 *   post:
 *     summary: Calcular financiamento/empréstimo
 *     tags: [Calculadora]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - principal
 *               - interestRate
 *               - term
 *             properties:
 *               principal:
 *                 type: number
 *                 minimum: 0
 *                 description: Valor principal
 *               interestRate:
 *                 type: number
 *                 minimum: 0
 *                 description: Taxa de juros (% ao mês)
 *               term:
 *                 type: integer
 *                 minimum: 1
 *                 description: Prazo em meses
 *               paymentType:
 *                 type: string
 *                 enum: [SAC, PRICE, AMERICAN]
 *                 default: PRICE
 *                 description: Sistema de amortização
 *     responses:
 *       200:
 *         description: Cálculo realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     principal:
 *                       type: number
 *                     interestRate:
 *                       type: number
 *                     term:
 *                       type: integer
 *                     paymentType:
 *                       type: string
 *                     monthlyPayment:
 *                       type: number
 *                     totalPayment:
 *                       type: number
 *                     totalInterest:
 *                       type: number
 *                     schedule:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: integer
 *                           payment:
 *                             type: number
 *                           principal:
 *                             type: number
 *                           interest:
 *                             type: number
 *                           balance:
 *                             type: number
 *                 calculatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos para cálculo
 */
router.post('/loan', (req, res) => calculatorController.calculateLoan(req, res));

// Rotas administrativas

/**
 * @swagger
 * /api/v1/calculator/history:
 *   get:
 *     summary: Obter histórico de cálculos (Admin)
 *     tags: [Calculadora]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Histórico obtido com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 */
router.get('/history', authenticate, authorize('ADMIN'), (req, res) => calculatorController.getCalculationHistory(req, res));

/**
 * @swagger
 * /api/v1/calculator/statistics:
 *   get:
 *     summary: Obter estatísticas de cálculos (Admin)
 *     tags: [Calculadora]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 */
router.get('/statistics', authenticate, authorize('ADMIN'), (req, res) => calculatorController.getCalculationStatistics(req, res));

export default router;