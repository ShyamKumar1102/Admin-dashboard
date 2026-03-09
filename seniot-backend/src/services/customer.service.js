const BaseService = require('./base.service');

class CustomerService extends BaseService {
  constructor() {
    super('seniot_customer', 'customers');
  }

  async getById(id) {
    return await super.getById(id, 'username');
  }

  async update(id, data) {
    return await super.update(id, data, 'username');
  }

  async delete(id) {
    return await super.delete(id, 'username');
  }
}

module.exports = new CustomerService();
