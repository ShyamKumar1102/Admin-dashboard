const customerService = require('./customer.service');
const engineerService = require('./engineer.service');
const { sendWelcomeEmail } = require('./email.service');

let processedUsers = new Set();

const checkNewUsers = async () => {
  try {
    // Check customers
    const customers = await customerService.getAll();
    for (const customer of customers) {
      const userId = customer.username || customer.id;
      
      // Skip if already processed or no email
      if (processedUsers.has(userId) || !customer.email) continue;
      
      // Skip if welcomeEmailSent flag is true
      if (customer.welcomeEmailSent === true) {
        processedUsers.add(userId);
        continue;
      }
      
      // Only send welcome email if user is verified (from app) or doesn't need verification (from website)
      // App users: isVerified = false initially, true after confirmation
      // Website users: isVerified = true from creation
      const shouldSendWelcome = customer.isVerified === true && customer.welcomeEmailSent !== true;
      
      if (shouldSendWelcome) {
        try {
          const customerName = `${customer.firstName || ''} ${customer.surname || ''}`.trim() || 
                              customer.companyName || customer.name || userId;
          await sendWelcomeEmail(customer.email, customerName, 'Customer');
          console.log(`✅ Welcome email sent to customer: ${customer.email}`);
          
          // Mark as sent in database
          await customerService.update(userId, { welcomeEmailSent: true });
          processedUsers.add(userId);
        } catch (emailError) {
          console.error(`Failed to send welcome email to ${customer.email}:`, emailError.message);
        }
      }
    }
    
    // Check engineers
    const engineers = await engineerService.getAll();
    for (const engineer of engineers) {
      const userId = engineer.username || engineer.id;
      
      // Skip if already processed or no email
      if (processedUsers.has(userId) || !engineer.email) continue;
      
      // Skip if welcomeEmailSent flag is true
      if (engineer.welcomeEmailSent === true) {
        processedUsers.add(userId);
        continue;
      }
      
      // Only send welcome email if user is verified (from app) or doesn't need verification (from website)
      const shouldSendWelcome = engineer.isVerified === true && engineer.welcomeEmailSent !== true;
      
      if (shouldSendWelcome) {
        try {
          const engineerName = `${engineer.firstName || ''} ${engineer.surname || ''}`.trim() || 
                              engineer.name || userId;
          await sendWelcomeEmail(engineer.email, engineerName, 'Engineer');
          console.log(`✅ Welcome email sent to engineer: ${engineer.email}`);
          
          // Mark as sent in database
          await engineerService.update(userId, { welcomeEmailSent: true });
          processedUsers.add(userId);
        } catch (emailError) {
          console.error(`Failed to send welcome email to ${engineer.email}:`, emailError.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking new users:', error.message);
  }
};

const startMonitoring = () => {
  console.log('👥 Starting user registration monitoring (checks every 10 seconds)...');
  // Check every 10 seconds
  setInterval(checkNewUsers, 10000);
  // Check immediately on start
  checkNewUsers();
};

module.exports = { startMonitoring };
