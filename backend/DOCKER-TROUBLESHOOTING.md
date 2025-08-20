# 🐳 Docker Troubleshooting - Contabilidade Igrejinha Backend

## 🚨 Problema Identificado

O erro que você está enfrentando é causado por:

1. **Configuração incorreta do banco de dados**: O arquivo `.env` está configurado para SQLite, mas o Docker está configurado para PostgreSQL
2. **Problema com OpenSSL**: O Prisma não consegue detectar a versão correta do OpenSSL no container Alpine
3. **Inicialização inadequada**: O container não aguarda os serviços dependentes (PostgreSQL e Redis) estarem prontos

## ✅ Soluções Implementadas

### 1. Arquivo de Configuração Docker
- Criado `.env.docker` com configurações específicas para Docker
- Configurado PostgreSQL como banco de dados principal
- Ajustadas URLs de Redis e outros serviços para usar nomes dos containers

### 2. Dockerfile Atualizado
- Adicionado OpenSSL e dependências necessárias
- Incluído PostgreSQL client e Redis client
- Adicionado script de inicialização personalizado

### 3. Script de Inicialização
- Aguarda PostgreSQL e Redis estarem disponíveis
- Executa migrações do Prisma automaticamente
- Gera cliente Prisma no container
- Executa seeds se disponíveis

### 4. Docker Compose Atualizado
- Configurado para usar `.env.docker`
- Adicionadas variáveis de ambiente específicas do OpenSSL
- Configurados health checks para todos os serviços

## 🚀 Como Executar

### Passo 1: Parar containers existentes
```bash
docker-compose down -v
```

### Passo 2: Limpar imagens antigas
```bash
docker system prune -a
```

### Passo 3: Rebuild e executar
```bash
docker-compose up --build -d
```

### Passo 4: Verificar logs
```bash
docker-compose logs -f backend
```

## 📋 Verificações de Saúde

### Verificar se todos os serviços estão rodando:
```bash
docker-compose ps
```

### Verificar logs específicos:
```bash
# Backend
docker-compose logs backend

# PostgreSQL
docker-compose logs postgres

# Redis
docker-compose logs redis
```

### Testar conectividade:
```bash
# Testar API
curl http://localhost:3001/api/v1/health

# Testar PostgreSQL
docker-compose exec postgres pg_isready -U contabil_user -d contabil_db

# Testar Redis
docker-compose exec redis redis-cli ping
```

## 🔧 Comandos Úteis

### Executar migrações manualmente:
```bash
docker-compose exec backend pnpm prisma migrate deploy
```

### Acessar container do backend:
```bash
docker-compose exec backend sh
```

### Resetar banco de dados:
```bash
docker-compose exec backend pnpm prisma migrate reset
```

### Ver estrutura do banco:
```bash
docker-compose exec backend pnpm prisma studio
```

## 🌐 Acessos Web

- **API Backend**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api-docs
- **PgAdmin**: http://localhost:5050
  - Email: admin@contabilidadeigrejinha.com
  - Senha: admin123
- **MailHog**: http://localhost:8025

## 🐛 Troubleshooting Adicional

### Se ainda houver problemas com OpenSSL:
```bash
# Verificar versão do OpenSSL no container
docker-compose exec backend openssl version

# Verificar engines do Prisma
docker-compose exec backend ls -la node_modules/.prisma/client/
```

### Se houver problemas de permissão:
```bash
# Ajustar permissões dos volumes
sudo chown -R $USER:$USER uploads logs
```

### Para desenvolvimento local (sem Docker):
- Use o arquivo `.env` original
- Execute: `pnpm install && pnpm prisma generate && pnpm dev`

## 📝 Notas Importantes

1. **Ambiente de Desenvolvimento**: Use `.env.docker` apenas para Docker
2. **Ambiente Local**: Use `.env` para desenvolvimento local
3. **Produção**: Crie `.env.production` com configurações seguras
4. **Backup**: Sempre faça backup dos dados antes de resetar o banco

## 🆘 Se o Problema Persistir

1. Verifique se todas as portas estão disponíveis (3001, 5432, 6379, 5050, 8025)
2. Certifique-se de que o Docker tem recursos suficientes (RAM/CPU)
3. Verifique os logs detalhados: `docker-compose logs --tail=100 backend`
4. Tente executar em modo de desenvolvimento local primeiro
5. Verifique se não há conflitos com outras instâncias do PostgreSQL/Redis