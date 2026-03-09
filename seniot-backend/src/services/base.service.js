const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { getDocClient, isDemoMode } = require('../config/dynamodb');
const { addTimestamps, sanitizeData } = require('../utils/helpers');

class BaseService {
  constructor(tableName, demoDataKey) {
    this.tableName = tableName;
    this.demoDataKey = demoDataKey;
    this.demoData = require('../utils/demoData');
  }

  async getAll() {
    if (isDemoMode()) {
      return this.demoData[this.demoDataKey] || [];
    }

    try {
      const docClient = getDocClient();
      const command = new ScanCommand({ TableName: this.tableName });
      const response = await docClient.send(command);
      return response.Items || [];
    } catch (error) {
      console.error(`Error scanning ${this.tableName}:`, error);
      return this.demoData[this.demoDataKey] || [];
    }
  }

  async getById(id, keyName = 'id') {
    if (isDemoMode()) {
      const items = this.demoData[this.demoDataKey] || [];
      return items.find(item => item[keyName] === id);
    }

    try {
      const docClient = getDocClient();
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { [keyName]: id }
      });
      const response = await docClient.send(command);
      return response.Item;
    } catch (error) {
      console.error(`Error getting item from ${this.tableName}:`, error);
      throw error;
    }
  }

  async create(data) {
    const item = sanitizeData(addTimestamps(data));

    if (isDemoMode()) {
      this.demoData[this.demoDataKey].push(item);
      return item;
    }

    try {
      const docClient = getDocClient();
      const command = new PutCommand({
        TableName: this.tableName,
        Item: item
      });
      await docClient.send(command);
      return item;
    } catch (error) {
      console.error(`Error creating item in ${this.tableName}:`, error);
      throw error;
    }
  }

  async update(id, data, keyName = 'id') {
    const updates = sanitizeData(addTimestamps(data, true));

    if (isDemoMode()) {
      const items = this.demoData[this.demoDataKey];
      const index = items.findIndex(item => item[keyName] === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...updates };
        return items[index];
      }
      return null;
    }

    try {
      const docClient = getDocClient();
      const updateExpression = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      Object.keys(updates).forEach((key, index) => {
        updateExpression.push(`#attr${index} = :val${index}`);
        expressionAttributeNames[`#attr${index}`] = key;
        expressionAttributeValues[`:val${index}`] = updates[key];
      });

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { [keyName]: id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });

      const response = await docClient.send(command);
      return response.Attributes;
    } catch (error) {
      console.error(`Error updating item in ${this.tableName}:`, error);
      throw error;
    }
  }

  async delete(id, keyName = 'id') {
    if (isDemoMode()) {
      const items = this.demoData[this.demoDataKey];
      const index = items.findIndex(item => item[keyName] === id || item.id === id || item.username === id);
      if (index !== -1) {
        const deleted = items.splice(index, 1)[0];
        return deleted;
      }
      return null;
    }

    try {
      const docClient = getDocClient();
      const item = await this.getById(id, keyName);
      
      if (!item) {
        throw new Error(`Item not found with ${keyName}=${id}`);
      }
      
      const command = new DeleteCommand({
        TableName: this.tableName,
        Key: { [keyName]: id }
      });
      
      await docClient.send(command);
      return item;
    } catch (error) {
      console.error(`Error deleting item from ${this.tableName}:`, error);
      throw error;
    }
  }

  async getByAlternateKey(id) {
    try {
      const docClient = getDocClient();
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'id = :id OR username = :id',
        ExpressionAttributeValues: { ':id': id }
      });
      const response = await docClient.send(command);
      return response.Items && response.Items.length > 0 ? response.Items[0] : null;
    } catch (error) {
      console.error('Error in getByAlternateKey:', error);
      return null;
    }
  }
}

module.exports = BaseService;
