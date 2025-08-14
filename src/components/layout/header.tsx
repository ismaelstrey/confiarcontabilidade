'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, Mail, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import { siteConfig, mainNav } from '@/lib/config'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  React.useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary-900 text-white py-2 hidden lg:block">
        <Container size="xl" padding="md">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{siteConfig.links.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{siteConfig.links.email}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-accent-400">CRC: {siteConfig.business.crc}</span>
              <span className="text-accent-400">CNPJ: {siteConfig.business.cnpj}</span>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-gray-200'
            : 'bg-white border-gray-100'
        )}
      >
        <Container size="xl" padding="md">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-lg">
                CP
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">ContabilPro</h1>
                <p className="text-xs text-gray-600">Contabilidade Empresarial</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary-600 relative',
                    pathname === item.href
                      ? 'text-primary-600'
                      : 'text-gray-700'
                  )}
                >
                  {item.title}
                  {pathname === item.href && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href="/contato">
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar Agora
                </Link>
              </Button>
              <Button
                variant="primary"
                size="sm"
                asChild
              >
                <Link href={siteConfig.links.whatsapp} target="_blank">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </Container>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-200 bg-white"
            >
              <Container size="xl" padding="md">
                <div className="py-4 space-y-4">
                  {mainNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'block py-2 text-base font-medium transition-colors',
                        pathname === item.href
                          ? 'text-primary-600 border-l-4 border-primary-600 pl-4'
                          : 'text-gray-700 hover:text-primary-600 pl-4'
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      asChild
                    >
                      <Link href="/contato">
                        <Phone className="h-4 w-4 mr-2" />
                        Ligar Agora
                      </Link>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      asChild
                    >
                      <Link href={siteConfig.links.whatsapp} target="_blank">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Link>
                    </Button>
                  </div>
                  <div className="pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{siteConfig.links.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{siteConfig.links.email}</span>
                    </div>
                  </div>
                </div>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}