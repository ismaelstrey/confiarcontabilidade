'use client'

import { useState } from 'react'
import { useNewsletter } from '@/hooks/useNewsletter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NewsletterFormProps {
  variant?: 'default' | 'compact' | 'inline'
  className?: string
  placeholder?: string
  buttonText?: string
}

export default function NewsletterForm({
  variant = 'default',
  className = '',
  placeholder = 'Digite seu e-mail',
  buttonText = 'Inscrever-se'
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const { subscribe, isLoading } = useNewsletter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Por favor, digite seu e-mail')
      return
    }

    try {
      await subscribe(email, name || undefined)
      setIsSuccess(true)
      setEmail('')
      setName('')
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 5000)
    } catch (err: any) {
      setError(err.message || 'Erro ao inscrever na newsletter')
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center justify-center p-4 bg-success-50 border border-success-200 rounded-lg ${className}`}
      >
        <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
        <span className="text-success-700 font-medium">
          Inscrição realizada com sucesso!
        </span>
      </motion.div>
    )
  }

  const renderCompactForm = () => (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )

  const renderInlineForm = () => (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          buttonText
        )}
      </Button>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute mt-12 flex items-center text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )

  const renderDefaultForm = () => (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome (opcional)"
          disabled={isLoading}
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          required
        />
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Inscrevendo...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            {buttonText}
          </>
        )}
      </Button>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )

  switch (variant) {
    case 'compact':
      return renderCompactForm()
    case 'inline':
      return renderInlineForm()
    default:
      return renderDefaultForm()
  }
}