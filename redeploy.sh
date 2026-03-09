#!/bin/bash

# Seniot Quick Redeploy Script
# Use this to redeploy after code updates

set -e

echo "🔄 Redeploying Seniot..."

cd /home/ubuntu/seniot

# Pull latest code
echo "📥 Pulling latest code..."
git pull

# Update backend
echo "⚙️ Updating backend..."
cd seniot-backend
npm install
pm2 restart seniot-backend

# Update frontend
echo "⚙️ Updating frontend..."
cd ../seniot
npm install
npm run build

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Redeployment Complete!"
echo ""
echo "📊 Backend status:"
pm2 status
echo ""
echo "🌐 Application is live!"
