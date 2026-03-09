import React, { useState } from 'react';
import './Modal.css';

const ViewSubscriptionModal = ({ subscription, onClose }) => {
  const [showEngineerView, setShowEngineerView] = useState(false);
  
  if (!subscription) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Subscription Details - {subscription.id || 'N/A'}</h2>
            <p className="modal-subtitle">View complete subscription information</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="customer-details">
            <h3>Subscription Information</h3>
            <div className="customer-info">
              <div>
                <div className="info-item">
                  <div className="info-label">Subscription ID</div>
                  <div className="info-value">{subscription.id || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Status</div>
                  <div className="info-value">
                    <span className={`status-badge status-${subscription.status?.toLowerCase() || 'unknown'}`}>
                      {subscription.status || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Customer</div>
                  <div className="info-value">{subscription.customerName || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Device ID</div>
                  <div className="info-value"><code>{subscription.deviceId || 'N/A'}</code></div>
                </div>
              </div>
              <div>
                <div className="info-item">
                  <div className="info-label">Device Location</div>
                  <div className="info-value">{subscription.deviceLocation || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Plan Name</div>
                  <div className="info-value">{subscription.planName || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Monthly Price</div>
                  <div className="info-value">${subscription.planPrice || 0}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Start Date</div>
                  <div className="info-value">{subscription.startDate || 'N/A'}</div>
                </div>
              </div>
            </div>
            <div className="customer-info" style={{marginTop: '20px'}}>
              <div>
                <div className="info-item">
                  <div className="info-label">Expiry Date</div>
                  <div className="info-value">{subscription.expiryDate || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Total Value</div>
                  <div className="info-value">
                    <span className="value-amount">${subscription.value || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowEngineerView(!showEngineerView)}
          >
            <i className={`fas fa-${showEngineerView ? 'user' : 'cog'}`}></i> 
            {showEngineerView ? 'User View' : 'Engineer View'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
      
      {showEngineerView && (
        <div className="modal-overlay" onClick={() => setShowEngineerView(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title"><i className="fas fa-cog"></i> Engineer View - {subscription.id}</h2>
                <p className="modal-subtitle">Technical details and raw data</p>
              </div>
              <button className="modal-close" onClick={() => setShowEngineerView(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="customer-details">
                <h3>Raw Subscription Data</h3>
                <pre style={{
                  background: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: '20px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  maxHeight: '400px',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }}>
                  {JSON.stringify(subscription, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowEngineerView(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSubscriptionModal;
