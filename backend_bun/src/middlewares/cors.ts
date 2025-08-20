/**
 * Middleware de CORS para permitir comunicação entre frontend e backend
 * Configurado para desenvolvimento e produção
 */

export interface CorsOptions {
  origin?: string | string[] | boolean | ((origin: string | undefined) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Middleware de CORS configurável
 * @param options - Opções de configuração do CORS
 * @returns Função middleware para Bun
 */
export function cors(options: CorsOptions = {}) {
  const {
    origin = true,
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name'
    ],
    credentials = true,
    maxAge = 86400 // 24 horas
  } = options;

  return (request: Request): Response | null => {
    const requestOrigin = request.headers.get('origin');
    const method = request.method;

    // Verificar se a origem é permitida
    let allowOrigin = '*';
    if (typeof origin === 'string') {
      allowOrigin = origin;
    } else if (Array.isArray(origin)) {
      allowOrigin = origin.includes(requestOrigin || '') ? requestOrigin || '*' : 'false';
    } else if (typeof origin === 'function') {
      allowOrigin = origin(requestOrigin || undefined) ? requestOrigin || '*' : 'false';
    } else if (origin === true) {
      allowOrigin = requestOrigin || '*';
    } else if (origin === false) {
      allowOrigin = 'false';
    }

    // Headers de resposta CORS
    const headers = new Headers({
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': methods.join(', '),
      'Access-Control-Allow-Headers': allowedHeaders.join(', '),
      'Access-Control-Max-Age': maxAge.toString()
    });

    if (credentials) {
      headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Responder a requisições OPTIONS (preflight)
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers
      });
    }

    // Para outras requisições, retornar null para continuar o processamento
    // Os headers serão adicionados na resposta final
    return null;
  };
}

/**
 * Configuração padrão de CORS para desenvolvimento
 */
export const developmentCors = cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:3004'
  ],
  credentials: true
});

/**
 * Configuração de CORS para produção
 */
export const productionCors = cors({
  origin: [
    'https://contabilidadeigrejinha.com',
    'https://www.contabilidadeigrejinha.com'
  ],
  credentials: true
});

/**
 * Adicionar headers CORS à resposta
 * @param response - Resposta HTTP
 * @param corsOptions - Opções de CORS
 * @returns Resposta com headers CORS adicionados
 */
export function addCorsHeaders(response: Response, corsOptions: CorsOptions = {}): Response {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name'
    ],
    credentials = true
  } = corsOptions;

  const headers = new Headers(response.headers);

  headers.set('Access-Control-Allow-Origin', typeof origin === 'string' ? origin : '*');
  headers.set('Access-Control-Allow-Methods', methods.join(', '));
  headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));

  if (credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}