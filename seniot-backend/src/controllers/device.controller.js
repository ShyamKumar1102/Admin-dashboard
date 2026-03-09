const deviceService = require('../services/device.service');
const engineerService = require('../services/engineer.service');
const { generateId, validateRequired } = require('../utils/helpers');

const transformDevice = (device) => {
  const mapCategory = (cat) => {
    if (!cat || cat === 'Unknown') return 'Unknown';
    const lower = cat.toLowerCase();
    if (lower === 'fault' || lower === 'active' || lower === 'online' || lower === 'offline') return 'Unknown';
    return cat;
  };
  
  const normalizeStatus = (status) => {
    if (!status) return 'Unknown';
    const lower = status.toLowerCase();
    if (lower === 'active') return 'Online';
    return status;
  };
  
  return {
    id: device.id || device.deviceId,
    deviceName: device.deviceName || device.name || 'N/A',
    productId: device.productId || device.id || 'N/A',
    macAddress: device.macAddress || 'N/A',
    status: normalizeStatus(device.status),
    category: mapCategory(device.category),
    customerId: device.customerId || 'N/A',
    engineerId: device.engineerId || 'N/A',
    assignedEngineer: device.assignedEngineer || device.engineerName || 'Not Assigned',
    assignmentStatus: device.assignmentStatus || 'Unassigned'
  };
};

const getAll = async (req, res) => {
  try {
    const [devices, engineers] = await Promise.all([
      deviceService.getAll(),
      engineerService.getAll()
    ]);
    
    // Remove duplicates and keep only valid devices
    const seen = new Set();
    const validDevices = devices.filter(d => {
      if (!d.deviceId || !d.deviceName || !d.productId || !d.macAddress) return false;
      if (seen.has(d.deviceId)) return false;
      seen.add(d.deviceId);
      return true;
    });
    
    const transformed = validDevices.map(device => {
      let assignedEngineer = 'Not Assigned';
      let engineerId = device.engineerId || 'N/A';
      
      if (device.engineerId) {
        const engineer = engineers.find(e => 
          e.username === device.engineerId || 
          e.engineerId === device.engineerId || 
          e.id === device.engineerId
        );
        if (engineer) {
          assignedEngineer = engineer.firstName || engineer.name || engineer.username || 'N/A';
        }
      }
      
      const mapCategory = (cat) => {
        if (!cat || cat === 'Unknown') return 'Unknown';
        const lower = cat.toLowerCase();
        if (lower === 'fault' || lower === 'active' || lower === 'online' || lower === 'offline') return 'Unknown';
        return cat;
      };
      
      const normalizeStatus = (status) => {
        if (!status) return 'Unknown';
        const lower = status.toLowerCase();
        if (lower === 'active') return 'Online';
        return status;
      };
      
      const deviceId = device.deviceId || device.id;
      return {
        id: deviceId,
        deviceName: device.deviceName || device.name || 'N/A',
        productId: device.productId || deviceId || 'N/A',
        macAddress: device.macAddress || 'N/A',
        status: normalizeStatus(device.status),
        category: mapCategory(device.category),
        customerId: device.customerId || 'N/A',
        engineerId: engineerId,
        assignedEngineer: assignedEngineer,
        assignmentStatus: engineerId !== 'N/A' ? 'Assigned' : 'Unassigned'
      };
    });
    
    res.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Error in getAll devices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const device = await deviceService.getById(req.params.id, 'deviceId');
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const create = async (req, res) => {
  try {
    validateRequired(req.body, ['deviceName', 'productId']);
    const deviceId = `DEV${Date.now().toString().slice(-6)}`;
    const device = await deviceService.create({
      deviceId: deviceId,
      id: deviceId,
      status: 'Online',
      category: req.body.category || 'Indoor Unit',
      ...req.body
    });
    res.status(201).json({ success: true, data: device });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const device = await deviceService.update(req.params.id, req.body, 'deviceId');
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const device = await deviceService.getById(req.params.id, 'deviceId');
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    // Mark as deleted instead of removing
    const updateData = {
      status: 'Deleted',
      deletedAt: new Date().toISOString()
    };
    
    const updatedDevice = await deviceService.update(req.params.id, updateData, 'deviceId');
    
    res.json({ success: true, data: updatedDevice, message: 'Device marked as deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
