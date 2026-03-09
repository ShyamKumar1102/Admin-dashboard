import React, { useState } from 'react';
import Modal from './Modal';

const AddDeviceModal = ({ isOpen, onClose, onAddDevice, customers, engineers }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    deviceId: '',
    macAddress: '',
    category: 'Indoor Unit',
    customerId: '',
    engineerId: '',
    installedDate: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    const selectedEngineer = engineers.find(e => e.id === formData.engineerId);
    
    const newDevice = {
      deviceName: `Device ${formData.deviceId}`,
      productId: `PROD${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      macAddress: formData.macAddress,
      category: formData.category,
      status: 'Online',
      assignedEngineer: selectedEngineer ? selectedEngineer.name : null,
      engineerId: formData.engineerId || null,
      customerId: formData.customerId,
      assignmentStatus: formData.customerId ? 'Assigned' : 'Unassigned',
      installedDate: formData.installedDate,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
    
    onAddDevice(newDevice);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      deviceId: '',
      macAddress: '',
      category: 'Indoor Unit',
      customerId: '',
      engineerId: '',
      installedDate: new Date().toISOString().split('T')[0]
    });
  };

  const generateDeviceId = () => {
    const id = `DEV${String(Date.now()).slice(-3)}`;
    setFormData({ ...formData, deviceId: id });
  };

  const generateMacAddress = () => {
    const mac = Array.from({length: 6}, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    ).join(':');
    setFormData({ ...formData, macAddress: mac });
  };

  const renderStepper = () => (
    <div className="stepper">
      <div className={`step ${currentStep >= 1 ? 'active' : 'inactive'}`}>
        <div className="step-number">1</div>
        <div className="step-title">Device Info</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 2 ? 'active' : 'inactive'}`}>
        <div className="step-number">2</div>
        <div className="step-title">Assignment</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 3 ? 'active' : 'inactive'}`}>
        <div className="step-number">3</div>
        <div className="step-title">Review</div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="form-section">
      <div className="form-group">
        <label className="form-label">Device ID *</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            name="deviceId"
            className="form-input"
            value={formData.deviceId}
            onChange={handleChange}
            placeholder="DEV001"
            required
          />
          <button type="button" className="btn btn-primary" onClick={generateDeviceId}>
            Generate
          </button>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">MAC Address *</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            name="macAddress"
            className="form-input"
            value={formData.macAddress}
            onChange={handleChange}
            placeholder="00:1B:44:11:3A:B7"
            required
          />
          <button type="button" className="btn btn-primary" onClick={generateMacAddress}>
            Generate
          </button>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          name="category"
          className="form-select"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="Indoor Unit">Indoor Unit</option>
          <option value="Soft Starter">Soft Starter</option>
          <option value="VFD">VFD</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-section">
      <div className="form-group">
        <label className="form-label">Assign to Customer *</label>
        <select
          name="customerId"
          className="form-select"
          value={formData.customerId}
          onChange={handleChange}
          required
        >
          <option value="">Select Customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name || customer.id} ({customer.id})
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Assign Engineer (Optional)</label>
        <select
          name="engineerId"
          className="form-select"
          value={formData.engineerId}
          onChange={handleChange}
        >
          <option value="">No Engineer Assigned</option>
          {engineers.filter(eng => eng.status !== 'Deleted').map(engineer => (
            <option key={engineer.id} value={engineer.id}>
              {engineer.name || engineer.id} - {engineer.email}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Installation Date</label>
        <input
          type="date"
          name="installedDate"
          className="form-input"
          value={formData.installedDate}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const renderStep3 = () => {
    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    const selectedEngineer = engineers.find(e => e.id === formData.engineerId);
    
    return (
      <div className="form-section">
        <h3 className="section-title">Device Summary</h3>
        <div className="billing-summary">
          <div className="billing-row">
            <span>Device ID:</span>
            <span><strong>{formData.deviceId || 'N/A'}</strong></span>
          </div>
          <div className="billing-row">
            <span>MAC Address:</span>
            <span><code>{formData.macAddress || 'N/A'}</code></span>
          </div>
          <div className="billing-row">
            <span>Category:</span>
            <span>{formData.category || 'N/A'}</span>
          </div>
          <div className="billing-row">
            <span>Customer:</span>
            <span>{selectedCustomer ? (selectedCustomer.name || selectedCustomer.id) : 'Not assigned'}</span>
          </div>
          <div className="billing-row">
            <span>Engineer:</span>
            <span>{selectedEngineer ? (selectedEngineer.name || selectedEngineer.id) : 'Not assigned'}</span>
          </div>
          <div className="billing-row">
            <span>Installation Date:</span>
            <span>{formData.installedDate || 'N/A'}</span>
          </div>
          <div className="billing-row total">
            <span>Status:</span>
            <span>Ready to Deploy</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title="Add New IoT Device"
      subtitle="Register a new device in the system"
      size="large"
    >
      <form onSubmit={handleSubmit}>
        {renderStepper()}
        
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="stepper-actions">
          <div>
            {currentStep > 1 && (
              <button type="button" className="btn-cancel" onClick={prevStep}>
                Back
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-cancel" onClick={() => { resetForm(); onClose(); }}>
              Cancel
            </button>
            {currentStep < 3 ? (
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Next
              </button>
            ) : (
              <button type="submit" className="btn btn-primary">
                Add Device
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddDeviceModal;