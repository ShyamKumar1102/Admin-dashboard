const subscriptionService = require('../services/subscription.service');
const { generateId, validateRequired } = require('../utils/helpers');

const transformSubscription = (sub) => {
  return {
    subscriptionId: sub.subscriptionid,
    planName: sub.planName || 'N/A',
    country: sub.country || 'N/A',
    price: sub.price || 0,
    status: sub.status || 'Active'
  };
};

const getAll = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getAll();
    const transformed = subscriptions.map(transformSubscription);
    res.json({ success: true, data: transformed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const subscription = await subscriptionService.getById(req.params.subscriptionId);
    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const create = async (req, res) => {
  try {
    validateRequired(req.body, ['planName', 'price', 'country']);
    const subscriptionid = `SUB${Date.now().toString().slice(-6)}`;
    const subscription = await subscriptionService.create({
      subscriptionid: subscriptionid,
      ...req.body
    });
    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const subscription = await subscriptionService.update(req.params.subscriptionId, req.body);
    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const subscription = await subscriptionService.getById(req.params.subscriptionId);
    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }
    
    // Mark as deleted instead of removing
    const updateData = {
      status: 'Deleted',
      deletedAt: new Date().toISOString()
    };
    
    const updatedSubscription = await subscriptionService.update(req.params.subscriptionId, updateData);
    
    res.json({ success: true, data: updatedSubscription, message: 'Subscription marked as deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
