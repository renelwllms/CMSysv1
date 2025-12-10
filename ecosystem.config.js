module.exports = {
  apps: [
    {
      name: 'cms-backend',
      cwd: '/home/epladmin/CMS/backend',
      script: 'dist/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/home/epladmin/CMS/logs/backend-error.log',
      out_file: '/home/epladmin/CMS/logs/backend-out.log',
      log_file: '/home/epladmin/CMS/logs/backend-combined.log',
      time: true,
    },
    {
      name: 'cms-frontend',
      cwd: '/home/epladmin/CMS/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/home/epladmin/CMS/logs/frontend-error.log',
      out_file: '/home/epladmin/CMS/logs/frontend-out.log',
      log_file: '/home/epladmin/CMS/logs/frontend-combined.log',
      time: true,
    },
  ],
};
