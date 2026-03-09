const BaseService = require('./base.service');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { getDocClient, isDemoMode } = require('../config/dynamodb');
const demoData = require('../utils/demoData');

class DeviceService extends BaseService {
  constructor() {
    super('seniot_devices', 'devices');
    this.keyName = 'deviceId';
  }

  async delete(id) {
    if (isDemoMode()) {
      const items = demoData[this.demoDataKey];
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        const removed = items.splice(index, 1)[0];
        demoData.removedDevices.push(removed);
        return removed;
      }
      return null;
    }

    try {
      return await super.delete(id, 'deviceId');
    } catch (error) {
      console.error('Error deleting device:', error);
      throw error;
    }
  }
}

module.exports = new DeviceService();
