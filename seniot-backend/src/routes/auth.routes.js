const express = require('express');
const router = express.Router();
const { getDocClient } = require('../config/dynamodb');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }
  
  try {
    const docClient = getDocClient();
    
    // Try customer table first
    let command = new GetCommand({
      TableName: 'seniot_customer',
      Key: { username }
    });
    
    let response = await docClient.send(command);
    let user = response.Item;
    
    // If not found, try engineer table
    if (!user) {
      command = new GetCommand({
        TableName: 'seniot_engineer',
        Key: { username }
      });
      response = await docClient.send(command);
      user = response.Item;
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first' });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const { password: _, ...userProfile } = user;
    res.json({ success: true, message: 'Login successful', user: userProfile });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
