import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const AddInvoiceModal = ({ isOpen, onClose, onAddInvoice, customers, devices, engineers }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    deviceId: '',
    engineerId: '',
    amount: 0,
    customerEmail: ''
  });

  const [filteredDevices, setFilteredDevices] = useState([]);

  useEffect(() => {
    if (formData.customerId) {
      // Filter devices by customerId, handle both string and exact matches
      const customerDevices = devices.filter(d => 
        d.customerId === formData.customerId || 
        d.customerId?.toString() === formData.customerId?.toString()
      );
      setFilteredDevices(customerDevices);
      
      // Reset device selection if current device doesn't belong to selected customer
      if (customerDevices.length > 0 && !customerDevices.find(d => d.id === formData.deviceId)) {
        setFormData(prev => ({ ...prev, deviceId: '' }));
      }
      
      // Auto-fill customer email
      const selectedCustomer = customers.find(c => c.id === formData.customerId);
      if (selectedCustomer && selectedCustomer.email) {
        setFormData(prev => ({ ...prev, customerEmail: selectedCustomer.email }));
      }
    } else {
      setFilteredDevices([]);
      setFormData(prev => ({ ...prev, deviceId: '', customerEmail: '' }));
    }
  }, [formData.customerId, devices, customers]);



  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.deviceId || !formData.amount || !formData.customerEmail) {
      alert('Please fill all required fields');
      return;
    }
    onAddInvoice(formData);
    setFormData({
      customerId: '',
      deviceId: '',
      engineerId: '',
      amount: 0,
      customerEmail: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h3><i className="fas fa-file-invoice"></i> Create New Invoice</h3>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer *</label>
            <select value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} required>
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.id}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Device * ({filteredDevices.length} available)</label>
            <select value={formData.deviceId} onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })} required disabled={!formData.customerId}>
              <option value="">{formData.customerId ? 'Select Device' : 'Select Customer First'}</option>
              {filteredDevices.map(d => (
                <option key={d.id} value={d.id}>{`${d.deviceName || d.productId || d.id} (${d.id})`}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Engineer (Optional)</label>
            <select value={formData.engineerId} onChange={(e) => setFormData({ ...formData, engineerId: e.target.value })}>
              <option value="">Select Engineer</option>
              {engineers.map(e => (
                <option key={e.id} value={e.id}>{e.name || e.id}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Customer Email *</label>
            <input type="email" value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} required placeholder="customer@example.com" readOnly />
          </div>

          <div className="form-group">
            <label>Amount *</label>
            <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required min="0" step="0.01" placeholder="Enter invoice amount" />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Invoice</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInvoiceModal;
