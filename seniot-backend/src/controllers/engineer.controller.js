const engineerService = require('../services/engineer.service');
const { generateId, validateRequired } = require('../utils/helpers');

const transformEngineer = (engineer) => {
  return {
    id: engineer.username || engineer.id,
    name: engineer.name || `${engineer.firstName || ''} ${engineer.surname || ''}`.trim() || 'N/A',
    email: engineer.email || 'N/A',
    phone: engineer.phone || engineer.mobile || engineer.mobileNo || 'N/A',
    specialization: engineer.specialization || 'IoT Systems',
    devices: engineer.devices || 0,
    status: engineer.status || 'available',
    allocations: engineer.allocations || [],
    plants: engineer.plants || []
  };
};

const getAll = async (req, res) => {
  try {
    const [engineers, devices] = await Promise.all([
      engineerService.getAll(),
      require('../services/device.service').getAll()
    ]);
    
    const transformed = engineers.filter(e => e.role === 'Engineer' || !e.role).map(engineer => {
      const assignedDevices = devices.filter(d => 
        d.engineerId === engineer.username || 
        d.engineerId === engineer.engineerId || 
        d.engineerId === engineer.id
      );
      
      return {
        id: engineer.username || engineer.id,
        name: engineer.name || `${engineer.firstName || ''} ${engineer.surname || ''}`.trim() || 'N/A',
        email: engineer.email || 'N/A',
        phone: engineer.phone || engineer.mobile || engineer.mobileNo || 'N/A',
        specialization: engineer.specialization || 'IoT Systems',
        devices: assignedDevices.length,
        status: engineer.status || 'available'
      };
    });
    
    res.json({ success: true, data: transformed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const engineer = await engineerService.getById(req.params.id);
    if (!engineer) {
      return res.status(404).json({ success: false, error: 'Engineer not found' });
    }
    res.json({ success: true, data: engineer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const create = async (req, res) => {
  try {
    validateRequired(req.body, ['engineerId', 'email', 'password']);
    const username = req.body.engineerId;
    const engineer = await engineerService.create({
      username,
      id: username,
      email: req.body.email,
      password: req.body.password,
      role: 'Engineer',
      isVerified: true,
      devices: 0,
      status: 'available',
      welcomeEmailSent: false
    });
    
    res.status(201).json({ success: true, data: engineer });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const engineer = await engineerService.update(req.params.id, req.body);
    if (!engineer) {
      return res.status(404).json({ success: false, error: 'Engineer not found' });
    }
    res.json({ success: true, data: engineer });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    console.log('Attempting to delete engineer with ID:', req.params.id);
    
    // Get all engineers to debug
    const allEngineers = await engineerService.getAll();
    console.log('All engineers:', allEngineers.map(e => ({ id: e.id, username: e.username, name: e.name })));
    
    // Find the engineer
    const engineer = allEngineers.find(e => 
      e.id === req.params.id || 
      e.username === req.params.id ||
      e.engineerId === req.params.id
    );
    
    if (!engineer) {
      console.log('Engineer not found with ID:', req.params.id);
      return res.status(404).json({ success: false, error: 'Engineer not found' });
    }
    
    console.log('Found engineer:', engineer);
    
    // Mark as deleted
    const updateData = {
      status: 'Deleted',
      deletedAt: new Date().toISOString()
    };
    
    // Use username as key for update
    const keyToUse = engineer.username || engineer.id;
    console.log('Using key for update:', keyToUse);
    
    const updatedEngineer = await engineerService.update(keyToUse, updateData);
    console.log('Update successful:', updatedEngineer);
    
    res.json({ success: true, data: updatedEngineer, message: 'Engineer marked as deleted' });
  } catch (error) {
    console.error('Error in engineer remove:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
