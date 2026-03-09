const paymentService = require('../services/payment.service');
const invoiceService = require('../services/invoice.service');
const { sendInvoiceEmail } = require('../services/email-invoice.service');
const { generateId, validateRequired } = require('../utils/helpers');

// Create payment and auto-generate invoice
const createPayment = async (req, res) => {
  try {
    validateRequired(req.body, ['customerEmail', 'amount', 'items']);

    const paymentId = `PAY-${Date.now()}`;
    const netAmount = Number(req.body.amount);
    const vatRate = 0; // Non-VAT registered
    const vatAmount = 0;
    const totalAmount = netAmount + vatAmount;

    // 1. Save payment to Payments table
    const payment = await paymentService.create({
      paymentId,
      customerEmail: req.body.customerEmail,
      customerName: req.body.customerName || 'Customer',
      items: req.body.items || [],
      netAmount,
      vatRate,
      vatAmount,
      totalAmount,
      status: 'Completed',
      paymentMethod: req.body.paymentMethod || 'Card',
      createdAt: new Date().toISOString()
    });

    // 2. Auto-generate invoice
    const invoiceNumber = await invoiceService.getNextInvoiceNumber();
    const invoiceId = generateId();

    const invoice = await invoiceService.create({
      invoiceId,
      invoiceNumber,
      paymentId,
      customerEmail: req.body.customerEmail,
      customerName: req.body.customerName || 'Customer',
      items: req.body.items || [],
      netAmount,
      vatRate,
      vatAmount,
      totalAmount,
      status: 'Paid',
      emailStatus: 'Pending',
      createdAt: new Date().toISOString()
    });

    // 3. Send invoice email
    const emailResult = await sendInvoiceEmail(req.body.customerEmail, invoice);
    
    if (emailResult.success) {
      await invoiceService.update(invoiceId, { emailStatus: 'Sent' });
    } else {
      await invoiceService.update(invoiceId, { emailStatus: 'Failed' });
    }

    res.status(201).json({
      success: true,
      data: {
        payment,
        invoice,
        emailSent: emailResult.success
      },
      message: 'Payment processed and invoice generated successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAll();
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await paymentService.getById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createPayment, getAllPayments, getPaymentById };
