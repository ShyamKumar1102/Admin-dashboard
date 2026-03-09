const subscriptionPlanService = require('./subscriptionPlan.service');
const customerService = require('./customer.service');
const deviceService = require('./device.service');
const invoiceService = require('./invoice.service');
const { sendInvoiceEmail } = require('./email-invoice.service');
const { generateId } = require('../utils/helpers');

let processedPlans = new Set();

const checkNewSubscriptionPlans = async () => {
  try {
    const plans = await subscriptionPlanService.getAll();
    const invoices = await invoiceService.getAll();
    
    for (const plan of plans) {
      const planKey = plan.deviceId;
      
      // Skip if already processed
      if (processedPlans.has(planKey)) continue;
      
      // Skip if no customer
      if (!plan.customerId) {
        processedPlans.add(planKey);
        continue;
      }
      
      // Check if invoice already exists for this deviceId
      const existingInvoice = invoices.find(inv => inv.deviceId === planKey || inv.subscriptionPlanId === planKey);
      if (existingInvoice) {
        processedPlans.add(planKey);
        continue;
      }

      // Generate and send invoice
      const customer = await customerService.getById(plan.customerId);
      if (!customer || !customer.email) {
        processedPlans.add(planKey);
        continue;
      }

      const devices = plan.deviceId ? [await deviceService.getById(plan.deviceId, 'deviceId')] : [];
      const invoiceNumber = await invoiceService.getNextInvoiceNumber();
      const invoiceId = generateId();
      const customerName = `${customer.firstName || ''} ${customer.surname || ''}`.trim() || customer.name || customer.companyName || customer.username;
      
      const netAmount = Number(plan.pricePaid || 0);
      const vatRate = 20;
      const vatAmount = netAmount * (vatRate / 100);
      const totalAmount = netAmount + vatAmount;

      const invoice = await invoiceService.create({
        invoiceId,
        invoiceNumber,
        customerId: plan.customerId,
        customerName,
        customerEmail: customer.email,
        subscriptionPlanId: planKey,
        planName: plan.planName,
        deviceId: plan.deviceId,
        currency: plan.currency || 'GBP',
        devices: devices.filter(d => d).map(d => ({
          deviceId: d.deviceId,
          deviceName: d.deviceName || d.productId || d.deviceId,
          plantName: d.plantName || 'N/A'
        })),
        netAmount,
        vatRate,
        vatAmount,
        totalAmount,
        amount: totalAmount,
        status: 'Unpaid',
        createdAt: new Date().toISOString()
      });

      const emailResult = await sendInvoiceEmail(customer.email, invoice);
      if (emailResult.success) {
        await invoiceService.update(invoiceId, { emailStatus: 'Sent', lastEmailSent: new Date().toISOString() });
        console.log(`✅ Invoice ${invoiceNumber} sent to ${customer.email} for device ${planKey}`);
      }
      
      processedPlans.add(planKey);
    }
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'NetworkingError') {
      console.error('⚠️  Network error - Cannot reach AWS DynamoDB. Check your internet connection.');
    } else {
      console.error('❌ Error scanning subscription_plans:', error.message);
    }
  }
};

const startMonitoring = () => {
  console.log('🔍 Starting subscription plan monitoring (checks every 5 seconds)...');
  // Check every 5 seconds
  setInterval(checkNewSubscriptionPlans, 5000);
  // Check immediately on start
  checkNewSubscriptionPlans();
};

module.exports = { startMonitoring };
