const invoiceService = require('../services/invoice.service');
const subscriptionPlanService = require('../services/subscriptionPlan.service');
const customerService = require('../services/customer.service');
const deviceService = require('../services/device.service');
const engineerService = require('../services/engineer.service');
const { sendInvoiceEmail } = require('../services/email-invoice.service');
const { generateId, validateRequired } = require('../utils/helpers');

const getAll = async (req, res) => {
  try {
    const plans = await subscriptionPlanService.getAll();
    const customers = await customerService.getAll();
    
    const invoices = plans.map((plan, index) => {
      const customerId = plan.customerId;
      const deviceId = plan.deviceId;
      const invoiceId = `INV-${deviceId}-${index}`;
      
      const customer = customers.find(c => c.username === customerId);
      
      const customerName = customer ? 
        `${customer.firstName || ''} ${customer.surname || ''}`.trim() || 
        customer.companyName || 
        customer.username : 'N/A';
      
      const customerEmail = customer?.email || 'N/A';
      
      // Check if plan has expired based on end date
      let currentStatus = plan.status || 'Pending';
      if (plan.endDate) {
        const endDate = new Date(plan.endDate);
        const today = new Date();
        if (endDate < today) {
          currentStatus = 'Inactive';
        }
      }
      
      return {
        invoiceId,
        invoiceNumber: invoiceId,
        customerId,
        customerEmail,
        customerName,
        deviceId,
        planName: plan.planName,
        planId: deviceId,
        amount: plan.pricePaid || 0,
        netAmount: plan.pricePaid || 0,
        vatAmount: 0,
        vatRate: 0,
        totalAmount: plan.pricePaid || 0,
        status: currentStatus,
        planStatus: currentStatus,
        currency: plan.currency || 'USD',
        createdAt: plan.createdAt || new Date().toISOString()
      };
    });
    
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error in getAll invoices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const plans = await subscriptionPlanService.getAll();
    const customers = await customerService.getAll();
    
    const deviceId = invoiceId.split('-')[1];
    const plan = plans.find(p => p.deviceId === deviceId);
    
    if (plan) {
      const customer = customers.find(c => c.username === plan.customerId);
      const customerName = customer ? 
        `${customer.firstName || ''} ${customer.surname || ''}`.trim() || 
        customer.companyName || 
        customer.username : 'N/A';
      
      let currentStatus = plan.status || 'Pending';
      if (plan.endDate) {
        const endDate = new Date(plan.endDate);
        const today = new Date();
        if (endDate < today) {
          currentStatus = 'Inactive';
        }
      }
      
      const invoice = {
        invoiceId,
        invoiceNumber: invoiceId,
        customerId: plan.customerId,
        customerEmail: customer?.email || 'N/A',
        customerName,
        deviceId: plan.deviceId,
        planName: plan.planName,
        amount: plan.pricePaid || 0,
        netAmount: plan.pricePaid || 0,
        vatAmount: 0,
        vatRate: 0,
        totalAmount: plan.pricePaid || 0,
        status: currentStatus,
        currency: plan.currency || 'USD',
        createdAt: plan.createdAt || new Date().toISOString()
      };
      return res.json({ success: true, data: invoice });
    }
    
    res.status(404).json({ success: false, error: 'Invoice not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const create = async (req, res) => {
  try {
    validateRequired(req.body, ['customerId', 'amount', 'customerEmail']);

    const customer = await customerService.getById(req.body.customerId);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    let deviceData = null;
    if (req.body.deviceId) {
      deviceData = await deviceService.getById(req.body.deviceId, 'deviceId');
      if (!deviceData) {
        return res.status(404).json({ success: false, error: 'Device not found' });
      }
    }

    let engineerName = null;
    if (req.body.engineerId) {
      const engineer = await engineerService.getById(req.body.engineerId);
      if (engineer) {
        engineerName = `${engineer.firstName || ''} ${engineer.surname || ''}`.trim() || engineer.name || engineer.username;
      }
    }

    const invoiceNumber = await invoiceService.getNextInvoiceNumber();
    const invoiceId = generateId();
    const customerName = `${customer.firstName || ''} ${customer.surname || ''}`.trim() || customer.name || customer.companyName || customer.username;
    const deviceName = deviceData ? (deviceData.deviceName || deviceData.productId || deviceData.deviceId || deviceData.id) : null;

    const netAmount = Number(req.body.amount);
    const vatRate = req.body.vatRate || 20;
    const vatAmount = netAmount * (vatRate / 100);
    const totalAmount = netAmount + vatAmount;

    const invoice = await invoiceService.create({
      invoiceId,
      invoiceNumber,
      customerId: req.body.customerId,
      customerName,
      customerEmail: req.body.customerEmail,
      deviceId: req.body.deviceId || null,
      deviceName,
      engineerId: req.body.engineerId || null,
      engineerName,
      subscriptionId: req.body.subscriptionId || null,
      planName: req.body.planName || null,
      devices: req.body.devices || [],
      netAmount,
      vatRate,
      vatAmount,
      totalAmount,
      amount: totalAmount,
      status: 'Unpaid',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    validateRequired(req.body, ['status']);
    
    const invoice = await invoiceService.getById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const updated = await invoiceService.update(req.params.id, { status: req.body.status });
    
    // Auto-send email when status changes to paid
    if (req.body.status.toLowerCase() === 'paid' && invoice.customerEmail) {
      try {
        await sendInvoiceEmail(invoice.customerEmail, updated);
        // Combine both updates into one
        const finalUpdate = await invoiceService.update(req.params.id, { 
          status: req.body.status,
          emailStatus: 'Sent',
          lastEmailSent: new Date().toISOString()
        });
        res.json({ success: true, data: finalUpdate });
        return;
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
      }
    }
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const invoice = await invoiceService.getById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    
    // Mark as deleted instead of removing
    const updateData = {
      status: 'Deleted',
      deletedAt: new Date().toISOString()
    };
    
    const updatedInvoice = await invoiceService.update(req.params.id, updateData);
    
    res.json({ success: true, data: updatedInvoice, message: 'Invoice marked as deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const resendEmail = async (req, res) => {
  try {
    // Extract deviceId from invoice ID format: INV-{deviceId}-{index}
    const invoiceId = req.params.id;
    const deviceId = invoiceId.split('-')[1];
    
    // Find the subscription plan by deviceId
    const plans = await subscriptionPlanService.getAll();
    const plan = plans.find(p => p.deviceId === deviceId);
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    
    // Get customer details
    const customers = await customerService.getAll();
    const customer = customers.find(c => c.username === plan.customerId);
    
    if (!customer || !customer.email) {
      return res.status(404).json({ success: false, error: 'Customer email not found' });
    }
    
    const customerName = `${customer.firstName || ''} ${customer.surname || ''}`.trim() || customer.companyName || customer.username;
    
    // Check if subscription is inactive/expired
    let isInactive = plan.status === 'Inactive';
    if (plan.endDate) {
      const endDate = new Date(plan.endDate);
      const today = new Date();
      if (endDate < today) {
        isInactive = true;
      }
    }
    
    // Send appropriate email based on status
    if (isInactive) {
      // Send subscription expiry/renewal email
      const { sendSubscriptionExpiryEmail } = require('../services/email.service');
      const emailResult = await sendSubscriptionExpiryEmail(customer.email, customerName, plan);
      
      if (emailResult) {
        res.json({ success: true, message: 'Subscription renewal reminder sent successfully' });
      } else {
        res.status(500).json({ success: false, error: 'Failed to send email' });
      }
    } else {
      // Send invoice email for active subscriptions
      // Find shop name from customer premises
      let shopName = 'N/A';
      if (customer.premises && Array.isArray(customer.premises)) {
        for (const premise of customer.premises) {
          if (premise.plants && Array.isArray(premise.plants)) {
            for (const plant of premise.plants) {
              if (plant.devices && Array.isArray(plant.devices)) {
                const device = plant.devices.find(d => d.id === deviceId);
                if (device) {
                  shopName = premise.name;
                  break;
                }
              }
            }
          }
          if (shopName !== 'N/A') break;
        }
      }
      
      // Build invoice object for email
      const invoice = {
        invoiceId,
        invoiceNumber: invoiceId,
        customerId: plan.customerId,
        customerName,
        customerEmail: customer.email,
        deviceId: plan.deviceId,
        planName: plan.planName,
        shopName,
        amount: plan.pricePaid,
        totalAmount: plan.pricePaid,
        netAmount: plan.pricePaid,
        vatAmount: 0,
        vatRate: 0,
        currency: plan.currency || 'USD',
        status: plan.status,
        createdAt: plan.createdAt
      };

      const emailResult = await sendInvoiceEmail(customer.email, invoice);
      
      if (emailResult.success) {
        res.json({ success: true, message: 'Invoice email resent successfully' });
      } else {
        res.status(500).json({ success: false, error: 'Failed to send email' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const cleanupOrphaned = async (req, res) => {
  try {
    const invoices = await invoiceService.getAll();
    const activeInvoices = invoices.filter(inv => inv.status !== 'Deleted');
    let deleted = 0;
    
    for (const inv of activeInvoices) {
      try {
        await invoiceService.delete(inv.invoiceId || inv.invoiceid);
        deleted++;
      } catch (err) {
        console.log('Skip:', err.message);
      }
    }
    
    res.json({ success: true, deleted, total: invoices.length, active: activeInvoices.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAll, getById, create, updateStatus, remove, resendEmail, cleanupOrphaned };
