import { Metadata } from 'next'
import { Shield, Eye, Lock, FileText, Users, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Contabilidade Empresarial',
  description: 'Política de Privacidade em conformidade com a LGPD. Saiba como coletamos, utilizamos e protegemos seus dados pessoais.',
  keywords: 'política de privacidade, LGPD, proteção de dados, privacidade, dados pessoais',
  openGraph: {
    title: 'Política de Privacidade | Contabilidade Empresarial',
    description: 'Nossa política de privacidade em conformidade com a LGPD',
    type: 'website',
  },
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 mr-4" />
            <h1 className="text-4xl font-bold">Política de Privacidade</h1>
          </div>
          <p className="text-xl text-center text-blue-100 max-w-3xl mx-auto">
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD)
          </p>
          <p className="text-center text-blue-200 mt-4">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Introdução */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Eye className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">1. Introdução</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>
                  A <strong>Contabilidade Empresarial</strong> ("nós", "nosso" ou "empresa") está comprometida 
                  com a proteção da privacidade e dos dados pessoais de nossos clientes, visitantes do site 
                  e usuários de nossos serviços.
                </p>
                <p>
                  Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos 
                  suas informações pessoais, em total conformidade com a Lei Geral de Proteção de Dados 
                  (Lei nº 13.709/2018 - LGPD) e demais legislações aplicáveis.
                </p>
              </div>
            </div>
          </section>

          {/* Dados Coletados */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">2. Dados Pessoais Coletados</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <h3 className="text-xl font-semibold mb-4">2.1 Dados fornecidos diretamente por você:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li><strong>Dados de identificação:</strong> nome completo, CPF/CNPJ, RG</li>
                  <li><strong>Dados de contato:</strong> e-mail, telefone, endereço</li>
                  <li><strong>Dados profissionais:</strong> empresa, cargo, área de atuação</li>
                  <li><strong>Dados financeiros:</strong> informações contábeis e fiscais necessárias para prestação dos serviços</li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-4">2.2 Dados coletados automaticamente:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas</li>
                  <li><strong>Cookies e tecnologias similares:</strong> para melhorar a experiência do usuário</li>
                  <li><strong>Dados de localização:</strong> quando necessário para prestação dos serviços</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Finalidades */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">3. Finalidades do Tratamento</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>Utilizamos seus dados pessoais para as seguintes finalidades:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li><strong>Prestação de serviços contábeis:</strong> execução de contratos e obrigações legais</li>
                  <li><strong>Comunicação:</strong> responder dúvidas, enviar informações relevantes</li>
                  <li><strong>Melhorias do site:</strong> análise de uso e otimização da experiência</li>
                  <li><strong>Marketing:</strong> envio de newsletters e materiais informativos (com seu consentimento)</li>
                  <li><strong>Cumprimento legal:</strong> atendimento a obrigações legais e regulamentares</li>
                  <li><strong>Segurança:</strong> prevenção de fraudes e proteção de nossos sistemas</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Base Legal */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Lock className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">4. Base Legal</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>O tratamento de seus dados pessoais é fundamentado nas seguintes bases legais:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li><strong>Consentimento:</strong> para marketing e cookies não essenciais</li>
                  <li><strong>Execução de contrato:</strong> para prestação dos serviços contábeis</li>
                  <li><strong>Cumprimento de obrigação legal:</strong> para atender exigências fiscais e regulamentares</li>
                  <li><strong>Legítimo interesse:</strong> para segurança e melhorias do site</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Compartilhamento */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">5. Compartilhamento de Dados</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>Seus dados podem ser compartilhados nas seguintes situações:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li><strong>Órgãos públicos:</strong> quando exigido por lei (Receita Federal, Junta Comercial, etc.)</li>
                  <li><strong>Prestadores de serviços:</strong> parceiros que nos auxiliam na prestação dos serviços</li>
                  <li><strong>Autoridades competentes:</strong> em caso de determinação judicial ou legal</li>
                </ul>
                <p><strong>Importante:</strong> Nunca vendemos seus dados pessoais para terceiros.</p>
              </div>
            </div>
          </section>

          {/* Direitos do Titular */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">6. Seus Direitos</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>Conforme a LGPD, você possui os seguintes direitos:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los</li>
                  <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li><strong>Anonimização ou eliminação:</strong> de dados desnecessários ou tratados em desconformidade</li>
                  <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
                  <li><strong>Eliminação:</strong> excluir dados tratados com base no consentimento</li>
                  <li><strong>Revogação do consentimento:</strong> retirar consentimento a qualquer momento</li>
                  <li><strong>Oposição:</strong> opor-se ao tratamento em certas situações</li>
                </ul>
                <p>
                  Para exercer seus direitos, entre em contato conosco através do e-mail: 
                  <strong>contato@contabilidadeigrejinha.com.br</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Segurança */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Lock className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">7. Segurança dos Dados</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li><strong>Criptografia:</strong> dados sensíveis são criptografados</li>
                  <li><strong>Controle de acesso:</strong> apenas pessoas autorizadas têm acesso aos dados</li>
                  <li><strong>Backup seguro:</strong> cópias de segurança regulares</li>
                  <li><strong>Monitoramento:</strong> sistemas de detecção de ameaças</li>
                  <li><strong>Treinamento:</strong> nossa equipe é treinada em proteção de dados</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Retenção */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">8. Retenção de Dados</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>Mantemos seus dados pelo tempo necessário para:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li><strong>Prestação dos serviços:</strong> durante a vigência do contrato</li>
                  <li><strong>Obrigações legais:</strong> conforme exigido pela legislação (geralmente 5 anos)</li>
                  <li><strong>Marketing:</strong> até a revogação do consentimento</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contato */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <AlertCircle className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">9. Contato e DPO</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>Para questões sobre esta política ou seus dados pessoais:</p>
                <div className="bg-blue-50 p-6 rounded-lg mt-4">
                  <p><strong>Encarregado de Proteção de Dados (DPO):</strong></p>
                  <p>E-mail: <strong>dpo@contabilidadeigrejinha.com.br</strong></p>
                  <p>Telefone: <strong>(51) 9 9916-0766</strong></p>
                  <p>Endereço: <strong>Estrada Geraldo Meneger, 12 - Voluntária Baixa, Igrejinha/RS</strong></p>
                </div>
              </div>
            </div>
          </section>

          {/* Alterações */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">10. Alterações na Política</h2>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>
                  Esta política pode ser atualizada periodicamente. Alterações significativas serão 
                  comunicadas através do nosso site e por e-mail, quando aplicável.
                </p>
                <p>
                  Recomendamos que você revise esta política regularmente para se manter informado 
                  sobre como protegemos seus dados.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}