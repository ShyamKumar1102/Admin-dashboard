const BaseService = require('./base.service');

class DeviceDataService extends BaseService {
  constructor() {
    super('seniot_devicedata', 'deviceData');
  }

  async getByDeviceId(deviceId) {
    return await this.getById(deviceId, 'deviceId');
  }
}

module.exports = new DeviceDataService();
