'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Loader2, Phone, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContacts } from '@/hooks/useContacts';
// import { useToast } from '@/components/ui/toast';

const contactSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email muito longo'),
  phone: z.string()
    .regex(/^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/, 'Telefone inválido')
    .min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  company: z.string().optional(),
  service: z.string()
    .min(1, 'Selecione um serviço'),
  message: z.string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(1000, 'Mensagem muito longa'),
  terms: z.boolean()
    .refine(val => val === true, 'Você deve aceitar os termos')
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function ContactForm({className}:{className?:string}) {
  const [isSuccess, setIsSuccess] = useState(false);
  const { createContact, isLoading } = useContacts();
  // const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange'
  });

  const serviceOptions = [
    { value: '', label: 'Selecione um serviço' },
    { value: 'contabilidade', label: 'Contabilidade Empresarial' },
    { value: 'consultoria', label: 'Consultoria Fiscal' },
    { value: 'planejamento', label: 'Planejamento Tributário' },
    { value: 'abertura', label: 'Abertura de Empresa' },
    { value: 'departamento-pessoal', label: 'Departamento Pessoal' },
    { value: 'auditoria', label: 'Auditoria Contábil' },
    { value: 'outros', label: 'Outros Serviços' }
  ];

  const onSubmit = async (data: ContactFormData) => {
    try {
      await createContact({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company || '',
        service: data.service,
        message: data.message
      });
      
      setIsSuccess(true);
      reset();
      
      // toast({
      //   type: 'success',
      //   title: 'Mensagem enviada com sucesso!',
      //   description: 'Nossa equipe entrará em contato em até 24 horas.',
      //   duration: 5000
      // });
    } catch (error) {
      console.error('Erro ao enviar contato:', error);
      // toast({
      //   type: 'error',
      //   title: 'Erro ao enviar mensagem',
      //   description: 'Tente novamente ou entre em contato via WhatsApp.',
      //   duration: 5000
      // });
    }
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue('phone', formatted);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center ${className}`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-success-600" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Mensagem Enviada!
        </h3>
        <p className="text-gray-600 mb-6">
          Obrigado pelo seu contato. Nossa equipe entrará em contato em breve.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => setIsSuccess(false)}
          >
            Enviar Nova Mensagem
          </Button>
          <Button
            variant="primary"
            asChild
          >
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className={`bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6 ${className}`}
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Entre em Contato
        </h3>
        <p className="text-gray-600">
          Preencha o formulário e nossa equipe entrará em contato
        </p>
      </div>

      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Seu nome completo"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 flex items-center"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.name.message}
          </motion.p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="seu@email.com"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 flex items-center"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.email.message}
          </motion.p>
        )}
      </div>

      {/* Telefone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone *</Label>
        <Input
          id="phone"
          {...register('phone')}
          onChange={handlePhoneChange}
          placeholder="(51) 99999-9999"
          className={errors.phone ? 'border-red-500' : ''}
          maxLength={15}
        />
        {errors.phone && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 flex items-center"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.phone.message}
          </motion.p>
        )}
      </div>

      {/* Empresa */}
      <div className="space-y-2">
        <Label htmlFor="company">Empresa (opcional)</Label>
        <Input
          id="company"
          {...register('company')}
          placeholder="Nome da sua empresa"
        />
      </div>

      {/* Serviço */}
      <div className="space-y-2">
        <Label htmlFor="service">Tipo de Serviço *</Label>
        <Select onValueChange={(value) => setValue('service', value)}>
          <SelectTrigger className={errors.service ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecione um serviço" />
          </SelectTrigger>
          <SelectContent>
            {serviceOptions.slice(1).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.service && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 flex items-center"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.service.message}
          </motion.p>
        )}
      </div>

      {/* Mensagem */}
      <div className="space-y-2">
        <Label htmlFor="message">Mensagem *</Label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder="Descreva como podemos ajudar você..."
          rows={4}
          className={errors.message ? 'border-red-500' : ''}
        />
        {errors.message && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 flex items-center"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.message.message}
          </motion.p>
        )}
      </div>

      {/* Termos */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          {...register('terms')}
          className={errors.terms ? 'border-red-500' : ''}
        />
        <div className="space-y-1">
          <Label htmlFor="terms" className="text-sm leading-relaxed">
            Aceito os{' '}
            <a href="/termos" className="text-primary-600 hover:underline">
              termos de uso
            </a>{' '}
            e{' '}
            <a href="/privacidade" className="text-primary-600 hover:underline">
              política de privacidade
            </a>
            *
          </Label>
          {errors.terms && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 flex items-center"
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.terms.message}
            </motion.p>
          )}
        </div>
      </div>



      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={isLoading}
        className="relative"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Enviar Mensagem
          </>
        )}
      </Button>

      {/* Alternative Contact */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3">
          Ou entre em contato diretamente:
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href="tel:+5511999999999">
              <Phone className="w-4 h-4 mr-2" />
              (51) 99916-0766
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href="mailto:contato@contabilidadeigrejinha.com.br">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </a>
          </Button>
          <Button
            variant="primary"
            size="sm"
            asChild
          >
            <a href="https://wa.me/5551999160766" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </motion.form>
  );
}