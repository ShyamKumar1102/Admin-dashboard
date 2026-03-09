require('dotenv').config();
const app = require('./app');
const { initializeDynamoDB, isDemoMode } = require('./config/dynamodb');
const { startMonitoring: startSubscriptionMonitoring } = require('./services/subscription-monitor.service');
const { startMonitoring: startUserMonitoring } = require('./services/user-monitor.service');

const PORT = process.env.PORT || 5000;

initializeDynamoDB();

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Seniot Backend Server Running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION || 'eu-north-1'}`);
  console.log(`⚙️  Mode: ${isDemoMode() ? 'DEMO' : 'AWS DynamoDB'}`);
  console.log('='.repeat(50));
  console.log(`\n✅ API available at: http://localhost:${PORT}`);
  console.log(`📚 API docs at: http://localhost:${PORT}\n`);
  
  // Start monitoring services
  startSubscriptionMonitoring();
  startUserMonitoring();
});
