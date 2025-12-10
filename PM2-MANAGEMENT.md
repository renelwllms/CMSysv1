# PM2 Process Management for CMS

## Services Overview

The Cafe Management System is now managed by PM2 with the following services:

- **cms-backend**: NestJS API server (Port 4000)
- **cms-frontend**: Next.js frontend (Port 3001)

## Quick Commands

### Start Services
```bash
cd /home/epladmin/CMS
./pm2-start.sh
# OR
npx pm2 start ecosystem.config.js
```

### Stop Services
```bash
cd /home/epladmin/CMS
./pm2-stop.sh
# OR
npx pm2 stop all
```

### Restart Services
```bash
cd /home/epladmin/CMS
./pm2-restart.sh
# OR
npx pm2 restart all
```

### Check Status
```bash
cd /home/epladmin/CMS
./pm2-status.sh
# OR
npx pm2 list
```

## View Logs

### Real-time Logs
```bash
# Both services
npx pm2 logs

# Specific service
npx pm2 logs cms-backend
npx pm2 logs cms-frontend

# Last N lines
npx pm2 logs --lines 100
```

### Log Files
Logs are stored in `/home/epladmin/CMS/logs/`:
- `backend-error.log` - Backend error logs
- `backend-out.log` - Backend output logs
- `frontend-error.log` - Frontend error logs
- `frontend-out.log` - Frontend output logs

## PM2 Management Commands

### Restart Individual Service
```bash
npx pm2 restart cms-backend
npx pm2 restart cms-frontend
```

### Stop Individual Service
```bash
npx pm2 stop cms-backend
npx pm2 stop cms-frontend
```

### Monitor Resources
```bash
npx pm2 monit
```

### Process Information
```bash
npx pm2 show cms-backend
npx pm2 show cms-frontend
```

### Clear Logs
```bash
npx pm2 flush
```

## Application URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:4000/api
- **Uploads**: http://localhost:4000/uploads
- **Remote Access**: http://192.168.1.124:3001

## Troubleshooting

### Service Won't Start
```bash
# Check logs
npx pm2 logs cms-backend --lines 50
npx pm2 logs cms-frontend --lines 50

# Check if ports are in use
ss -tlnp | grep -E ':(3001|4000)'

# Restart service
npx pm2 restart cms-backend
npx pm2 restart cms-frontend
```

### High Memory Usage
```bash
# Check resource usage
npx pm2 list

# Restart specific service
npx pm2 restart cms-backend --update-env
```

### Reset Everything
```bash
# Stop all
npx pm2 delete all

# Rebuild (if needed)
cd backend && npm run build
cd ../frontend && npm run build

# Start fresh
cd /home/epladmin/CMS
npx pm2 start ecosystem.config.js
npx pm2 save
```

## Configuration

The PM2 configuration is stored in `ecosystem.config.js`. To modify settings like memory limits, environment variables, or instances:

1. Edit `ecosystem.config.js`
2. Reload PM2: `npx pm2 reload ecosystem.config.js`

## Auto-Restart on System Boot

Note: Setting up auto-restart on system boot requires sudo permissions. If needed, ask your system administrator to run:

```bash
sudo env PATH=$PATH:/usr/bin /home/epladmin/CMS/node_modules/pm2/bin/pm2 startup systemd -u epladmin --hp /home/epladmin
```

Then save the current process list:
```bash
npx pm2 save
```
