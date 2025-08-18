-- Script de inicialização do banco de dados
-- Este arquivo é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Criar schema público se não existir
CREATE SCHEMA IF NOT EXISTS public;

-- Criar usuário se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'contabil_user') THEN
        CREATE USER contabil_user WITH PASSWORD 'contabil_pass';
    END IF;
END
$$;

-- Garantir que o usuário tenha as permissões necessárias
GRANT ALL PRIVILEGES ON DATABASE contabilidade_igrejinha TO contabil_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO contabil_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO contabil_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO contabil_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO contabil_user;

-- Garantir permissões futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO contabil_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO contabil_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO contabil_user;

-- Configurações de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Comentário informativo
COMMENT ON SCHEMA public IS 'Schema principal para o sistema de contabilidade';