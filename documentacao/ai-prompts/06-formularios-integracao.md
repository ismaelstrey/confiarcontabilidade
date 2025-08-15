# Prompt: Formulários e Integrações

## 🎯 Objetivo
Implementar sistema completo de formulários com validação avançada, integração com APIs de envio, reCAPTCHA, WhatsApp Business e outras integrações essenciais para conversão de leads.

## 📋 Prompt para IA

```
Implemente um sistema robusto de formulários e integrações para o site de contabilidade, focando em captura de leads, segurança e experiência do usuário excepcional.

**FORMULÁRIOS OBRIGATÓRIOS:**

## 1. FORMULÁRIO DE CONTATO PRINCIPAL
Crie `src/components/forms/ContactForm.tsx` com:

**Campos:**
- Nome completo* (validação: mín 2 caracteres)
- Email* (validação: formato válido)
- Telefone* (validação: formato brasileiro)
- Empresa (opcional)
- Tipo de serviço* (select com opções)
- Mensagem* (textarea, mín 10 caracteres)
- Aceite de termos* (checkbox obrigatório)

**Funcionalidades:**
- Validação em tempo real com Zod
- Estados visuais (error, success, loading)
- Máscara para telefone brasileiro
- reCAPTCHA v3 integrado
- Envio via API route do Next.js
- Confirmação por email automática
- Integração com WhatsApp (opcional)

**Implementação:**

```typescript
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { toast } from 'react-hot-toast'
import ReCAPTCHA from 'react-google-recaptcha'

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
    .refine(val => val === true, 'Você deve aceitar os termos'),
  recaptcha: z.string()
    .min(1, 'Verificação de segurança obrigatória')
})

type ContactFormData = z.infer<typeof contactSchema>

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null)

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
  })

  const serviceOptions = [
    { value: '', label: 'Selecione um serviço' },
    { value: 'contabilidade', label: 'Contabilidade Empresarial' },
    { value: 'consultoria', label: 'Consultoria Fiscal' },
    { value: 'planejamento', label: 'Planejamento Tributário' },
    { value: 'abertura', label: 'Abertura de Empresa' },
    { value: 'departamento-pessoal', label: 'Departamento Pessoal' },
    { value: 'auditoria', label: 'Auditoria Contábil' },
    { value: 'outros', label: 'Outros Serviços' }
  ]

  const onSubmit = async (data: ContactFormData) => {
    if (!recaptchaValue) {
      toast.error('Por favor, complete a verificação de segurança')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recaptcha: recaptchaValue
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem')
      }

      const result = await response.json()
      
      setIsSuccess(true)
      reset()
      setRecaptchaValue(null)
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.')
      
      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000)
      
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value)
    setValue('recaptcha', value || '')
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Mensagem Enviada!
        </h3>
        <p className="text-gray-600 mb-6">
          Obrigado pelo contato. Nossa equipe entrará em contato em breve.
        </p>
        <Button 
          onClick={() => setIsSuccess(false)}
          variant="primary"
        >
          Enviar Nova Mensagem
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Nome */}
      <div>
        <Input
          label="Nome Completo"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Seu nome completo"
          required
        />
      </div>

      {/* Email e Telefone */}
      <div className="grid md:grid-cols-2 gap-6">
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="seu@email.com"
          required
        />
        <Input
          label="Telefone"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="(11) 99999-9999"
          mask="(99) 99999-9999"
          required
        />
      </div>

      {/* Empresa e Serviço */}
      <div className="grid md:grid-cols-2 gap-6">
        <Input
          label="Empresa"
          {...register('company')}
          placeholder="Nome da sua empresa"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Serviço *
          </label>
          <select
            {...register('service')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
              errors.service ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {serviceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.service && (
            <p className="mt-1 text-sm text-red-600">
              {errors.service.message}
            </p>
          )}
        </div>
      </div>

      {/* Mensagem */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mensagem *
        </label>
        <textarea
          {...register('message')}
          rows={5}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none ${
            errors.message ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descreva como podemos ajudar sua empresa..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* reCAPTCHA */}
      <div className="flex justify-center">
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          onChange={handleRecaptchaChange}
          theme="light"
        />
        {errors.recaptcha && (
          <p className="mt-1 text-sm text-red-600">
            {errors.recaptcha.message}
          </p>
        )}
      </div>

      {/* Termos */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          {...register('terms')}
          className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label className="text-sm text-gray-600">
          Aceito os{' '}
          <a href="/termos" className="text-primary-600 hover:underline">
            termos de uso
          </a>{' '}
          e{' '}
          <a href="/privacidade" className="text-primary-600 hover:underline">
            política de privacidade
          </a>
          *
        </label>
      </div>
      {errors.terms && (
        <p className="text-sm text-red-600">
          {errors.terms.message}
        </p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
        rightIcon={!isSubmitting ? <Send className="w-5 h-5" /> : undefined}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
      </Button>
    </motion.form>
  )
}

export { ContactForm }
```

## 2. API ROUTE PARA CONTATO
Crie `src/app/api/contact/route.ts` com:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  phone: z.string().min(10),
  company: z.string().optional(),
  service: z.string().min(1),
  message: z.string().min(10).max(1000),
  terms: z.boolean().refine(val => val === true),
  recaptcha: z.string().min(1)
})

// Verificar reCAPTCHA
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  
  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY não configurada')
    return false
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()
    return data.success && data.score > 0.5
  } catch (error) {
    console.error('Erro ao verificar reCAPTCHA:', error)
    return false
  }
}

// Configurar transporter de email
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = contactSchema.parse(body)
    
    // Verificar reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(validatedData.recaptcha)
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: 'Verificação de segurança falhou' },
        { status: 400 }
      )
    }

    const transporter = createTransporter()

    // Email para a empresa
    const companyEmailHtml = `
      <h2>Nova mensagem do site</h2>
      <p><strong>Nome:</strong> ${validatedData.name}</p>
      <p><strong>Email:</strong> ${validatedData.email}</p>
      <p><strong>Telefone:</strong> ${validatedData.phone}</p>
      <p><strong>Empresa:</strong> ${validatedData.company || 'Não informado'}</p>
      <p><strong>Serviço:</strong> ${validatedData.service}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${validatedData.message.replace(/\n/g, '<br>')}</p>
    `

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.CONTACT_EMAIL,
      subject: `Nova mensagem de ${validatedData.name}`,
      html: companyEmailHtml,
    })

    // Email de confirmação para o cliente
    const clientEmailHtml = `
      <h2>Obrigado pelo contato!</h2>
      <p>Olá ${validatedData.name},</p>
      <p>Recebemos sua mensagem e nossa equipe entrará em contato em breve.</p>
      <p>Dados da sua solicitação:</p>
      <ul>
        <li><strong>Serviço:</strong> ${validatedData.service}</li>
        <li><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</li>
      </ul>
      <p>Atenciosamente,<br>Equipe ContabilPro</p>
    `

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: validatedData.email,
      subject: 'Confirmação de contato - ContabilPro',
      html: clientEmailHtml,
    })

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro no formulário de contato:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
```

## 3. FORMULÁRIO DE NEWSLETTER
Crie `src/components/forms/NewsletterForm.tsx` com:

**Funcionalidades:**
- Campo email com validação
- Integração com Mailchimp/SendGrid
- Double opt-in
- Estados de loading e sucesso
- LGPD compliance

## 4. FORMULÁRIO DE ORÇAMENTO RÁPIDO
Crie `src/components/forms/QuoteForm.tsx` com:

**Campos:**
- Nome e email
- Tipo de empresa (MEI, ME, EPP, etc.)
- Faturamento mensal estimado
- Serviços de interesse (múltipla escolha)
- Observações

## 5. INTEGRAÇÃO WHATSAPP BUSINESS
Crie `src/components/integrations/WhatsAppButton.tsx` com:

```typescript
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface WhatsAppButtonProps {
  message?: string
  phone?: string
  className?: string
}

const WhatsAppButton = ({ 
  message = "Olá! Gostaria de saber mais sobre os serviços da ContabilPro.",
  phone = "5511999999999",
  className = ""
}: WhatsAppButtonProps) => {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50 transition-colors ${className}`}
    >
      <MessageCircle className="w-6 h-6" />
    </motion.button>
  )
}

export { WhatsAppButton }
```

## 6. CALCULADORAS FISCAIS
Crie `src/components/calculators/` com:

### Calculadora Simples Nacional
- Faturamento mensal
- Atividade da empresa
- Cálculo automático do imposto
- Comparação com outros regimes

### Calculadora de Rescisão
- Dados do funcionário
- Tipo de rescisão
- Cálculo de verbas rescisórias

## 7. SISTEMA DE AGENDAMENTO
Crie `src/components/forms/ScheduleForm.tsx` com:

**Funcionalidades:**
- Calendário interativo
- Horários disponíveis
- Tipos de reunião
- Confirmação por email
- Integração com Google Calendar

**INTEGRAÇÕES ADICIONAIS:**

## GOOGLE ANALYTICS 4
```typescript
// src/lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
```

## FACEBOOK PIXEL
```typescript
// src/lib/fbpixel.ts
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

export const pageview = () => {
  window.fbq('track', 'PageView')
}

export const event = (name: string, options = {}) => {
  window.fbq('track', name, options)
}
```

## HOTJAR INTEGRATION
```typescript
// src/lib/hotjar.ts
export const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID

export const initHotjar = () => {
  if (typeof window !== 'undefined' && HOTJAR_ID) {
    (function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid: HOTJAR_ID, hjsv:6};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  }
}
```

**VARIÁVEIS DE AMBIENTE (.env.local):**
```
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM="ContabilPro <contato@contabilpro.com>"
CONTACT_EMAIL=contato@contabilpro.com

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=sua-site-key
RECAPTCHA_SECRET_KEY=sua-secret-key

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=123456789
NEXT_PUBLIC_HOTJAR_ID=1234567

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999

# Mailchimp (se usar)
MAILCHIMP_API_KEY=sua-api-key
MAILCHIMP_AUDIENCE_ID=sua-audience-id
```

**SEGURANÇA:**
- Rate limiting nos formulários
- Sanitização de inputs
- Validação server-side
- CSRF protection
- Headers de segurança
- Logs de tentativas suspeitas
```

## ✅ Critérios de Validação

Após executar este prompt, verifique se:
- [ ] Formulários funcionam com validação completa
- [ ] Emails são enviados corretamente
- [ ] reCAPTCHA está funcionando
- [ ] WhatsApp integration funciona
- [ ] Analytics estão trackando eventos
- [ ] Calculadoras funcionam corretamente
- [ ] Sistema de agendamento funciona
- [ ] Todas as integrações estão ativas

## 🔄 Próximos Passos

Após completar formulários e integrações:
1. Execute o prompt "07-otimizacao-seo.md"
2. Configure monitoramento e analytics
3. Teste todas as funcionalidades
4. Prepare para deploy em produção

---

*Formulários bem implementados são essenciais para conversão de visitantes em leads qualificados.*