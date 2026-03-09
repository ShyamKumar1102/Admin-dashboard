const { v4: uuidv4 } = require('uuid');

const generateId = () => uuidv4();

const addTimestamps = (data, isUpdate = false) => {
  const now = new Date().toISOString();
  if (!isUpdate) {
    data.createdAt = now;
  }
  data.updatedAt = now;
  return data;
};

const validateRequired = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

const sanitizeData = (data) => {
  const sanitized = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      sanitized[key] = data[key];
    }
  });
  return sanitized;
};

module.exports = {
  generateId,
  addTimestamps,
  validateRequired,
  sanitizeData
};
