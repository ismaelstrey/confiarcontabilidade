'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function ProfilePageContent() {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
      })
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    try {
      setIsUpdatingProfile(true)
      await updateProfile(profileData)
      setProfileSuccess('Perfil atualizado com sucesso!')
    } catch (err: any) {
      setProfileError(err.message)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    try {
      setIsChangingPassword(true)
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordSuccess('Senha alterada com sucesso!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err: any) {
      setPasswordError(err.message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                ← Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
            <div></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Informações Pessoais
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Alterar Senha
              </button>
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Informações Pessoais</h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div className="text-sm text-gray-500">
                  <p><strong>Tipo de conta:</strong> {user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</p>
                  <p><strong>Membro desde:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </div>

                {profileError && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{profileError}</div>
                  </div>
                )}

                {profileSuccess && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-700">{profileSuccess}</div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingProfile ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Alterar Senha</h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Senha atual
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nova senha
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                {passwordError && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{passwordError}</div>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-700">{passwordSuccess}</div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ProfilePageContent />
    </ProtectedRoute>
  )
}