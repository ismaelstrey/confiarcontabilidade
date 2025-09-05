import { Metadata } from 'next'
import { FileText, Scale, AlertTriangle, Shield, Users, Gavel } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Termos de Uso | Contabilidade Empresarial',
  description: 'Termos de Uso do site e serviços da Contabilidade Empresarial. Conheça seus direitos e obrigações.',
  keywords: 'termos de uso, condições de uso, contrato, serviços contábeis, direitos, obrigações',
  openGraph: {
    title: 'Termos de Uso | Contabilidade Empresarial',
    description: 'Termos e condições de uso dos nossos serviços',
    type: 'website',
  },
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <Scale className="h-12 w-12 mr-4" />
            <h1 className="text-4xl font-bold">Termos de Uso</h1>
          </div>
          <p className="text-xl text-center text-blue-100 max-w-3xl mx-auto">
            Condições gerais de uso do site e serviços
          </p>
          <p className="text-center text-blue-200 mt-4">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Aceitação */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Gavel className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">1. Aceitação dos Termos</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>
                  Ao acessar e utilizar o site da <strong>Contabilidade Empresarial</strong> e/ou contratar 
                  nossos serviços, você concorda em cumprir e ficar vinculado a estes Termos de Uso.
                </p>
                <p>
                  Se você não concordar com qualquer parte destes termos, não deve utilizar nosso site 
                  ou serviços.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                    <p className="text-yellow-800">
                      <strong>Importante:</strong> Estes termos constituem um acordo legal entre você e nossa empresa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Definições */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">2. Definições</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <ul className="list-disc pl-6 mb-6">
                  <li><strong>"Empresa", "nós", "nosso":</strong> Contabilidade Empresarial</li>
                  <li><strong>"Usuário", "você", "seu":</strong> pessoa física ou jurídica que acessa o site ou contrata serviços</li>
                  <li><strong>"Site":</strong> portal eletrônico da Contabilidade Empresarial</li>
                  <li><strong>"Serviços":</strong> todos os serviços contábeis, fiscais e consultivos oferecidos</li>
                  <li><strong>"Conteúdo":</strong> textos, imagens, vídeos e demais materiais disponibilizados</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Serviços */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">3. Descrição dos Serviços</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <h3 className="text-xl font-semibold mb-4">3.1 Serviços Oferecidos:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Contabilidade empresarial e consultiva</li>
                  <li>Assessoria fiscal e tributária</li>
                  <li>Departamento pessoal e folha de pagamento</li>
                  <li>Abertura e legalização de empresas</li>
                  <li>Consultoria empresarial</li>
                  <li>Planejamento tributário</li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-4">3.2 Disponibilidade:</h3>
                <p>
                  Nossos serviços estão disponíveis de segunda a sexta-feira, das 8h às 18h. 
                  O site pode estar temporariamente indisponível devido a manutenções programadas.
                </p>
              </div>
            </div>
          </section>

          {/* Cadastro e Conta */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">4. Cadastro e Conta do Usuário</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <h3 className="text-xl font-semibold mb-4">4.1 Responsabilidades do Usuário:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
                  <li>Manter a confidencialidade de suas credenciais de acesso</li>
                  <li>Notificar imediatamente sobre uso não autorizado de sua conta</li>
                  <li>Ser responsável por todas as atividades realizadas em sua conta</li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-4">4.2 Suspensão de Conta:</h3>
                <p>
                  Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos 
                  ou sejam utilizadas para atividades ilegais ou prejudiciais.
                </p>
              </div>
            </div>
          </section>

          {/* Obrigações */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Scale className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">5. Obrigações das Partes</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <h3 className="text-xl font-semibold mb-4">5.1 Obrigações da Empresa:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Prestar os serviços contratados com qualidade e pontualidade</li>
                  <li>Manter sigilo sobre as informações do cliente</li>
                  <li>Cumprir prazos legais e contratuais</li>
                  <li>Fornecer orientações técnicas adequadas</li>
                  <li>Manter sistemas seguros e atualizados</li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-4">5.2 Obrigações do Cliente:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Fornecer documentos e informações necessárias</li>
                  <li>Efetuar pagamentos nos prazos acordados</li>
                  <li>Comunicar alterações relevantes em tempo hábil</li>
                  <li>Colaborar para o bom andamento dos serviços</li>
                  <li>Cumprir obrigações legais e regulamentares</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Uso Aceitável */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">6. Uso Aceitável</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <h3 className="text-xl font-semibold mb-4">6.1 Usos Proibidos:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Atividades ilegais ou que violem regulamentações</li>
                  <li>Transmissão de vírus, malware ou códigos maliciosos</li>
                  <li>Tentativas de acesso não autorizado aos sistemas</li>
                  <li>Uso para spam ou comunicações não solicitadas</li>
                  <li>Violação de direitos de propriedade intelectual</li>
                  <li>Interferência no funcionamento do site ou serviços</li>
                </ul>
                
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                    <p className="text-red-800">
                      <strong>Violações podem resultar em:</strong> suspensão imediata da conta, 
                      rescisão do contrato e ações legais cabíveis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Propriedade Intelectual */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">7. Propriedade Intelectual</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>
                  Todo o conteúdo do site, incluindo textos, imagens, logos, design, software e 
                  demais elementos, são de propriedade da Contabilidade Empresarial ou de seus 
                  licenciadores, protegidos por direitos autorais e outras leis de propriedade intelectual.
                </p>
                <h3 className="text-xl font-semibold mb-4">7.1 Uso Permitido:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Visualização e navegação pessoal no site</li>
                  <li>Download de materiais expressamente disponibilizados</li>
                  <li>Compartilhamento de links para o conteúdo</li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-4">7.2 Uso Proibido:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Reprodução, distribuição ou modificação sem autorização</li>
                  <li>Uso comercial não autorizado</li>
                  <li>Remoção de avisos de direitos autorais</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pagamentos */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">8. Pagamentos e Cancelamentos</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <h3 className="text-xl font-semibold mb-4">8.1 Condições de Pagamento:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Pagamentos devem ser efetuados conforme acordado no contrato</li>
                  <li>Atraso no pagamento pode resultar em juros e multa</li>
                  <li>Serviços podem ser suspensos em caso de inadimplência</li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-4">8.2 Cancelamento:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Cliente pode cancelar serviços mediante aviso prévio de 30 dias</li>
                  <li>Empresa pode cancelar em caso de violação dos termos</li>
                  <li>Valores pagos antecipadamente serão reembolsados proporcionalmente</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Limitação de Responsabilidade */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">9. Limitação de Responsabilidade</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>
                  Nossa responsabilidade é limitada aos serviços contratados e às obrigações 
                  expressamente assumidas. Não nos responsabilizamos por:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Danos indiretos, incidentais ou consequenciais</li>
                  <li>Perda de lucros, dados ou oportunidades de negócio</li>
                  <li>Ações ou omissões de terceiros</li>
                  <li>Falhas em sistemas de terceiros</li>
                  <li>Caso fortuito ou força maior</li>
                </ul>
                
                <div className="bg-blue-50 p-6 rounded-lg mt-4">
                  <p><strong>Importante:</strong> Esta limitação não se aplica a danos causados por dolo ou culpa grave.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Privacidade */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">10. Privacidade e Proteção de Dados</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>
                  O tratamento de dados pessoais é regido por nossa 
                  <a href="/privacidade" className="text-blue-600 hover:text-blue-800 font-semibold">
                    Política de Privacidade
                  </a>, em conformidade com a LGPD.
                </p>
                <p>
                  Ao utilizar nossos serviços, você concorda com a coleta e uso de informações 
                  conforme descrito em nossa política de privacidade.
                </p>
              </div>
            </div>
          </section>

          {/* Lei Aplicável */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Gavel className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">11. Lei Aplicável e Foro</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>
                  Estes termos são regidos pelas leis brasileiras, especialmente:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Código Civil Brasileiro</li>
                  <li>Código de Defesa do Consumidor</li>
                  <li>Lei Geral de Proteção de Dados (LGPD)</li>
                  <li>Marco Civil da Internet</li>
                </ul>
                <p>
                  Fica eleito o foro da comarca de <strong>São Paulo/SP</strong> para dirimir 
                  quaisquer controvérsias decorrentes destes termos.
                </p>
              </div>
            </div>
          </section>

          {/* Alterações */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">12. Alterações nos Termos</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                  Alterações significativas serão comunicadas através de:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Aviso no site</li>
                  <li>E-mail para usuários cadastrados</li>
                  <li>Notificação na área do cliente</li>
                </ul>
                <p>
                  O uso continuado dos serviços após as alterações constitui aceitação dos novos termos.
                </p>
              </div>
            </div>
          </section>

          {/* Contato */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">13. Contato</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>Para dúvidas sobre estes termos, entre em contato:</p>
                <div className="bg-blue-50 p-6 rounded-lg mt-4">
                  <p><strong>Contabilidade Igrejinha</strong></p>
                  <p>E-mail: <strong>contato@contabilidadeigrejinha.com.br</strong></p>
                  <p>Telefone: <strong>(51) 9 9916-0766</strong></p>
                  <p>Endereço: <strong>Estrada Geraldo Meneger, 12 - Voluntária Baixa, Igrejinha/RS</strong></p>
                  <p>CNPJ: <strong>55.324.886/0001-10</strong></p>
                </div>
              </div>
            </div>
          </section>

          {/* Disposições Finais */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Scale className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">14. Disposições Finais</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <ul className="list-disc pl-6 mb-6">
                  <li>Se qualquer disposição for considerada inválida, as demais permanecerão em vigor</li>
                  <li>A tolerância com descumprimentos não constitui renúncia de direitos</li>
                  <li>Estes termos constituem o acordo integral entre as partes</li>
                  <li>Prevalece a versão em português em caso de traduções</li>
                </ul>
                
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-6">
                  <p className="text-green-800">
                    <strong>Ao utilizar nossos serviços, você declara ter lido, compreendido e 
                    concordado com todos os termos e condições aqui estabelecidos.</strong>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}