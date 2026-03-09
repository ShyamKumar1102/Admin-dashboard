const BaseService = require('./base.service');
const { syncInvoiceStatus } = require('./invoice-sync.service');

class SubscriptionService extends BaseService {
  constructor() {
    super('Seniot-subscription', 'subscriptions');
  }

  async getById(subscriptionid) {
    return await super.getById(subscriptionid, 'subscriptionid');
  }

  async update(subscriptionid, data) {
    // Get the subscription first to get deviceId
    const subscription = await this.getById(subscriptionid);
    
    const result = await super.update(subscriptionid, data, 'subscriptionid');
    
    // Sync invoice status when subscription status changes
    if (data.status && subscription && subscription.deviceId) {
      await syncInvoiceStatus(subscription.deviceId, data.status);
    }
    
    return result;
  }

  async delete(subscriptionid) {
    return await super.delete(subscriptionid, 'subscriptionid');
  }

  async getAll() {
    const subscriptions = await super.getAll();
    const now = new Date();
    
    for (const sub of subscriptions) {
      if (sub.endDate && sub.status !== 'Inactive') {
        const endDate = new Date(sub.endDate);
        if (endDate < now) {
          await this.update(sub.subscriptionid, { status: 'Inactive' });
          sub.status = 'Inactive';
        }
      }
      // Normalize key names for frontend
      if (sub.subscriptionid && !sub.subscriptionId) {
        sub.subscriptionId = sub.subscriptionid;
      }
    }
    
    return subscriptions;
  }
}

module.exports = new SubscriptionService();
