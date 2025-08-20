'use client';

import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

function DashboardContent() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Contabilidade Igrejinha
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Bem-vindo ao Dashboard!
              </h1>
              <p className="text-gray-600 mb-8">
                Aqui você pode gerenciar sua conta e acessar nossos serviços.
              </p>

              {/* User Info Card */}
              <div className="bg-white rounded-lg shadow p-6 mb-8 max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Conta</h2>
                <div className="space-y-2 text-left">
                  <p><strong>Nome:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Tipo:</strong> {user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</p>
                  <p><strong>Membro desde:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                  href="/calculadora"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2">Calculadora de Impostos</h3>
                  <p className="text-blue-100">Calcule seus impostos de forma rápida e precisa</p>
                </Link>

                <Link
                  href="/contato"
                  className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2">Fale Conosco</h3>
                  <p className="text-green-100">Entre em contato para tirar suas dúvidas</p>
                </Link>

                <Link
                  href="/blog"
                  className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg shadow transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2">Blog</h3>
                  <p className="text-purple-100">Leia nossos artigos sobre contabilidade</p>
                </Link>

                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg shadow transition-colors"
                  >
                    <h3 className="text-lg font-semibold mb-2">Painel Admin</h3>
                    <p className="text-red-100">Acesse o painel administrativo</p>
                  </Link>
                )}

                <Link
                  href="/perfil"
                  className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-lg shadow transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2">Meu Perfil</h3>
                  <p className="text-gray-100">Gerencie suas informações pessoais</p>
                </Link>

                <Link
                  href="/servicos"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-lg shadow transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2">Nossos Serviços</h3>
                  <p className="text-indigo-100">Conheça todos os nossos serviços</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardContent />
    </ProtectedRoute>
  );
}