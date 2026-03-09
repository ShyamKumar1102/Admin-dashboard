const nodemailer = require('nodemailer');
require('dotenv').config();

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

const sendInvoiceEmail = async (customerEmail, invoiceData) => {
  const devices = invoiceData.devices || [];
  const currency = invoiceData.currency || 'GBP';
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
  
  const deviceRows = devices.map(device => `
    <tr>
      <td>${device.deviceId}</td>
      <td>${device.plantName || 'N/A'}<br><small>ID: ${device.deviceId}</small></td>
      <td>${currencySymbol} ${(invoiceData.netAmount / devices.length).toFixed(2)}</td>
      <td>${invoiceData.vatRate || 20}%</td>
      <td>${currencySymbol} ${((invoiceData.netAmount / devices.length) * (1 + (invoiceData.vatRate || 20) / 100)).toFixed(2)}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.4; color: #000; margin: 0; padding: 20px; }
        .container { max-width: 700px; margin: 0 auto; }
        .header { margin-bottom: 20px; }
        .company-header { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .invoice-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
        .company-details { font-size: 12px; line-height: 1.6; margin-bottom: 20px; }
        .addresses { display: table; width: 100%; margin-bottom: 20px; }
        .company-address, .customer-address { display: table-cell; vertical-align: top; font-size: 12px; line-height: 1.5; }
        .customer-address { text-align: left; padding-left: 50px; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
        .invoice-table th { border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold; background: #f5f5f5; }
        .invoice-table td { border: 1px solid #000; padding: 8px; }
        .totals { text-align: right; margin-top: 20px; font-size: 13px; line-height: 1.8; }
        .totals strong { font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-header">SENIOT</div>
          <div class="invoice-title">INVOICE</div>
          <div class="company-details">
            Website: www.seniotgateway.com<br>
            Email: info@seniotgateway.com<br><br>
            VAT No: GB 123 456 789<br>
            Invoice date: ${new Date(invoiceData.createdAt).toLocaleDateString('en-GB')}<br>
            Invoice No: ${invoiceData.invoiceNumber}
          </div>
        </div>
        
        <div class="addresses">
          <div class="company-address">
            <strong>60 TORRING WAY</strong><br>
            MORDEN<br>
            SURREY SM4 5QA<br>
            UNITED KINGDOM
          </div>
          <div class="customer-address">
            <strong>${invoiceData.customerName || 'Customer Name'}</strong><br>
            Customer ID: ${invoiceData.customerId}<br>
            ${invoiceData.planName ? `Plan: ${invoiceData.planName}<br>` : ''}
            BILLING ADDRESS
          </div>
        </div>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Shop Name</th>
              <th>Plant Devices</th>
              <th>Unit Price</th>
              <th>VAT</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${deviceRows || `
            <tr>
              <td>${invoiceData.subscriptionId || invoiceData.deviceId || 'N/A'}</td>
              <td>${invoiceData.shopName || 'N/A'}</td>
              <td>${invoiceData.planName || invoiceData.deviceName || 'Subscription'}<br><small>ID: ${invoiceData.subscriptionId || invoiceData.deviceId || 'N/A'}</small></td>
              <td>${currencySymbol} ${(invoiceData.netAmount || invoiceData.amount).toFixed(2)}</td>
              <td>${invoiceData.vatRate || 20}%</td>
              <td>${currencySymbol} ${(invoiceData.totalAmount || invoiceData.amount).toFixed(2)}</td>
            </tr>
            `}
          </tbody>
        </table>
        
        <div class="totals">
          <strong>Total Net Amount: ${currencySymbol} ${(invoiceData.netAmount || invoiceData.amount).toFixed(2)}</strong><br>
          <strong>Total VAT: ${currencySymbol} ${(invoiceData.vatAmount || 0).toFixed(2)}</strong><br>
          <strong>Invoice Total: ${currencySymbol} ${(invoiceData.totalAmount || invoiceData.amount).toFixed(2)}</strong>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Invoice ${invoiceData.invoiceNumber} - SENIOT`,
    html: emailHtml
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendInvoiceEmail };
