#!/bin/bash
# Check status of CMS services

cd /home/epladmin/CMS
npx pm2 list
echo ""
echo "Log locations:"
echo "  Backend: /home/epladmin/CMS/logs/backend-*.log"
echo "  Frontend: /home/epladmin/CMS/logs/frontend-*.log"
echo ""
echo "View logs:"
echo "  npx pm2 logs cms-backend"
echo "  npx pm2 logs cms-frontend"
