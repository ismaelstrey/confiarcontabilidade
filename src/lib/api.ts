import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// Instância do Axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Se o token expirou, redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Tipos para as respostas da API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Tipos para autenticação
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}



export interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt?: string
  updatedAt?: string
}

// Tipos para contatos
export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  message: string
  service?: string
  status: 'PENDING' | 'CONTACTED' | 'RESOLVED'
  createdAt: string
}

// Tipos para artigos
export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  category: string
  tags: string[]
  featured: boolean
  published: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  readTime: number
}

// Serviços da API
export const apiService = {
  // Autenticação
  auth: {
    login: (data: LoginRequest) => api.post<ApiResponse<AuthResponse>>('/auth/login', data),
    register: (data: RegisterRequest) => api.post<ApiResponse<AuthResponse>>('/auth/register', data),
    refreshToken: () => api.post<ApiResponse<AuthResponse>>('/auth/refresh-token'),
    forgotPassword: (email: string) => api.post<ApiResponse>('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) =>
      api.post<ApiResponse>('/auth/reset-password', { token, password }),
    getProfile: () => api.get<ApiResponse<User>>('/auth/profile'),
    updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>('/auth/profile', data),
    changePassword: (currentPassword: string, newPassword: string) =>
      api.put<ApiResponse>('/auth/change-password', { currentPassword, newPassword }),
  },

  // Usuários
  users: {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
      api.get<ApiResponse<PaginatedResponse<User>>>('/users', { params }),
    getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
    update: (id: string, data: Partial<User>) => api.put<ApiResponse<User>>(`/users/${id}`, data),
    delete: (id: string) => api.delete<ApiResponse>(`/users/${id}`),
    updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>('/auth/profile', data),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      api.put<ApiResponse>('/auth/change-password', data),
  },

  // Contatos
  contacts: {
    create: (data: Omit<Contact, 'id' | 'status' | 'createdAt'>) =>
      api.post<ApiResponse<Contact>>('/contact', data),
    getAll: (params?: { page?: number; limit?: number; status?: string }) =>
      api.get<ApiResponse<PaginatedResponse<Contact>>>('/contact', { params }),
    getById: (id: string) => api.get<ApiResponse<Contact>>(`/contact/${id}`),
    update: (id: string, data: Partial<Contact>) => api.put<ApiResponse<Contact>>(`/contact/${id}`, data),
    delete: (id: string) => api.delete<ApiResponse>(`/contact/${id}`),
  },

  // Artigos
  articles: {
    getAll: (params?: { page?: number; limit?: number; category?: string; featured?: boolean }) =>
      api.get<ApiResponse<PaginatedResponse<Article>>>('/articles', { params }),
    getBySlug: (slug: string) => api.get<ApiResponse<Article>>(`/articles/slug/${slug}`),
    getById: (id: string) => api.get<ApiResponse<Article>>(`/articles/${id}`),
    create: (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<ApiResponse<Article>>('/articles', data),
    update: (id: string, data: Partial<Article>) => api.put<ApiResponse<Article>>(`/articles/${id}`, data),
    delete: (id: string) => api.delete<ApiResponse>(`/articles/${id}`),
  },

  // Newsletter
  newsletter: {
    subscribe: (email: string, name?: string) =>
      api.post<ApiResponse>('/newsletter/subscribe', { email, name }),
    unsubscribe: (email: string) => api.post<ApiResponse>('/newsletter/unsubscribe', { email }),
    getSubscribers: (params?: { page?: number; limit?: number }) =>
      api.get<ApiResponse<PaginatedResponse<{ id: string; email: string; name?: string; createdAt: string }>>>('/newsletter', { params }),
  },

  // Calculadora
  calculator: {
    calculate: (data: {
      revenue: number
      employees: number
      businessType: 'mei' | 'simples' | 'presumido' | 'real'
      hasPartners: boolean
    }) => api.post<ApiResponse<any>>('/calculator', data),
  },

  // Admin
  admin: {
    getDashboard: () => api.get<ApiResponse<any>>('/admin/dashboard'),
    getSystemInfo: () => api.get<ApiResponse<any>>('/admin/system-info'),
    getActivityLogs: (params?: { page?: number; limit?: number }) =>
      api.get<ApiResponse<PaginatedResponse<any>>>('/admin/activity-logs', { params }),
    createBackup: () => api.post<ApiResponse<any>>('/admin/backups'),
    getBackups: () => api.get<ApiResponse<any[]>>('/admin/backups'),
    downloadBackup: (filename: string) => api.get(`/admin/backups/${filename}`, { responseType: 'blob' }),
    deleteBackup: (filename: string) => api.delete<ApiResponse>(`/admin/backups/${filename}`),
    getSettings: () => api.get<ApiResponse<any>>('/admin/settings'),
    updateSettings: (data: any) => api.put<ApiResponse<any>>('/admin/settings', data),
  },
}

export default api