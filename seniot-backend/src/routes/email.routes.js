const express = require('express');
const router = express.Router();
const { getDocClient, isDemoMode } = require('../config/dynamodb');
const { generateToken, sendConfirmationEmail } = require('../services/email.service');
const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

// Send confirmation email for existing user
router.post('/send-confirmation', async (req, res) => {
  const { username, role } = req.body;
  
  if (!username || !role) {
    return res.status(400).json({ success: false, message: 'Username and role required' });
  }

  const tableName = role === 'Engineer' ? 'seniot_engineer' : 'seniot_customer';
  
  try {
    const docClient = getDocClient();
    const command = new GetCommand({
      TableName: tableName,
      Key: { username }
    });
    
    const response = await docClient.send(command);
    
    if (!response.Item) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = response.Item;
    
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }
    
    const token = generateToken();
    
    // Update user with verification token
    const updateCommand = new UpdateCommand({
      TableName: tableName,
      Key: { username },
      UpdateExpression: 'set verificationToken = :token',
      ExpressionAttributeValues: { ':token': token }
    });
    
    await docClient.send(updateCommand);
    
    // Send email
    await sendConfirmationEmail(
      user.email,
      user.firstName || user.name || 'User',
      token,
      username,
      role
    );
    
    res.json({ success: true, message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Send confirmation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Confirm email endpoint
router.get('/confirm', async (req, res) => {
  const { token, username, role } = req.query;
  
  if (!token || !username || !role) {
    return res.status(400).send('Invalid confirmation link');
  }
  
  const tableName = role === 'Engineer' ? 'seniot_engineer' : 'seniot_customer';
  
  try {
    const docClient = getDocClient();
    const command = new GetCommand({
      TableName: tableName,
      Key: { username }
    });
    
    const response = await docClient.send(command);
    const user = response.Item;
    
    if (!user || user.verificationToken !== token) {
      return res.status(400).send('Invalid or expired confirmation link');
    }
    
    if (user.isVerified) {
      return res.status(400).send('Email already verified');
    }
    
    // Update user as verified
    const updateCommand = new UpdateCommand({
      TableName: tableName,
      Key: { username },
      UpdateExpression: 'set isVerified = :v remove verificationToken',
      ExpressionAttributeValues: { ':v': true }
    });
    
    await docClient.send(updateCommand);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; }
          .box { background: white; padding: 30px; border-radius: 8px; max-width: 400px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h2 { color: #4CAF50; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>✅ Email Confirmed!</h2>
          <p>Your account has been successfully verified.</p>
          <p>You can now log in to the application.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Confirmation error:', error);
    res.status(500).send('Verification failed');
  }
});

module.exports = router;
