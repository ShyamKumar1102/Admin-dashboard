# Seniot Backend - IoT Management System API

Complete production-ready backend for Seniot IoT Management System.

## 🚀 Quick Start

### Installation
```bash
cd seniot-backend
npm install
```

### Configuration
Edit `.env` file:
```env
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
DEMO_MODE=false
PORT=5000
```

### Run
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📦 Tech Stack
- Node.js v18+
- Express.js
- AWS SDK v3
- DynamoDB
- UUID for ID generation
- CORS enabled
- Body-parser for JSON

## 🗄️ DynamoDB Tables

| Table Name | Primary Key | Type |
|------------|-------------|------|
| seniot_customer | id | String |
| seniot_engineer | id | String |
| seniot_devices | id | String |
| seniot_devicedata | deviceId | String |
| seniot_staff | id | String |
| subscription_plans | planId | String |
| removeddevices | id | String |

## 📡 API Endpoints

### Customers
```
GET    /api/customers          - Get all customers
GET    /api/customers/:id      - Get customer by ID
POST   /api/customers          - Create customer
PUT    /api/customers/:id      - Update customer
DELETE /api/customers/:id      - Delete customer
```

**Create Customer Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

### Engineers
```
GET    /api/engineers          - Get all engineers
GET    /api/engineers/:id      - Get engineer by ID
POST   /api/engineers          - Create engineer
PUT    /api/engineers/:id      - Update engineer
DELETE /api/engineers/:id      - Delete engineer
```

**Create Engineer Request:**
```json
{
  "name": "Mike Johnson",
  "email": "mike@seniot.com",
  "phone": "+1234567890",
  "specialization": "IoT Systems"
}
```

### Devices
```
GET    /api/devices            - Get all devices
GET    /api/devices/:id        - Get device by ID
POST   /api/devices            - Create device
PUT    /api/devices/:id        - Update device
DELETE /api/devices/:id        - Delete device (moves to removeddevices)
```

**Create Device Request:**
```json
{
  "deviceName": "Temperature Sensor",
  "productId": "TEMP-001",
  "status": "Active",
  "customerId": "customer-id",
  "engineerId": "engineer-id"
}
```

### Device Data
```
GET    /api/device-data/:deviceId  - Get device data
POST   /api/device-data            - Create device data
```

**Create Device Data Request:**
```json
{
  "deviceId": "device-id",
  "temperature": 25.5,
  "humidity": 60,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Subscriptions
```
GET    /api/subscriptions          - Get all subscriptions
GET    /api/subscriptions/:planId  - Get subscription by planId
POST   /api/subscriptions          - Create subscription
PUT    /api/subscriptions/:planId  - Update subscription
DELETE /api/subscriptions/:planId  - Delete subscription
```

**Create Subscription Request:**
```json
{
  "planName": "Premium Plan",
  "price": 199,
  "duration": "1 month",
  "features": ["Priority Support", "50 Devices"]
}
```

### Staff
```
GET    /api/staff              - Get all staff
GET    /api/staff/:id          - Get staff by ID
POST   /api/staff              - Create staff
PUT    /api/staff/:id          - Update staff
DELETE /api/staff/:id          - Delete staff
```

**Create Staff Request:**
```json
{
  "name": "Admin User",
  "email": "admin@seniot.com",
  "role": "Administrator"
}
```

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔐 Features

✅ UUID generation for all IDs
✅ Automatic timestamps (createdAt, updatedAt)
✅ Null/undefined safety
✅ Proper HTTP status codes
✅ Central error handling
✅ Field validation
✅ CORS enabled
✅ Demo mode fallback
✅ Device deletion moves to removeddevices table

## 🧪 Demo Mode

If `DEMO_MODE=true` or AWS connection fails:
- Uses in-memory mock data
- All APIs work identically
- Console shows: "Running in DEMO MODE"

## 🔧 Project Structure

```
seniot-backend/
├── src/
│   ├── config/
│   │   └── dynamodb.js
│   ├── routes/
│   │   ├── customers.routes.js
│   │   ├── engineers.routes.js
│   │   ├── devices.routes.js
│   │   ├── deviceData.routes.js
│   │   ├── subscriptions.routes.js
│   │   └── staff.routes.js
│   ├── controllers/
│   │   ├── customer.controller.js
│   │   ├── engineer.controller.js
│   │   ├── device.controller.js
│   │   ├── deviceData.controller.js
│   │   ├── subscription.controller.js
│   │   └── staff.controller.js
│   ├── services/
│   │   ├── base.service.js
│   │   ├── customer.service.js
│   │   ├── engineer.service.js
│   │   ├── device.service.js
│   │   ├── deviceData.service.js
│   │   ├── subscription.service.js
│   │   └── staff.service.js
│   ├── utils/
│   │   ├── helpers.js
│   │   └── demoData.js
│   ├── app.js
│   └── server.js
├── .env
├── package.json
└── README.md
```

## 🎯 Testing

### Test with curl:
```bash
# Get all customers
curl http://localhost:5000/api/customers

# Create customer
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Get customer by ID
curl http://localhost:5000/api/customers/{id}
```

## 🔗 Frontend Integration

Update your React frontend to use:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 📝 Notes

- All IDs are auto-generated using UUID
- Timestamps are ISO 8601 format
- Device deletion moves items to removeddevices table
- Subscription uses planId as primary key
- Device data uses deviceId as primary key

## 🆘 Troubleshooting

**Issue: Running in DEMO MODE**
- Check AWS credentials in .env
- Verify DynamoDB tables exist
- Check IAM permissions

**Issue: CORS errors**
- CORS is enabled by default
- Frontend can connect from any origin

**Issue: Connection timeout**
- Verify AWS region matches tables
- Check network connectivity
- Verify credentials are valid

## 📄 License

MIT
