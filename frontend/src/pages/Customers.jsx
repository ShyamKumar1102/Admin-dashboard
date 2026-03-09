import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AddCustomerModal from '../components/modals/AddCustomerModal';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../hooks/useToast';
import { dbService } from '../services/unifiedDatabaseService';
import { formatPrice } from '../data/subscriptions';
import './pages.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersData, devicesData, engineersData] = await Promise.all([
        dbService.getAllCustomers(),
        dbService.getAllDevices(),
        dbService.getAllEngineers()
      ]);
      setCustomers(customersData || []);
      setDevices(devicesData || []);
      setEngineers(engineersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data: ' + error.message, 'error');
    }
  };

  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(customers.map(c => c.country))];
    return uniqueCountries.sort();
  }, [customers]);

  const locations = useMemo(() => {
    if (countryFilter === 'all') return [];
    const countryCustomers = customers.filter(c => c.country === countryFilter);
    const uniqueLocations = [...new Set(countryCustomers.map(c => {
      if (typeof c.location === 'string') return c.location.split(',')[0];
      if (c.location && c.location.city) return c.location.city;
      return 'Unknown';
    }))];
    return uniqueLocations.sort();
  }, [customers, countryFilter]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Exclude deleted customers from 'all' category
      if (categoryFilter === 'all' && customer.status === 'Deleted') return false;
      if (categoryFilter === 'deleted' && customer.status !== 'Deleted') return false;
      
      const matchesSearch = searchTerm === '' || 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = countryFilter === 'all' || customer.country === countryFilter;
      
      const customerLocation = typeof customer.location === 'string' ? customer.location : 
        (customer.location && customer.location.city) ? customer.location.city : '';
      const matchesLocation = locationFilter === 'all' || customerLocation?.includes(locationFilter);
      
      const customerDeviceCount = devices.filter(d => 
        d.customerId === customer.id || d.customerId === customer.customerId || d.customerId === customer.username
      ).length;
      
      const matchesCategory = categoryFilter === 'all' ||
        (categoryFilter === 'active' && customerDeviceCount > 0) ||
        (categoryFilter === 'inactive' && customerDeviceCount === 0) ||
        (categoryFilter === 'deleted' && customer.status === 'Deleted');
      
      return matchesSearch && matchesCountry && matchesLocation && matchesCategory;
    });
  }, [customers, searchTerm, countryFilter, locationFilter, categoryFilter, devices]);

  const stats = useMemo(() => ({
    activeCustomers: customers.length,
    managedDevices: devices.length,
    activeSubscriptions: customers.filter(c => devices.some(d => d.customerId === c.id || d.customerId === c.customerId || d.customerId === c.username)).length
  }), [customers, devices]);

  const handleAddCustomer = async (newCustomer) => {
    try {
      const success = await dbService.createCustomer(newCustomer);
      if (success) {
        await loadData();
        setShowAddModal(false);
        showToast('Customer added successfully', 'success');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      showToast('Failed to add customer: ' + error.message, 'error');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    setConfirmDelete(customerId);
  };

  const confirmDeleteCustomer = async () => {
    const customerId = confirmDelete;
    setConfirmDelete(null);
    
    try {
      const success = await dbService.deleteCustomer(customerId);
      if (success) {
        const freshCustomersData = await dbService.getAllCustomers();
        setCustomers(freshCustomersData);
        showToast('Customer deleted successfully', 'success');
      } else {
        showToast('Failed to delete customer', 'error');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToast('Error: ' + error.message, 'error');
    }
  };

  return (
    <div className="customers-page">
      <header className="page-header">
        <div>
          <h1><i className="fas fa-users"></i> Customer Management</h1>
          <p className="page-subtitle">Manage your customer base and their IoT deployments</p>
        </div>
      </header>

      <div className="content">
        <section className="overview-section">
          <div className="overview-cards">
            <div className="overview-card total">
              <span className="overview-icon"><i className="fas fa-users"></i></span>
              <div className="overview-content">
                <div className="overview-number">{stats.activeCustomers}</div>
                <div className="overview-label">Active Customers</div>
              </div>
            </div>
            <div className="overview-card devices">
              <span className="overview-icon"><i className="fas fa-microchip"></i></span>
              <div className="overview-content">
                <div className="overview-number">{stats.managedDevices}</div>
                <div className="overview-label">Managed Devices</div>
              </div>
            </div>
            <div className="overview-card subscriptions">
              <span className="overview-icon"><i className="fas fa-clipboard-check"></i></span>
              <div className="overview-content">
                <div className="overview-number">{stats.activeSubscriptions}</div>
                <div className="overview-label">Active Subscriptions</div>
              </div>
            </div>
          </div>
        </section>

        <section className="country-pricing-section">
          <div className="section-header">
            <h2 className="section-title"><i className="fas fa-globe"></i> View Pricing By Country</h2>
            <div className="section-controls">
              <select 
                className="filter-select" 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option key="United States" value="United States">United States</option>
                <option key="India" value="India">India</option>
                <option key="United Kingdom" value="United Kingdom">United Kingdom</option>
                <option key="Germany" value="Germany">Germany</option>
                <option key="Japan" value="Japan">Japan</option>
                <option key="Australia" value="Australia">Australia</option>
                <option key="Canada" value="Canada">Canada</option>
                <option key="China" value="China">China</option>
              </select>
              <button className="btn btn-secondary" onClick={() => {
                showToast(`Viewing pricing for ${selectedCountry}. Currency rates applied.`, 'info');
              }}>
                <i className="fas fa-eye"></i> View Pricing
              </button>
            </div>
          </div>
          <div className="pricing-info">
            <p className="pricing-note">
              <i className="fas fa-info-circle"></i>
              Pricing displayed for <strong>{selectedCountry}</strong>. 
              Monthly spend values are automatically converted to local currency.
            </p>
          </div>
        </section>

        <section className="categories-section">
          <h2 className="section-title"><i className="fas fa-tags"></i> Customer Filters</h2>
          <div className="category-filters">
            {['all', 'Active', 'Inactive', 'Deleted'].map(cat => {
              const count = cat === 'all' ? customers.filter(c => c.status !== 'Deleted').length :
                cat === 'Active' ? customers.filter(c => c.status !== 'Deleted' && devices.some(d => d.customerId === c.id || d.customerId === c.customerId || d.customerId === c.username)).length :
                cat === 'Inactive' ? customers.filter(c => c.status !== 'Deleted' && !devices.some(d => d.customerId === c.id || d.customerId === c.customerId || d.customerId === c.username)).length :
                customers.filter(c => c.status === 'Deleted').length;
              
              return (
                <button 
                  key={cat} 
                  className={`category-btn ${categoryFilter === cat.toLowerCase() ? 'active' : ''}`} 
                  onClick={() => setCategoryFilter(cat.toLowerCase())}
                >
                  <i className={`fas ${cat === 'all' ? 'fa-users' : cat === 'Active' ? 'fa-user-check' : cat === 'Inactive' ? 'fa-user-times' : 'fa-trash'}`}></i>{' '}
                  {cat === 'all' ? 'All Customers' : cat} ({count})
                </button>
              );
            })}
          </div>
        </section>

        <section className="customers-section">
          <div className="section-header">
            <h2 className="section-title"><i className="fas fa-building"></i> Customer Directory</h2>
            <div className="section-controls">
              <select 
                className="filter-select" 
                value={countryFilter} 
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setLocationFilter('all');
                }}
              >
                <option value="all">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <select 
                className="filter-select" 
                value={locationFilter} 
                onChange={(e) => setLocationFilter(e.target.value)}
                disabled={countryFilter === 'all'}
              >
                <option value="all">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="search-input" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <i className="fas fa-plus"></i> Add Customer
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Country</th>
                  <th>Location</th>
                  <th>Staff Count</th>
                  <th>Engineer Count</th>
                  <th>Devices</th>
                  <th>Monthly Spend</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => {
                  const customerDeviceCount = devices.filter(d => 
                    d.customerId === customer.id || 
                    d.customerId === customer.customerId || 
                    d.customerId === customer.username
                  ).length;
                  
                  const displayLocation = typeof customer.location === 'string' ? customer.location :
                    customer.location ? `${customer.location.city || ''}, ${customer.location.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') : 'N/A';
                  
                  return (
                    <tr key={customer.id}>
                      <td><strong>{customer.id || 'N/A'}</strong></td>
                      <td><strong>{customer.name || 'N/A'}</strong></td>
                      <td>{customer.email || 'N/A'}</td>
                      <td>{customer.mobile || 'N/A'}</td>
                      <td>{customer.country || 'N/A'}</td>
                      <td>{displayLocation}</td>
                      <td>{customer.totalStaff || 0}</td>
                      <td>{customer.totalEngineers || 0}</td>
                      <td>{customerDeviceCount}</td>
                      <td>
                        <span className="value-amount">{formatPrice(customer.monthlySpend, selectedCountry)}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/customers/${customer.id}`} className="btn btn-primary btn-sm">
                            <i className="fas fa-eye"></i> View
                          </Link>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      
      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddCustomer={handleAddCustomer}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {confirmDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this customer? This action cannot be undone."
          onConfirm={confirmDeleteCustomer}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default Customers;