# Prompt: Páginas Internas do Site

## 🎯 Objetivo
Implementar todas as páginas internas do site com conteúdo rico, animações consistentes e otimização para SEO e conversão.

## 📋 Prompt para IA

```
Crie todas as páginas internas do site institucional de contabilidade com conteúdo profissional, design consistente e funcionalidades específicas para cada seção.

**PÁGINAS OBRIGATÓRIAS:**

## 1. PÁGINA SOBRE NÓS (/sobre)
Crie `src/app/sobre/page.tsx` com:

**Seções:**

### Hero Section Interna
- Título: "Nossa História de Excelência"
- Subtítulo: "15 anos transformando empresas através da contabilidade estratégica"
- Background com padrão sutil
- Breadcrumb navigation

### História da Empresa
- Timeline interativa com marcos importantes
- Animação de scroll reveal
- Anos: 2008 (Fundação), 2012 (Expansão), 2018 (Digitalização), 2023 (Inovação)

### Missão, Visão e Valores
- Cards animados com ícones
- Hover effects elegantes
- Layout em grid responsivo

**Conteúdo:**
```
Missão: "Oferecer soluções contábeis estratégicas que impulsionem o crescimento sustentável dos nossos clientes."
Visão: "Ser referência em contabilidade empresarial, reconhecida pela excelência e inovação."
Valores: Transparência, Excelência, Inovação, Compromisso, Ética
```

### Certificações e Prêmios
- Grid de certificações com logos
- Hover effects com informações adicionais
- Badges de reconhecimento

### Equipe Executiva
- Cards da diretoria com fotos profissionais
- Modal com biografia completa
- Links para LinkedIn

## 2. PÁGINA DE SERVIÇOS (/servicos)
Crie `src/app/servicos/page.tsx` com:

**Estrutura:**

### Hero Section
- Título: "Soluções Contábeis Completas"
- Subtítulo: "Serviços especializados para cada necessidade da sua empresa"

### Grid de Serviços
- Cards expandidos com mais detalhes
- Ícones personalizados para cada serviço
- Botão "Solicitar Orçamento" em cada card
- Animações de entrada escalonadas

**Serviços Detalhados:**

1. **Contabilidade Empresarial**
   - Escrituração contábil
   - Demonstrações financeiras
   - Conciliações bancárias
   - Análise de resultados

2. **Consultoria Fiscal**
   - Compliance tributário
   - Revisão de obrigações
   - Defesa em fiscalizações
   - Orientação preventiva

3. **Planejamento Tributário**
   - Análise de regime tributário
   - Elisão fiscal
   - Reorganização societária
   - Simulações tributárias

4. **Abertura de Empresas**
   - Constituição societária
   - Registro em órgãos
   - Licenças e alvarás
   - Orientação inicial

5. **Departamento Pessoal**
   - Folha de pagamento
   - Admissões e demissões
   - Obrigações trabalhistas
   - eSocial e FGTS

6. **Auditoria Contábil**
   - Auditoria independente
   - Due diligence
   - Revisão de processos
   - Relatórios especializados

### Seção de Processo
- Como trabalhamos (4 etapas)
- Timeline visual com animações
- Ícones e descrições claras

### CTA Section
- Formulário de solicitação de orçamento
- Campos: Nome, Email, Telefone, Empresa, Serviço, Mensagem
- Validação em tempo real

## 3. PÁGINA DA EQUIPE (/equipe)
Crie `src/app/equipe/page.tsx` com:

**Funcionalidades:**

### Hero Section
- Título: "Nossa Equipe Especializada"
- Subtítulo: "Profissionais qualificados e experientes ao seu serviço"

### Grid da Equipe
- Cards com foto, nome, cargo, especialização
- Hover effect revelando mais informações
- Modal com biografia completa
- Links para redes sociais profissionais

**Estrutura da Equipe:**
```
Diretoria:
- João Silva - Diretor Geral (CRC 123456)
- Maria Santos - Diretora Técnica (CRC 789012)

Contadores:
- Carlos Oliveira - Contador Sênior
- Ana Costa - Contadora Pleno
- Pedro Lima - Contador Júnior

Consultores:
- Lucia Ferreira - Consultora Fiscal
- Roberto Alves - Consultor Tributário

Supporte:
- Fernanda Silva - Analista Contábil
- Marcos Souza - Assistente Administrativo
```

### Seção de Especializações
- Áreas de expertise da equipe
- Certificações e formações
- Educação continuada

## 4. PÁGINA DE CONTATO (/contato)
Crie `src/app/contato/page.tsx` com:

**Elementos:**

### Hero Section
- Título: "Entre em Contato Conosco"
- Subtítulo: "Estamos prontos para atender sua empresa"

### Formulário Principal
- Campos: Nome*, Email*, Telefone*, Empresa, Tipo de Serviço*, Mensagem*
- Validação com Zod
- reCAPTCHA integrado
- Estados de loading e sucesso
- Integração com API de envio

### Informações de Contato
- Endereço completo
- Telefones (fixo e WhatsApp)
- Email comercial
- Horário de funcionamento
- Redes sociais

### Mapa Interativo
- Google Maps embed
- Marcador personalizado
- Botão "Como Chegar"

### Outras Formas de Contato
- WhatsApp Business
- Chat online (se implementado)
- Agendamento de reunião

## 5. PÁGINA DO BLOG (/blog)
Crie `src/app/blog/page.tsx` com:

**Funcionalidades:**

### Hero Section
- Título: "Blog ContabilPro"
- Subtítulo: "Insights e dicas sobre contabilidade e gestão empresarial"

### Lista de Artigos
- Grid responsivo de cards
- Imagem, título, resumo, data, autor
- Categorias com cores diferentes
- Paginação ou infinite scroll
- Sistema de busca

### Sidebar
- Artigos mais lidos
- Categorias
- Newsletter signup
- Redes sociais

**Categorias:**
- Contabilidade Empresarial
- Tributário
- Trabalhista
- Gestão Financeira
- Legislação
- Dicas Empresariais

### Artigos Exemplo (criar 6-8 artigos):
1. "Como escolher o regime tributário ideal para sua empresa"
2. "eSocial: Guia completo para empresas"
3. "Planejamento tributário: economize legalmente"
4. "Demonstrações financeiras: entenda os relatórios"
5. "Compliance fiscal: evite problemas com o fisco"

## 6. PÁGINAS DE SERVIÇOS INDIVIDUAIS
Crie páginas específicas para cada serviço principal:

### /servicos/contabilidade
### /servicos/consultoria
### /servicos/planejamento
### /servicos/abertura

**Estrutura padrão:**
- Hero específico do serviço
- Descrição detalhada
- Benefícios e vantagens
- Processo de trabalho
- Cases de sucesso
- FAQ específico
- CTA para orçamento

**IMPLEMENTAÇÃO TÉCNICA:**

## COMPONENTE DE PÁGINA PADRÃO:

```typescript
import { Metadata } from 'next'
import { Container, Section } from '@/components/ui'
import { PageHeader } from '@/components/layout'
import { motion } from 'framer-motion'

interface PageProps {
  title: string
  subtitle: string
  breadcrumb?: Array<{ name: string; href: string }>
  children: React.ReactNode
}

const PageTemplate = ({ title, subtitle, breadcrumb, children }: PageProps) => {
  return (
    <>
      <PageHeader 
        title={title}
        subtitle={subtitle}
        breadcrumb={breadcrumb}
      />
      <main>
        {children}
      </main>
    </>
  )
}

// Exemplo de uso na página Sobre
export const metadata: Metadata = {
  title: 'Sobre Nós - ContabilPro',
  description: 'Conheça a história, missão e valores da ContabilPro. 15 anos de excelência em contabilidade empresarial.',
  openGraph: {
    title: 'Sobre Nós - ContabilPro',
    description: 'Conheça nossa história de 15 anos em contabilidade empresarial.',
    images: ['/images/sobre-og.jpg'],
  },
}

export default function SobrePage() {
  const breadcrumb = [
    { name: 'Início', href: '/' },
    { name: 'Sobre Nós', href: '/sobre' }
  ]

  return (
    <PageTemplate 
      title="Nossa História de Excelência"
      subtitle="15 anos transformando empresas através da contabilidade estratégica"
      breadcrumb={breadcrumb}
    >
      <HistorySection />
      <MissionSection />
      <CertificationsSection />
      <TeamSection />
    </PageTemplate>
  )
}
```

## COMPONENTE TIMELINE:

```typescript
interface TimelineItem {
  year: string
  title: string
  description: string
  icon: React.ReactNode
}

const Timeline = ({ items }: { items: TimelineItem[] }) => {
  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200" />
      
      <div className="space-y-12">
        {items.map((item, index) => (
          <motion.div
            key={item.year}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative flex items-start"
          >
            {/* Ícone */}
            <div className="flex-shrink-0 w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white relative z-10">
              {item.icon}
            </div>
            
            {/* Conteúdo */}
            <div className="ml-8 flex-1">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {item.year}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
```

**SEO PARA CADA PÁGINA:**
- Meta tags únicas e otimizadas
- Schema markup apropriado
- URLs amigáveis
- Breadcrumbs estruturados
- Open Graph tags
- Canonical URLs

**PERFORMANCE:**
- Lazy loading de imagens
- Code splitting por página
- Prefetch de páginas relacionadas
- Otimização de bundle size

**ACESSIBILIDADE:**
- Headings hierárquicos corretos
- Alt text em todas as imagens
- Focus management
- ARIA labels apropriados
- Contraste adequado
```

## ✅ Critérios de Validação

Após executar este prompt, verifique se:
- [ ] Todas as páginas carregam sem erros
- [ ] Navegação entre páginas funciona
- [ ] Breadcrumbs estão corretos
- [ ] SEO está implementado em todas as páginas
- [ ] Formulários funcionam com validação
- [ ] Animações são consistentes
- [ ] Design responsivo em todas as páginas
- [ ] Performance está otimizada

## 🔄 Próximos Passos

Após completar as páginas internas:
1. Execute o prompt "06-formularios-integracao.md"
2. Implemente sistema de blog dinâmico
3. Configure analytics e tracking
4. Otimize para conversão

---

*Páginas internas bem estruturadas aumentam a credibilidade e convertem mais visitantes em clientes.*