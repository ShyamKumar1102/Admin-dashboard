const staffService = require('../services/staff.service');
const { generateId, validateRequired } = require('../utils/helpers');

const transformStaff = (staff) => {
  return {
    id: staff.id || staff.username,
    name: staff.name || `${staff.firstName || ''} ${staff.surname || ''}`.trim() || 'N/A',
    email: staff.email || 'N/A',
    role: staff.role || 'Staff'
  };
};

const getAll = async (req, res) => {
  try {
    const staff = await staffService.getAll();
    const filtered = staff.filter(s => s.role === 'Staff' || s.role === 'Administrator' || !s.role).map(transformStaff);
    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const member = await staffService.getById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const create = async (req, res) => {
  try {
    validateRequired(req.body, ['name', 'email', 'role']);
    const member = await staffService.create({
      id: generateId(),
      ...req.body
    });
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const member = await staffService.update(req.params.id, req.body);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const member = await staffService.delete(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
