const customerService = require('../services/customer.service');
const { generateId, validateRequired } = require('../utils/helpers');

const transformCustomer = (customer) => {
  return {
    id: customer.id || customer.username,
    name: `${customer.firstName || ''} ${customer.surname || ''}`.trim() || customer.name || customer.companyName || 'N/A',
    email: customer.email || 'N/A',
    phone: customer.phone || customer.mobile || customer.mobileNo || 'N/A',
    mobile: customer.phone || customer.mobile || customer.mobileNo || 'N/A',
    address: customer.address || 'N/A',
    location: customer.address || 'N/A',
    country: customer.country || 'N/A',
    totalStaff: customer.totalStaff || 0,
    totalEngineers: customer.totalEngineers || 0,
    devices: customer.devices || 0,
    monthlySpend: customer.monthlySpend || 0
  };
};

const getAll = async (req, res) => {
  try {
    const customers = await customerService.getAll();
    const filtered = customers.filter(c => c.role === 'Customer' || !c.role).map(transformCustomer);
    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const customer = await customerService.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const create = async (req, res) => {
  try {
    validateRequired(req.body, ['customerId', 'email', 'password']);
    const username = req.body.customerId;
    const customer = await customerService.create({
      username,
      id: username,
      email: req.body.email,
      password: req.body.password,
      role: 'Customer',
      isVerified: true,
      totalStaff: 0,
      totalEngineers: 0,
      devices: 0,
      monthlySpend: 0,
      welcomeEmailSent: false
    });
    
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const customer = await customerService.update(req.params.id, req.body);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const customer = await customerService.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    // Mark as deleted instead of removing
    const updateData = {
      status: 'Deleted',
      deletedAt: new Date().toISOString()
    };
    
    const updatedCustomer = await customerService.update(req.params.id, updateData);
    
    res.json({ success: true, data: updatedCustomer, message: 'Customer marked as deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
