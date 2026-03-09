const BaseService = require('./base.service');
const { syncInvoiceStatus } = require('./invoice-sync.service');

class SubscriptionPlanService extends BaseService {
  constructor() {
    super('subscription_plans', 'subscriptionPlans');
  }

  async getById(deviceId) {
    return await super.getById(deviceId, 'deviceId');
  }

  async update(deviceId, data) {
    const result = await super.update(deviceId, data, 'deviceId');
    
    // Sync invoice status when plan status changes
    if (data.status) {
      await syncInvoiceStatus(deviceId, data.status);
    }
    
    return result;
  }

  async delete(deviceId) {
    return await super.delete(deviceId, 'deviceId');
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
