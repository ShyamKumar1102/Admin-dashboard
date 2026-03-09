const BaseService = require('./base.service');

class AllocationService extends BaseService {
  constructor() {
    super('allocations', 'allocations');
  }
}

module.exports = new AllocationService();
