# Seniot IoT Management System - Full Stack Setup Guide

## 🎯 Overview

Complete IoT Management System with:
- **Frontend**: React (Port 5173)
- **Backend**: Node.js + Express (Port 5000)
- **Database**: AWS DynamoDB

## 🚀 Quick Start

### Step 1: Backend Setup

```bash
cd seniot-backend
npm install
```

Configure `.env`:
```env
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
DEMO_MODE=false
PORT=5000
```

Start backend:
```bash
npm run dev
```

Backend will run on: **http://localhost:5000**

### Step 2: Frontend Setup

```bash
cd seniot
npm install
```

Configure `.env`:
```env
PORT=5173
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

Frontend will run on: **http://localhost:5173**

## 📦 DynamoDB Tables Required

Create these 7 tables in AWS DynamoDB (region: eu-north-1):

| Table Name | Primary Key | Type |
|------------|-------------|------|
| seniot_customer | id | String |
| seniot_engineer | id | String |
| seniot_devices | id | String |
| seniot_devicedata | deviceId | String |
| seniot_staff | id | String |
| subscription_plans | planId | String |
| removeddevices | id | String |

## 🔄 Real-Time Updates

The frontend automatically polls the backend every 5 seconds for:
- Customer updates
- Engineer updates
- Device updates
- Subscription updates

Any changes in the database will appear in the UI within 5 seconds.

## 📡 API Endpoints

### Customers
- `GET /api/customers` - Get all
- `POST /api/customers` - Create
- `PUT /api/customers/:id` - Update
- `DELETE /api/customers/:id` - Delete

### Engineers
- `GET /api/engineers` - Get all
- `POST /api/engineers` - Create
- `PUT /api/engineers/:id` - Update
- `DELETE /api/engineers/:id` - Delete

### Devices
- `GET /api/devices` - Get all
- `POST /api/devices` - Create
- `PUT /api/devices/:id` - Update
- `DELETE /api/devices/:id` - Delete (moves to removeddevices)

### Subscriptions
- `GET /api/subscriptions` - Get all
- `POST /api/subscriptions` - Create
- `PUT /api/subscriptions/:planId` - Update
- `DELETE /api/subscriptions/:planId` - Delete

## ✅ Features

✅ Full CRUD operations for all modules
✅ Real-time data synchronization (5-second polling)
✅ Automatic UUID generation
✅ Timestamps (createdAt, updatedAt)
✅ Demo mode fallback
✅ CORS enabled
✅ Error handling
✅ Field validation

## 🧪 Testing

1. Start backend: `cd seniot-backend && npm run dev`
2. Start frontend: `cd seniot && npm start`
3. Open browser: `http://localhost:5173`
4. Add a customer/engineer/device
5. Check backend logs for API calls
6. Verify data appears in UI immediately

## 🔧 Troubleshooting

### Backend not connecting to DynamoDB
- Check AWS credentials in backend `.env`
- Verify tables exist in eu-north-1 region
- Backend will fall back to demo mode automatically

### Frontend not showing data
- Ensure backend is running on port 5000
- Check browser console for API errors
- Verify REACT_APP_API_URL in frontend `.env`

### Port already in use
- Frontend: Change PORT in `.env`
- Backend: Change PORT in backend `.env`

## 📝 Project Structure

```
seniot (2)/
├── seniot/                    # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   ├── apiService.jsx
│   │   │   ├── unifiedDatabaseService.jsx
│   │   │   └── realTimeService.jsx
│   │   └── App.jsx
│   ├── .env
│   └── package.json
│
└── seniot-backend/            # Backend (Node.js)
    ├── src/
    │   ├── config/
    │   ├── routes/
    │   ├── controllers/
    │   ├── services/
    │   └── server.js
    ├── .env
    └── package.json
```

## 🎉 Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can add customers
- [ ] Can add engineers
- [ ] Can add devices
- [ ] Can add subscriptions
- [ ] Data persists after refresh
- [ ] Real-time updates working
- [ ] No console errors

## 📚 Additional Notes

- All files are now `.jsx` format
- Frontend uses backend API (no direct AWS calls)
- Backend handles all DynamoDB operations
- Real-time updates via polling (5 seconds)
- Device deletion moves to `removeddevices` table
- Subscription uses `planId` as primary key

## 🆘 Support

Check logs:
- Backend: Terminal running `npm run dev`
- Frontend: Browser console (F12)

Both services log all operations for debugging.
