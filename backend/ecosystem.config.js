/**
 * Configuração do PM2 para Contabilidade Igrejinha Backend
 * 
 * Este arquivo define as configurações para execução da aplicação
 * em diferentes ambientes usando PM2.
 */

module.exports = {
  apps: [
    {
      // Configuração para Desenvolvimento
      name: 'contabil-backend-dev',
      script: './dist/server.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      watch: true,
      watch_delay: 1000,
      ignore_watch: [
        'node_modules',
        'logs',
        'uploads',
        'temp',
        '.git',
        '*.log'
      ],
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        API_VERSION: 'v1'
      },
      error_file: './logs/pm2-dev-error.log',
      out_file: './logs/pm2-dev-out.log',
      log_file: './logs/pm2-dev-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },
    {
      // Configuração para Produção
      name: 'contabil-backend-prod',
      script: './dist/server.js',
      cwd: './',
      instances: 'max', // Usa todos os cores disponíveis
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        API_VERSION: 'v1'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        API_VERSION: 'v1',
        // Otimizações para produção
        NODE_OPTIONS: '--max-old-space-size=2048'
      },
      error_file: './logs/pm2-prod-error.log',
      out_file: './logs/pm2-prod-out.log',
      log_file: './logs/pm2-prod-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '30s',
      max_memory_restart: '1G',
      // Configurações de cluster
      kill_timeout: 5000,
      listen_timeout: 8000,
      // Configurações de log
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Configurações de monitoramento
      pmx: true,
      automation: false
    },
    {
      // Configuração para Staging/Homologação
      name: 'contabil-backend-staging',
      script: './dist/server.js',
      cwd: './',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'staging',
        PORT: 3001,
        API_VERSION: 'v1'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
        API_VERSION: 'v1'
      },
      error_file: './logs/pm2-staging-error.log',
      out_file: './logs/pm2-staging-out.log',
      log_file: './logs/pm2-staging-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '20s',
      max_memory_restart: '800M'
    }
  ],

  // Configurações de deploy (opcional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/contabil-backend.git',
      path: '/var/www/contabil-backend',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    staging: {
      user: 'deploy',
      host: ['your-staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/contabil-backend.git',
      path: '/var/www/contabil-backend-staging',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    }
  }
};

/**
 * COMANDOS ÚTEIS DO PM2:
 * 
 * Desenvolvimento:
 * pm2 start ecosystem.config.js --only contabil-backend-dev
 * pm2 logs contabil-backend-dev
 * pm2 restart contabil-backend-dev
 * 
 * Produção:
 * pm2 start ecosystem.config.js --only contabil-backend-prod --env production
 * pm2 logs contabil-backend-prod
 * pm2 restart contabil-backend-prod
 * pm2 reload contabil-backend-prod  # Zero downtime reload
 * 
 * Staging:
 * pm2 start ecosystem.config.js --only contabil-backend-staging --env staging
 * 
 * Monitoramento:
 * pm2 monit
 * pm2 status
 * pm2 info contabil-backend-prod
 * 
 * Logs:
 * pm2 logs
 * pm2 logs contabil-backend-prod --lines 100
 * pm2 flush  # Limpar logs
 * 
 * Deploy (se configurado):
 * pm2 deploy production setup
 * pm2 deploy production
 * pm2 deploy staging
 * 
 * Outros:
 * pm2 save          # Salvar configuração atual
 * pm2 resurrect     # Restaurar processos salvos
 * pm2 startup       # Configurar inicialização automática
 * pm2 unstartup     # Remover inicialização automática
 * pm2 kill          # Parar PM2 daemon
 */