# ==============================================
# Multi-stage Dockerfile para Backend API
# Contabilidade Igrejinha
# ==============================================

# Estágio 1: Build
FROM node:18-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN pnpm prisma generate

# Build da aplicação
RUN pnpm build

# Remover dependências de desenvolvimento
RUN pnpm prune --prod

# ==============================================
# Estágio 2: Runtime
FROM node:18-alpine AS runtime

# Instalar dependências do sistema
RUN apk add --no-cache \
    dumb-init \
    curl \
    tzdata \
    openssl \
    openssl-dev \
    ca-certificates

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos necessários do estágio de build
COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/prisma ./prisma
COPY --from=builder --chown=backend:nodejs /app/package.json ./package.json

# Criar diretórios necessários
RUN mkdir -p uploads logs temp && \
    chown -R backend:nodejs uploads logs temp

# Definir usuário
USER backend

# Expor porta
EXPOSE 3001

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001
ENV API_VERSION=v1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/v1/health || exit 1

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]

# ==============================================
# Estágio 3: Development (opcional)
FROM node:18-alpine AS development

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependências do sistema para desenvolvimento
RUN apk add --no-cache \
    git \
    curl \
    tzdata \
    openssl \
    openssl-dev \
    ca-certificates \
    postgresql-client \
    redis

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Instalar todas as dependências (incluindo dev)
RUN pnpm install --frozen-lockfile

# Gerar cliente Prisma
RUN pnpm prisma generate

# Copiar script de inicialização
COPY scripts/docker-init.sh /usr/local/bin/docker-init.sh
RUN chmod +x /usr/local/bin/docker-init.sh

# Criar diretórios necessários
RUN mkdir -p uploads logs temp

# Expor porta
EXPOSE 3001

# Definir variáveis de ambiente para desenvolvimento
ENV NODE_ENV=development
ENV PORT=3001
ENV API_VERSION=v1

# Comando para desenvolvimento (com hot reload)
CMD ["/usr/local/bin/docker-init.sh", "pnpm", "dev"]

# ==============================================
# INSTRUÇÕES DE USO:
# ==============================================
#
# Build para produção:
# docker build --target runtime -t contabil-backend:latest .
#
# Build para desenvolvimento:
# docker build --target development -t contabil-backend:dev .
#
# Executar produção:
# docker run -p 3001:3001 --env-file .env contabil-backend:latest
#
# Executar desenvolvimento:
# docker run -p 3001:3001 -v $(pwd):/app --env-file .env contabil-backend:dev
#
# Com docker-compose (recomendado):
# docker-compose up -d
# ==============================================