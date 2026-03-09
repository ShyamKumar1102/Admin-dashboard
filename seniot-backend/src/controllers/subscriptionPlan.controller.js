const subscriptionPlanService = require('../services/subscriptionPlan.service');
const invoiceService = require('../services/invoice.service');
const customerService = require('../services/customer.service');
const emailService = require('../services/email.service');
const { syncInvoiceStatus } = require('../services/invoice-sync.service');

const getAll = async (req, res) => {
  try {
    const plans = await subscriptionPlanService.getAll();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const create = async (req, res) => {
  try {
    console.log('Creating subscription plan:', req.body);
    const plan = await subscriptionPlanService.create(req.body);
    console.log('Plan created:', plan);
    
    // Only create invoice if explicitly requested (new plans from frontend)
    if (req.body.createInvoice === true) {
      const customer = await customerService.getById(plan.customerId || plan.customerid);
      
      if (customer) {
        const invoiceId = `INV-${Date.now()}`;
        const invoice = {
          invoiceId,
          invoiceNumber: invoiceId,
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          deviceId: plan.deviceId || plan.deviceid,
          planName: plan.planName,
          planId: plan.planId || plan.planid,
          amount: plan.pricePaid || plan.price,
          netAmount: plan.pricePaid || plan.price,
          vatRate: 0,
          vatAmount: 0,
          totalAmount: plan.pricePaid || plan.price,
          emailStatus: 'Sent',
          createdAt: new Date().toISOString()
        };
        
        await invoiceService.create(invoice);
        await emailService.sendInvoiceEmail(customer.email, customer.name, invoice);
        console.log('Invoice created and email sent');
      }
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error in create subscription plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { planId } = req.params;
    const deviceId = planId;
    
    // Get old plan data before update
    const oldPlan = await subscriptionPlanService.getById(deviceId);
    
    const updated = await subscriptionPlanService.update(deviceId, req.body);
    
    // Sync invoice status
    if (req.body.status) {
      await syncInvoiceStatus(deviceId, req.body.status);
    }
    
    // Send email if plan name changed (upgrade/downgrade)
    if (req.body.planName && oldPlan && oldPlan.planName !== req.body.planName) {
      try {
        const customer = await customerService.getById(updated.customerId || updated.customerid);
        if (customer && customer.email) {
          const { sendPlanChangeEmail } = require('../services/email.service');
          const customerName = `${customer.firstName || ''} ${customer.surname || ''}`.trim() || 
                              customer.companyName || customer.username;
          await sendPlanChangeEmail(customer.email, customerName, oldPlan, updated);
          console.log(`✅ Plan change email sent to ${customer.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send plan change email:', emailError);
      }
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAll, create, update };
