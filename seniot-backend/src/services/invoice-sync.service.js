const invoiceService = require('./invoice.service');
const { sendSubscriptionExpiryEmail } = require('./email.service');
const customerService = require('./customer.service');
const subscriptionPlanService = require('./subscriptionPlan.service');

const syncInvoiceStatus = async (deviceId, newStatus) => {
  try {
    const invoices = await invoiceService.getAll();
    const relatedInvoices = invoices.filter(inv => inv.deviceId === deviceId);
    
    for (const invoice of relatedInvoices) {
      const invoiceStatus = newStatus === 'Active' ? 'Paid' : 
                           newStatus === 'Inactive' ? 'Cancelled' : 'Pending';
      
      await invoiceService.update(invoice.invoiceId, { status: invoiceStatus });
      
      // Send expiry email when subscription becomes inactive
      if (newStatus === 'Inactive' && invoice.customerEmail) {
        try {
          const plan = await subscriptionPlanService.getById(deviceId);
          const customer = await customerService.getAll().then(customers => 
            customers.find(c => c.username === invoice.customerId)
          );
          
          const customerName = customer ? 
            `${customer.firstName || ''} ${customer.surname || ''}`.trim() || 
            customer.companyName || 
            customer.username : invoice.customerName;
          
          await sendSubscriptionExpiryEmail(invoice.customerEmail, customerName, plan);
          console.log(`✅ Subscription expiry email sent to ${invoice.customerEmail}`);
        } catch (emailError) {
          console.error('❌ Failed to send subscription expiry email:', emailError);
        }
      }
    }
  } catch (error) {
    console.error('Error syncing invoice status:', error);
  }
};

module.exports = { syncInvoiceStatus };
