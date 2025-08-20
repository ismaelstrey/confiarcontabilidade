'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, User } from '@/lib/api';


interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && !!token;

  // Carregar dados do usuário do localStorage na inicialização
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.auth.login({ email, password });

      if (response.data.success && response.data.data?.user) {
        const userData = response.data?.data.user;
        const userToken = response.data?.data.token;

        setUser(userData as User);
        setToken(userToken);

        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));

        router.push('/dashboard');
      } else {
        throw new Error(response.data.message || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.auth.register({ name, email, password, confirmPassword });

      if (response.data.success && response.data) {
        const userData = response.data.data?.user;
        const userToken = response.data.data?.token;

        setUser(userData as User);
        setToken(userToken as string);

        localStorage.setItem('token', userToken as string);
        localStorage.setItem('user', JSON.stringify(userData));

        router.push('/dashboard');
      } else {
        throw new Error(response.data.message || 'Erro no registro');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      const response = await apiService.users.updateProfile(data);

      if (response.data.success && response.data) {
        const updatedUser = response.data.data;
        setUser(updatedUser || null);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.users.changePassword({
        currentPassword,
        newPassword
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;