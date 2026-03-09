import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AddInvoiceModal from '../components/modals/AddInvoiceModal';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../hooks/useToast';
import invoiceService from '../services/invoiceService';
import apiService from '../services/apiService';
import { realTimeService } from '../services/realTimeService';
import './pages.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadData();
    
    const unsubscribeCustomers = realTimeService.subscribe('customers', (newCustomers) => {
      setCustomers(newCustomers);
    });
    
    const unsubscribeDevices = realTimeService.subscribe('devices', (newDevices) => {
      setDevices(newDevices);
    });
    
    const unsubscribeEngineers = realTimeService.subscribe('engineers', (newEngineers) => {
      setEngineers(newEngineers);
    });
    
    const intervalId = setInterval(async () => {
      try {
        const invoicesData = await invoiceService.getAll();
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Error refreshing invoices:', error);
      }
    }, 5000);
    
    return () => {
      unsubscribeCustomers();
      unsubscribeDevices();
      unsubscribeEngineers();
      clearInterval(intervalId);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, plansData, customersData, devicesData, engineersData] = await Promise.all([
        invoiceService.getAll(),
        apiService.get('/subscription-plans'),
        apiService.get('/customers'),
        apiService.get('/devices'),
        apiService.get('/engineers')
      ]);
      
      setInvoices(invoicesData);
      setSubscriptionPlans(plansData);
      setCustomers(customersData);
      setDevices(devicesData);
      setEngineers(engineersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = { 'USD': '$', 'INR': '₹', 'GBP': '£', 'EUR': '€', 'JPY': '¥', 'AUD': 'A$', 'CAD': 'C$', 'CNY': '¥' };
    return symbols[currency] || '$';
  };

  const stats = useMemo(() => {
    const total = invoices.filter(i => i.status !== 'Deleted').length;
    const active = invoices.filter(i => i.status === 'Active').length;
    const inactive = invoices.filter(i => i.status === 'Inactive').length;
    return { total, active, inactive };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const categoryMatch = currentCategory === 'all' ? invoice.status !== 'Deleted' : 
        (currentCategory === 'Active' && invoice.status === 'Active') ||
        (currentCategory === 'Inactive' && invoice.status === 'Inactive') ||
        (currentCategory === 'Deleted' && invoice.status === 'Deleted');
      
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'active' && invoice.status === 'Active') ||
        (statusFilter === 'inactive' && invoice.status === 'Inactive');
      
      const searchMatch = searchTerm === '' || 
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return categoryMatch && statusMatch && searchMatch;
    });
  }, [invoices, currentCategory, statusFilter, searchTerm]);

  const handleAddInvoice = async (invoiceData) => {
    try {
      await invoiceService.create(invoiceData);
      await loadData();
      setShowAddModal(false);
      showToast('Invoice created successfully', 'success');
    } catch (error) {
      console.error('Error creating invoice:', error);
      showToast('Error: ' + error.message, 'error');
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await invoiceService.updateStatus(invoiceId, newStatus);
      const invoicesData = await invoiceService.getAll();
      setInvoices(invoicesData);
      showToast('Status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Error: ' + error.message, 'error');
    }
  };

  const handleDelete = async (invoiceId) => {
    setConfirmDelete(invoiceId);
  };

  const confirmDeleteInvoice = async () => {
    const invoiceId = confirmDelete;
    setConfirmDelete(null);
    
    try {
      await invoiceService.delete(invoiceId);
      const freshInvoicesData = await invoiceService.getAll();
      setInvoices(freshInvoicesData);
      showToast('Invoice deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showToast('Error: ' + error.message, 'error');
    }
  };

  const handleResendEmail = async (invoiceId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/invoices/${invoiceId}/resend-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        showToast('Invoice email resent successfully!', 'success');
      } else {
        showToast('Failed to resend email: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      showToast('Error: ' + error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="devices-page">
        <header className="page-header">
          <h1><i className="fas fa-file-invoice"></i> Invoice Management</h1>
          <p className="page-subtitle">Track and manage customer invoices</p>
        </header>
        <div className="content">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading invoices...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="devices-page">
      <header className="page-header">
        <h1><i className="fas fa-file-invoice"></i> Invoice Management</h1>
        <p className="page-subtitle">Track and manage customer invoices</p>
      </header>

      <div className="content">
        <section className="overview-section">
          <div className="overview-cards">
            <div className="overview-card total">
              <span className="overview-icon"><i className="fas fa-file-invoice"></i></span>
              <div className="overview-content">
                <div className="overview-number">{stats.total}</div>
                <div className="overview-label">Total Invoices</div>
              </div>
            </div>
            <div className="overview-card online">
              <span className="overview-icon"><i className="fas fa-check-circle" style={{color: '#27ae60'}}></i></span>
              <div className="overview-content">
                <div className="overview-number highlight">{stats.active}</div>
                <div className="overview-label">Active</div>
              </div>
            </div>
            <div className="overview-card offline">
              <span className="overview-icon"><i className="fas fa-times-circle" style={{color: '#e74c3c'}}></i></span>
              <div className="overview-content">
                <div className="overview-number">{stats.inactive}</div>
                <div className="overview-label">Inactive</div>
              </div>
            </div>
          </div>
        </section>

        <section className="categories-section">
          <h2 className="section-title"><i className="fas fa-tags"></i> Invoice Categories</h2>
          <div className="category-filters">
            {['all', 'Active', 'Inactive', 'Deleted'].map(cat => {
              const count = cat === 'all' ? invoices.filter(i => i.status !== 'Deleted').length :
                cat === 'Active' ? invoices.filter(i => i.status === 'Active').length :
                cat === 'Inactive' ? invoices.filter(i => i.status === 'Inactive').length :
                invoices.filter(i => i.status === 'Deleted').length;
              
              return (
                <button 
                  key={cat} 
                  className={`category-btn ${currentCategory === cat ? 'active' : ''}`} 
                  onClick={() => setCurrentCategory(cat)}
                >
                  <i className={`fas ${cat === 'all' ? 'fa-list' : cat === 'Active' ? 'fa-check-circle' : cat === 'Inactive' ? 'fa-times-circle' : 'fa-trash'}`}></i>{' '}
                  {cat === 'all' ? 'All' : cat} ({count})
                </button>
              );
            })}
          </div>
        </section>

        <section className="devices-section">
          <div className="section-header">
            <h2 className="section-title"><i className="fas fa-list"></i> Invoice List</h2>
            <div className="section-controls">
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <input type="text" placeholder="Search invoices or customer..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><i className="fas fa-plus"></i> Add Invoice</button>
            </div>
          </div>

          <div className="table-container">
            <table className="devices-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer Name</th>
                  <th>Customer Email</th>
                  <th>Device ID</th>
                  <th>Net Amount</th>
                  <th>VAT</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                      No invoices found for the selected category: <strong>{currentCategory}</strong>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.invoiceId}>
                      <td><strong>{invoice.invoiceNumber}</strong></td>
                      <td>
                        {invoice.customerName || 'N/A'}
                        {invoice.planName && (
                          <div style={{fontSize: '11px', color: '#666', marginTop: '4px'}}>
                            <i className="fas fa-box"></i> {invoice.planName}
                          </div>
                        )}
                      </td>
                      <td>{invoice.customerEmail || 'No email'}</td>
                      <td><code>{invoice.deviceId || 'N/A'}</code></td>
                      <td>{getCurrencySymbol(invoice.currency)}{invoice.netAmount?.toFixed(2) || invoice.amount?.toFixed(2)}</td>
                      <td>{getCurrencySymbol(invoice.currency)}{invoice.vatAmount?.toFixed(2) || '0.00'} ({invoice.vatRate || 0}%)</td>
                      <td><strong>{getCurrencySymbol(invoice.currency)}{invoice.totalAmount?.toFixed(2) || invoice.amount?.toFixed(2)}</strong></td>
                      <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge status-${invoice.status?.toLowerCase() || 'inactive'}`}>
                          <i className={`fas ${invoice.status === 'Active' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>{' '}
                          {invoice.status || 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/invoices/${invoice.invoiceId || invoice.id}`} className="btn btn-primary btn-sm">
                            <i className="fas fa-eye"></i> View
                          </Link>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleResendEmail(invoice.invoiceId)} title="Resend Email">
                            <i className="fas fa-envelope"></i>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(invoice.invoiceId)} title="Delete">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      
      <AddInvoiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddInvoice={handleAddInvoice}
        customers={customers}
        devices={devices}
        engineers={engineers}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {confirmDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this invoice? This action cannot be undone."
          onConfirm={confirmDeleteInvoice}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default Invoices;
