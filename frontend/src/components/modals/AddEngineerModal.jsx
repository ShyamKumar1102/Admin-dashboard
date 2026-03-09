import React, { useState } from 'react';
import Modal from './Modal';

const AddEngineerModal = ({ isOpen, onClose, onAddEngineer }) => {
  const [formData, setFormData] = useState({
    engineerId: '',
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
    const newEngineer = {
      engineerId: formData.engineerId,
      email: formData.email,
      password: formData.password
    };
    onAddEngineer(newEngineer);
    setFormData({
      engineerId: '',
      email: '',
      password: ''
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Engineer"
      subtitle="Create a new team member profile"
      size="medium"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">Engineer Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Engineer ID *</label>
              <input
                type="text"
                name="engineerId"
                className="form-input"
                placeholder="e.g., ENG001"
                value={formData.engineerId}
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
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add Engineer
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEngineerModal;