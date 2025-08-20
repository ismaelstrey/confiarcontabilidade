#!/bin/sh
# ==============================================
# Script de Inicialização Docker
# Contabilidade Igrejinha Backend
# ==============================================

set -e

echo "🐳 Iniciando configuração do container..."

# Aguardar PostgreSQL estar disponível
echo "⏳ Aguardando PostgreSQL..."
until pg_isready -h postgres -p 5432 -U $POSTGRES_USER; do
  echo "PostgreSQL não está pronto - aguardando..."
  sleep 2
done
echo "✅ PostgreSQL está pronto!"

# Aguardar Redis estar disponível
echo "⏳ Aguardando Redis..."
until redis-cli -h redis ping; do
  echo "Redis não está pronto - aguardando..."
  sleep 2
done
echo "✅ Redis está pronto!"

# Executar migrações do Prisma
echo "🔄 Executando migrações do Prisma..."
pnpm prisma migrate deploy

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
pnpm prisma generate

# Executar seeds (se existir)
if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
  echo "🌱 Executando seeds..."
  pnpm prisma db seed
fi

echo "🚀 Container configurado com sucesso!"
echo "📚 Swagger disponível em: http://localhost:3001/api-docs"
echo "🗄️ PgAdmin disponível em: http://localhost:5050"
echo "📧 MailHog disponível em: http://localhost:8025"

# Iniciar aplicação
echo "🎯 Iniciando aplicação..."
exec "$@"