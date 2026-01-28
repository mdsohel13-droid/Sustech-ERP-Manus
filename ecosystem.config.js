module.exports = {
  apps: [
    {
      name: 'sustech-erp',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Health check
      health_check: {
        endpoint: 'http://localhost:3000',
        timeout: 10000,
        interval: 30000,
      },
      
      // Restart policies
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
  
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:mdsohel13-droid/sustech_kpi_dashboard.git',
      path: '/var/www/sustech-erp',
      'post-deploy': 'pnpm install --prod && pnpm run build && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production"',
    },
  },
};
