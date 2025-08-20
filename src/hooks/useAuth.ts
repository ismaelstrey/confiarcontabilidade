'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook customizado para acessar o contexto de autenticação
 * Re-exporta o hook do contexto para manter compatibilidade
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;