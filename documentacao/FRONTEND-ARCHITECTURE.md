# Arquitetura do Frontend

Este documento descreve a arquitetura do frontend do sistema, incluindo a estrutura de pastas, padrões de design, gerenciamento de estado, roteamento e componentes principais.

## Tecnologias Principais

- **React**: Biblioteca para construção de interfaces de usuário
- **TypeScript**: Superset tipado de JavaScript
- **Tailwind CSS v4**: Framework CSS utilitário para estilização
- **React Router DOM**: Biblioteca para gerenciamento de rotas
- **Framer Motion**: Biblioteca para animações
- **React Query**: Biblioteca para gerenciamento de estado do servidor e cache
- **Zod**: Biblioteca para validação de esquemas
- **Axios**: Cliente HTTP para requisições à API

## Estrutura de Pastas

```
src/
├── assets/           # Recursos estáticos (imagens, fontes, etc.)
├── components/       # Componentes reutilizáveis
│   ├── common/       # Componentes comuns (botões, inputs, etc.)
│   ├── layout/       # Componentes de layout (header, footer, etc.)
│   └── sections/     # Seções específicas de páginas
├── context/          # Contextos React
├── hooks/            # Hooks personalizados
├── pages/            # Componentes de página
├── services/         # Serviços para comunicação com a API
├── styles/           # Estilos globais e configurações do Tailwind
├── types/            # Tipos e interfaces TypeScript
├── utils/            # Funções utilitárias
├── App.tsx           # Componente principal da aplicação
├── main.tsx          # Ponto de entrada da aplicação
└── vite-env.d.ts     # Tipos para o ambiente Vite
```

## Padrões de Design

### Componentes

Os componentes seguem uma estrutura consistente:

```typescript
// src/components/common/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  ...props
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 py-2 px-4',
    lg: 'h-11 px-8 text-base',
  };
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>
  );
};
```

### Hooks Personalizados

Hooks personalizados são utilizados para encapsular lógica reutilizável:

```typescript
// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
```

### Serviços de API

Os serviços de API são organizados por domínio e utilizam Axios para comunicação com o backend:

```typescript
// src/services/api.ts
import axios from 'axios';
import { env } from '@/utils/env';

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
```

```typescript
// src/services/authService.ts
import { api } from './api';
import { LoginInput, LoginResponse, RegisterInput, User } from '@/types/auth';

export const authService = {
  async login(data: LoginInput): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
  
  async register(data: RegisterInput): Promise<User> {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },
  
  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
  
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },
};
```

## Gerenciamento de Estado

### Contexto React

O Contexto React é utilizado para gerenciar estado global da aplicação:

```typescript
// src/context/AuthContext.tsx
import { createContext, ReactNode, useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const user = await authService.me();
          setUser(user);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };
    
    loadUser();
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };
  
  const register = async (name: string, email: string, password: string) => {
    const user = await authService.register({ name, email, password });
    setUser(user);
  };
  
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### React Query

React Query é utilizado para gerenciar estado do servidor e cache:

```typescript
// src/hooks/useContacts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/services/contactService';
import { Contact, ContactInput } from '@/types/contact';

export const useContacts = () => {
  const queryClient = useQueryClient();
  
  const getContacts = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactService.getContacts(),
  });
  
  const getContact = (id: string) => {
    return useQuery({
      queryKey: ['contact', id],
      queryFn: () => contactService.getContact(id),
    });
  };
  
  const createContact = useMutation({
    mutationFn: (data: ContactInput) => contactService.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
  
  const updateContact = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContactInput> }) =>
      contactService.updateContact(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', variables.id] });
    },
  });
  
  const deleteContact = useMutation({
    mutationFn: (id: string) => contactService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
  
  return {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
  };
};
```

## Roteamento

O roteamento é gerenciado com React Router DOM:

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AdminRoute } from '@/components/common/AdminRoute';

// Páginas
import { Home } from '@/pages/Home';
import { About } from '@/pages/About';
import { Services } from '@/pages/Services';
import { Contact } from '@/pages/Contact';
import { Calculator } from '@/pages/Calculator';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Profile } from '@/pages/Profile';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminContacts } from '@/pages/admin/Contacts';
import { AdminArticles } from '@/pages/admin/Articles';
import { AdminServices } from '@/pages/admin/Services';
import { NotFound } from '@/pages/NotFound';

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/servicos" element={<Services />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/calculadora" element={<Calculator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            
            {/* Rotas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/perfil" element={<Profile />} />
            </Route>
            
            {/* Rotas de administrador */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/contatos" element={<AdminContacts />} />
              <Route path="/admin/artigos" element={<AdminArticles />} />
              <Route path="/admin/servicos" element={<AdminServices />} />
            </Route>
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
};
```

### Rotas Protegidas

```typescript
// src/components/common/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Carregando...</div>;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
```

```typescript
// src/components/common/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Carregando...</div>;
  }
  
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" />;
};
```

## Formulários e Validação

Os formulários são gerenciados com React Hook Form e validados com Zod:

```typescript
// src/pages/Contact.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { contactService } from '@/services/contactService';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Layout } from '@/components/layout/Layout';

const contactSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  subject: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });
  
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      await contactService.createContact(data);
      setIsSuccess(true);
      toast.success('Mensagem enviada com sucesso!');
      reset();
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout title="Contato">
      <div className="container mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8"
        >
          <h1 className="text-3xl font-bold mb-6 text-center">Entre em Contato</h1>
          
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <svg
                className="w-16 h-16 text-green-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <h2 className="text-2xl font-semibold mb-2">Mensagem Enviada!</h2>
              <p className="text-gray-600 mb-6">
                Obrigado por entrar em contato. Responderemos em breve.
              </p>
              <Button onClick={() => setIsSuccess(false)}>Enviar Nova Mensagem</Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Nome"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                </div>
                <div>
                  <Input
                    label="E-mail"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Telefone"
                    {...register('phone')}
                    error={errors.phone?.message}
                  />
                </div>
                <div>
                  <Input
                    label="Assunto"
                    {...register('subject')}
                    error={errors.subject?.message}
                  />
                </div>
              </div>
              
              <div>
                <Textarea
                  label="Mensagem"
                  rows={5}
                  {...register('message')}
                  error={errors.message?.message}
                />
              </div>
              
              <div className="text-center">
                <Button type="submit" isLoading={isSubmitting}>
                  Enviar Mensagem
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};
```

## Animações

As animações são implementadas com Framer Motion:

```typescript
// src/components/common/FadeIn.tsx
import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInProps extends MotionProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

export const FadeIn = ({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  ...props
}: FadeInProps) => {
  const directionVariants = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };
  
  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directionVariants[direction],
      }}
      animate={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      transition={{
        duration: 0.5,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
```

## Responsividade

A responsividade é gerenciada com Tailwind CSS:

```typescript
// src/components/layout/Header.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const navItems = [
    { label: 'Início', path: '/' },
    { label: 'Sobre', path: '/sobre' },
    { label: 'Serviços', path: '/servicos' },
    { label: 'Calculadora', path: '/calculadora' },
    { label: 'Contato', path: '/contato' },
  ];
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            ContabilidadeIgrejinha
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <ul className="flex items-center space-x-6">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`text-base font-medium transition-colors hover:text-primary ${pathname === item.path ? 'text-primary' : 'text-gray-700'}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => logout()}>
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/cadastro">
                    <Button size="sm">Cadastrar</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4">
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`block text-base font-medium transition-colors hover:text-primary ${pathname === item.path ? 'text-primary' : 'text-gray-700'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/cadastro" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">Cadastrar</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
```

## Conclusão

A arquitetura do frontend foi projetada para ser modular, escalável e de fácil manutenção. A separação de responsabilidades entre componentes, hooks, serviços e contextos permite um desenvolvimento organizado e eficiente.

A utilização de TypeScript proporciona segurança de tipos e melhor documentação do código, enquanto o Tailwind CSS facilita a estilização consistente e responsiva. O React Router DOM gerencia o roteamento da aplicação, e o React Query simplifica o gerenciamento de estado do servidor e cache.

As animações com Framer Motion melhoram a experiência do usuário, tornando a interface mais dinâmica e agradável. A validação de formulários com Zod garante que os dados enviados ao backend estejam corretos e consistentes.

Esta arquitetura fornece uma base sólida para o desenvolvimento do frontend, permitindo a adição de novas funcionalidades de forma organizada e eficiente.