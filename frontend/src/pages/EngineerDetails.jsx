import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { dbService } from '../services/unifiedDatabaseService';
import './pages.css';

const EngineerDetails = () => {
  const { id } = useParams();
  const [engineer, setEngineer] = useState(null);
  const [assignedDevices, setAssignedDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEngineer();
  }, [id]);

  const loadEngineer = async () => {
    try {
      const [engineers, devices] = await Promise.all([
        dbService.getAllEngineers(),
        dbService.getAllDevices()
      ]);
      
      const foundEngineer = engineers.find(e => e.id === id || e.username === id);
      setEngineer(foundEngineer);
      
      if (foundEngineer) {
        const engineerDevices = devices.filter(d => 
          d.engineerId === foundEngineer.id || 
          d.engineerId === foundEngineer.username ||
          d.assignedEngineer === foundEngineer.name ||
          d.assignedEngineer === foundEngineer.username
        );
        setAssignedDevices(engineerDevices);
      }
    } catch (error) {
      console.error('Error loading engineer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Engineer Details" />
        <div className="page-container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading engineer details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!engineer) {
    return (
      <>
        <Header title="Engineer Details" />
        <div className="page-container">
          <div className="customer-details">
            <h2>Engineer Not Found</h2>
            <p>The requested engineer could not be found.</p>
            <Link to="/engineers" className="btn btn-primary">
              Back to Engineers
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`Engineer Details - ${engineer.name}`} />
      <div className="page-container">
        <div className="customer-details">
          <h2>Engineer Information</h2>
          <div className="customer-info">
            <div>
              <div className="info-item">
                <div className="info-label">Engineer ID</div>
                <div className="info-value">{engineer.id || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Full Name</div>
                <div className="info-value">{engineer.name || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Email Address</div>
                <div className="info-value">{engineer.email || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Phone Number</div>
                <div className="info-value">{engineer.phone || 'N/A'}</div>
              </div>
            </div>
            <div>
              <div className="info-item">
                <div className="info-label">Specialization</div>
                <div className="info-value">{engineer.specialization || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Assigned Devices</div>
                <div className="info-value">{assignedDevices.length}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Current Status</div>
                <div className="info-value">
                  <span className={`status-badge status-${engineer.status || 'available'}`}>
                    {engineer.status === 'assigned' ? 'Assigned' : 'Available'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {assignedDevices.length > 0 && (
            <div className="customer-details" style={{marginTop: '20px'}}>
              <h2>Assigned Devices</h2>
              <div className="table-container">
                <table className="devices-table">
                  <thead>
                    <tr>
                      <th>Device ID</th>
                      <th>Device Name</th>
                      <th>Product ID</th>
                      <th>Status</th>
                      <th>Customer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedDevices.map((device, index) => (
                      <tr key={device.id || `dev-${index}`}>
                        <td><strong>{device.id || 'N/A'}</strong></td>
                        <td>{device.deviceName || 'N/A'}</td>
                        <td><code>{device.productId || 'N/A'}</code></td>
                        <td>
                          <span className={`status-badge status-${device.status?.toLowerCase() || 'unknown'}`}>
                            {device.status || 'Unknown'}
                          </span>
                        </td>
                        <td>{device.customerId || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="action-buttons">
            <Link to="/engineers" className="btn btn-secondary">
              Back to Engineers
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default EngineerDetails;