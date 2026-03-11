const BaseService = require('./base.service');
const { syncInvoiceStatus } = require('./invoice-sync.service');

class SubscriptionPlanService extends BaseService {
  constructor() {
    super('Seniot-subscription', 'subscriptionPlans');
  }

  async getById(subscriptionid) {
    return await super.getById(subscriptionid, 'subscriptionid');
  }

  async update(subscriptionid, data) {
    const result = await super.update(subscriptionid, data, 'subscriptionid');
    
    // Sync invoice status when plan status changes
    if (data.status) {
      await syncInvoiceStatus(subscriptionid, data.status);
    }
    
    return result;
  }

  async delete(subscriptionid) {
    return await super.delete(subscriptionid, 'subscriptionid');
  }

  async getAll() {
    const plans = await super.getAll();
    // Normalize key names
    return plans.map(plan => {
      if (plan.planid && !plan.planId) {
        plan.planId = plan.planid;
      }
      if (plan.customerid && !plan.customerId) {
        plan.customerId = plan.customerid;
      }
      if (plan.deviceid && !plan.deviceId) {
        plan.deviceId = plan.deviceid;
      }
      return plan;
    });
  }
}

module.exports = new SubscriptionPlanService();
