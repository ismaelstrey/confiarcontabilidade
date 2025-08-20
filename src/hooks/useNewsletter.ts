'use client'

import { useState, useEffect } from 'react'
import { apiService } from '@/lib/api'

interface UseNewsletterReturn {
  isLoading: boolean
  error: string | null
  success: boolean
  subscribe: (email: string, name?: string) => Promise<void>
  unsubscribe: (email: string) => Promise<void>
  clearMessages: () => void
}

export function useNewsletter(): UseNewsletterReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Função para limpar mensagens
  const clearMessages = () => {
    setError(null)
    setSuccess(false)
  }

  // Função para inscrever na newsletter
  const subscribe = async (email: string, name?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(false)
      
      const response = await apiService.newsletter.subscribe(email, name)
      
      if (response.data.success) {
        setSuccess(true)
      } else {
        throw new Error(response.data.message || 'Erro ao inscrever na newsletter')
      }
    } catch (err: any) {
      console.error('Erro ao inscrever na newsletter:', err)
      const errorMessage = err.response?.data?.message || 'Erro ao inscrever na newsletter'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para cancelar inscrição na newsletter
  const unsubscribe = async (email: string) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(false)
      
      const response = await apiService.newsletter.unsubscribe(email)
      
      if (response.data.success) {
        setSuccess(true)
      } else {
        throw new Error(response.data.message || 'Erro ao cancelar inscrição')
      }
    } catch (err: any) {
      console.error('Erro ao cancelar inscrição:', err)
      const errorMessage = err.response?.data?.message || 'Erro ao cancelar inscrição'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    success,
    subscribe,
    unsubscribe,
    clearMessages,
  }
}

// Hook para administradores gerenciarem assinantes
interface UseNewsletterSubscribersOptions {
  page?: number
  limit?: number
  autoFetch?: boolean
}

interface Subscriber {
  id: string
  email: string
  name?: string
  createdAt: string
}

interface UseNewsletterSubscribersReturn {
  subscribers: Subscriber[]
  pagination: any
  isLoading: boolean
  error: string | null
  fetchSubscribers: () => Promise<void>
  refetch: () => Promise<void>
}

export function useNewsletterSubscribers(options: UseNewsletterSubscribersOptions = {}): UseNewsletterSubscribersReturn {
  const { page = 1, limit = 10, autoFetch = true } = options
  
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar assinantes
  const fetchSubscribers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = { page, limit }
      const response = await apiService.newsletter.getSubscribers(params)
      
      if (response.data.success && response.data.data) {
        setSubscribers(response.data.data.data)
        setPagination(response.data.data.pagination)
      } else {
        throw new Error(response.data.message || 'Erro ao buscar assinantes')
      }
    } catch (err: any) {
      console.error('Erro ao buscar assinantes:', err)
      setError(err.response?.data?.message || 'Erro ao buscar assinantes')
      setSubscribers([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para refetch (alias para fetchSubscribers)
  const refetch = fetchSubscribers

  // Buscar assinantes automaticamente quando o hook é montado
  useEffect(() => {
    if (autoFetch) {
      fetchSubscribers()
    }
  }, [page, limit, autoFetch])

  return {
    subscribers,
    pagination,
    isLoading,
    error,
    fetchSubscribers,
    refetch,
  }
}