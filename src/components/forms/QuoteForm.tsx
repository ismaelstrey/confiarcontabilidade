'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  Send, 
  User,
  Mail,
  Phone,
  Building,
  MessageSquare,
  Calculator
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';

const quoteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  empresa: z.string().optional(),
  servicos: z.array(z.string()).min(1, 'Selecione pelo menos um serviço'),
  faturamento: z.string().min(1, 'Selecione uma faixa de faturamento'),
  funcionarios: z.string().min(1, 'Selecione o número de funcionários'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  urgencia: z.string().min(1, 'Selecione o prazo desejado'),
  termos: z.boolean().refine(val => val === true, 'Você deve aceitar os termos')
});

type QuoteFormData = z.infer<typeof quoteSchema>;

const services = [
  'Contabilidade Empresarial',
  'Consultoria Fiscal',
  'Planejamento Tributário',
  'Abertura de Empresa',
  'Departamento Pessoal',
  'Auditoria Contábil',
  'Consultoria Empresarial',
  'Gestão Financeira'
];

const revenueRanges = [
  'Até R$ 81.000/ano (MEI)',
  'R$ 81.000 - R$ 360.000/ano (ME)',
  'R$ 360.000 - R$ 4.8M/ano (EPP)',
  'Acima de R$ 4.8M/ano (Média/Grande)'
];

const employeeRanges = [
  '1-5 funcionários',
  '6-20 funcionários',
  '21-50 funcionários',
  '51-100 funcionários',
  'Mais de 100 funcionários'
];

const urgencyOptions = [
  'Não tenho pressa (30+ dias)',
  'Prazo normal (15-30 dias)',
  'Urgente (7-15 dias)',
  'Muito urgente (até 7 dias)'
];

export function QuoteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      servicos: [],
      termos: false
    }
  });

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao enviar solicitação');
      }
      
      reset();
      setSelectedServices([]);
      
      toast({
        type: 'success',
        title: 'Solicitação enviada com sucesso!',
        description: 'Entraremos em contato em até 24 horas com seu orçamento personalizado.',
        duration: 6000
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Erro ao enviar solicitação',
        description: 'Tente novamente ou entre em contato via telefone.',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceToggle = (service: string) => {
    const newServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    
    setSelectedServices(newServices);
    setValue('servicos', newServices);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-8"
    >
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Calculator className="w-6 h-6 mr-2 text-primary-600" />
          Solicitar Orçamento
        </h3>
        <p className="text-gray-600">
          Preencha o formulário abaixo para receber um orçamento personalizado para sua empresa.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Pessoais */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register('nome')}
                className="pl-10"
                placeholder="Seu nome completo"
              />
            </div>
            {errors.nome && (
              <p className="text-red-600 text-sm mt-1">{errors.nome.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register('email')}
                type="email"
                className="pl-10"
                placeholder="seu@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Telefone *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register('telefone')}
                type="tel"
                className="pl-10"
                placeholder="(51) 99999-9999"
              />
            </div>
            {errors.telefone && (
              <p className="text-red-600 text-sm mt-1">{errors.telefone.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome da Empresa
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register('empresa')}
                className="pl-10"
                placeholder="Nome da sua empresa"
              />
            </div>
          </div>
        </div>

        {/* Serviços */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Serviços de Interesse * (selecione um ou mais)
          </label>
          <div className="grid md:grid-cols-2 gap-3">
            {services.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={selectedServices.includes(service)}
                  onCheckedChange={() => handleServiceToggle(service)}
                />
                <label
                  htmlFor={service}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {service}
                </label>
              </div>
            ))}
          </div>
          {errors.servicos && (
            <p className="text-red-600 text-sm mt-1">{errors.servicos.message}</p>
          )}
        </div>

        {/* Informações da Empresa */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Faturamento Anual *
            </label>
            <Select onValueChange={(value) => setValue('faturamento', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a faixa de faturamento" />
              </SelectTrigger>
              <SelectContent>
                {revenueRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.faturamento && (
              <p className="text-red-600 text-sm mt-1">{errors.faturamento.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Número de Funcionários *
            </label>
            <Select onValueChange={(value) => setValue('funcionarios', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o número de funcionários" />
              </SelectTrigger>
              <SelectContent>
                {employeeRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.funcionarios && (
              <p className="text-red-600 text-sm mt-1">{errors.funcionarios.message}</p>
            )}
          </div>
        </div>

        {/* Prazo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Prazo Desejado *
          </label>
          <Select onValueChange={(value) => setValue('urgencia', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Quando você precisa dos serviços?" />
            </SelectTrigger>
            <SelectContent>
              {urgencyOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.urgencia && (
            <p className="text-red-600 text-sm mt-1">{errors.urgencia.message}</p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descrição das Necessidades *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Textarea
              {...register('descricao')}
              className="pl-10 min-h-[120px] resize-none"
              placeholder="Descreva suas necessidades específicas, situação atual da empresa, desafios que enfrenta..."
            />
          </div>
          {errors.descricao && (
            <p className="text-red-600 text-sm mt-1">{errors.descricao.message}</p>
          )}
        </div>

        {/* Termos */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="termos"
            {...register('termos')}
            onCheckedChange={(checked) => setValue('termos', checked as boolean)}
          />
          <label htmlFor="termos" className="text-sm text-gray-700 cursor-pointer">
            Aceito os{' '}
            <a href="/termos" className="text-primary-600 hover:text-primary-700 underline">
              termos de uso
            </a>{' '}
            e{' '}
            <a href="/privacidade" className="text-primary-600 hover:text-primary-700 underline">
              política de privacidade
            </a>
            . Autorizo o contato para apresentação da proposta comercial.
          </label>
        </div>
        {errors.termos && (
          <p className="text-red-600 text-sm mt-1">{errors.termos.message}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 px-8 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Enviando Solicitação...
            </div>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              Solicitar Orçamento Gratuito
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}