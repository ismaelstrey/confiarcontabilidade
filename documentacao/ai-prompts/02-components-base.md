# Prompt: Componentes Base do Design System

## 🎯 Objetivo
Implementar todos os componentes base do design system utilizando Radix UI, Framer Motion, Tailwind CSS e TypeScript com Next.js 15.4.6, seguindo as especificações definidas, com foco em reutilização, acessibilidade e animações suaves.

## 📋 Prompt para IA

```
Implemente um sistema completo de componentes base para o site de contabilidade, utilizando as melhores práticas de React 19, TypeScript, Tailwind CSS e acessibilidade com Next.js 15.4.6. Todos os componentes devem seguir rigorosamente o design system definido, ser TypeScript, acessíveis e com animações suaves.

**COMPONENTES OBRIGATÓRIOS:**

## 1. BUTTON COMPONENT
Crie `src/components/ui/Button.tsx` com:

**Variantes:**
- primary: Gradiente azul com sombra e hover effect
- secondary: Outline azul com hover fill
- success: Gradiente verde para CTAs de sucesso
- ghost: Transparente com hover sutil
- link: Estilo de link com underline animado

**Tamanhos:**
- sm: padding menor, texto pequeno
- md: tamanho padrão
- lg: padding maior, texto maior
- xl: botão hero, muito grande

**Estados:**
- loading: com spinner animado
- disabled: opacidade reduzida
- hover: transform translateY(-2px)
- active: transform translateY(0)

**Props TypeScript:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}
```

## 2. CARD COMPONENT
Crie `src/components/ui/Card.tsx` com:

**Variantes:**
- default: Card básico com sombra sutil
- service: Card para serviços com hover especial
- team: Card para membros da equipe
- blog: Card para artigos do blog
- stats: Card para estatísticas com números grandes

**Animações:**
- Hover: translateY(-4px) + sombra maior
- Entrada: fadeInUp com delay escalonado
- Loading: shimmer effect

## 3. INPUT COMPONENT
Crie `src/components/ui/Input.tsx` com:

**Tipos:**
- text, email, tel, password, textarea
- Integração com react-hook-form
- Validação visual em tempo real
- Estados: default, focus, error, success

**Funcionalidades:**
- Label flutuante animada
- Ícones opcionais (esquerda/direita)
- Mensagens de erro animadas
- Contador de caracteres para textarea

## 4. LOADING COMPONENTS
Crie `src/components/ui/Loading.tsx` com:

**Variantes:**
- spinner: Spinner circular animado
- dots: Três pontos pulsantes
- skeleton: Placeholder para conteúdo
- page: Loading de página completa

## 5. CONTAINER COMPONENT
Crie `src/components/ui/Container.tsx` com:

**Funcionalidades:**
- Responsivo com max-width por breakpoint
- Padding lateral consistente
- Centralização automática
- Variantes: default, narrow, wide, full

## 6. SECTION COMPONENT
Crie `src/components/ui/Section.tsx` com:

**Funcionalidades:**
- Padding vertical consistente
- Backgrounds: default, gray, dark, gradient
- Animações de entrada ao scroll
- Suporte a patterns de background

**ESPECIFICAÇÕES TÉCNICAS:**

**Animações (Framer Motion):**
- Use variants para animações consistentes
- Duração padrão: 0.3s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Stagger children com delay de 0.1s

**Acessibilidade:**
- Todos os componentes com ARIA labels apropriados
- Navegação por teclado funcional
- Focus visible com outline customizado
- Screen reader friendly

**TypeScript:**
- Props interfaces bem definidas
- Generics onde apropriado
- Ref forwarding para todos os componentes
- Strict mode compliance

**Tailwind Classes:**
- Use as variáveis CSS customizadas definidas
- Classes condicionais com clsx
- Responsive design mobile-first
- Dark mode ready (opcional)

**EXEMPLO DE IMPLEMENTAÇÃO - BUTTON:**

```typescript
'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    className,
    disabled,
    ...props
  },
  ref
) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg hover:from-primary-700 hover:to-primary-600 hover:-translate-y-0.5 hover:shadow-xl focus:ring-primary-500',
    secondary: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white hover:-translate-y-0.5 focus:ring-primary-500',
    // ... outras variantes
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg',
    xl: 'px-8 py-4 text-xl rounded-xl'
  }
  
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  )
})

Button.displayName = 'Button'
export { Button }
```

**ARQUIVO DE EXPORTAÇÃO:**
Crie `src/components/ui/index.ts` exportando todos os componentes:

```typescript
export { Button } from './Button'
export { Card } from './Card'
export { Input } from './Input'
export { Loading } from './Loading'
export { Container } from './Container'
export { Section } from './Section'
```

**STORYBOOK (OPCIONAL):**
Se usar Storybook, crie stories para cada componente mostrando todas as variantes e estados.

**TESTES:**
Crie testes básicos para cada componente verificando:
- Renderização correta
- Props funcionando
- Eventos de click
- Estados de loading/disabled

**DOCUMENTAÇÃO:**
Cada componente deve ter comentários JSDoc explicando:
- Propósito do componente
- Props disponíveis
- Exemplos de uso
- Notas de acessibilidade
```

## ✅ Critérios de Validação

Após executar este prompt, verifique se:
- [ ] Todos os componentes renderizam sem erros
- [ ] Animações são suaves e consistentes
- [ ] Props TypeScript funcionam corretamente
- [ ] Acessibilidade implementada (tab navigation, ARIA)
- [ ] Responsividade funciona em todos os breakpoints
- [ ] Estados (hover, focus, disabled) funcionam
- [ ] Integração com Tailwind CSS correta
- [ ] Componentes são reutilizáveis e flexíveis

## 🔄 Próximos Passos

Após completar os componentes base:
1. Execute o prompt "03-layout-navigation.md"
2. Implemente o sistema de animações avançadas
3. Desenvolva as seções específicas do site
4. Integre os formulários com validação

---

*Estes componentes base serão a fundação de todo o site, garantindo consistência e qualidade.*