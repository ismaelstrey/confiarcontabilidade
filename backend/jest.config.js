/**
 * Configuração do Jest para Contabilidade Igrejinha Backend
 */

module.exports = {
  // Preset para TypeScript
  preset: 'ts-jest',
  
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Diretório raiz dos testes
  rootDir: './',
  
  // Padrões de arquivos de teste
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/tests/**/*.test.ts'
  ],
  
  // Arquivos a serem ignorados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/logs/',
    '/uploads/',
    '/temp/'
  ],
  
  // Extensões de arquivo suportadas
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transformações
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  
  // Configuração do ts-jest
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // Mapeamento de módulos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1'
  },
  
  // Arquivos de configuração antes dos testes
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],
  
  // Configuração de cobertura (temporariamente desabilitada)
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // Arquivos para coleta de cobertura
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/config/database.ts',
    '!src/**/__tests__/**',
    '!src/tests/**'
  ],
  
  // Thresholds de cobertura (temporariamente desabilitado)
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70
  //   }
  // },
  
  // Configurações adicionais
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  maxWorkers: '50%',
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 30000
};