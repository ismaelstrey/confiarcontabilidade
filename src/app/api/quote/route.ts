import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados com Zod
    const validatedData = quoteSchema.parse(body);
    
    // Simular processamento (em produção, aqui você faria:
    // - Salvar no banco de dados
    // - Enviar email para a equipe comercial
    // - Integrar com CRM
    // - Enviar email de confirmação para o cliente
    
    console.log('Solicitação de orçamento recebida:', {
      ...validatedData,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Em produção, você pode integrar com:
    // - Nodemailer para envio de emails
    // - SendGrid, Mailgun, etc.
    // - CRM como HubSpot, Pipedrive, etc.
    // - WhatsApp Business API
    
    /*
    // Exemplo de integração com email:
    await sendEmail({
      to: 'comercial@contabilpro.com.br',
      subject: `Nova Solicitação de Orçamento - ${validatedData.nome}`,
      template: 'quote-request',
      data: validatedData
    });
    
    // Exemplo de integração com CRM:
    await createCRMLead({
      name: validatedData.nome,
      email: validatedData.email,
      phone: validatedData.telefone,
      company: validatedData.empresa,
      services: validatedData.servicos,
      revenue: validatedData.faturamento,
      employees: validatedData.funcionarios,
      description: validatedData.descricao,
      urgency: validatedData.urgencia,
      source: 'website-quote-form'
    });
    */
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Solicitação de orçamento recebida com sucesso!',
        data: {
          id: `quote_${Date.now()}`,
          estimatedResponse: '24 horas'
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Erro ao processar solicitação de orçamento:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dados inválidos',
          errors: error.issues
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor. Tente novamente mais tarde.'
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar se a API está funcionando
export async function GET() {
  return NextResponse.json(
    { 
      message: 'Quote API is working',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}