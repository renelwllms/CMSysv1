#!/bin/bash
# Restart CMS services with PM2

cd /home/epladmin/CMS
npx pm2 restart all
