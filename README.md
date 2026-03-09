# Seniot IoT Management System

Full-stack IoT management application with React frontend and Node.js backend.

## 🚀 Quick Start

### Terminal 1 - Backend
```bash
cd seniot-backend
npm install
npm run dev
```
Backend runs on: http://localhost:5000

### Terminal 2 - Frontend
```bash
cd seniot
npm install
npm start
```
Frontend runs on: http://localhost:5173

## ✅ What's New

- ✅ All files converted to `.jsx`
- ✅ Frontend runs on port 5173
- ✅ Backend API on port 5000
- ✅ Real-time updates every 5 seconds
- ✅ No direct AWS calls from frontend
- ✅ All database operations through backend

## 📚 Documentation

See `FULLSTACK_SETUP.md` for complete setup instructions.

## 🔧 Configuration

**Backend** (`seniot-backend/.env`):
```env
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=YOUR_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET
DEMO_MODE=false
PORT=5000
```

**Frontend** (`seniot/.env`):
```env
PORT=5173
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎯 Features

- Customer Management
- Engineer Management
- Device Management
- Subscription Management
- Real-time Data Sync
- Auto-refresh every 5 seconds

## 📡 Architecture

```
Frontend (React - Port 5173)
    ↓ HTTP Requests
Backend (Express - Port 5000)
    ↓ AWS SDK
DynamoDB (AWS)
```

All changes in DynamoDB appear in the UI within 5 seconds!
