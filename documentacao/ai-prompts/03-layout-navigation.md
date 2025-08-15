# Prompt: Layout e Navegação Principal

## 🎯 Objetivo
Implementar o layout principal do site com header fixo, navegação responsiva, footer completo e sistema de navegação fluido com animações profissionais.

## 📋 Prompt para IA

```
Implemente o sistema completo de layout e navegação para o site institucional de contabilidade. O layout deve ser moderno, profissional e totalmente responsivo com animações suaves.

**COMPONENTES DE LAYOUT OBRIGATÓRIOS:**

## 1. HEADER COMPONENT
Crie `src/components/layout/Header.tsx` com:

**Funcionalidades:**
- Header fixo no topo com backdrop blur
- Logo da empresa (placeholder SVG por enquanto)
- Navegação principal horizontal (desktop)
- Menu hamburger animado (mobile)
- Botão CTA "Fale Conosco" destacado
- Scroll behavior: transparente no topo, sólido ao rolar

**Navegação Principal:**
- Início
- Sobre Nós
- Serviços (com dropdown)
- Equipe
- Blog
- Contato

**Animações:**
- Fade in/out do background ao scroll
- Hover effects nos links
- Dropdown animado para Serviços
- Menu mobile slide-in da direita

**Responsividade:**
- Desktop: navegação horizontal completa
- Tablet: navegação compacta
- Mobile: menu hamburger

## 2. MOBILE MENU COMPONENT
Crie `src/components/layout/MobileMenu.tsx` com:

**Funcionalidades:**
- Overlay escuro com blur
- Menu slide-in animado
- Links com animação stagger
- Botão de fechar animado
- Scroll lock quando aberto

**Animações:**
- Slide-in da direita
- Fade-in do overlay
- Stagger dos itens do menu
- Morphing do ícone hamburger para X

## 3. FOOTER COMPONENT
Crie `src/components/layout/Footer.tsx` com:

**Seções:**
- Informações da empresa (logo, descrição)
- Links rápidos (navegação principal)
- Serviços (lista dos principais)
- Contato (endereço, telefone, email)
- Redes sociais
- Copyright e links legais

**Design:**
- Background escuro (gray-900)
- Texto claro
- Links com hover effects
- Ícones das redes sociais animados
- Divisão clara entre seções

## 4. BREADCRUMB COMPONENT
Crie `src/components/layout/Breadcrumb.tsx` com:

**Funcionalidades:**
- Navegação hierárquica
- Separadores animados
- Link para página anterior
- Integração com Next.js router

## 5. LAYOUT PRINCIPAL
Crie `src/components/layout/Layout.tsx` como wrapper:

**Estrutura:**
```typescript
interface LayoutProps {
  children: React.ReactNode
  showBreadcrumb?: boolean
  pageTitle?: string
  pageDescription?: string
}

const Layout = ({ children, showBreadcrumb, pageTitle, pageDescription }: LayoutProps) => {
  return (
    <>
      <SEOHead title={pageTitle} description={pageDescription} />
      <Header />
      {showBreadcrumb && <Breadcrumb />}
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
```

**ESPECIFICAÇÕES TÉCNICAS DETALHADAS:**

## HEADER IMPLEMENTAÇÃO:

```typescript
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const router = useRouter()

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { name: 'Início', href: '/' },
    { name: 'Sobre Nós', href: '/sobre' },
    { 
      name: 'Serviços', 
      href: '/servicos',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Contabilidade Empresarial', href: '/servicos/contabilidade' },
        { name: 'Consultoria Fiscal', href: '/servicos/consultoria' },
        { name: 'Planejamento Tributário', href: '/servicos/planejamento' },
        { name: 'Abertura de Empresas', href: '/servicos/abertura' },
      ]
    },
    { name: 'Equipe', href: '/equipe' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contato', href: '/contato' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900">ContabilPro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.hasDropdown ? (
                  <>
                    <button
                      className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                      onMouseEnter={() => setIsServicesOpen(true)}
                      onMouseLeave={() => setIsServicesOpen(false)}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {isServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
                          onMouseEnter={() => setIsServicesOpen(true)}
                          onMouseLeave={() => setIsServicesOpen(false)}
                        >
                          {item.dropdownItems?.map((dropdownItem, index) => (
                            <motion.div
                              key={dropdownItem.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Link
                                href={dropdownItem.href}
                                className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                              >
                                {dropdownItem.name}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-primary-600 transition-colors relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="primary" 
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => router.push('/contato')}
            >
              Fale Conosco
            </Button>
            
            <button
              className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        navigationItems={navigationItems}
      />
    </motion.header>
  )
}
```

**MOBILE MENU IMPLEMENTAÇÃO:**

```typescript
interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navigationItems: NavigationItem[]
}

const MobileMenu = ({ isOpen, onClose, navigationItems }: MobileMenuProps) => {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">C</span>
                  </div>
                  <span className="font-bold text-lg">ContabilPro</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="space-y-4">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="block py-3 text-lg font-medium text-gray-700 hover:text-primary-600 transition-colors border-b border-gray-100"
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                    
                    {/* Dropdown items for mobile */}
                    {item.hasDropdown && item.dropdownItems && (
                      <div className="ml-4 mt-2 space-y-2">
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block py-2 text-gray-600 hover:text-primary-600 transition-colors"
                            onClick={onClose}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* CTA Button */}
              <div className="mt-8">
                <Button 
                  variant="primary" 
                  fullWidth
                  onClick={() => {
                    onClose()
                    router.push('/contato')
                  }}
                >
                  Fale Conosco
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

**FOOTER IMPLEMENTAÇÃO:**
Footer completo com 4 colunas responsivas, links organizados, informações de contato e redes sociais.

**SEO INTEGRATION:**
Integre com next-seo para meta tags dinâmicas em cada página.

**ACESSIBILIDADE:**
- Navegação por teclado completa
- ARIA labels apropriados
- Focus management no menu mobile
- Skip links para conteúdo principal

**PERFORMANCE:**
- Lazy loading de componentes pesados
- Otimização de re-renders
- Debounce no scroll listener
- Preload de páginas importantes
```

## ✅ Critérios de Validação

Após executar este prompt, verifique se:
- [ ] Header fixo funciona com scroll behavior
- [ ] Menu mobile abre/fecha suavemente
- [ ] Dropdown de serviços funciona no desktop
- [ ] Navegação por teclado funciona
- [ ] Footer está completo e responsivo
- [ ] Animações são suaves em todos os dispositivos
- [ ] Links internos funcionam corretamente
- [ ] Layout responsivo em todos os breakpoints

## 🔄 Próximos Passos

Após completar o layout:
1. Execute o prompt "04-hero-landing.md"
2. Implemente as seções principais
3. Configure o sistema de animações ao scroll
4. Desenvolva as páginas internas

---

*O layout é a base da experiência do usuário - deve ser impecável em todos os aspectos.*