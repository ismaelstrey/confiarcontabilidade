# Contabilidade Igrejinha

Sistema de contabilidade especializado para igrejas e organizações religiosas, oferecendo serviços de contabilidade, calculadora de impostos, blog informativo e área de contato.

## Visão Geral

Este projeto consiste em uma aplicação web completa com frontend em React e backend em Node.js, projetada para atender às necessidades específicas de igrejas e organizações religiosas na área contábil.

### Principais Funcionalidades

- **Autenticação e Gerenciamento de Usuários**: Sistema completo de registro, login e perfis de usuário.
- **Calculadora de Impostos**: Ferramenta para cálculo de impostos específicos para organizações religiosas.
- **Blog Informativo**: Artigos e conteúdos relevantes sobre contabilidade para igrejas.
- **Formulário de Contato**: Canal de comunicação direto com a equipe de contabilidade.
- **Painel Administrativo**: Gerenciamento de usuários, contatos, artigos e serviços.
- **Área do Cliente**: Acesso a informações e histórico de cálculos de impostos.

## Tecnologias Utilizadas

### Backend

- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para Node.js
- **TypeScript**: Superset tipado de JavaScript
- **Prisma**: ORM para acesso ao banco de dados
- **PostgreSQL**: Banco de dados relacional
- **JWT**: Autenticação baseada em tokens
- **Zod**: Validação de esquemas
- **Swagger**: Documentação da API
- **Jest**: Framework de testes
- **PM2**: Gerenciador de processos para Node.js

### Frontend

- **React**: Biblioteca para construção de interfaces de usuário
- **TypeScript**: Superset tipado de JavaScript
- **Vite**: Bundler e servidor de desenvolvimento
- **Tailwind CSS**: Framework CSS utilitário
- **React Router DOM**: Biblioteca para gerenciamento de rotas
- **React Query**: Biblioteca para gerenciamento de estado do servidor e cache
- **Framer Motion**: Biblioteca para animações
- **Axios**: Cliente HTTP para requisições à API

## Estrutura do Projeto

O projeto segue uma arquitetura cliente-servidor, com uma clara separação entre frontend e backend:

```
/
├── backend/                # Código-fonte do backend
│   ├── prisma/            # Esquema e migrações do Prisma
│   ├── src/               # Código-fonte da aplicação backend
│   │   ├── config/        # Configurações da aplicação
│   │   ├── controllers/   # Controladores da API
│   │   ├── middlewares/   # Middlewares do Express
│   │   ├── repositories/  # Camada de acesso a dados
│   │   ├── routes/        # Definição de rotas
│   │   ├── services/      # Lógica de negócios
│   │   ├── utils/         # Utilitários e helpers
│   │   ├── validators/    # Validadores de dados (Zod)
│   │   ├── docs/          # Documentação Swagger
│   │   ├── types/         # Tipos e interfaces TypeScript
│   │   ├── server.ts      # Ponto de entrada da aplicação
│   │   └── app.ts         # Configuração da aplicação Express
│
├── frontend/              # Código-fonte do frontend
│   ├── public/            # Arquivos estáticos públicos
│   ├── src/               # Código-fonte da aplicação frontend
│   │   ├── assets/        # Recursos estáticos
│   │   ├── components/    # Componentes React
│   │   ├── context/       # Contextos React
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── pages/         # Componentes de página
│   │   ├── services/      # Serviços para comunicação com a API
│   │   ├── styles/        # Estilos globais e configurações do Tailwind
│   │   ├── types/         # Tipos e interfaces TypeScript
│   │   ├── utils/         # Funções utilitárias
│   │   ├── App.tsx        # Componente principal da aplicação
│   │   └── main.tsx       # Ponto de entrada da aplicação
│
├── documentacao/          # Documentação detalhada do projeto
```

## Instalação e Configuração

### Pré-requisitos

- Node.js (v18 ou superior)
- pnpm (v8 ou superior)
- PostgreSQL (v14 ou superior)

### Backend

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/contabilidadeigrejinha.git
cd contabilidadeigrejinha/backend
```

2. Instale as dependências:

```bash
pnpm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações do banco de dados:

```bash
pnpm prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

### Frontend

1. Navegue até a pasta do frontend:

```bash
cd ../frontend
```

2. Instale as dependências:

```bash
pnpm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

## Documentação

A documentação detalhada do projeto está disponível na pasta `documentacao/`, incluindo:

- **BACKEND-ARCHITECTURE.md**: Arquitetura do backend
- **BACKEND-ROUTES.md**: Definição das rotas da API
- **BACKEND-VALIDATORS.md**: Validadores de dados
- **BACKEND-UTILS.md**: Utilitários e helpers
- **BACKEND-TESTS.md**: Testes automatizados
- **BACKEND-SWAGGER.md**: Documentação da API com Swagger
- **BACKEND-CONFIG.md**: Configuração do ambiente
- **BACKEND-SECURITY.md**: Segurança do backend
- **BACKEND-INTEGRATIONS.md**: Integrações com serviços externos
- **FRONTEND-ARCHITECTURE.md**: Arquitetura do frontend
- **DATABASE-STRUCTURE.md**: Estrutura do banco de dados
- **PROJECT-STRUCTURE.md**: Estrutura geral do projeto

## Testes

### Backend

```bash
cd backend
pnpm test        # Executa todos os testes
pnpm test:unit   # Executa apenas os testes unitários
pnpm test:int    # Executa apenas os testes de integração
pnpm test:e2e    # Executa apenas os testes end-to-end
pnpm test:cov    # Executa os testes com cobertura
```

### Frontend

```bash
cd frontend
pnpm test        # Executa todos os testes
pnpm test:cov    # Executa os testes com cobertura
```

## Implantação

### Produção

1. **Backend**:

```bash
cd backend
pnpm install
pnpm prisma migrate deploy
pnpm build
pnpm start:prod
```

2. **Frontend**:

```bash
cd frontend
pnpm install
pnpm build
# Servir os arquivos estáticos gerados
```

### Docker

O projeto inclui um arquivo `docker-compose.yml` para facilitar a implantação com Docker:

```bash
docker-compose up -d
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

## Contato

Para mais informações, entre em contato através do e-mail: contato@contabilidadeigrejinha.com.br
