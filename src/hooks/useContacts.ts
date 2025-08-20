'use client'

import { useState, useEffect } from 'react'
import { apiService, Contact, PaginatedResponse } from '@/lib/api'

interface UseContactsOptions {
  page?: number
  limit?: number
  status?: string
  autoFetch?: boolean
}

interface UseContactsReturn {
  contacts: Contact[]
  pagination: PaginatedResponse<Contact>['pagination'] | null
  isLoading: boolean
  error: string | null
  createContact: (data: Omit<Contact, 'id' | 'status' | 'createdAt'>) => Promise<Contact>
  updateContact: (id: string, data: Partial<Contact>) => Promise<Contact>
  deleteContact: (id: string) => Promise<void>
  fetchContacts: () => Promise<void>
  refetch: () => Promise<void>
}

export function useContacts(options: UseContactsOptions = {}): UseContactsReturn {
  const { page = 1, limit = 10, status, autoFetch = true } = options
  
  const [contacts, setContacts] = useState<Contact[]>([])
  const [pagination, setPagination] = useState<PaginatedResponse<Contact>['pagination'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar contatos
  const fetchContacts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = { page, limit, ...(status && { status }) }
      const response = await apiService.contacts.getAll(params)
      
      if (response.data.success && response.data.data) {
        setContacts(response.data.data.data)
        setPagination(response.data.data.pagination)
      } else {
        throw new Error(response.data.message || 'Erro ao buscar contatos')
      }
    } catch (err: any) {
      console.error('Erro ao buscar contatos:', err)
      setError(err.response?.data?.message || 'Erro ao buscar contatos')
      setContacts([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para criar contato
  const createContact = async (data: Omit<Contact, 'id' | 'status' | 'createdAt'>): Promise<Contact> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.contacts.create(data)
      
      if (response.data.success && response.data.data) {
        const newContact = response.data.data
        setContacts(prev => [newContact, ...prev])
        return newContact
      } else {
        throw new Error(response.data.message || 'Erro ao criar contato')
      }
    } catch (err: any) {
      console.error('Erro ao criar contato:', err)
      const errorMessage = err.response?.data?.message || 'Erro ao criar contato'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para atualizar contato
  const updateContact = async (id: string, data: Partial<Contact>): Promise<Contact> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.contacts.update(id, data)
      
      if (response.data.success && response.data.data) {
        const updatedContact = response.data.data
        setContacts(prev => prev.map(contact => 
          contact.id === id ? updatedContact : contact
        ))
        return updatedContact
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar contato')
      }
    } catch (err: any) {
      console.error('Erro ao atualizar contato:', err)
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar contato'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para deletar contato
  const deleteContact = async (id: string): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.contacts.delete(id)
      
      if (response.data.success) {
        setContacts(prev => prev.filter(contact => contact.id !== id))
      } else {
        throw new Error(response.data.message || 'Erro ao deletar contato')
      }
    } catch (err: any) {
      console.error('Erro ao deletar contato:', err)
      const errorMessage = err.response?.data?.message || 'Erro ao deletar contato'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para refetch (alias para fetchContacts)
  const refetch = fetchContacts

  // Buscar contatos automaticamente quando o hook é montado
  useEffect(() => {
    if (autoFetch) {
      fetchContacts()
    }
  }, [page, limit, status, autoFetch])

  return {
    contacts,
    pagination,
    isLoading,
    error,
    createContact,
    updateContact,
    deleteContact,
    fetchContacts,
    refetch,
  }
}

// Hook para um contato específico
export function useContact(id: string) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContact = async () => {
    if (!id) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.contacts.getById(id)
      
      if (response.data.success && response.data.data) {
        setContact(response.data.data)
      } else {
        throw new Error(response.data.message || 'Erro ao buscar contato')
      }
    } catch (err: any) {
      console.error('Erro ao buscar contato:', err)
      setError(err.response?.data?.message || 'Erro ao buscar contato')
      setContact(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContact()
  }, [id])

  return {
    contact,
    isLoading,
    error,
    refetch: fetchContact,
  }
}