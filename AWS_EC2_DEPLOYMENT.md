# AWS EC2 Deployment Guide for Seniot

## Prerequisites
- AWS Account with EC2 access
- EC2 instance (Ubuntu 22.04 LTS recommended, t2.medium or larger)
- Security Group with ports 80, 443, 5000 open

## Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Instances → Launch Instance
2. Choose Ubuntu 22.04 LTS AMI
3. Instance type: t2.medium (minimum)
4. Configure Security Group:
   - HTTP (80)
   - HTTPS (443)
   - SSH (22)
   - Custom TCP (5000) for backend

## Step 2: Connect to EC2 and Setup

SSH into your instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

## Step 4: Clone Repository

```bash
cd /home/ubuntu
git clone <your-repo-url> seniot
cd seniot
```

## Step 5: Setup Backend

```bash
cd seniot-backend
npm install

# Create .env file
cat > .env << EOF
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DEMO_MODE=false
PORT=5000
NODE_ENV=production
EOF

# Start backend with PM2
pm2 start npm --name "seniot-backend" -- start
pm2 save
pm2 startup
```

## Step 6: Setup Frontend

```bash
cd ../seniot
npm install

# Create .env file
cat > .env << EOF
PORT=3000
REACT_APP_API_URL=http://your-ec2-public-ip:5000/api
EOF

# Build frontend
npm run build
```

## Step 7: Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/seniot > /dev/null << EOF
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name your-ec2-public-ip;

    # Frontend
    location / {
        root /home/ubuntu/seniot/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
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

# Enable site
sudo ln -s /etc/nginx/sites-available/seniot /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## Step 8: Verify Deployment

```bash
# Check backend
pm2 status

# Check Nginx
sudo systemctl status nginx

# Test endpoints
curl http://localhost:5000/api/customers
curl http://localhost/
```

## Step 9: Setup SSL (Optional but Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Troubleshooting

### Backend not starting
```bash
pm2 logs seniot-backend
```

### Nginx issues
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Check ports
```bash
sudo netstat -tlnp | grep LISTEN
```

### View PM2 logs
```bash
pm2 logs
```

## Maintenance

### Restart services
```bash
pm2 restart seniot-backend
sudo systemctl restart nginx
```

### Update code
```bash
cd /home/ubuntu/seniot
git pull
cd seniot-backend && npm install
cd ../seniot && npm install && npm run build
sudo systemctl restart nginx
```

### Monitor
```bash
pm2 monit
```

## Environment Variables

Update AWS credentials in `/home/ubuntu/seniot-backend/.env`:
- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY

Update API URL in `/home/ubuntu/seniot/.env`:
- REACT_APP_API_URL=http://your-ec2-public-ip:5000/api

## Security Notes

1. Use IAM roles instead of hardcoded credentials (recommended)
2. Enable Security Group restrictions
3. Use SSL/TLS certificates
4. Keep packages updated
5. Use strong SSH key pairs
