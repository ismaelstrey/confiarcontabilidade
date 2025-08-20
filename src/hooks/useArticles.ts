'use client'

import { useState, useEffect } from 'react'
import { apiService, Article, PaginatedResponse } from '@/lib/api'

interface UseArticlesOptions {
  page?: number
  limit?: number
  category?: string
  featured?: boolean
  autoFetch?: boolean
}

interface UseArticlesReturn {
  articles: Article[]
  pagination: PaginatedResponse<Article>['pagination'] | null
  isLoading: boolean
  error: string | null
  createArticle: (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Article>
  updateArticle: (id: string, data: Partial<Article>) => Promise<Article>
  deleteArticle: (id: string) => Promise<void>
  fetchArticles: () => Promise<void>
  refetch: () => Promise<void>
}

export function useArticles(options: UseArticlesOptions = {}): UseArticlesReturn {
  const { page = 1, limit = 10, category, featured, autoFetch = true } = options
  
  const [articles, setArticles] = useState<Article[]>([])
  const [pagination, setPagination] = useState<PaginatedResponse<Article>['pagination'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar artigos
  const fetchArticles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = { 
        page, 
        limit, 
        ...(category && { category }),
        ...(featured !== undefined && { featured })
      }
      const response = await apiService.articles.getAll(params)
      
      if (response.data.success && response.data.data) {
        setArticles(response.data.data.data)
        setPagination(response.data.data.pagination)
      } else {
        throw new Error(response.data.message || 'Erro ao buscar artigos')
      }
    } catch (err: any) {
      console.error('Erro ao buscar artigos:', err)
      setError(err.response?.data?.message || 'Erro ao buscar artigos')
      setArticles([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para criar artigo
  const createArticle = async (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.articles.create(data)
      
      if (response.data.success && response.data.data) {
        const newArticle = response.data.data
        setArticles(prev => [newArticle, ...prev])
        return newArticle
      } else {
        throw new Error(response.data.message || 'Erro ao criar artigo')
      }
    } catch (err: any) {
      console.error('Erro ao criar artigo:', err)
      const errorMessage = err.response?.data?.message || 'Erro ao criar artigo'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para atualizar artigo
  const updateArticle = async (id: string, data: Partial<Article>): Promise<Article> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.articles.update(id, data)
      
      if (response.data.success && response.data.data) {
        const updatedArticle = response.data.data
        setArticles(prev => prev.map(article => 
          article.id === id ? updatedArticle : article
        ))
        return updatedArticle
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar artigo')
      }
    } catch (err: any) {
      console.error('Erro ao atualizar artigo:', err)
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar artigo'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para deletar artigo
  const deleteArticle = async (id: string): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.articles.delete(id)
      
      if (response.data.success) {
        setArticles(prev => prev.filter(article => article.id !== id))
      } else {
        throw new Error(response.data.message || 'Erro ao deletar artigo')
      }
    } catch (err: any) {
      console.error('Erro ao deletar artigo:', err)
      const errorMessage = err.response?.data?.message || 'Erro ao deletar artigo'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para refetch (alias para fetchArticles)
  const refetch = fetchArticles

  // Buscar artigos automaticamente quando o hook é montado
  useEffect(() => {
    if (autoFetch) {
      fetchArticles()
    }
  }, [page, limit, category, featured, autoFetch])

  return {
    articles,
    pagination,
    isLoading,
    error,
    createArticle,
    updateArticle,
    deleteArticle,
    fetchArticles,
    refetch,
  }
}

// Hook para um artigo específico por slug
export function useArticleBySlug(slug: string) {
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArticle = async () => {
    if (!slug) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.articles.getBySlug(slug)
      
      if (response.data.success && response.data.data) {
        setArticle(response.data.data)
      } else {
        throw new Error(response.data.message || 'Artigo não encontrado')
      }
    } catch (err: any) {
      console.error('Erro ao buscar artigo:', err)
      setError(err.response?.data?.message || 'Erro ao buscar artigo')
      setArticle(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchArticle()
  }, [slug])

  return {
    article,
    isLoading,
    error,
    refetch: fetchArticle,
  }
}

// Hook para um artigo específico por ID
export function useArticle(id: string) {
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArticle = async () => {
    if (!id) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.articles.getById(id)
      
      if (response.data.success && response.data.data) {
        setArticle(response.data.data)
      } else {
        throw new Error(response.data.message || 'Artigo não encontrado')
      }
    } catch (err: any) {
      console.error('Erro ao buscar artigo:', err)
      setError(err.response?.data?.message || 'Erro ao buscar artigo')
      setArticle(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchArticle()
  }, [id])

  return {
    article,
    isLoading,
    error,
    refetch: fetchArticle,
  }
}