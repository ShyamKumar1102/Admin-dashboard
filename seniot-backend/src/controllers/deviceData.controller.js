const deviceDataService = require('../services/deviceData.service');
const { validateRequired } = require('../utils/helpers');

const getByDeviceId = async (req, res) => {
  try {
    const data = await deviceDataService.getByDeviceId(req.params.deviceId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Device data not found' });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const create = async (req, res) => {
  try {
    validateRequired(req.body, ['deviceId']);
    const data = await deviceDataService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { getByDeviceId, create };
