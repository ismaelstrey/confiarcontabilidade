# Script de Configuracao Inicial - Backend API
# Contabilidade Igrejinha

Write-Host "Iniciando configuracao do ambiente de desenvolvimento..." -ForegroundColor Green
Write-Host ""

# Verificar Node.js
Write-Host "Verificando pre-requisitos..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
    
    $versionNumber = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($versionNumber.Split('.')[0])
    
    if ($majorVersion -lt 18) {
        Write-Host "Node.js versao 18.0.0 ou superior e necessaria!" -ForegroundColor Red
        Write-Host "Versao atual: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Node.js nao encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Node.js 18.0.0+" -ForegroundColor Yellow
    exit 1
}

# Verificar pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Host "pnpm encontrado: v$pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "pnpm nao encontrado! Instalando..." -ForegroundColor Yellow
    npm install -g pnpm
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Falha ao instalar pnpm!" -ForegroundColor Red
        exit 1
    }
    
    $pnpmVersion = pnpm --version
    Write-Host "pnpm instalado: v$pnpmVersion" -ForegroundColor Green
}

Write-Host ""

# Configurar .env
Write-Host "Configurando variaveis de ambiente..." -ForegroundColor Yellow

if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Arquivo .env criado a partir do .env.example" -ForegroundColor Green
        Write-Host "IMPORTANTE: Revise e ajuste as configuracoes no arquivo .env" -ForegroundColor Yellow
    } else {
        Write-Host "Arquivo .env.example nao encontrado!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Arquivo .env ja existe" -ForegroundColor Green
}

Write-Host ""

# Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha ao instalar dependencias!" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencias instaladas com sucesso!" -ForegroundColor Green
Write-Host ""

# Configurar Prisma
Write-Host "Configurando banco de dados..." -ForegroundColor Yellow

# Gerar cliente Prisma
pnpm prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha ao gerar cliente Prisma!" -ForegroundColor Red
    exit 1
}

Write-Host "Cliente Prisma gerado!" -ForegroundColor Green

# Aplicar schema
pnpm prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha ao aplicar schema do banco!" -ForegroundColor Red
    exit 1
}

Write-Host "Schema do banco aplicado!" -ForegroundColor Green

# Criar diretorios
Write-Host "Criando diretorios necessarios..." -ForegroundColor Yellow

$directories = @(
    "uploads",
    "uploads\images",
    "uploads\documents",
    "logs",
    "temp"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Diretorio criado: $dir" -ForegroundColor Green
    } else {
        Write-Host "Diretorio ja existe: $dir" -ForegroundColor Green
    }
}

Write-Host ""

# Verificar Redis
Write-Host "Verificando servicos opcionais..." -ForegroundColor Yellow

try {
    $redisTest = Test-NetConnection -ComputerName "localhost" -Port 6379 -WarningAction SilentlyContinue
    if ($redisTest.TcpTestSucceeded) {
        Write-Host "Redis esta rodando na porta 6379" -ForegroundColor Green
    } else {
        Write-Host "Redis nao esta rodando (cache desabilitado)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Nao foi possivel verificar Redis" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "CONFIGURACAO CONCLUIDA!" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Revise o arquivo .env e ajuste as configuracoes" -ForegroundColor White
Write-Host "2. Configure um banco PostgreSQL para producao" -ForegroundColor White
Write-Host "3. Configure Redis para cache (opcional)" -ForegroundColor White
Write-Host "4. Execute 'pnpm dev' para iniciar o servidor" -ForegroundColor White
Write-Host "5. Acesse http://localhost:3001/api-docs para ver a documentacao" -ForegroundColor White
Write-Host ""
Write-Host "COMANDOS UTEIS:" -ForegroundColor Cyan
Write-Host "pnpm dev          - Iniciar servidor de desenvolvimento" -ForegroundColor White
Write-Host "pnpm build        - Compilar para producao" -ForegroundColor White
Write-Host "pnpm start        - Iniciar servidor de producao" -ForegroundColor White
Write-Host "pnpm test         - Executar todos os testes" -ForegroundColor White
Write-Host "pnpm db:studio    - Abrir Prisma Studio" -ForegroundColor White
Write-Host "pnpm lint         - Verificar codigo" -ForegroundColor White
Write-Host "pnpm format       - Formatar codigo" -ForegroundColor White
Write-Host ""
Write-Host "DOCUMENTACAO:" -ForegroundColor Cyan
Write-Host "- API Docs: http://localhost:3001/api-docs" -ForegroundColor White
Write-Host "- Roadmap: ./documentacao/ROADMAP-DESENVOLVIMENTO.md" -ForegroundColor White
Write-Host "- Backend Docs: ./documentacao/BACKEND-DOCUMENTATION.md" -ForegroundColor White
Write-Host ""