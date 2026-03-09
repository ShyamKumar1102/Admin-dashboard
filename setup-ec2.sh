#!/bin/bash

# Seniot AWS EC2 Automated Setup Script
# Run this on your EC2 instance after SSH connection

set -e

echo "🚀 Starting Seniot EC2 Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Clone repository
echo "📂 Cloning repository..."
cd /home/ubuntu
if [ ! -d "seniot" ]; then
    git clone https://github.com/your-username/seniot.git
fi
cd seniot

# Setup Backend
echo "⚙️ Setting up backend..."
cd seniot-backend
npm install

# Create backend .env
cat > .env << EOF
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DEMO_MODE=false
PORT=5000
NODE_ENV=production
EOF

echo "⚠️ UPDATE .env with your AWS credentials!"

# Start backend
echo "🚀 Starting backend with PM2..."
pm2 start npm --name "seniot-backend" -- start
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Setup Frontend
echo "⚙️ Setting up frontend..."
cd ../seniot
npm install

# Create frontend .env
cat > .env << EOF
PORT=3000
REACT_APP_API_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000/api
EOF

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Configure Nginx
echo "⚙️ Configuring Nginx..."
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

sudo tee /etc/nginx/sites-available/seniot > /dev/null << EOF
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name $EC2_IP;

    location / {
        root /home/ubuntu/seniot/build;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/seniot /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and start Nginx
echo "🔧 Testing Nginx configuration..."
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Setup Complete!"
echo ""
echo "📊 Status:"
pm2 status
echo ""
echo "🌐 Access your application at: http://$EC2_IP"
echo ""
echo "⚠️ IMPORTANT: Update AWS credentials in /home/ubuntu/seniot-backend/.env"
echo ""
echo "📝 Useful commands:"
echo "  - View backend logs: pm2 logs seniot-backend"
echo "  - Restart backend: pm2 restart seniot-backend"
echo "  - Restart Nginx: sudo systemctl restart nginx"
echo "  - Monitor: pm2 monit"
