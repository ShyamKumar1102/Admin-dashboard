import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { dbService } from '../services/unifiedDatabaseService';
import './pages.css';

const FaultDetails = () => {
  const { id } = useParams();
  const [fault, setFault] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFaultDetails();
  }, [id]);

  const loadFaultDetails = async () => {
    try {
      const [devices, customers] = await Promise.all([
        dbService.getAllDevices(),
        dbService.getAllCustomers()
      ]);
      
      const foundFault = devices.find(d => d.id === id || d.deviceId === id);
      const foundCustomer = foundFault ? customers.find(c => c.name === foundFault.customerName || c.username === foundFault.customerId) : null;
      
      setFault(foundFault);
      setCustomer(foundCustomer);
    } catch (error) {
      console.error('Error loading fault details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Fault Details" />
        <div className="page-container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading fault details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!fault) {
    return (
      <>
        <Header title="Fault Details" />
        <div className="page-container">
          <div className="fault-details">
            <h2>Fault Not Found</h2>
            <p>The requested fault record could not be found.</p>
            <Link to="/faults" className="btn btn-primary">
              Back to Fault Devices
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`Fault Details - ${fault.id || fault.deviceId}`} />
      <div className="page-container">
        <div className="fault-details">
          <h2>Fault Information</h2>
          <div className="fault-info">
            <div className="fault-section">
              <h3>Device Information</h3>
              <div className="info-item">
                <div className="info-label">Device ID</div>
                <div className="info-value">{fault.deviceId || fault.id}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Product ID</div>
                <div className="info-value">{fault.productId || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Fault Category</div>
                <div className="info-value">{fault.faultCategory || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Priority</div>
                <div className="info-value">
                  <span className={`priority-badge priority-${fault.priority?.toLowerCase() || 'low'}`}>
                    {fault.priority || 'Low'}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Status</div>
                <div className="info-value">
                  <span className={`status-badge status-${fault.status?.toLowerCase() || 'open'}`}>
                    {fault.status || 'Open'}
                  </span>
                </div>
              </div>
            </div>

            <div className="fault-section">
              <h3>Customer Details</h3>
              <div className="info-item">
                <div className="info-label">Customer Name</div>
                <div className="info-value">{fault.customerName || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Customer Email</div>
                <div className="info-value">{customer?.email || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Customer Location</div>
                <div className="info-value">{customer?.location || 'N/A'}</div>
              </div>
            </div>

            <div className="fault-section">
              <h3>Assignment Details</h3>
              <div className="info-item">
                <div className="info-label">Assigned Engineer</div>
                <div className="info-value">{fault.engineerAssigned || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Assigned Date</div>
                <div className="info-value">{fault.assignedDate || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Resolved Date</div>
                <div className="info-value">{fault.resolvedDate || 'Not resolved yet'}</div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <Link to={`/devices/${fault.deviceId || fault.id}`} className="btn btn-secondary">
              View Device Details
            </Link>
            {customer && (
              <Link to={`/customers/${customer.id}`} className="btn btn-secondary">
                View Customer Details
              </Link>
            )}
            <Link to="/faults" className="btn btn-primary">
              Back to Fault Devices
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default FaultDetails;
