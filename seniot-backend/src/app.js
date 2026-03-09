const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const customerRoutes = require('./routes/customers.routes');
const engineerRoutes = require('./routes/engineers.routes');
const deviceRoutes = require('./routes/devices.routes');
const deviceDataRoutes = require('./routes/deviceData.routes');
const subscriptionRoutes = require('./routes/subscriptions.routes');
const subscriptionPlanRoutes = require('./routes/subscriptionPlans.routes');
const staffRoutes = require('./routes/staff.routes');
const emailRoutes = require('./routes/email.routes');
const authRoutes = require('./routes/auth.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const paymentRoutes = require('./routes/payment.routes');
const bannerRoutes = require('./routes/banner.routes');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({
    message: 'Seniot IoT Management System API',
    version: '1.0.0',
    endpoints: {
      customers: '/api/customers',
      engineers: '/api/engineers',
      devices: '/api/devices',
      deviceData: '/api/device-data',
      subscriptions: '/api/subscriptions',
      subscriptionPlans: '/api/subscription-plans',
      staff: '/api/staff'
    }
  });
});

app.use('/api/customers', customerRoutes);
app.use('/api/engineers', engineerRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/device-data', deviceDataRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/subscription-plans', subscriptionPlanRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api', emailRoutes);
app.use('/api', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/banners', bannerRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    error: errorMessage
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

module.exports = app;
