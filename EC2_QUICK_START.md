# Quick Start: Deploy Seniot to AWS EC2

## 1️⃣ Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Select: **Ubuntu 22.04 LTS**
3. Instance Type: **t2.medium** (minimum)
4. Storage: **20GB** (gp3)
5. Security Group - Add inbound rules:
   - SSH (22) - Your IP
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - TCP (5000) - 0.0.0.0/0 (Backend)
6. Launch and download key pair

## 2️⃣ Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## 3️⃣ Run Automated Setup

```bash
# Download and run setup script
curl -O https://raw.githubusercontent.com/your-repo/seniot/main/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

Or manually:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2

# Clone and setup
cd /home/ubuntu
git clone https://github.com/your-repo/seniot.git
cd seniot

# Backend setup
cd seniot-backend
npm install
cat > .env << EOF
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
DEMO_MODE=false
PORT=5000
NODE_ENV=production
EOF

pm2 start npm --name "seniot-backend" -- start
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Frontend setup
cd ../seniot
npm install
cat > .env << EOF
PORT=3000
REACT_APP_API_URL=http://your-ec2-ip:5000/api
EOF

npm run build

# Nginx config
sudo tee /etc/nginx/sites-available/seniot > /dev/null << 'EOF'
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name _;

    location / {
        root /home/ubuntu/seniot/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/seniot /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 4️⃣ Verify Deployment

```bash
# Check backend
pm2 status

# Check Nginx
sudo systemctl status nginx

# Test API
curl http://localhost:5000/api/customers

# View logs
pm2 logs seniot-backend
```

## 5️⃣ Access Application

Open browser: `http://your-ec2-public-ip`

## 📋 Useful Commands

```bash
# View backend logs
pm2 logs seniot-backend

# Restart backend
pm2 restart seniot-backend

# Restart Nginx
sudo systemctl restart nginx

# Monitor resources
pm2 monit

# Check running processes
pm2 status

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🔐 SSL/TLS Setup (Optional)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🚀 Update Code

```bash
cd /home/ubuntu/seniot
git pull
cd seniot-backend && npm install
cd ../seniot && npm install && npm run build
pm2 restart seniot-backend
sudo systemctl restart nginx
```

## ⚠️ Important Notes

1. **Update AWS Credentials**: Edit `/home/ubuntu/seniot-backend/.env` with your AWS keys
2. **Update API URL**: Edit `/home/ubuntu/seniot/.env` with your EC2 public IP
3. **Security**: Use IAM roles instead of hardcoded credentials (recommended)
4. **Backups**: Set up automated backups for your data
5. **Monitoring**: Set up CloudWatch alarms for your EC2 instance

## 🆘 Troubleshooting

### Backend not starting
```bash
pm2 logs seniot-backend
```

### Nginx errors
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Port already in use
```bash
sudo lsof -i :5000
sudo lsof -i :80
```

### Check EC2 IP
```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

## 📊 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Check disk space
df -h

# Check memory
free -h

# Check CPU
top
```

## 💾 Backup Strategy

```bash
# Backup database (if using local storage)
tar -czf backup-$(date +%Y%m%d).tar.gz /home/ubuntu/seniot

# Upload to S3
aws s3 cp backup-*.tar.gz s3://your-bucket/backups/
```
