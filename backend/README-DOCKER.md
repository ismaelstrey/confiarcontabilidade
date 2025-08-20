# Docker Compose - Contabilidade Igrejinha Backend

Este documento explica como usar o Docker Compose para executar o backend da aplicação Contabilidade Igrejinha.

## Pré-requisitos

- Docker
- Docker Compose
- Arquivo `.env` configurado (copie de `.env.example`)

## Configuração

### 1. Configurar variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env conforme necessário
```

### 2. Variáveis importantes no .env

```env
# Database
POSTGRES_DB=contabil_db
POSTGRES_USER=contabil
POSTGRES_PASSWORD=contabil123
DATABASE_URL="postgresql://contabil:contabil123@postgres:5432/contabil_db"

# Redis
REDIS_URL="redis://redis:6379"

# PgAdmin
PGADMIN_DEFAULT_EMAIL=admin@contabilidade.com
PGADMIN_DEFAULT_PASSWORD=admin123

# Mailhog
MAILHOG_SMTP_PORT=1025
MAILHOG_WEB_PORT=8025
```

## Comandos

### Iniciar todos os serviços

```bash
docker-compose up -d
```

### Iniciar com logs visíveis

```bash
docker-compose up
```

### Parar todos os serviços

```bash
docker-compose down
```

### Rebuild e restart

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Ver logs de um serviço específico

```bash
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

## Serviços Disponíveis

### Backend API
- **URL**: http://localhost:3001
- **Swagger**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/api/v1/health

### PostgreSQL Database
- **Host**: localhost
- **Port**: 5432
- **Database**: contabil_db
- **User**: contabil
- **Password**: contabil123

### PgAdmin (Database Management)
- **URL**: http://localhost:5050
- **Email**: admin@contabilidade.com
- **Password**: admin123

### Redis Cache
- **Host**: localhost
- **Port**: 6379

### Mailhog (Email Testing)
- **SMTP**: localhost:1025
- **Web UI**: http://localhost:8025

## Volumes

Os seguintes volumes são criados para persistir dados:

- `postgres_data`: Dados do PostgreSQL
- `pgadmin_data`: Configurações do PgAdmin
- `redis_data`: Dados do Redis
- `uploads_data`: Arquivos de upload
- `logs_data`: Logs da aplicação

## Troubleshooting

### Problema: Erro de conexão com o banco

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar apenas o PostgreSQL
docker-compose restart postgres
```

### Problema: Erro de permissão nos volumes

```bash
# Limpar volumes e recriar
docker-compose down -v
docker-compose up -d
```

### Problema: Backend não conecta aos serviços

```bash
# Verificar se todos os serviços estão rodando
docker-compose ps

# Verificar logs do backend
docker-compose logs backend

# Reiniciar o backend
docker-compose restart backend
```

### Resetar tudo

```bash
# CUIDADO: Isso remove todos os dados!
docker-compose down -v
docker system prune -f
docker-compose up -d
```

## Desenvolvimento

### Executar migrações do Prisma

```bash
# Entrar no container do backend
docker-compose exec backend bash

# Executar migrações
npx prisma migrate dev

# Gerar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio
```

### Instalar novas dependências

```bash
# Entrar no container
docker-compose exec backend bash

# Instalar dependência
pnpm add nome-da-dependencia

# Rebuild o container
docker-compose build backend
docker-compose restart backend
```

## Produção

Para produção, considere:

1. Alterar todas as senhas padrão
2. Usar PostgreSQL externo (não em container)
3. Usar Redis externo (não em container)
4. Configurar SSL/TLS
5. Configurar backup automático
6. Usar secrets do Docker para senhas
7. Configurar monitoramento e logs centralizados

## Variáveis de Ambiente Importantes

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NODE_ENV` | Ambiente de execução | `development` |
| `PORT` | Porta do backend | `3001` |
| `DATABASE_URL` | URL de conexão do banco | - |
| `REDIS_URL` | URL de conexão do Redis | - |
| `JWT_SECRET` | Chave secreta JWT | - |
| `CORS_ORIGIN` | URLs permitidas CORS | - |
| `LOG_LEVEL` | Nível de log | `info` |
| `SWAGGER_ENABLED` | Habilitar Swagger | `true` |

## Monitoramento

### Health Checks

Todos os serviços possuem health checks configurados:

- **Backend**: `GET /api/v1/health`
- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`

### Verificar status

```bash
# Ver status de todos os serviços
docker-compose ps

# Ver health status
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```