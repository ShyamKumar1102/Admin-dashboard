import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { dbService } from '../services/unifiedDatabaseService';
import './pages.css';

const DeviceDetails = () => {
  const { deviceId } = useParams();
  const [activeTab, setActiveTab] = useState('history');
  const [device, setDevice] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeviceData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  const loadDeviceData = async () => {
    try {
      const devices = await dbService.getAllDevices();
      const foundDevice = devices.find(d => d.id === deviceId);
      setDevice(foundDevice);
      
      if (foundDevice) {
        const customers = await dbService.getAllCustomers();
        const foundCustomer = customers.find(c => c.id === foundDevice.customerId);
        setCustomer(foundCustomer);
      }
    } catch (error) {
      console.error('Error loading device data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="device-details-page">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading device details...</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <>
        <Header title="Device Details" />
        <div className="page-container">
          <div className="customer-details">
            <h2>Device Not Found</h2>
            <Link to="/devices" className="btn btn-primary">
              Back to Devices
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`Device Details - ${device.deviceName}`} />
      <div className="page-container">
        <div className="customer-details">
        <section className="device-info-section">
          <div className="device-info-cards">
            <div className="device-info-card">
              <h3>Device Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Device ID:</span>
                  <span className="info-value">{device.id || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Product ID:</span>
                  <span className="info-value"><code>{device.productId || 'N/A'}</code></span>
                </div>
                <div className="info-item">
                  <span className="info-label">Device Name:</span>
                  <span className="info-value"><strong>{device.deviceName || 'N/A'}</strong></span>
                </div>
                <div className="info-item">
                  <span className="info-label">MAC Address:</span>
                  <span className="info-value"><code>{device.macAddress || 'N/A'}</code></span>
                </div>
                <div className="info-item">
                  <span className="info-label">Category:</span>
                  <span className="info-value">
                    <span className={`category-badge category-${device.category?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
                      {device.category || 'N/A'}
                    </span>
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className="info-value">
                    <span className={`status-badge status-${device.status?.toLowerCase() || 'unknown'}`}>
                      {device.status || 'Unknown'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="device-info-card">
              <h3>Customer Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">{customer?.name || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Customer ID:</span>
                  <span className="info-value">{device.customerId || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{customer?.location || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Country:</span>
                  <span className="info-value">{customer?.country || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="device-info-card">
              <h3>Subscription & Engineering</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Assigned Engineer:</span>
                  <span className="info-value">{device.assignedEngineer || 'Not Assigned'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Installation Date:</span>
                  <span className="info-value">N/A</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Update:</span>
                  <span className="info-value">N/A</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="device-tabs-section">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <i className="fas fa-history"></i> Device History
            </button>
            <button 
              className={`tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
              onClick={() => setActiveTab('customer')}
            >
              <i className="fas fa-user"></i> Customer History
            </button>
            <button 
              className={`tab-btn ${activeTab === 'faults' ? 'active' : ''}`}
              onClick={() => setActiveTab('faults')}
            >
              <i className="fas fa-exclamation-triangle"></i> Fault History
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'history' && (
              <div className="history-tab">
                <h3>Device Update / Version History</h3>
                <div className="table-container">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Device ID</th>
                        <th>Status</th>
                        <th>Engineer</th>
                        <th>Customer</th>
                        <th>Category</th>
                        <th>MAC Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>{device.id || 'N/A'}</strong></td>
                        <td>
                          <span className={`status-badge status-${device.status?.toLowerCase() || 'unknown'}`}>
                            {device.status || 'Unknown'}
                          </span>
                        </td>
                        <td>{device.assignedEngineer || 'Not Assigned'}</td>
                        <td>{device.customerId || 'N/A'}</td>
                        <td>{device.category || 'N/A'}</td>
                        <td><code>{device.macAddress || 'N/A'}</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'customer' && (
              <div className="customer-tab">
                <h3>Customer Information</h3>
                <div className="customer-history-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Customer Name:</span>
                      <span className="info-value">{customer?.name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{customer?.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Mobile:</span>
                      <span className="info-value">{customer?.mobile || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Location:</span>
                      <span className="info-value">{customer?.location || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faults' && (
              <div className="faults-tab">
                <h3>Device Status</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Current Status:</span>
                    <span className="info-value">
                      <span className={`status-badge status-${device.status?.toLowerCase() || 'unknown'}`}>
                        {device.status || 'Unknown'}
                      </span>
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Assigned Engineer:</span>
                    <span className="info-value">{device.assignedEngineer || 'Not Assigned'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      
      <div className="action-buttons">
        <Link to="/devices" className="btn btn-secondary">
          Back to Devices
        </Link>
      </div>
    </div>
    </>
  );
};

export default DeviceDetails;