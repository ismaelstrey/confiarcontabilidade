# Docker Setup - Backend Contabilidade Igrejinha

Este documento explica como configurar e executar o backend usando Docker.

## Pré-requisitos

- Docker
- Docker Compose
- Node.js (para desenvolvimento local)

## Configuração

### 1. Variáveis de Ambiente

O arquivo `.env` já está configurado com as credenciais corretas para o Docker:

```env
DATABASE_URL="postgresql://contabil_user:contabil_pass@localhost:5432/contabilidade_igrejinha?schema=public"
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=contabilidade_igrejinha
DATABASE_USER=contabil_user
DATABASE_PASSWORD=contabil_pass
```

### 2. Serviços Disponíveis

#### PostgreSQL
- **Porta**: 5432
- **Usuário**: contabil_user
- **Senha**: contabil_pass
- **Banco**: contabilidade_igrejinha

#### PgAdmin (Opcional)
- **Porta**: 5050
- **Email**: admin@contabilidade.com
- **Senha**: admin123
- **URL**: http://localhost:5050

## Comandos

### Iniciar os serviços
```bash
docker-compose up -d
```

### Parar os serviços
```bash
docker-compose down
```

### Ver logs
```bash
docker-compose logs -f
```

### Reiniciar apenas o PostgreSQL
```bash
docker-compose restart postgres
```

### Executar migrações do Prisma
```bash
# Após iniciar o banco
npx prisma migrate dev
```

### Acessar o container PostgreSQL
```bash
docker exec -it contabilidade_postgres psql -U contabil_user -d contabilidade_igrejinha
```

## Estrutura dos Volumes

- `postgres_data`: Dados persistentes do PostgreSQL
- `pgadmin_data`: Configurações do PgAdmin

## Rede

Todos os serviços estão na rede `contabilidade_network` para comunicação interna.

## Troubleshooting

### Problema de conexão
1. Verifique se o Docker está rodando
2. Confirme que as portas não estão em uso
3. Verifique os logs: `docker-compose logs postgres`

### Reset completo
```bash
docker-compose down -v
docker-compose up -d
```

### Backup do banco
```bash
docker exec contabilidade_postgres pg_dump -U contabil_user contabilidade_igrejinha > backup.sql
```

### Restaurar backup
```bash
docker exec -i contabilidade_postgres psql -U contabil_user contabilidade_igrejinha < backup.sql
```