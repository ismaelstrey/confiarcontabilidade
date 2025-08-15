# Estrutura do Projeto

Este documento descreve a estrutura geral do projeto, incluindo a organização de diretórios, a integração entre frontend e backend, e as principais tecnologias utilizadas.

## Visão Geral

O projeto segue uma arquitetura cliente-servidor, com uma clara separação entre frontend e backend:

- **Frontend**: Aplicação React com TypeScript, utilizando Tailwind CSS para estilização e React Router para navegação.
- **Backend**: API RESTful construída com Node.js, Express e TypeScript, utilizando Prisma como ORM para acesso ao banco de dados.
- **Banco de Dados**: PostgreSQL para armazenamento de dados persistentes.

## Estrutura de Diretórios

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
│   ├── .env               # Variáveis de ambiente (desenvolvimento)
│   ├── .env.test          # Variáveis de ambiente (testes)
│   ├── .env.production    # Variáveis de ambiente (produção)
│   ├── package.json       # Dependências e scripts
│   └── tsconfig.json      # Configuração do TypeScript
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
│   ├── .env               # Variáveis de ambiente (desenvolvimento)
│   ├── .env.production    # Variáveis de ambiente (produção)
│   ├── package.json       # Dependências e scripts
│   ├── tsconfig.json      # Configuração do TypeScript
│   ├── tailwind.config.js # Configuração do Tailwind CSS
│   └── vite.config.ts     # Configuração do Vite
│
├── documentacao/          # Documentação do projeto
│   ├── BACKEND-ARCHITECTURE.md
│   ├── BACKEND-CONTROLLERS.md
│   ├── BACKEND-MIDDLEWARES.md
│   ├── BACKEND-REPOSITORIES.md
│   ├── BACKEND-ROUTES.md
│   ├── BACKEND-SERVICES.md
│   ├── BACKEND-SWAGGER.md
│   ├── BACKEND-TESTS.md
│   ├── BACKEND-UTILS.md
│   ├── BACKEND-VALIDATORS.md
│   ├── DATABASE-STRUCTURE.md
│   ├── FRONTEND-ARCHITECTURE.md
│   ├── PRISMA-SCHEMA.md
│   └── PROJECT-STRUCTURE.md
│
├── .gitignore             # Arquivos e diretórios ignorados pelo Git
├── docker-compose.yml     # Configuração do Docker Compose
├── README.md              # Documentação principal do projeto
└── package.json           # Scripts e dependências do projeto raiz
```

## Tecnologias Principais

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
- **Winston**: Biblioteca para logging
- **Sentry**: Monitoramento de erros

### Frontend

- **React**: Biblioteca para construção de interfaces de usuário
- **TypeScript**: Superset tipado de JavaScript
- **Vite**: Bundler e servidor de desenvolvimento
- **Tailwind CSS**: Framework CSS utilitário
- **React Router DOM**: Biblioteca para gerenciamento de rotas
- **React Query**: Biblioteca para gerenciamento de estado do servidor e cache
- **Framer Motion**: Biblioteca para animações
- **Axios**: Cliente HTTP para requisições à API
- **React Hook Form**: Biblioteca para gerenciamento de formulários
- **Zod**: Validação de esquemas

## Fluxo de Dados

O fluxo de dados entre o frontend e o backend segue o padrão RESTful:

1. **Frontend**: O usuário interage com a interface, gerando eventos.
2. **Frontend (Serviços)**: Os serviços do frontend fazem requisições HTTP para a API do backend.
3. **Backend (Rotas)**: As rotas do backend recebem as requisições e as encaminham para os controladores apropriados.
4. **Backend (Controladores)**: Os controladores processam as requisições, validam os dados e delegam a lógica de negócios para os serviços.
5. **Backend (Serviços)**: Os serviços implementam a lógica de negócios e utilizam os repositórios para acessar o banco de dados.
6. **Backend (Repositórios)**: Os repositórios interagem com o banco de dados através do Prisma ORM.
7. **Backend (Resposta)**: O resultado é retornado ao frontend como uma resposta HTTP.
8. **Frontend (Atualização)**: O frontend atualiza a interface com base na resposta recebida.

## Comunicação entre Frontend e Backend

A comunicação entre o frontend e o backend é realizada através de uma API RESTful:

- **Endpoints**: A API expõe endpoints para cada recurso (usuários, contatos, artigos, etc.).
- **Métodos HTTP**: Os métodos HTTP (GET, POST, PUT, DELETE) são utilizados para indicar a operação a ser realizada.
- **Formato de Dados**: Os dados são trocados no formato JSON.
- **Autenticação**: A autenticação é realizada através de tokens JWT incluídos no cabeçalho Authorization das requisições.

### Exemplo de Comunicação

1. **Login (Frontend)**:

```typescript
// frontend/src/services/authService.ts
import { api } from './api';
import { LoginInput, LoginResponse } from '@/types/auth';

export const authService = {
  async login(data: LoginInput): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
};
```

2. **Login (Backend)**:

```typescript
// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { loginSchema } from '../validators/authValidator';

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await this.authService.login(data.email, data.password);
      return res.json(result);
    } catch (error) {
      // Tratamento de erro
    }
  }
}
```

## Autenticação e Autorização

O sistema utiliza JWT (JSON Web Tokens) para autenticação e controle de acesso baseado em papéis (RBAC) para autorização:

1. **Autenticação**:
   - O usuário faz login fornecendo e-mail e senha.
   - O backend valida as credenciais e gera um token JWT.
   - O token é retornado ao frontend e armazenado no localStorage.
   - O frontend inclui o token no cabeçalho Authorization de todas as requisições subsequentes.

2. **Autorização**:
   - O backend verifica o token JWT em cada requisição protegida.
   - O papel do usuário (USER, ADMIN) é extraído do token.
   - O acesso a recursos protegidos é concedido ou negado com base no papel do usuário.

## Implantação

O projeto pode ser implantado de várias formas:

### Desenvolvimento Local

1. **Backend**:

```bash
cd backend
pnpm install
pnpm prisma migrate dev
pnpm dev
```

2. **Frontend**:

```bash
cd frontend
pnpm install
pnpm dev
```

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

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  postgres-data:
```

Para iniciar os serviços:

```bash
docker-compose up -d
```

## Conclusão

A estrutura do projeto foi projetada para ser modular, escalável e de fácil manutenção. A separação clara entre frontend e backend, a organização em camadas e a utilização de tecnologias modernas proporcionam uma base sólida para o desenvolvimento do sistema.

A documentação detalhada de cada componente do sistema está disponível nos arquivos específicos na pasta `documentacao/`, fornecendo uma referência completa para o desenvolvimento e manutenção do projeto.