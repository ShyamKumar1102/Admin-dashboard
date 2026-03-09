const BaseService = require('./base.service');

class PaymentService extends BaseService {
  constructor() {
    super('Payments', 'payments');
  }

  async getById(id) {
    return await super.getById(id, 'paymentId');
  }

  async update(id, data) {
    return await super.update(id, data, 'paymentId');
  }

  async delete(id) {
    return await super.delete(id, 'paymentId');
  }
}

module.exports = new PaymentService();
