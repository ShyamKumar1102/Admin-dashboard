const BaseService = require('./base.service');

class StaffService extends BaseService {
  constructor() {
    super('seniot_staff', 'staff');
  }
}

module.exports = new StaffService();
