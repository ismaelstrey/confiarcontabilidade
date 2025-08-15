'use client';

import { Wifi, RefreshCw, Home, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
            <Wifi className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Você está offline
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Dicas para reconectar:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left">
              <li>• Verifique se o Wi-Fi está ativado</li>
              <li>• Teste sua conexão móvel</li>
              <li>• Reinicie seu roteador se necessário</li>
              <li>• Aguarde alguns minutos e tente novamente</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
          
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Ir para Home
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <a href="tel:+5511999999999">
                <Phone className="w-4 h-4 mr-2" />
                Ligar
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              📱 Contato de Emergência
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
              Precisa falar conosco urgentemente?
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">WhatsApp:</span>
                <a 
                  href="https://wa.me/5511999999999" 
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  (11) 99999-9999
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">Email:</span>
                <a 
                  href="mailto:contato@contabilpro.com.br" 
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  contato@contabilpro.com.br
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Esta página funciona mesmo offline graças à nossa tecnologia PWA
          </p>
        </div>
      </div>
    </div>
  );
}