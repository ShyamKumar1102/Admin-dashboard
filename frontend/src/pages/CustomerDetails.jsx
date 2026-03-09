import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { dbService } from '../services/unifiedDatabaseService';
import './pages.css';

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const [customers, allDevices] = await Promise.all([
        dbService.getAllCustomers(),
        dbService.getAllDevices()
      ]);
      const foundCustomer = customers.find(c => c.id === id || c.customerId === id || c.username === id);
      setCustomer(foundCustomer);
      
      if (foundCustomer) {
        const customerDevices = allDevices.filter(d => 
          d.customerId === foundCustomer.id || 
          d.customerId === foundCustomer.customerId || 
          d.customerId === foundCustomer.username
        );
        setDevices(customerDevices);
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Customer Details" />
        <div className="page-container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading customer details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!customer) {
    return (
      <>
        <Header title="Customer Details" />
        <div className="page-container">
          <div className="customer-details">
            <h2>Customer Not Found</h2>
            <p>The requested customer could not be found.</p>
            <Link to="/customers" className="btn btn-primary">
              Back to Customers
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`Customer Details - ${customer.name}`} />
      <div className="page-container">
        <div className="customer-details">
          <h2>Customer Information</h2>
          <div className="customer-info">
            <div>
              <div className="info-item">
                <div className="info-label">Customer ID</div>
                <div className="info-value">{customer.id || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Company Name</div>
                <div className="info-value">{customer.name || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Email Address</div>
                <div className="info-value">{customer.email || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Phone Number</div>
                <div className="info-value">{customer.mobile || 'N/A'}</div>
              </div>
            </div>
            <div>
              <div className="info-item">
                <div className="info-label">Address</div>
                <div className="info-value">{customer.location || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Total Staff Count</div>
                <div className="info-value">{customer.totalStaff || 0}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Total Engineers</div>
                <div className="info-value">{customer.totalEngineers || 0}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Devices</div>
                <div className="info-value">{devices.length}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Monthly Spend</div>
                <div className="info-value">${customer.monthlySpend || 0}</div>
              </div>
            </div>
          </div>
          
          {devices.length > 0 && (
            <div className="customer-devices">
              <h3>Assigned Devices</h3>
              <table className="devices-table">
                <thead>
                  <tr>
                    <th>Device ID</th>
                    <th>Device Name</th>
                    <th>Product ID</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(device => (
                    <tr key={device.id}>
                      <td><strong>{device.id}</strong></td>
                      <td>{device.deviceName || 'N/A'}</td>
                      <td><code>{device.productId || 'N/A'}</code></td>
                      <td><span className={`status-badge status-${device.status?.toLowerCase()}`}>{device.status || 'Unknown'}</span></td>
                      <td>
                        <Link to={`/devices/${device.id}`} className="btn btn-primary btn-sm">
                          <i className="fas fa-eye"></i> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="action-buttons">
            <Link to="/customers" className="btn btn-secondary">
              Back to Customers
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDetails;