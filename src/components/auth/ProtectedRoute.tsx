'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Se requer autenticação e usuário não está autenticado
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Se requer admin e usuário não é admin
    if (requireAdmin && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard'); // Redireciona para dashboard se não for admin
      return;
    }
  }, [isAuthenticated, isLoading, user, requireAuth, requireAdmin, router, redirectTo]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se requer autenticação e usuário não está autenticado, não renderiza nada
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Se requer admin e usuário não é admin, não renderiza nada
  if (requireAdmin && (!user || user.role !== 'ADMIN')) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;