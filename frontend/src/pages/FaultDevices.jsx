import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { dbService } from '../services/unifiedDatabaseService';
import './pages.css';

const FaultDevices = () => {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [faultsList, setFaultsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const faultsData = await dbService.getAllFaults();
      setFaultsList(faultsData);
    } catch (error) {
      console.error('Error loading faults:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (reportData) => {
    try {
      const faultId = `FAULT${String(faultsList.length + 1).padStart(3, '0')}`;
      const newFault = {
        id: faultId,
        deviceId: reportData.deviceId,
        productId: reportData.productId || 'PROD001',
        customerName: reportData.customerName,
        faultCategory: reportData.category,
        priority: reportData.priority,
        engineerAssigned: reportData.engineer,
        assignedDate: new Date().toISOString().split('T')[0],
        resolvedDate: null,
        status: 'Open'
      };
      const success = await dbService.createFault(newFault);
      if (success) {
        setFaultsList(prev => [...prev, newFault]);
        setShowReportModal(false);
        alert('Issue reported successfully!');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
    }
  };

  const handleMarkResolved = async (faultId) => {
    console.log('Mark resolved clicked:', faultId);
    try {
      const fault = faultsList.find(f => f.id === faultId);
      if (fault) {
        const success = await dbService.updateFault(faultId, {
          ...fault,
          status: 'Resolved',
          resolvedDate: new Date().toISOString().split('T')[0]
        });
        if (success) {
          setFaultsList(prev => 
            prev.map(fault => 
              fault.id === faultId 
                ? { ...fault, status: 'Resolved', resolvedDate: new Date().toISOString().split('T')[0] }
                : fault
            )
          );
          alert(`Fault ${faultId} marked as resolved!`);
        }
      }
    } catch (error) {
      console.error('Error resolving fault:', error);
    }
  };

  const handleDeleteFault = async (faultId) => {
    if (window.confirm('Are you sure you want to delete this fault?')) {
      try {
        const success = await dbService.deleteFault(faultId);
        if (success) {
          setFaultsList(prev => prev.filter(f => f.id !== faultId));
        }
      } catch (error) {
        console.error('Error deleting fault:', error);
      }
    }
  };

  const handleReportIssue = () => {
    setShowReportModal(true);
  };

  const faultStats = useMemo(() => ({
    totalFaults: faultsList.length,
    criticalIssues: faultsList.filter(f => f.priority === 'Critical').length,
    resolvedToday: faultsList.filter(f => f.status === 'Resolved' && f.resolvedDate === new Date().toISOString().split('T')[0]).length,
    averageResolutionTime: '2.5 hours'
  }), [faultsList]);

  const faultCategories = useMemo(() => {
    const categories = ['Hardware', 'Software', 'Network'];
    return categories.map(cat => ({
      name: cat,
      count: faultsList.filter(f => f.faultCategory === cat).length,
      color: cat === 'Hardware' ? '#e74c3c' : cat === 'Software' ? '#3498db' : '#f39c12'
    }));
  }, [faultsList]);

  const filteredFaults = useMemo(() => {
    return faultsList.filter(fault => {
      const matchesCategory = categoryFilter === 'all' || fault.faultCategory === categoryFilter;
      const matchesStatus = statusFilter === 'all' || fault.status === statusFilter;
      const matchesSearch = searchTerm === '' || 
        fault.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fault.deviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fault.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fault.engineerAssigned?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [faultsList, categoryFilter, statusFilter, searchTerm]);

  if (loading) {
    return (
      <div className="fault-devices-page">
        <header className="page-header">
          <h1><i className="fas fa-exclamation-triangle"></i> Fault Management</h1>
        </header>
        <div className="content">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading faults...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace(' ', '-');
    return <span className={`status-badge status-${statusClass}`}>{status}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityClass = priority.toLowerCase();
    return <span className={`priority-badge priority-${priorityClass}`}>{priority}</span>;
  };

  return (
    <div className="fault-devices-page">
      <header className="page-header">
        <h1><i className="fas fa-exclamation-triangle"></i> Fault Management</h1>
      </header>

      <div className="content">
        <section className="overview-section">
          <div className="overview-cards">
            <div className="overview-card total">
              <span className="overview-icon"><i className="fas fa-exclamation-triangle"></i></span>
              <div className="overview-content">
                <div className="overview-number">{faultStats.totalFaults}</div>
                <div className="overview-label">Total Faults</div>
              </div>
            </div>
            <div className="overview-card critical">
              <span className="overview-icon"><i className="fas fa-fire"></i></span>
              <div className="overview-content">
                <div className="overview-number highlight">{faultStats.criticalIssues}</div>
                <div className="overview-label">Critical Issues</div>
              </div>
            </div>
            <div className="overview-card resolved">
              <span className="overview-icon"><i className="fas fa-check-circle"></i></span>
              <div className="overview-content">
                <div className="overview-number">{faultStats.resolvedToday}</div>
                <div className="overview-label">Resolved Today</div>
              </div>
            </div>
            <div className="overview-card time">
              <span className="overview-icon"><i className="fas fa-clock"></i></span>
              <div className="overview-content">
                <div className="overview-number">{faultStats.averageResolutionTime}</div>
                <div className="overview-label">Avg Resolution Time</div>
              </div>
            </div>
          </div>
        </section>

        <section className="categories-section">
          <h2 className="section-title"><i className="fas fa-tags"></i> Fault Categories</h2>
          <div className="fault-categories">
            {faultCategories.map(category => (
              <div key={category.name} className="fault-category-card">
                <div className="category-icon" style={{backgroundColor: category.color}}>
                  <i className={`fas ${category.name === 'Hardware' ? 'fa-microchip' : category.name === 'Software' ? 'fa-code' : 'fa-network-wired'}`}></i>
                </div>
                <div className="category-info">
                  <div className="category-name">{category.name}</div>
                  <div className="category-count">{category.count} issues</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="faults-section">
          <div className="section-header">
            <h2 className="section-title"><i className="fas fa-list"></i> Active Issues</h2>
            <div className="section-controls">
              <select 
                className="filter-select" 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Network</option>
              </select>
              <select 
                className="filter-select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Critical">Critical</option>
                <option value="Resolved">Resolved</option>
              </select>
              <input 
                type="text" 
                placeholder="Search faults..." 
                className="search-input" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <button className="btn btn-primary" onClick={handleReportIssue}>
                <i className="fas fa-plus"></i> Report Issue
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="faults-table">
              <thead>
                <tr>
                  <th>Fault ID</th>
                  <th>Device</th>
                  <th>Product ID</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Engineer</th>
                  <th>Assigned Date</th>
                  <th>Resolved Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaults.map(fault => (
                  <tr key={fault.id}>
                    <td><strong>{fault.id || 'N/A'}</strong></td>
                    <td><code className="device-id">{fault.deviceId || 'N/A'}</code></td>
                    <td><code className="device-id">{fault.productId || 'N/A'}</code></td>
                    <td>{fault.customerName || 'N/A'}</td>
                    <td>
                      <span className={`category-badge category-${fault.faultCategory?.toLowerCase() || 'unknown'}`}>
                        {fault.faultCategory || 'N/A'}
                      </span>
                    </td>
                    <td>{getPriorityBadge(fault.priority || 'Low')}</td>
                    <td>{fault.engineerAssigned || 'N/A'}</td>
                    <td>{fault.assignedDate || 'N/A'}</td>
                    <td>{fault.resolvedDate || 'N/A'}</td>
                    <td>{getStatusBadge(fault.status || 'Open')}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/faults/${fault.id}`} className="btn btn-primary btn-sm">
                          <i className="fas fa-eye"></i> View
                        </Link>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleDeleteFault(fault.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report New Issue</h3>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSubmitReport({
                deviceId: formData.get('deviceId'),
                productId: formData.get('productId'),
                customerName: formData.get('customerName'),
                category: formData.get('category'),
                priority: formData.get('priority'),
                engineer: formData.get('engineer')
              });
            }}>
              <div className="form-group">
                <label>Device ID *</label>
                <input type="text" name="deviceId" required placeholder="e.g., DEV001" />
              </div>
              <div className="form-group">
                <label>Product ID</label>
                <input type="text" name="productId" placeholder="e.g., PROD001" />
              </div>
              <div className="form-group">
                <label>Customer Name *</label>
                <input type="text" name="customerName" required placeholder="Customer name" />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select name="category" required>
                  <option value="">Select category</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Network">Network</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority *</label>
                <select name="priority" required>
                  <option value="">Select priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign Engineer *</label>
                <select name="engineer" required>
                  <option value="">Select engineer</option>
                  <option value="John Smith">John Smith</option>
                  <option value="Sarah Johnson">Sarah Johnson</option>
                  <option value="Mike Wilson">Mike Wilson</option>
                  <option value="Emily Davis">Emily Davis</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Report Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaultDevices;