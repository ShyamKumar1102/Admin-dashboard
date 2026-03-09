import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { getServicePlansForCountry } from '../../data/subscriptions';

const EditSubscriptionModal = ({ subscription, onClose, onUpdateSubscription }) => {
  const [formData, setFormData] = useState({
    country: '',
    planName: '',
    price: 0
  });

  useEffect(() => {
    if (subscription) {
      setFormData({
        country: subscription.country || 'United States',
        planName: subscription.planName || '',
        price: subscription.price || 0
      });
    }
  }, [subscription]);

  const servicePlans = getServicePlansForCountry(formData.country);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'planName') {
      const selectedPlan = servicePlans.find(p => p.name === value);
      setFormData(prev => ({
        ...prev,
        planName: value,
        price: selectedPlan?.price || 0
      }));
    } else if (name === 'country') {
      setFormData(prev => ({
        ...prev,
        country: value,
        planName: '',
        price: 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedSubscription = {
      ...subscription,
      country: formData.country,
      planName: formData.planName,
      price: parseFloat(formData.price) || 0,
      status: 'Active'
    };

    onUpdateSubscription(updatedSubscription);
    onClose();
  };

  if (!subscription) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Subscription"
      subtitle="Update subscription plan details"
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price *</label>
              <input
                type="number"
                name="price"
                className="form-input"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                required
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Update Subscription
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSubscriptionModal;