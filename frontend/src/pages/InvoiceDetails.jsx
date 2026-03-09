import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import invoiceService from '../services/invoiceService';
import apiService from '../services/apiService';
import './pages.css';

const getCurrencySymbol = (currency) => {
  const symbols = { 'USD': '$', 'INR': '₹', 'GBP': '£', 'EUR': '€', 'JPY': '¥', 'AUD': 'A$', 'CAD': 'C$', 'CNY': '¥' };
  return symbols[currency] || '$';
};

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      const invoiceData = await invoiceService.getById(id);
      setInvoice(invoiceData);
      
      // Fetch customer data for billing address
      if (invoiceData.customerId) {
        const customerData = await apiService.get(`/customers/${invoiceData.customerId}`);
        setCustomer(customerData);
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Invoice Details" />
        <div className="page-container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading invoice...</p>
          </div>
        </div>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <Header title="Invoice Details" />
        <div className="page-container">
          <div className="customer-details">
            <h2>Invoice not found</h2>
            <Link to="/invoices" className="btn btn-primary">
              Back to Invoices
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`Invoice Details - ${invoice.invoiceNumber}`} />
      <div className="page-container">
        <div className="customer-details">
        <section className="device-info-section">
          <div className="device-info-cards">
            <div className="device-info-card">
              <h3><i className="fas fa-info-circle"></i> Invoice Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Invoice Number:</span>
                  <span className="info-value"><strong>{invoice.invoiceNumber}</strong></span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge status-${invoice.status?.toLowerCase()}`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Net Amount:</span>
                  <span className="info-value"><strong>{getCurrencySymbol(invoice.currency)}{invoice.netAmount?.toFixed(2) || invoice.amount?.toFixed(2)}</strong></span>
                </div>
                <div className="info-item">
                  <span className="info-label">VAT ({invoice.vatRate || 0}%):</span>
                  <span className="info-value">{getCurrencySymbol(invoice.currency)}{invoice.vatAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Amount:</span>
                  <span className="info-value"><strong>{getCurrencySymbol(invoice.currency)}{invoice.totalAmount?.toFixed(2) || invoice.amount?.toFixed(2)}</strong></span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created Date:</span>
                  <span className="info-value">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="device-info-card">
              <h3><i className="fas fa-user"></i> Customer Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Customer ID:</span>
                  <span className="info-value">{invoice.customerId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Customer Name:</span>
                  <span className="info-value">{invoice.customerName || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Customer Email:</span>
                  <span className="info-value"><strong>{invoice.customerEmail}</strong></span>
                </div>
                <div className="info-item">
                  <span className="info-label">Billing Address:</span>
                  <span className="info-value">{customer?.address || 'No address provided'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Device ID:</span>
                  <span className="info-value">{invoice.deviceId}</span>
                </div>
                {invoice.engineerId && (
                  <div className="info-item">
                    <span className="info-label">Engineer ID:</span>
                    <span className="info-value">{invoice.engineerId}</span>
                  </div>
                )}
                {invoice.paymentId && (
                  <div className="info-item">
                    <span className="info-label">Payment ID:</span>
                    <span className="info-value">{invoice.paymentId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="action-buttons">
          <Link to="/invoices" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to Invoices
          </Link>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <i className="fas fa-print"></i> Print Invoice
          </button>
        </div>

        {/* Professional Invoice Template */}
        <div className="invoice-template" style={{ marginTop: '30px', backgroundColor: 'white', padding: '40px', border: '1px solid #ddd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>SENIOT</h1>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px 0' }}>INVOICE</h2>
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                Website: www.seniotgateway.com<br/>
                Email: info@seniotgateway.com
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.4' }}>
              VAT No: GB 123 456 789<br/>
              Invoice date: {new Date(invoice.createdAt).toLocaleDateString()}<br/>
              Invoice No: {invoice.invoiceNumber}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
              <strong>60 TORRING WAY</strong><br/>
              MORDEN<br/>
              SURREY SM4 5QA<br/>
              UNITED KINGDOM
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
              <strong>{invoice.customerName || 'CUSTOMER BUSINESS NAME'}</strong><br/>
              Customer ID: {invoice.customerId}<br/>
              {customer?.address ? customer.address.split(',').map((line, i) => <span key={i}>{line.trim()}<br/></span>) : 'BILLING ADDRESS'}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '8px 4px', fontWeight: 'bold' }}>Ref</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', fontWeight: 'bold' }}>Plant Devices</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 'bold' }}>Unit Price</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 'bold' }}>VAT</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 'bold' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 4px', verticalAlign: 'top' }}>{invoice.planName || invoice.deviceName || 'Device'}</td>
                <td style={{ padding: '8px 4px', verticalAlign: 'top' }}>
                  {invoice.planName || invoice.deviceName || 'IoT Device'}<br/>
                  <small>ID: {invoice.deviceId}</small>
                </td>
                <td style={{ textAlign: 'right', padding: '8px 4px', verticalAlign: 'top' }}>{getCurrencySymbol(invoice.currency)} {(invoice.netAmount || invoice.amount)?.toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: '8px 4px', verticalAlign: 'top' }}>{invoice.vatRate || 0}%</td>
                <td style={{ textAlign: 'right', padding: '8px 4px', verticalAlign: 'top' }}>{getCurrencySymbol(invoice.currency)} {(invoice.totalAmount || invoice.amount)?.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.6' }}>
            <div><strong>Total Net Amount: {getCurrencySymbol(invoice.currency)} {(invoice.netAmount || invoice.amount)?.toFixed(2)}</strong></div>
            <div><strong>Total VAT: {getCurrencySymbol(invoice.currency)} {(invoice.vatAmount || 0)?.toFixed(2)}</strong></div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '5px', marginTop: '5px' }}>
              Invoice Total: {getCurrencySymbol(invoice.currency)} {(invoice.totalAmount || invoice.amount)?.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default InvoiceDetails;
