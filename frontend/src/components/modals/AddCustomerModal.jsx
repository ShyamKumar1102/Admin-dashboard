import React, { useState } from 'react';
import Modal from './Modal';

const AddCustomerModal = ({ isOpen, onClose, onAddCustomer }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCustomer = {
      customerId: formData.customerId,
      email: formData.email,
      password: formData.password
    };
    onAddCustomer(newCustomer);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      email: '',
      password: ''
    });
  };

  const renderStepper = () => null;
  const renderStep1 = () => null;
  const renderStep2 = () => null;
  const renderStep3 = () => null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title="Add New Customer"
      subtitle="Create a new customer profile"
      size="large"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">Customer Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer ID *</label>
              <input
                type="text"
                name="customerId"
                className="form-input"
                placeholder="e.g., CUST001"
                value={formData.customerId}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Create Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={() => { resetForm(); onClose(); }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add Customer
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCustomerModal;