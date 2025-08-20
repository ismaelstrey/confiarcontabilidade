# Arquitetura do Backend

Este documento descreve a arquitetura do backend do sistema, incluindo a estrutura de pastas, padrões de design, fluxo de dados e responsabilidades de cada camada.

## Estrutura de Pastas

```
src/
├── config/           # Configurações da aplicação
│   ├── env.ts        # Variáveis de ambiente
│   ├── database.ts   # Configuração do Prisma
│   └── server.ts     # Configuração do Express
├── controllers/      # Controladores da aplicação
├── middlewares/      # Middlewares do Express
├── repositories/     # Camada de acesso a dados
├── routes/           # Definição de rotas
├── services/         # Lógica de negócios
├── utils/            # Utilitários e helpers
├── validators/       # Validadores de dados (Zod)
├── docs/             # Documentação Swagger
├── types/            # Tipos e interfaces TypeScript
├── server.ts         # Ponto de entrada da aplicação
└── app.ts            # Configuração da aplicação Express
```

## Arquitetura em Camadas

O backend segue uma arquitetura em camadas, onde cada camada tem uma responsabilidade específica:

### 1. Camada de Apresentação (Controllers e Routes)

- **Routes**: Definem os endpoints da API e conectam as requisições HTTP aos controladores apropriados.
- **Controllers**: Recebem as requisições, validam os dados de entrada, delegam o processamento para os serviços e retornam as respostas.

### 2. Camada de Negócios (Services)

- Implementa a lógica de negócios da aplicação.
- Coordena as operações entre diferentes repositórios.
- Aplica regras de negócio e validações complexas.
- Não deve conter lógica de acesso a dados ou apresentação.

### 3. Camada de Acesso a Dados (Repositories)

- Responsável por interagir com o banco de dados.
- Implementa operações CRUD para cada entidade.
- Abstrai a complexidade do acesso a dados para as camadas superiores.
- Utiliza o Prisma ORM para comunicação com o banco de dados.

### 4. Camada de Infraestrutura (Middlewares, Utils, Config)

- **Middlewares**: Implementam funcionalidades transversais como autenticação, logging, tratamento de erros, etc.
- **Utils**: Fornecem funções utilitárias reutilizáveis em toda a aplicação.
- **Config**: Gerencia configurações e variáveis de ambiente.

## Fluxo de Dados

1. **Requisição HTTP** → O cliente envia uma requisição para um endpoint da API.
2. **Middleware** → A requisição passa por middlewares globais (CORS, parsing de JSON, etc.).
3. **Router** → A rota correspondente é identificada.
4. **Middleware de Rota** → A requisição passa por middlewares específicos da rota (autenticação, validação, etc.).
5. **Controller** → O controlador recebe a requisição e extrai os dados necessários.
6. **Validação** → Os dados de entrada são validados usando Zod.
7. **Service** → O controlador chama o serviço apropriado para processar a requisição.
8. **Repository** → O serviço utiliza repositórios para acessar o banco de dados.
9. **Resposta** → O resultado é retornado ao cliente, passando de volta pela pilha de chamadas.

## Padrões de Design

### Injeção de Dependências

Os serviços recebem suas dependências (repositórios, outros serviços) através do construtor, facilitando os testes e reduzindo o acoplamento.

```typescript
export class UserService {
  constructor(private userRepository: UserRepository) {}
  
  async findById(id: string) {
    return this.userRepository.findById(id);
  }
}
```

### Repository Pattern

O padrão Repository é utilizado para abstrair o acesso a dados, permitindo que a lógica de negócios seja independente da fonte de dados.

```typescript
export class UserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

### Service Layer

A camada de serviço encapsula a lógica de negócios e coordena operações entre diferentes repositórios.

```typescript
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService
  ) {}
  
  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Credenciais inválidas');
    }
    
    return this.tokenService.generateToken(user);
  }
}
```

### Middleware Pattern

Middlewares são utilizados para implementar funcionalidades transversais como autenticação, logging, tratamento de erros, etc.

```typescript
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
```

## Tratamento de Erros

O sistema utiliza um middleware global para tratamento de erros, que captura exceções lançadas em qualquer parte da aplicação e retorna respostas de erro padronizadas.

```typescript
export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Erro de validação',
      errors: err.errors,
    });
  }
  
  if (err instanceof PrismaClientKnownRequestError) {
    // Tratamento específico para erros do Prisma
    return res.status(400).json({
      message: 'Erro de banco de dados',
      code: err.code,
    });
  }
  
  return res.status(500).json({
    message: 'Erro interno do servidor',
  });
};
```

## Validação de Dados

A validação de dados de entrada é realizada utilizando a biblioteca Zod, que permite definir esquemas de validação de forma declarativa.

```typescript
export const createUserSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

## Autenticação e Autorização

O sistema utiliza JWT (JSON Web Tokens) para autenticação e controle de acesso baseado em papéis (RBAC) para autorização.

```typescript
export const roleMiddleware = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    next();
  };
};
```

## Logging e Monitoramento

O sistema utiliza Winston para logging e Sentry para monitoramento de erros em produção.

```typescript
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};
```

## Conclusão

A arquitetura em camadas adotada no backend proporciona uma separação clara de responsabilidades, facilitando a manutenção, testabilidade e escalabilidade do sistema. Cada camada tem um propósito específico e se comunica com as demais através de interfaces bem definidas, reduzindo o acoplamento e aumentando a coesão do código.

A utilização de padrões de design como Repository, Service Layer e Middleware Pattern, combinada com tecnologias modernas como TypeScript, Prisma e Express, resulta em um backend robusto, seguro e de fácil manutenção.