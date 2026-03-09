import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AddDeviceModal from '../components/modals/AddDeviceModal';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../hooks/useToast';
import { dbService } from '../services/unifiedDatabaseService';
import { realTimeService } from '../services/realTimeService';
import './pages.css';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const unsubscribeDevices = realTimeService.subscribe('devices', (newDevices) => {
      console.log('Real-time devices update:', newDevices.length);
      setDevices(newDevices);
    });
    
    const unsubscribeCustomers = realTimeService.subscribe('customers', (newCustomers) => {
      setCustomers(newCustomers);
    });
    
    const unsubscribeEngineers = realTimeService.subscribe('engineers', (newEngineers) => {
      setEngineers(newEngineers);
    });
    
    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeDevices();
      unsubscribeCustomers();
      unsubscribeEngineers();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [devicesData, customersData, engineersData] = await Promise.all([
        dbService.getAllDevices(),
        dbService.getAllCustomers(),
        dbService.getAllEngineers()
      ]);
      setDevices(devicesData || []);
      setCustomers(customersData || []);
      setEngineers(engineersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeDevices = devices.filter(d => d.status !== 'Deleted');
    const total = activeDevices.length;
    const online = activeDevices.filter(d => d.status === 'Online').length;
    const offline = activeDevices.filter(d => d.status === 'Offline').length;
    const fault = activeDevices.filter(d => d.status === 'Fault').length;
    return { total, online, offline, fault };
  }, [devices]);

  const filteredDevices = useMemo(() => {
    console.log('Filtering devices with category:', currentCategory);
    console.log('Total devices:', devices.length);
    
    const filtered = devices.filter(device => {
      const categoryMatch = currentCategory === 'all' ? device.status !== 'Deleted' : 
        (currentCategory === 'Online' && device.status === 'Online' && device.status !== 'Deleted') ||
        (currentCategory === 'Assigned' && device.status !== 'Deleted' && device.assignedEngineer && device.assignedEngineer !== 'Not Assigned') ||
        (currentCategory === 'Unassigned' && device.status !== 'Deleted' && (!device.assignedEngineer || device.assignedEngineer === 'Not Assigned')) ||
        (currentCategory === 'Fault' && device.status === 'Fault') ||
        (currentCategory === 'Deleted' && device.status === 'Deleted');
      
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'online' && device.status === 'Online') ||
        (statusFilter === 'offline' && device.status === 'Offline') ||
        (statusFilter === 'fault' && device.status === 'Fault');
      
      const searchMatch = searchTerm === '' || 
        device.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.macAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (device.assignedEngineer && device.assignedEngineer.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return categoryMatch && statusMatch && searchMatch;
    });
    
    console.log('Filtered devices:', filtered.length);
    return filtered;
  }, [devices, currentCategory, statusFilter, searchTerm, forceUpdate]);

  const getStatusIcon = (status) => {
    const icons = { 'Online': 'fa-circle', 'Offline': 'fa-circle', 'Fault': 'fa-exclamation-triangle', 'Deleted': 'fa-trash' };
    return icons[status] || 'fa-circle';
  };

  const handleDeleteDevice = async (deviceId) => {
    setConfirmDelete(deviceId);
  };

  const confirmDeleteDevice = async () => {
    const deviceId = confirmDelete;
    setConfirmDelete(null);
    
    try {
      const success = await dbService.deleteDevice(deviceId);
      if (success) {
        await loadData();
        showToast('Device deleted successfully', 'success');
      } else {
        showToast('Failed to delete device', 'error');
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      showToast('Error: ' + error.message, 'error');
    }
  };

  const handleUpdateDeviceStatus = async (deviceId, newStatus) => {
    console.log('Toggle device status clicked:', deviceId, newStatus);
    try {
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        const success = await dbService.updateDevice(deviceId, { ...device, status: newStatus });
        if (success) {
          setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: newStatus } : d));
        }
      }
    } catch (error) {
      console.error('Error updating device status:', error);
    }
  };

  if (loading) {
    return (
      <div className="devices-page">
        <header className="page-header">
          <h1><i className="fas fa-microchip"></i> Device Management</h1>
          <p className="page-subtitle">Monitor and manage your IoT device network</p>
        </header>
        <div className="content">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading devices...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddDevice = async (newDevice) => {
    try {
      const deviceId = `DEV${Date.now().toString().slice(-6)}`;
      const deviceData = {
        id: deviceId,
        deviceId: deviceId,
        deviceName: newDevice.deviceName || `Device ${deviceId}`,
        productId: newDevice.productId || `PROD${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        macAddress: newDevice.macAddress || 'N/A',
        category: newDevice.category || 'Unknown',
        status: 'Online',
        customerId: newDevice.customerId || 'N/A',
        engineerId: newDevice.engineerId || '',
        assignedEngineer: newDevice.assignedEngineer || 'Not Assigned'
      };
      const success = await dbService.createDevice(deviceData);
      if (success) {
        await loadData();
        setShowAddModal(false);
        showToast('Device added successfully', 'success');
      }
    } catch (error) {
      console.error('Error adding device:', error);
      showToast('Error adding device: ' + error.message, 'error');
    }
  };

  return (
    <div className="devices-page">
      <header className="page-header">
        <h1><i className="fas fa-microchip"></i> Device Management</h1>
        <p className="page-subtitle">Monitor and manage your IoT device network</p>
      </header>

      <div className="content">
        <section className="overview-section">
          <div className="overview-cards">
            <div className="overview-card total">
              <span className="overview-icon"><i className="fas fa-microchip"></i></span>
              <div className="overview-content">
                <div className="overview-number">{stats.total}</div>
                <div className="overview-label">Total Devices</div>
              </div>
            </div>
            <div className="overview-card online">
              <span className="overview-icon"><i className="fas fa-circle" style={{color: '#27ae60'}}></i></span>
              <div className="overview-content">
                <div className="overview-number highlight">{stats.online}</div>
                <div className="overview-label">Online & Healthy</div>
              </div>
            </div>
            <div className="overview-card offline">
              <span className="overview-icon"><i className="fas fa-circle" style={{color: '#e74c3c'}}></i></span>
              <div className="overview-content">
                <div className="overview-number highlight">{stats.offline}</div>
                <div className="overview-label">Offline</div>
              </div>
            </div>
            <div className="overview-card fault">
              <span className="overview-icon"><i className="fas fa-exclamation-triangle"></i></span>
              <div className="overview-content">
                <div className="overview-number">{stats.fault}</div>
                <div className="overview-label">Need Attention</div>
              </div>
            </div>
          </div>
        </section>

        <section className="categories-section">
          <h2 className="section-title"><i className="fas fa-tags"></i> Device Filters</h2>
          <div className="category-filters">
            {['all', 'Online', 'Assigned', 'Unassigned', 'Fault', 'Deleted'].map(cat => {
              const count = cat === 'all' ? devices.filter(d => d.status !== 'Deleted').length :
                cat === 'Online' ? devices.filter(d => d.status === 'Online' && d.status !== 'Deleted').length :
                cat === 'Assigned' ? devices.filter(d => d.status !== 'Deleted' && d.assignedEngineer && d.assignedEngineer !== 'Not Assigned').length :
                cat === 'Unassigned' ? devices.filter(d => d.status !== 'Deleted' && (!d.assignedEngineer || d.assignedEngineer === 'Not Assigned')).length :
                cat === 'Fault' ? devices.filter(d => d.status === 'Fault').length :
                devices.filter(d => d.status === 'Deleted').length;
              
              return (
                <button 
                  key={cat} 
                  className={`category-btn ${currentCategory === cat ? 'active' : ''}`} 
                  onClick={() => {
                    console.log('Category clicked:', cat);
                    setCurrentCategory(cat);
                    setForceUpdate(prev => prev + 1);
                  }}
                >
                  <i className={`fas ${cat === 'all' ? 'fa-tools' : cat === 'Online' ? 'fa-check-circle' : cat === 'Assigned' ? 'fa-user-check' : cat === 'Unassigned' ? 'fa-user-times' : cat === 'Fault' ? 'fa-exclamation-triangle' : 'fa-trash'}`}></i> 
                  {cat === 'all' ? 'All Devices' : `${cat} Devices`} ({count})
                </button>
              );
            })}
          </div>
        </section>

        <section className="devices-section">
          <div className="section-header">
            <h2 className="section-title"><i className="fas fa-tools"></i> Device Inventory</h2>
            <div className="section-controls">
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="fault">Fault</option>
              </select>
              <input type="text" placeholder="Search devices, product ID, or device name..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><i className="fas fa-plus"></i> Add Device</button>
            </div>
          </div>

          <div className="table-container">
            <table className="devices-table" key={`${currentCategory}-${statusFilter}-${searchTerm}`}>
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Product ID</th>
                  <th>Device Name</th>
                  <th>MAC Address</th>
                  <th>Customer ID</th>
                  <th>Category</th>
                  <th>Engineer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                      No devices found for the selected category: <strong>{currentCategory}</strong>
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((device, index) => (
                    <tr key={device.id}>
                      <td><strong>{device.id || 'N/A'}</strong></td>
                      <td><code className="device-id">{device.productId || 'N/A'}</code></td>
                      <td><strong>{device.deviceName || 'N/A'}</strong></td>
                      <td><code className="mac-address">{device.macAddress || 'N/A'}</code></td>
                      <td>{device.customerId || 'N/A'}</td>
                      <td><span className={`category-badge category-${device.category?.toLowerCase().replace(' ', '-') || 'unknown'}`}>{device.category || 'N/A'}</span></td>
                      <td>{device.assignedEngineer || device.engineerId || 'Not Assigned'}</td>
                      <td><span className={`status-badge status-${device.status?.toLowerCase() || 'unknown'}`}><i className={`fas ${getStatusIcon(device.status)}`}></i> {device.status || 'Unknown'}</span></td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/devices/${device.id}`} className="btn btn-primary btn-sm">
                            <i className="fas fa-eye"></i> View
                          </Link>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDeleteDevice(device.id)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      
      <AddDeviceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddDevice={handleAddDevice}
        customers={customers}
        engineers={engineers}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {confirmDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this device? This action cannot be undone."
          onConfirm={confirmDeleteDevice}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default Devices;