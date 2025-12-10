#!/bin/bash
# Start CMS services with PM2

cd /home/epladmin/CMS
npx pm2 start ecosystem.config.js
