#!/bin/bash
# Stop CMS services with PM2

cd /home/epladmin/CMS
npx pm2 stop all
