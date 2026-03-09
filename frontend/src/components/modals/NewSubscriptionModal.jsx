import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { dbService } from '../../services/unifiedDatabaseService';
import { getServicePlansForCountry } from '../../data/subscriptions';

const NewSubscriptionModal = ({ isOpen, onClose, onAddSubscription }) => {
  const [formData, setFormData] = useState({
    country: 'United States',
    planName: ''
  });

  const servicePlans = getServicePlansForCountry(formData.country);
  const selectedPlan = servicePlans?.find(p => p.name === formData.planName);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === 'country' && { planName: '' })
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newSubscription = {
      country: formData.country,
      planName: selectedPlan?.name || formData.planName,
      price: selectedPlan?.price || 0,
      status: 'Active'
    };
    
    try {
      await onAddSubscription(newSubscription);
      alert('Subscription created successfully!');
      resetForm();
      onClose();
    } catch (error) {
      alert('Error creating subscription: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      country: 'United States',
      planName: ''
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title="New Subscription"
      subtitle="Create a new service subscription"
      size="large"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">Subscription Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Country *</label>
              <select
                name="country"
                className="form-select"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="United States">United States</option>
                <option value="India">India</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="Japan">Japan</option>
                <option value="Australia">Australia</option>
                <option value="Canada">Canada</option>
                <option value="China">China</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Plan *</label>
              <select
                name="planName"
                className="form-select"
                value={formData.planName}
                onChange={handleChange}
                required
              >
                <option value="">Choose a plan</option>
                {servicePlans?.map((plan) => (
                  <option key={plan.name} value={plan.name}>
                    {plan.name} - {plan.symbol}{plan.price}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={() => { resetForm(); onClose(); }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Subscription
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewSubscriptionModal;