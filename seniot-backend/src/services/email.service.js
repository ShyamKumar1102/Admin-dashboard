const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const generateToken = () => crypto.randomBytes(32).toString('hex');

const sendConfirmationEmail = async (email, firstName, token, username, role) => {
  const confirmationUrl = `${process.env.API_URL || 'http://localhost:5000'}/api/confirm?token=${token}&username=${username}&role=${role}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirm Your Seniot Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Seniot, ${firstName}!</h2>
        <p>Thank you for registering as a ${role}.</p>
        <p>Please click the button below to confirm your email and activate your account:</p>
        <a href="${confirmationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Confirm My Email</a>
        <p>Or copy this link: ${confirmationUrl}</p>
        <p>If you didn't create this account, please ignore this email.</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

const sendInvoiceEmail = async (email, customerName, invoice) => {
  try {
    console.log('Sending invoice email to:', email);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Invoice ${invoice.invoiceNumber} - Subscription Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #667eea;">Invoice for Subscription Plan</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for subscribing to our service. Please find your invoice details below:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Invoice Number:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Plan Name:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${invoice.planName}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Device ID:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${invoice.deviceId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">$${invoice.totalAmount}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Status:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${invoice.status}</td>
            </tr>
          </table>
          
          <p>Please proceed with the payment at your earliest convenience.</p>
          <p>Thank you for your business!</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply.</p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
};

const sendSubscriptionExpiryEmail = async (email, customerName, plan) => {
  try {
    console.log('Sending subscription expiry email to:', email);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Subscription Expired - Renew Now to Continue Service',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e74c3c;">
          <h2 style="color: #e74c3c;">⚠️ Your Subscription Has Expired</h2>
          <p>Dear ${customerName},</p>
          <p>Your subscription plan has expired and your service is now <strong>inactive</strong>.</p>
          
          <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">Subscription Details:</h3>
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan.planName}</p>
            <p style="margin: 5px 0;"><strong>Device ID:</strong> ${plan.deviceId}</p>
            <p style="margin: 5px 0;"><strong>Expired On:</strong> ${new Date(plan.endDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ${plan.currency || '$'} ${plan.pricePaid}</p>
          </div>
          
          <h3 style="color: #667eea;">Why is this happening?</h3>
          <p>Your subscription plan has reached its end date. To continue using our IoT management services, you need to renew your subscription.</p>
          
          <h3 style="color: #667eea;">What happens now?</h3>
          <ul style="line-height: 1.8;">
            <li>Your device monitoring is currently paused</li>
            <li>You won't receive real-time alerts and updates</li>
            <li>Historical data remains accessible</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscriptions" 
               style="display: inline-block; padding: 15px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Renew Subscription Now
            </a>
          </div>
          
          <p><strong>Need help?</strong> Contact our support team at <a href="mailto:info@seniotgateway.com">info@seniotgateway.com</a></p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
            This is an automated notification from SENIOT IoT Management System.<br>
            Website: www.seniotgateway.com
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Subscription expiry email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending subscription expiry email:', error);
    throw error;
  }
};

const sendPlanChangeEmail = async (email, customerName, oldPlan, newPlan) => {
  try {
    console.log('Sending plan change email to:', email);
    const isUpgrade = (newPlan.pricePaid || 0) > (oldPlan.pricePaid || 0);
    const changeType = isUpgrade ? 'Upgraded' : 'Changed';
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Subscription Plan ${changeType} - ${newPlan.planName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #667eea;">
          <h2 style="color: #667eea;">✨ Your Subscription Plan Has Been ${changeType}!</h2>
          <p>Dear ${customerName},</p>
          <p>Great news! Your subscription plan has been successfully ${changeType.toLowerCase()}.</p>
          
          <div style="display: flex; gap: 20px; margin: 20px 0;">
            <div style="flex: 1; background: #f8f9fa; padding: 15px; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #666; font-size: 14px;">Previous Plan</h3>
              <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${oldPlan.planName || 'N/A'}</p>
              <p style="margin: 5px 0; color: #666;">${oldPlan.currency || '$'} ${oldPlan.pricePaid || 0}/month</p>
            </div>
            <div style="flex: 1; background: #e8f5e9; padding: 15px; border-radius: 5px; border: 2px solid #4caf50;">
              <h3 style="margin-top: 0; color: #4caf50; font-size: 14px;">New Plan</h3>
              <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #4caf50;">${newPlan.planName}</p>
              <p style="margin: 5px 0; color: #666;">${newPlan.currency || '$'} ${newPlan.pricePaid}/month</p>
            </div>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1976d2;">Updated Subscription Details:</h3>
            <p style="margin: 5px 0;"><strong>Device ID:</strong> ${newPlan.deviceId}</p>
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${newPlan.planName}</p>
            <p style="margin: 5px 0;"><strong>Monthly Cost:</strong> ${newPlan.currency || '$'} ${newPlan.pricePaid}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Active</p>
            ${newPlan.endDate ? `<p style="margin: 5px 0;"><strong>Valid Until:</strong> ${new Date(newPlan.endDate).toLocaleDateString()}</p>` : ''}
          </div>
          
          ${isUpgrade ? `
          <h3 style="color: #667eea;">🎉 What's New in ${newPlan.planName}?</h3>
          <p>You now have access to enhanced features and better service!</p>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscriptions" 
               style="display: inline-block; padding: 15px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View My Subscription
            </a>
          </div>
          
          <p><strong>Questions?</strong> Contact our support team at <a href="mailto:info@seniotgateway.com">info@seniotgateway.com</a></p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
            This is an automated notification from SENIOT IoT Management System.<br>
            Website: www.seniotgateway.com
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Plan change email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending plan change email:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (email, name, role) => {
  try {
    console.log(`Sending welcome email to ${role}:`, email);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Welcome to SENIOT - Your ${role} Account is Ready!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #667eea;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #667eea; margin: 0;">SENIOT</h1>
            <p style="color: #666; margin: 5px 0;">IoT Management System</p>
          </div>
          
          <h2 style="color: #667eea;">🎉 Welcome to SENIOT, ${name}!</h2>
          <p>Thank you for registering as a <strong>${role}</strong> with SENIOT IoT Management System.</p>
          
          <div style="background: #e8f5e9; padding: 20px; border-left: 4px solid #4caf50; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2e7d32;">✅ Your Account is Active</h3>
            <p style="margin: 5px 0;">You can now log in and start using our platform.</p>
          </div>
          
          <h3 style="color: #667eea;">What You Can Do:</h3>
          <ul style="line-height: 2;">
            ${role === 'Customer' ? `
            <li>📊 Monitor your IoT devices in real-time</li>
            <li>📝 Manage subscription plans</li>
            <li>💳 View invoices and payment history</li>
            <li>👥 Manage your staff and engineers</li>
            <li>📧 Receive alerts and notifications</li>
            ` : `
            <li>🔧 Manage customer devices</li>
            <li>📊 View device data and analytics</li>
            <li>📝 Update device configurations</li>
            <li>👥 Collaborate with customers</li>
            <li>📧 Receive service notifications</li>
            `}
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="display: inline-block; padding: 15px 40px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Login to Your Account
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #666;">Need Help Getting Started?</h3>
            <p style="margin: 5px 0;">Our support team is here to help you!</p>
            <p style="margin: 5px 0;">
              📧 Email: <a href="mailto:info@seniotgateway.com">info@seniotgateway.com</a><br>
              🌐 Website: <a href="https://www.seniotgateway.com">www.seniotgateway.com</a>
            </p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; text-align: center;">
            This is an automated welcome email from SENIOT IoT Management System.<br>
            If you didn't create this account, please contact us immediately.
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

module.exports = { generateToken, sendConfirmationEmail, sendInvoiceEmail, sendSubscriptionExpiryEmail, sendPlanChangeEmail, sendWelcomeEmail };
