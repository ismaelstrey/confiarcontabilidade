import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  phone: z.string().min(10),
  company: z.string().optional(),
  service: z.string().min(1),
  message: z.string().min(10).max(1000),
  terms: z.boolean().refine(val => val === true)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validatedData = contactSchema.parse(body);
    
    // Aqui você pode integrar com:
    // - Serviço de email (SendGrid, Resend, etc.)
    // - CRM (HubSpot, Pipedrive, etc.)
    // - Banco de dados
    // - Webhook do WhatsApp Business
    
    console.log('Dados do contato recebidos:', {
      ...validatedData,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Em produção, você enviaria emails, salvaria no banco, etc.
    // Exemplo de integração com email:
    /*
    await sendEmail({
      to: 'contato@contabilpro.com.br',
      subject: `Novo contato: ${validatedData.name}`,
      html: `
        <h2>Novo contato recebido</h2>
        <p><strong>Nome:</strong> ${validatedData.name}</p>
        <p><strong>Email:</strong> ${validatedData.email}</p>
        <p><strong>Telefone:</strong> ${validatedData.phone}</p>
        <p><strong>Empresa:</strong> ${validatedData.company || 'Não informado'}</p>
        <p><strong>Serviço:</strong> ${validatedData.service}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${validatedData.message}</p>
      `
    });
    
    // Email de confirmação para o cliente
    await sendEmail({
      to: validatedData.email,
      subject: 'Confirmação de contato - ContabilPro',
      html: `
        <h2>Obrigado pelo seu contato!</h2>
        <p>Olá ${validatedData.name},</p>
        <p>Recebemos sua mensagem e nossa equipe entrará em contato em breve.</p>
        <p>Dados do seu contato:</p>
        <ul>
          <li><strong>Serviço:</strong> ${validatedData.service}</li>
          <li><strong>Mensagem:</strong> ${validatedData.message}</li>
        </ul>
        <p>Atenciosamente,<br>Equipe ContabilPro</p>
      `
    });
    */
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Mensagem enviada com sucesso!' 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Erro ao processar contato:', error);
    
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
        message: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

// Função auxiliar para envio de emails (exemplo)
/*
async function sendEmail({ to, subject, html }: {
  to: string;
  subject: string;
  html: string;
}) {
  // Exemplo com SendGrid
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to,
    from: 'contato@contabilpro.com.br',
    subject,
    html,
  };
  
  await sgMail.send(msg);
}
*/