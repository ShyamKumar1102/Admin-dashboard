import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AddEngineerModal from '../components/modals/AddEngineerModal';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../hooks/useToast';
import { dbService } from '../services/unifiedDatabaseService';
import './pages.css';

const Engineers = () => {
  const [engineers, setEngineers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [engineersData, devicesData] = await Promise.all([
        dbService.getAllEngineers(),
        dbService.getAllDevices()
      ]);
      
      // Count assigned devices for each engineer
      const engineersWithDevices = (engineersData || []).map(eng => {
        const assignedDevices = (devicesData || []).filter(d => 
          d.status !== 'Deleted' && (
            d.engineerId === eng.id || 
            d.engineerId === eng.username || 
            d.assignedEngineer === eng.name ||
            d.assignedEngineer === eng.username
          )
        ).length;
        
        return {
          ...eng,
          devices: assignedDevices,
          status: eng.status === 'Deleted' ? 'Deleted' : (assignedDevices > 0 ? 'assigned' : 'available')
        };
      });
      
      setEngineers(engineersWithDevices);
    } catch (error) {
      console.error('Error loading engineers:', error);
      showToast('Error loading engineers: ' + error.message, 'error');
    }
  };

  const stats = useMemo(() => ({
    total: engineers.filter(e => e.status !== 'Deleted').length,
    assigned: engineers.filter(e => e.status === 'assigned' && e.status !== 'Deleted').length,
    available: engineers.filter(e => e.status === 'available' && e.status !== 'Deleted').length
  }), [engineers]);

  const filtered = useMemo(() => {
    return engineers.filter(e => {
      const matchFilter = filter === 'all' ? e.status !== 'Deleted' : 
        (filter === 'assigned' && e.status === 'assigned') || 
        (filter === 'available' && e.status === 'available') ||
        (filter === 'deleted' && e.status === 'Deleted');
      const matchSearch = search === '' || e.name?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [engineers, filter, search]);

  const handleAddEngineer = async (newEngineer) => {
    try {
      const success = await dbService.createEngineer(newEngineer);
      if (success) {
        await loadData();
        setShowAddModal(false);
        showToast('Engineer added successfully', 'success');
      }
    } catch (error) {
      console.error('Error adding engineer:', error);
      showToast('Failed to add engineer: ' + error.message, 'error');
    }
  };

  const handleDeleteEngineer = async (engineerId) => {
    setConfirmDelete(engineerId);
  };

  const confirmDeleteEngineer = async () => {
    const engineerId = confirmDelete;
    setConfirmDelete(null);
    
    try {
      const success = await dbService.deleteEngineer(engineerId);
      if (success) {
        const freshEngineersData = await dbService.getAllEngineers();
        setEngineers(freshEngineersData);
        showToast('Engineer deleted successfully', 'success');
      } else {
        showToast('Failed to delete engineer', 'error');
      }
    } catch (error) {
      console.error('Error deleting engineer:', error);
      showToast('Error: ' + error.message, 'error');
    }
  };

  const handleViewEngineer = (engineerId) => {
    // Navigation handled by Link component
  };

  return (
    <div className="engineers-page">
      <header className="page-header">
        <div>
          <h1><i className="fas fa-user-tie"></i> Engineering Team</h1>
          <p className="page-subtitle">Manage your technical workforce and assignments</p>
        </div>
      </header>
      <div className="content">
        <section className="overview-section">
          <div className="overview-cards">
            <div className="overview-card total">
              <span className="overview-icon"><i className="fas fa-users"></i></span>
              <div className="overview-content">
                <div className="overview-number">{stats.total}</div>
                <div className="overview-label">Total Engineers</div>
              </div>
            </div>
            <div className="overview-card assigned">
              <span className="overview-icon"><i className="fas fa-bolt"></i></span>
              <div className="overview-content">
                <div className="overview-number">{stats.assigned}</div>
                <div className="overview-label">Currently Assigned</div>
              </div>
            </div>
            <div className="overview-card available">
              <span className="overview-icon"><i className="fas fa-user-check"></i></span>
              <div className="overview-content">
                <div className="overview-number">{stats.available}</div>
                <div className="overview-label">Available for Tasks</div>
              </div>
            </div>
          </div>
        </section>
        <section className="categories-section">
          <h2 className="section-title"><i className="fas fa-tags"></i> Engineer Filters</h2>
          <div className="category-filters">
            {['all', 'Assigned', 'Available', 'Deleted'].map(cat => {
              const count = cat === 'all' ? engineers.filter(e => e.status !== 'Deleted').length :
                cat === 'Assigned' ? engineers.filter(e => e.status === 'assigned').length :
                cat === 'Available' ? engineers.filter(e => e.status === 'available').length :
                engineers.filter(e => e.status === 'Deleted').length;
              
              return (
                <button 
                  key={cat} 
                  className={`category-btn ${filter === cat.toLowerCase() ? 'active' : ''}`} 
                  onClick={() => setFilter(cat.toLowerCase())}
                >
                  <i className={`fas ${cat === 'all' ? 'fa-users' : cat === 'Assigned' ? 'fa-user-check' : cat === 'Available' ? 'fa-user-clock' : 'fa-trash'}`}></i>{' '}
                  {cat === 'all' ? 'All Engineers' : cat} ({count})
                </button>
              );
            })}
          </div>
        </section>

        <section className="engineers-section">
          <div className="section-header">
            <h2 className="section-title"><i className="fas fa-tools"></i> Team Members</h2>
            <div className="section-controls">
              <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Engineers</option>
                <option value="assigned">Assigned</option>
                <option value="available">Available</option>
                <option value="deleted">Deleted</option>
              </select>
              <input type="text" placeholder="Search engineers..." className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><i className="fas fa-plus"></i> Add Engineer</button>
            </div>
          </div>
          <div className="table-container">
            <table className="engineers-table">
              <thead>
                <tr>
                  <th>Engineer ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Assigned Devices</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, index) => (
                  <tr key={e.id || `eng-${index}`}>
                    <td><strong>{e.id || 'N/A'}</strong></td>
                    <td><strong>{e.name || 'N/A'}</strong></td>
                    <td>{e.email || 'N/A'}</td>
                    <td>{e.phone || 'N/A'}</td>
                    <td><span className="device-count">{e.devices || 0}</span></td>
                    <td><span className={`status-badge status-${e.status || 'available'}`}>{e.status === 'assigned' ? 'Assigned' : e.status === 'Deleted' ? 'Deleted' : 'Available'}</span></td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/engineers/${e.id}`} className="btn btn-primary btn-sm">
                          <i className="fas fa-eye"></i> View
                        </Link>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleDeleteEngineer(e.id)}
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
      
      <AddEngineerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddEngineer={handleAddEngineer}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {confirmDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this engineer? This action cannot be undone."
          onConfirm={confirmDeleteEngineer}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default Engineers;
