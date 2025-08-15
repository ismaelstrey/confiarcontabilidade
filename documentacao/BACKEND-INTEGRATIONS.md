# Integrações Externas do Backend - Contabilidade Igrejinha

Este documento contém exemplos de implementação para integração do backend com serviços externos, como envio de e-mails, notificações, APIs de terceiros e serviços de armazenamento.

## Serviço de E-mail

### Configuração do Nodemailer

```typescript
// src/config/email.ts
import { env } from './env';

/**
 * Configuração do serviço de e-mail
 */
export const emailConfig = {
  // Configuração do serviço SMTP
  smtp: {
    host: env.email.host,
    port: env.email.port,
    secure: env.email.secure,
    auth: {
      user: env.email.user,
      pass: env.email.password,
    },
  },
  // Configuração de remetente padrão
  defaults: {
    from: {
      name: 'Contabilidade Igrejinha',
      email: env.email.from,
    },
  },
  // Configuração de templates
  templates: {
    dir: 'src/templates/emails',
    engine: 'handlebars',
  },
};
```

### Serviço de E-mail

```typescript
// src/services/emailService.ts
import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { emailConfig } from '../config/email';
import { logger } from '../utils/logger';

/**
 * Interface para dados de e-mail
 */
export interface EmailData {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

/**
 * Serviço para envio de e-mails
 */
export class EmailService {
  private transporter: Transporter;
  private templatesDir: string;

  /**
   * Inicializa o serviço de e-mail
   */
  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig.smtp);
    this.templatesDir = path.resolve(process.cwd(), emailConfig.templates.dir);
    
    // Verifica a conexão com o servidor SMTP
    this.verifyConnection();
  }

  /**
   * Verifica a conexão com o servidor SMTP
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('Conexão com servidor SMTP estabelecida com sucesso');
    } catch (error) {
      logger.error('Erro ao conectar com servidor SMTP:', error);
    }
  }

  /**
   * Compila um template de e-mail com Handlebars
   * @param templateName Nome do template
   * @param context Dados para o template
   * @returns HTML compilado
   */
  private async compileTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    
    try {
      const templateSource = await fs.promises.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateSource);
      return template(context);
    } catch (error) {
      logger.error(`Erro ao compilar template ${templateName}:`, error);
      throw new Error(`Erro ao compilar template ${templateName}`);
    }
  }

  /**
   * Envia um e-mail
   * @param emailData Dados do e-mail
   * @returns Informações do envio
   */
  public async sendEmail(emailData: EmailData): Promise<any> {
    try {
      const { to, subject, template, context, text, html, attachments } = emailData;
      
      let htmlContent = html;
      
      // Compila o template se fornecido
      if (template && context) {
        htmlContent = await this.compileTemplate(template, context);
      }
      
      // Configura o e-mail
      const mailOptions = {
        from: `${emailConfig.defaults.from.name} <${emailConfig.defaults.from.email}>`,
        to,
        subject,
        text,
        html: htmlContent,
        attachments,
      };
      
      // Envia o e-mail
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`E-mail enviado: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Erro ao enviar e-mail:', error);
      throw new Error('Falha ao enviar e-mail');
    }
  }

  /**
   * Envia e-mail de boas-vindas
   * @param to E-mail do destinatário
   * @param name Nome do destinatário
   * @returns Informações do envio
   */
  public async sendWelcomeEmail(to: string, name: string): Promise<any> {
    return this.sendEmail({
      to,
      subject: 'Bem-vindo à Contabilidade Igrejinha',
      template: 'welcome',
      context: {
        name,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        currentYear: new Date().getFullYear(),
      },
    });
  }

  /**
   * Envia e-mail de redefinição de senha
   * @param to E-mail do destinatário
   * @param name Nome do destinatário
   * @param resetToken Token de redefinição
   * @returns Informações do envio
   */
  public async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<any> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to,
      subject: 'Redefinição de Senha',
      template: 'password-reset',
      context: {
        name,
        resetUrl,
        expiresIn: '1 hora',
        currentYear: new Date().getFullYear(),
      },
    });
  }

  /**
   * Envia e-mail de confirmação de contato
   * @param to E-mail do destinatário
   * @param name Nome do destinatário
   * @returns Informações do envio
   */
  public async sendContactConfirmationEmail(to: string, name: string): Promise<any> {
    return this.sendEmail({
      to,
      subject: 'Recebemos sua mensagem - Contabilidade Igrejinha',
      template: 'contact-confirmation',
      context: {
        name,
        websiteUrl: process.env.FRONTEND_URL,
        currentYear: new Date().getFullYear(),
      },
    });
  }

  /**
   * Envia e-mail de notificação de novo contato para a equipe
   * @param contactData Dados do contato
   * @returns Informações do envio
   */
  public async sendNewContactNotification(contactData: any): Promise<any> {
    return this.sendEmail({
      to: emailConfig.defaults.from.email,
      subject: 'Novo Contato Recebido',
      template: 'new-contact-notification',
      context: {
        contact: contactData,
        adminUrl: `${process.env.FRONTEND_URL}/admin/contacts`,
        currentYear: new Date().getFullYear(),
      },
    });
  }

  /**
   * Envia e-mail com resultado de cálculo tributário
   * @param to E-mail do destinatário
   * @param name Nome do destinatário
   * @param calculationResult Resultado do cálculo
   * @returns Informações do envio
   */
  public async sendTaxCalculationEmail(to: string, name: string, calculationResult: any): Promise<any> {
    return this.sendEmail({
      to,
      subject: 'Resultado do Cálculo Tributário - Contabilidade Igrejinha',
      template: 'tax-calculation',
      context: {
        name,
        calculation: calculationResult,
        websiteUrl: process.env.FRONTEND_URL,
        currentYear: new Date().getFullYear(),
      },
    });
  }
}

// Exporta uma instância do serviço
export const emailService = new EmailService();
```

### Exemplo de Template de E-mail

```handlebars
<!-- src/templates/emails/welcome.hbs -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à Contabilidade Igrejinha</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      background-color: #f9fafb;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #6b7280;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bem-vindo à Contabilidade Igrejinha</h1>
    </div>
    <div class="content">
      <p>Olá, {{name}}!</p>
      <p>Estamos muito felizes em tê-lo como cliente da Contabilidade Igrejinha. Sua conta foi criada com sucesso e você já pode acessar nossa plataforma.</p>
      <p>Com nossos serviços, você terá acesso a:</p>
      <ul>
        <li>Consultoria contábil personalizada</li>
        <li>Cálculos tributários precisos</li>
        <li>Relatórios financeiros detalhados</li>
        <li>Suporte especializado</li>
      </ul>
      <p>Para acessar sua conta, clique no botão abaixo:</p>
      <p style="text-align: center;">
        <a href="{{loginUrl}}" class="button">Acessar Minha Conta</a>
      </p>
      <p>Se você tiver alguma dúvida ou precisar de assistência, não hesite em entrar em contato conosco.</p>
      <p>Atenciosamente,<br>Equipe Contabilidade Igrejinha</p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} Contabilidade Igrejinha. Todos os direitos reservados.</p>
      <p>Este e-mail foi enviado para você porque você se cadastrou em nosso site.</p>
    </div>
  </div>
</body>
</html>
```

## Integração com Serviços de Notificação

### Serviço de Notificação Push

```typescript
// src/services/pushNotificationService.ts
import webpush from 'web-push';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Interface para dados de notificação
 */
export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  data?: Record<string, any>;
}

/**
 * Serviço para envio de notificações push
 */
export class PushNotificationService {
  /**
   * Inicializa o serviço de notificações push
   */
  constructor() {
    // Configura as chaves VAPID para Web Push
    webpush.setVapidDetails(
      `mailto:${env.push.contactEmail}`,
      env.push.publicKey,
      env.push.privateKey
    );
  }

  /**
   * Envia uma notificação push para um usuário específico
   * @param userId ID do usuário
   * @param notification Dados da notificação
   * @returns Resultado do envio
   */
  public async sendToUser(userId: string, notification: NotificationData): Promise<any> {
    try {
      // Busca as inscrições do usuário
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
      });

      if (subscriptions.length === 0) {
        logger.info(`Nenhuma inscrição encontrada para o usuário ${userId}`);
        return { sent: 0 };
      }

      // Envia a notificação para cada inscrição
      const results = await Promise.allSettled(
        subscriptions.map(subscription => 
          this.sendNotification(JSON.parse(subscription.subscription), notification)
        )
      );

      // Conta os envios bem-sucedidos
      const successful = results.filter(result => result.status === 'fulfilled').length;

      // Remove inscrições expiradas ou inválidas
      const failedIndices = results
        .map((result, index) => (result.status === 'rejected' ? index : -1))
        .filter(index => index !== -1);

      if (failedIndices.length > 0) {
        await this.removeInvalidSubscriptions(
          failedIndices.map(index => subscriptions[index].id)
        );
      }

      return { sent: successful, failed: failedIndices.length };
    } catch (error) {
      logger.error('Erro ao enviar notificação push:', error);
      throw new Error('Falha ao enviar notificação push');
    }
  }

  /**
   * Envia uma notificação push para todos os usuários
   * @param notification Dados da notificação
   * @returns Resultado do envio
   */
  public async sendToAll(notification: NotificationData): Promise<any> {
    try {
      // Busca todas as inscrições
      const subscriptions = await prisma.pushSubscription.findMany();

      if (subscriptions.length === 0) {
        logger.info('Nenhuma inscrição encontrada');
        return { sent: 0 };
      }

      // Envia a notificação para cada inscrição
      const results = await Promise.allSettled(
        subscriptions.map(subscription => 
          this.sendNotification(JSON.parse(subscription.subscription), notification)
        )
      );

      // Conta os envios bem-sucedidos
      const successful = results.filter(result => result.status === 'fulfilled').length;

      // Remove inscrições expiradas ou inválidas
      const failedIndices = results
        .map((result, index) => (result.status === 'rejected' ? index : -1))
        .filter(index => index !== -1);

      if (failedIndices.length > 0) {
        await this.removeInvalidSubscriptions(
          failedIndices.map(index => subscriptions[index].id)
        );
      }

      return { sent: successful, failed: failedIndices.length };
    } catch (error) {
      logger.error('Erro ao enviar notificação push em massa:', error);
      throw new Error('Falha ao enviar notificação push em massa');
    }
  }

  /**
   * Envia uma notificação push para uma inscrição específica
   * @param subscription Dados da inscrição
   * @param notification Dados da notificação
   * @returns Resultado do envio
   */
  private async sendNotification(
    subscription: webpush.PushSubscription,
    notification: NotificationData
  ): Promise<any> {
    try {
      const payload = JSON.stringify(notification);
      return await webpush.sendNotification(subscription, payload);
    } catch (error) {
      logger.error('Erro ao enviar notificação push individual:', error);
      throw error;
    }
  }

  /**
   * Remove inscrições inválidas
   * @param subscriptionIds IDs das inscrições
   */
  private async removeInvalidSubscriptions(subscriptionIds: string[]): Promise<void> {
    try {
      await prisma.pushSubscription.deleteMany({
        where: {
          id: {
            in: subscriptionIds,
          },
        },
      });
      logger.info(`${subscriptionIds.length} inscrições inválidas removidas`);
    } catch (error) {
      logger.error('Erro ao remover inscrições inválidas:', error);
    }
  }

  /**
   * Salva uma nova inscrição push
   * @param userId ID do usuário
   * @param subscription Dados da inscrição
   * @returns Inscrição salva
   */
  public async saveSubscription(userId: string, subscription: webpush.PushSubscription): Promise<any> {
    try {
      // Verifica se a inscrição já existe
      const existingSubscription = await prisma.pushSubscription.findFirst({
        where: {
          userId,
          endpoint: subscription.endpoint,
        },
      });

      if (existingSubscription) {
        // Atualiza a inscrição existente
        return prisma.pushSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            subscription: JSON.stringify(subscription),
            updatedAt: new Date(),
          },
        });
      }

      // Cria uma nova inscrição
      return prisma.pushSubscription.create({
        data: {
          userId,
          endpoint: subscription.endpoint,
          subscription: JSON.stringify(subscription),
        },
      });
    } catch (error) {
      logger.error('Erro ao salvar inscrição push:', error);
      throw new Error('Falha ao salvar inscrição push');
    }
  }

  /**
   * Remove uma inscrição push
   * @param userId ID do usuário
   * @param endpoint Endpoint da inscrição
   * @returns Resultado da remoção
   */
  public async removeSubscription(userId: string, endpoint: string): Promise<any> {
    try {
      return prisma.pushSubscription.deleteMany({
        where: {
          userId,
          endpoint,
        },
      });
    } catch (error) {
      logger.error('Erro ao remover inscrição push:', error);
      throw new Error('Falha ao remover inscrição push');
    }
  }
}

// Exporta uma instância do serviço
export const pushNotificationService = new PushNotificationService();
```

### Serviço de Notificação por WhatsApp

```typescript
// src/services/whatsappService.ts
import axios from 'axios';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Interface para mensagem do WhatsApp
 */
export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template';
  text?: string;
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: 'header' | 'body' | 'button';
      parameters: Array<{
        type: 'text' | 'currency' | 'date_time';
        text?: string;
        currency?: {
          code: string;
          amount: number;
        };
        date_time?: {
          fallback_value: string;
        };
      }>;
    }>;
  };
}

/**
 * Serviço para envio de mensagens via WhatsApp
 */
export class WhatsAppService {
  private apiUrl: string;
  private apiKey: string;
  private phoneNumberId: string;

  /**
   * Inicializa o serviço de WhatsApp
   */
  constructor() {
    this.apiUrl = 'https://graph.facebook.com/v17.0';
    this.apiKey = env.whatsapp.apiKey;
    this.phoneNumberId = env.whatsapp.phoneNumberId;
  }

  /**
   * Envia uma mensagem de texto via WhatsApp
   * @param to Número de telefone do destinatário
   * @param text Texto da mensagem
   * @returns Resultado do envio
   */
  public async sendTextMessage(to: string, text: string): Promise<any> {
    try {
      // Formata o número de telefone
      const formattedNumber = this.formatPhoneNumber(to);
      
      // Configura a mensagem
      const message: WhatsAppMessage = {
        to: formattedNumber,
        type: 'text',
        text,
      };
      
      // Envia a mensagem
      return this.sendMessage(message);
    } catch (error) {
      logger.error('Erro ao enviar mensagem de texto via WhatsApp:', error);
      throw new Error('Falha ao enviar mensagem via WhatsApp');
    }
  }

  /**
   * Envia uma mensagem de boas-vindas via WhatsApp
   * @param to Número de telefone do destinatário
   * @param name Nome do destinatário
   * @returns Resultado do envio
   */
  public async sendWelcomeMessage(to: string, name: string): Promise<any> {
    try {
      // Formata o número de telefone
      const formattedNumber = this.formatPhoneNumber(to);
      
      // Configura a mensagem de template
      const message: WhatsAppMessage = {
        to: formattedNumber,
        type: 'template',
        template: {
          name: 'welcome_message',
          language: {
            code: 'pt_BR',
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: name,
                },
              ],
            },
          ],
        },
      };
      
      // Envia a mensagem
      return this.sendMessage(message);
    } catch (error) {
      logger.error('Erro ao enviar mensagem de boas-vindas via WhatsApp:', error);
      throw new Error('Falha ao enviar mensagem de boas-vindas via WhatsApp');
    }
  }

  /**
   * Envia uma notificação de contato recebido via WhatsApp
   * @param to Número de telefone do destinatário
   * @param contactName Nome do contato
   * @param contactEmail E-mail do contato
   * @returns Resultado do envio
   */
  public async sendContactNotification(to: string, contactName: string, contactEmail: string): Promise<any> {
    try {
      // Formata o número de telefone
      const formattedNumber = this.formatPhoneNumber(to);
      
      // Configura a mensagem de template
      const message: WhatsAppMessage = {
        to: formattedNumber,
        type: 'template',
        template: {
          name: 'contact_notification',
          language: {
            code: 'pt_BR',
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: contactName,
                },
                {
                  type: 'text',
                  text: contactEmail,
                },
                {
                  type: 'date_time',
                  date_time: {
                    fallback_value: new Date().toLocaleString('pt-BR'),
                  },
                },
              ],
            },
          ],
        },
      };
      
      // Envia a mensagem
      return this.sendMessage(message);
    } catch (error) {
      logger.error('Erro ao enviar notificação de contato via WhatsApp:', error);
      throw new Error('Falha ao enviar notificação de contato via WhatsApp');
    }
  }

  /**
   * Envia uma mensagem via WhatsApp
   * @param message Mensagem a ser enviada
   * @returns Resultado do envio
   */
  private async sendMessage(message: WhatsAppMessage): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        message,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      logger.info('Mensagem WhatsApp enviada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Erro na API do WhatsApp:', error);
      throw new Error('Falha na API do WhatsApp');
    }
  }

  /**
   * Formata um número de telefone para o padrão do WhatsApp
   * @param phoneNumber Número de telefone
   * @returns Número formatado
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove caracteres não numéricos
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Adiciona o código do país se não estiver presente
    if (!cleaned.startsWith('55')) {
      cleaned = `55${cleaned}`;
    }
    
    return cleaned;
  }
}

// Exporta uma instância do serviço
export const whatsappService = new WhatsAppService();
```

## Integração com APIs de Terceiros

### Serviço de Consulta de CNPJ

```typescript
// src/services/cnpjService.ts
import axios from 'axios';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Interface para dados de CNPJ
 */
export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  data_situacao_cadastral: string;
  data_inicio_atividade: string;
  natureza_juridica: string;
  cnae_principal: {
    codigo: string;
    descricao: string;
  };
  cnae_secundarios: Array<{
    codigo: string;
    descricao: string;
  }>;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    municipio: string;
    uf: string;
  };
  telefones: string[];
  email: string;
  capital_social: number;
  porte: string;
  simples_nacional: boolean;
  mei: boolean;
}

/**
 * Serviço para consulta de CNPJ
 */
export class CNPJService {
  private apiUrl: string;
  private apiKey: string;

  /**
   * Inicializa o serviço de consulta de CNPJ
   */
  constructor() {
    this.apiUrl = env.cnpj.apiUrl;
    this.apiKey = env.cnpj.apiKey;
  }

  /**
   * Consulta dados de um CNPJ
   * @param cnpj CNPJ a ser consultado
   * @returns Dados do CNPJ
   */
  public async consultCNPJ(cnpj: string): Promise<CNPJData> {
    try {
      // Formata o CNPJ (remove caracteres não numéricos)
      const formattedCNPJ = cnpj.replace(/\D/g, '');
      
      // Valida o CNPJ
      if (formattedCNPJ.length !== 14) {
        throw new Error('CNPJ inválido');
      }
      
      // Consulta a API
      const response = await axios.get(`${this.apiUrl}/cnpj/${formattedCNPJ}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      // Verifica se a consulta foi bem-sucedida
      if (response.status !== 200) {
        throw new Error(`Erro na consulta de CNPJ: ${response.statusText}`);
      }
      
      // Retorna os dados formatados
      return this.formatCNPJData(response.data);
    } catch (error) {
      logger.error('Erro ao consultar CNPJ:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('CNPJ não encontrado');
        } else if (error.response.status === 429) {
          throw new Error('Limite de consultas excedido. Tente novamente mais tarde');
        }
      }
      
      throw new Error('Falha ao consultar CNPJ');
    }
  }

  /**
   * Formata os dados de CNPJ recebidos da API
   * @param data Dados brutos da API
   * @returns Dados formatados
   */
  private formatCNPJData(data: any): CNPJData {
    // Implementação específica para a API utilizada
    // Este exemplo assume uma estrutura específica de resposta
    return {
      cnpj: data.cnpj,
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia || '',
      situacao_cadastral: data.situacao_cadastral,
      data_situacao_cadastral: data.data_situacao_cadastral,
      data_inicio_atividade: data.data_inicio_atividade,
      natureza_juridica: data.natureza_juridica,
      cnae_principal: {
        codigo: data.cnae_principal.codigo,
        descricao: data.cnae_principal.descricao,
      },
      cnae_secundarios: data.cnae_secundarios || [],
      endereco: {
        logradouro: data.endereco.logradouro,
        numero: data.endereco.numero,
        complemento: data.endereco.complemento || '',
        bairro: data.endereco.bairro,
        cep: data.endereco.cep,
        municipio: data.endereco.municipio,
        uf: data.endereco.uf,
      },
      telefones: data.telefones || [],
      email: data.email || '',
      capital_social: data.capital_social,
      porte: data.porte,
      simples_nacional: data.simples_nacional,
      mei: data.mei,
    };
  }

  /**
   * Verifica se um CNPJ é válido
   * @param cnpj CNPJ a ser validado
   * @returns true se o CNPJ for válido, false caso contrário
   */
  public validateCNPJ(cnpj: string): boolean {
    // Remove caracteres não numéricos
    const cleaned = cnpj.replace(/\D/g, '');
    
    // Verifica o tamanho
    if (cleaned.length !== 14) {
      return false;
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleaned)) {
      return false;
    }
    
    // Algoritmo de validação do CNPJ
    let sum = 0;
    let weight = 5;
    
    // Calcula o primeiro dígito verificador
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    let digit = 11 - (sum % 11);
    const firstVerifier = digit > 9 ? 0 : digit;
    
    // Verifica o primeiro dígito verificador
    if (parseInt(cleaned.charAt(12)) !== firstVerifier) {
      return false;
    }
    
    // Calcula o segundo dígito verificador
    sum = 0;
    weight = 6;
    
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    digit = 11 - (sum % 11);
    const secondVerifier = digit > 9 ? 0 : digit;
    
    // Verifica o segundo dígito verificador
    return parseInt(cleaned.charAt(13)) === secondVerifier;
  }
}

// Exporta uma instância do serviço
export const cnpjService = new CNPJService();
```

### Serviço de Consulta de CEP

```typescript
// src/services/cepService.ts
import axios from 'axios';
import { logger } from '../utils/logger';

/**
 * Interface para dados de endereço
 */
export interface AddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  ddd: string;
}

/**
 * Serviço para consulta de CEP
 */
export class CEPService {
  private apiUrl: string;

  /**
   * Inicializa o serviço de consulta de CEP
   */
  constructor() {
    this.apiUrl = 'https://viacep.com.br/ws';
  }

  /**
   * Consulta um CEP
   * @param cep CEP a ser consultado
   * @returns Dados do endereço
   */
  public async consultCEP(cep: string): Promise<AddressData> {
    try {
      // Formata o CEP (remove caracteres não numéricos)
      const formattedCEP = cep.replace(/\D/g, '');
      
      // Valida o CEP
      if (formattedCEP.length !== 8) {
        throw new Error('CEP inválido');
      }
      
      // Consulta a API
      const response = await axios.get(`${this.apiUrl}/${formattedCEP}/json`);
      
      // Verifica se a consulta foi bem-sucedida
      if (response.status !== 200) {
        throw new Error(`Erro na consulta de CEP: ${response.statusText}`);
      }
      
      // Verifica se o CEP existe
      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      return response.data;
    } catch (error) {
      logger.error('Erro ao consultar CEP:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('CEP não encontrado');
        }
      }
      
      throw new Error('Falha ao consultar CEP');
    }
  }

  /**
   * Valida um CEP
   * @param cep CEP a ser validado
   * @returns true se o CEP for válido, false caso contrário
   */
  public validateCEP(cep: string): boolean {
    // Remove caracteres não numéricos
    const cleaned = cep.replace(/\D/g, '');
    
    // Verifica o tamanho
    return cleaned.length === 8;
  }
}

// Exporta uma instância do serviço
export const cepService = new CEPService();
```

## Integração com Serviços de Armazenamento

### Serviço de Armazenamento de Arquivos

```typescript
// src/services/storageService.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Interface para opções de upload
 */
export interface UploadOptions {
  folder?: string;
  contentType?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

/**
 * Serviço para armazenamento de arquivos
 */
export class StorageService {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private localStoragePath: string;
  private useS3: boolean;

  /**
   * Inicializa o serviço de armazenamento
   */
  constructor() {
    this.bucket = env.storage.bucket;
    this.region = env.storage.region;
    this.localStoragePath = path.join(process.cwd(), env.storage.localPath);
    this.useS3 = env.storage.useS3;
    
    // Cria o diretório local se não existir
    if (!this.useS3 && !fs.existsSync(this.localStoragePath)) {
      fs.mkdirSync(this.localStoragePath, { recursive: true });
    }
    
    // Inicializa o cliente S3 se necessário
    if (this.useS3) {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: env.storage.accessKeyId,
          secretAccessKey: env.storage.secretAccessKey,
        },
      });
    }
  }

  /**
   * Faz upload de um arquivo para o armazenamento
   * @param filePath Caminho do arquivo local
   * @param options Opções de upload
   * @returns Informações do arquivo armazenado
   */
  public async uploadFile(filePath: string, options: UploadOptions = {}): Promise<any> {
    try {
      // Gera um nome único para o arquivo
      const fileName = path.basename(filePath);
      const fileExt = path.extname(fileName);
      const uniqueName = `${uuidv4()}${fileExt}`;
      
      // Define o caminho no armazenamento
      const folder = options.folder || 'uploads';
      const key = `${folder}/${uniqueName}`;
      
      if (this.useS3) {
        // Upload para o S3
        const fileContent = fs.readFileSync(filePath);
        
        const command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: fileContent,
          ContentType: options.contentType || this.getContentType(fileExt),
          ACL: options.isPublic ? 'public-read' : 'private',
          Metadata: options.metadata,
        });
        
        await this.s3Client.send(command);
        
        // Gera a URL do arquivo
        const fileUrl = options.isPublic
          ? `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
          : await this.getSignedUrl(key);
        
        return {
          key,
          url: fileUrl,
          size: fs.statSync(filePath).size,
          mimetype: options.contentType || this.getContentType(fileExt),
        };
      } else {
        // Armazenamento local
        const destFolder = path.join(this.localStoragePath, folder);
        
        // Cria a pasta de destino se não existir
        if (!fs.existsSync(destFolder)) {
          fs.mkdirSync(destFolder, { recursive: true });
        }
        
        const destPath = path.join(destFolder, uniqueName);
        
        // Copia o arquivo
        fs.copyFileSync(filePath, destPath);
        
        // Gera a URL do arquivo
        const fileUrl = `/storage/${folder}/${uniqueName}`;
        
        return {
          key,
          url: fileUrl,
          size: fs.statSync(filePath).size,
          mimetype: options.contentType || this.getContentType(fileExt),
        };
      }
    } catch (error) {
      logger.error('Erro ao fazer upload de arquivo:', error);
      throw new Error('Falha ao fazer upload de arquivo');
    }
  }

  /**
   * Faz upload de um buffer para o armazenamento
   * @param buffer Buffer do arquivo
   * @param fileName Nome do arquivo
   * @param options Opções de upload
   * @returns Informações do arquivo armazenado
   */
  public async uploadBuffer(buffer: Buffer, fileName: string, options: UploadOptions = {}): Promise<any> {
    try {
      // Gera um nome único para o arquivo
      const fileExt = path.extname(fileName);
      const uniqueName = `${uuidv4()}${fileExt}`;
      
      // Define o caminho no armazenamento
      const folder = options.folder || 'uploads';
      const key = `${folder}/${uniqueName}`;
      
      if (this.useS3) {
        // Upload para o S3
        const command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: options.contentType || this.getContentType(fileExt),
          ACL: options.isPublic ? 'public-read' : 'private',
          Metadata: options.metadata,
        });
        
        await this.s3Client.send(command);
        
        // Gera a URL do arquivo
        const fileUrl = options.isPublic
          ? `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
          : await this.getSignedUrl(key);
        
        return {
          key,
          url: fileUrl,
          size: buffer.length,
          mimetype: options.contentType || this.getContentType(fileExt),
        };
      } else {
        // Armazenamento local
        const destFolder = path.join(this.localStoragePath, folder);
        
        // Cria a pasta de destino se não existir
        if (!fs.existsSync(destFolder)) {
          fs.mkdirSync(destFolder, { recursive: true });
        }
        
        const destPath = path.join(destFolder, uniqueName);
        
        // Escreve o buffer no arquivo
        fs.writeFileSync(destPath, buffer);
        
        // Gera a URL do arquivo
        const fileUrl = `/storage/${folder}/${uniqueName}`;
        
        return {
          key,
          url: fileUrl,
          size: buffer.length,
          mimetype: options.contentType || this.getContentType(fileExt),
        };
      }
    } catch (error) {
      logger.error('Erro ao fazer upload de buffer:', error);
      throw new Error('Falha ao fazer upload de buffer');
    }
  }

  /**
   * Obtém um arquivo do armazenamento
   * @param key Chave do arquivo
   * @returns Buffer do arquivo
   */
  public async getFile(key: string): Promise<Buffer> {
    try {
      if (this.useS3) {
        // Obtém do S3
        const command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
        
        const response = await this.s3Client.send(command);
        
        // Converte o stream para buffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
        
        return Buffer.concat(chunks);
      } else {
        // Obtém do armazenamento local
        const filePath = path.join(this.localStoragePath, key);
        
        if (!fs.existsSync(filePath)) {
          throw new Error('Arquivo não encontrado');
        }
        
        return fs.readFileSync(filePath);
      }
    } catch (error) {
      logger.error('Erro ao obter arquivo:', error);
      throw new Error('Falha ao obter arquivo');
    }
  }

  /**
   * Exclui um arquivo do armazenamento
   * @param key Chave do arquivo
   * @returns true se o arquivo foi excluído com sucesso
   */
  public async deleteFile(key: string): Promise<boolean> {
    try {
      if (this.useS3) {
        // Exclui do S3
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
        
        await this.s3Client.send(command);
      } else {
        // Exclui do armazenamento local
        const filePath = path.join(this.localStoragePath, key);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        } else {
          logger.warn(`Arquivo não encontrado para exclusão: ${filePath}`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Erro ao excluir arquivo:', error);
      throw new Error('Falha ao excluir arquivo');
    }
  }

  /**
   * Gera uma URL assinada para acesso temporário a um arquivo privado
   * @param key Chave do arquivo
   * @param expiresIn Tempo de expiração em segundos
   * @returns URL assinada
   */
  public async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      if (!this.useS3) {
        // Para armazenamento local, retorna a URL direta
        return `/storage/${key}`;
      }
      
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      
      return getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      logger.error('Erro ao gerar URL assinada:', error);
      throw new Error('Falha ao gerar URL assinada');
    }
  }

  /**
   * Obtém o tipo de conteúdo com base na extensão do arquivo
   * @param ext Extensão do arquivo
   * @returns Tipo de conteúdo
   */
  private getContentType(ext: string): string {
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
    };
    
    return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
  }
}

// Exporta uma instância do serviço
export const storageService = new StorageService();
```

## Integração com Serviços de Pagamento

### Serviço de Pagamento

```typescript
// src/services/paymentService.ts
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Interface para dados de pagamento
 */
export interface PaymentData {
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerDocument?: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
}

/**
 * Interface para dados de cartão de crédito
 */
export interface CreditCardData {
  number: string;
  holderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
}

/**
 * Serviço para processamento de pagamentos
 */
export class PaymentService {
  private apiUrl: string;
  private apiKey: string;

  /**
   * Inicializa o serviço de pagamento
   */
  constructor() {
    this.apiUrl = env.payment.apiUrl;
    this.apiKey = env.payment.apiKey;
  }

  /**
   * Cria um link de pagamento
   * @param paymentData Dados do pagamento
   * @returns Link de pagamento
   */
  public async createPaymentLink(paymentData: PaymentData): Promise<any> {
    try {
      const payload = {
        reference_id: uuidv4(),
        description: paymentData.description,
        amount: {
          value: this.formatAmount(paymentData.amount),
          currency: 'BRL',
        },
        payment_method: {
          type: 'payment_link',
          expiration_date: this.getExpirationDate(7), // 7 dias
        },
        notification_urls: [
          paymentData.callbackUrl || env.payment.defaultCallbackUrl,
        ],
        customer: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          tax_id: paymentData.customerDocument,
          phones: paymentData.customerPhone ? [
            {
              country: '55',
              area: paymentData.customerPhone.substring(0, 2),
              number: paymentData.customerPhone.substring(2),
              type: 'MOBILE',
            },
          ] : undefined,
        },
        metadata: paymentData.metadata,
      };
      
      const response = await axios.post(
        `${this.apiUrl}/payment-links`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      logger.info('Link de pagamento criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Erro ao criar link de pagamento:', error);
      throw new Error('Falha ao criar link de pagamento');
    }
  }

  /**
   * Processa um pagamento com cartão de crédito
   * @param paymentData Dados do pagamento
   * @param cardData Dados do cartão de crédito
   * @returns Resultado do processamento
   */
  public async processCreditCardPayment(paymentData: PaymentData, cardData: CreditCardData): Promise<any> {
    try {
      const payload = {
        reference_id: uuidv4(),
        description: paymentData.description,
        amount: {
          value: this.formatAmount(paymentData.amount),
          currency: 'BRL',
        },
        payment_method: {
          type: 'CREDIT_CARD',
          installments: 1,
          capture: true,
          card: {
            number: cardData.number,
            exp_month: cardData.expirationMonth,
            exp_year: cardData.expirationYear,
            security_code: cardData.cvv,
            holder: {
              name: cardData.holderName,
            },
          },
        },
        notification_urls: [
          paymentData.callbackUrl || env.payment.defaultCallbackUrl,
        ],
        customer: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          tax_id: paymentData.customerDocument,
          phones: paymentData.customerPhone ? [
            {
              country: '55',
              area: paymentData.customerPhone.substring(0, 2),
              number: paymentData.customerPhone.substring(2),
              type: 'MOBILE',
            },
          ] : undefined,
        },
        metadata: paymentData.metadata,
      };
      
      const response = await axios.post(
        `${this.apiUrl}/charges`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      logger.info('Pagamento com cartão processado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Erro ao processar pagamento com cartão:', error);
      throw new Error('Falha ao processar pagamento com cartão');
    }
  }

  /**
   * Gera um QR code para pagamento via PIX
   * @param paymentData Dados do pagamento
   * @returns Dados do QR code
   */
  public async generatePixQRCode(paymentData: PaymentData): Promise<any> {
    try {
      const payload = {
        reference_id: uuidv4(),
        description: paymentData.description,
        amount: {
          value: this.formatAmount(paymentData.amount),
          currency: 'BRL',
        },
        payment_method: {
          type: 'PIX',
          expiration_date: this.getExpirationDate(1), // 1 dia
        },
        notification_urls: [
          paymentData.callbackUrl || env.payment.defaultCallbackUrl,
        ],
        customer: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          tax_id: paymentData.customerDocument,
        },
        metadata: paymentData.metadata,
      };
      
      const response = await axios.post(
        `${this.apiUrl}/charges`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      logger.info('QR code PIX gerado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Erro ao gerar QR code PIX:', error);
      throw new Error('Falha ao gerar QR code PIX');
    }
  }

  /**
   * Consulta o status de um pagamento
   * @param paymentId ID do pagamento
   * @returns Status do pagamento
   */
  public async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/charges/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );
      
      logger.info('Status do pagamento consultado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Erro ao consultar status do pagamento:', error);
      throw new Error('Falha ao consultar status do pagamento');
    }
  }

  /**
   * Cancela um pagamento
   * @param paymentId ID do pagamento
   * @returns Resultado do cancelamento
   */
  public async cancelPayment(paymentId: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/charges/${paymentId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      logger.info('Pagamento cancelado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Erro ao cancelar pagamento:', error);
      throw new Error('Falha ao cancelar pagamento');
    }
  }

  /**
   * Formata o valor para o formato aceito pela API
   * @param amount Valor a ser formatado
   * @returns Valor formatado
   */
  private formatAmount(amount: number): string {
    return (amount * 100).toFixed(0);
  }

  /**
   * Obtém a data de expiração
   * @param days Número de dias para expiração
   * @returns Data de expiração no formato ISO
   */
  private getExpirationDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }
}

// Exporta uma instância do serviço
export const paymentService = new PaymentService();
```

## Integração com Serviços de Logging

### Serviço de Logging

```typescript
// src/utils/logger.ts
import winston from 'winston';
import { env } from '../config/env';

// Configuração de níveis de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Escolhe o nível de log com base no ambiente
const level = () => {
  return env.isDevelopment ? 'debug' : 'info';
};

// Cores para os níveis de log
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Adiciona as cores ao winston
winston.addColors(colors);

// Formato para os logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Transportes para os logs
const transports = [
  // Logs de console
  new winston.transports.Console(),
  
  // Logs de erro em arquivo
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  
  // Todos os logs em arquivo
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Cria o logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});
```

### Integração com Sentry

```typescript
// src/utils/sentry.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { env } from '../config/env';

/**
 * Inicializa o Sentry para monitoramento de erros
 * @param app Instância do Express
 */
export const initSentry = (app: any) => {
  if (!env.sentry.dsn) {
    console.warn('Sentry DSN não configurado. Monitoramento de erros desativado.');
    return;
  }
  
  Sentry.init({
    dsn: env.sentry.dsn,
    integrations: [
      // Habilita o rastreamento de requisições HTTP
      new Sentry.Integrations.Http({ tracing: true }),
      // Habilita o rastreamento do Express
      new Sentry.Integrations.Express({ app }),
      // Habilita o profiling
      new ProfilingIntegration(),
    ],
    // Configura o ambiente
    environment: env.nodeEnv,
    // Habilita o rastreamento de desempenho
    tracesSampleRate: env.isProduction ? 0.1 : 1.0,
    // Habilita o profiling de desempenho
    profilesSampleRate: env.isProduction ? 0.1 : 1.0,
  });
  
  // Middleware de rastreamento do Sentry
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  
  // Middleware de tratamento de erros do Sentry (deve ser registrado após os middlewares de rota e antes do middleware de tratamento de erros personalizado)
  app.use(Sentry.Handlers.errorHandler());
  
  console.log('Sentry inicializado com sucesso.');
};

/**
 * Captura uma exceção no Sentry
 * @param error Erro a ser capturado
 * @param context Contexto adicional
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (!env.sentry.dsn) return;
  
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Captura uma mensagem no Sentry
 * @param message Mensagem a ser capturada
 * @param level Nível da mensagem
 * @param context Contexto adicional
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) => {
  if (!env.sentry.dsn) return;
  
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
};

/**
 * Configura o contexto do usuário no Sentry
 * @param user Dados do usuário
 */
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  if (!env.sentry.dsn) return;
  
  Sentry.setUser(user);
};

/**
 * Remove o contexto do usuário no Sentry
 */
export const clearUser = () => {
  if (!env.sentry.dsn) return;
  
  Sentry.setUser(null);
};
```

## Conclusão

Este documento fornece exemplos de implementação para integração do backend com serviços externos, incluindo:

1. **Serviço de E-mail**: Implementação com Nodemailer para envio de e-mails transacionais e de marketing.
2. **Serviço de Notificação Push**: Implementação com Web Push para envio de notificações push para navegadores.
3. **Serviço de Notificação por WhatsApp**: Implementação para envio de mensagens via WhatsApp usando a API do WhatsApp Business.
4. **Serviço de Consulta de CNPJ**: Implementação para consulta de dados de CNPJ em APIs externas.
5. **Serviço de Consulta de CEP**: Implementação para consulta de endereços a partir de CEPs usando a API ViaCEP.
6. **Serviço de Armazenamento de Arquivos**: Implementação para upload, download e exclusão de arquivos, com suporte a armazenamento local e na nuvem (AWS S3).
7. **Serviço de Pagamento**: Implementação para processamento de pagamentos, geração de links de pagamento e QR codes PIX.
8. **Serviço de Logging**: Implementação com Winston para registro de logs em diferentes níveis.
9. **Integração com Sentry**: Implementação para monitoramento de erros e desempenho da aplicação.

Estas implementações fornecem uma base sólida para a integração do backend com serviços externos, permitindo a criação de uma aplicação completa e robusta.