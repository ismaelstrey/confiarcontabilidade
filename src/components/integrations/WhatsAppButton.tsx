'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/config';

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  variant?: 'fixed' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

export function WhatsAppButton({ 
  message = 'Olá! Gostaria de saber mais sobre os serviços contábeis.',
  className = '',
  variant = 'fixed',
  size = 'md'
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const phoneNumber = siteConfig.contact?.whatsapp?.replace(/\D/g, '') || '11999999999'; // Remove non-digits
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodedMessage}`;
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };
  
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8'
  };
  
  const baseClasses = `
    bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl
    transition-all duration-300 flex items-center justify-center group z-50
    ${sizeClasses[size]} ${className}
  `;
  
  const fixedClasses = 'fixed bottom-6 right-6';
  
  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };
  
  if (variant === 'fixed') {
    return (
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`${baseClasses} ${fixedClasses}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <MessageCircle className={`${iconSizes[size]} group-hover:scale-110 transition-transform`} />
        
        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : 10
          }}
          className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none"
        >
          Fale conosco no WhatsApp
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </motion.div>
        
        {/* Pulse animation */}
        <motion.div
          className="absolute inset-0 bg-green-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>
    );
  }
  
  return (
    <motion.button
      onClick={handleClick}
      className={baseClasses}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className={`${iconSizes[size]} mr-2`} />
      <span className="font-semibold">WhatsApp</span>
    </motion.button>
  );
}

// Componente para link de WhatsApp com número específico
interface WhatsAppLinkProps {
  phone?: string;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export function WhatsAppLink({ 
  phone,
  message = 'Olá! Gostaria de saber mais sobre os serviços contábeis.',
  children,
  className = ''
}: WhatsAppLinkProps) {
  const phoneNumber = phone ? phone.replace(/\D/g, '') : siteConfig.contact?.whatsapp?.replace(/\D/g, '') || '11999999999';
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodedMessage}`;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <a
      href={whatsappUrl}
      onClick={handleClick}
      className={`inline-flex items-center text-green-600 hover:text-green-700 transition-colors ${className}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

// Hook para gerar URLs do WhatsApp
export function useWhatsApp() {
  const generateWhatsAppUrl = (message: string, phone?: string) => {
    const phoneNumber = phone ? phone.replace(/\D/g, '') : siteConfig.contact?.whatsapp?.replace(/\D/g, '') || '11999999999';
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/55${phoneNumber}?text=${encodedMessage}`;
  };
  
  const openWhatsApp = (message: string, phone?: string) => {
    const url = generateWhatsAppUrl(message, phone);
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return {
    generateWhatsAppUrl,
    openWhatsApp
  };
}