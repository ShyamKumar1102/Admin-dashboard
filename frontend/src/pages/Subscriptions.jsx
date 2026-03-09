import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NewSubscriptionModal from '../components/modals/NewSubscriptionModal';
import ViewSubscriptionModal from '../components/modals/ViewSubscriptionModal';
import EditSubscriptionModal from '../components/modals/EditSubscriptionModal';
import { dbService } from '../services/unifiedDatabaseService';
import { realTimeService } from '../services/realTimeService';
import { servicePlans, getServicePlansForCountry, countryPricing } from '../data/subscriptions';
import './pages.css';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('subscriptions');
  
  // Debug state
  useEffect(() => {
    console.log('showEditModal:', showEditModal);
    console.log('selectedSubscription:', selectedSubscription);
  }, [showEditModal, selectedSubscription]);

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const unsubscribeSubscriptions = realTimeService.subscribe('subscriptions', (newSubscriptions) => {
      console.log('Real-time subscriptions update:', newSubscriptions.length);
      setSubscriptions(newSubscriptions);
    });
    
    const unsubscribeCustomers = realTimeService.subscribe('customers', (newCustomers) => {
      setCustomers(newCustomers);
    });
    
    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeSubscriptions();
      unsubscribeCustomers();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionsData, plansData, customersData] = await Promise.all([
        dbService.getAllSubscriptions(),
        fetch('http://localhost:5000/api/subscription-plans')
          .then(r => r.json())
          .then(data => data.data || data)
          .catch(() => []),
        dbService.getAllCustomers()
      ]);
      
      console.log('Subscriptions:', subscriptionsData);
      console.log('Plans response:', plansData);
      
      setSubscriptions(subscriptionsData);
      setSubscriptionPlans(Array.isArray(plansData) ? plansData : []);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(subscription => {
      // Exclude deleted subscriptions from all views except deleted category
      if (subscription.status === 'Deleted') return false;
      
      const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
      const matchesPlan = planFilter === 'all' || subscription.planName?.includes(planFilter);
      const matchesSearch = searchTerm === '' || 
        subscription.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.deviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesPlan && matchesSearch;
    });
  }, [subscriptions, statusFilter, planFilter, searchTerm]);

  const currentServicePlans = useMemo(() => {
    return getServicePlansForCountry(selectedCountry);
  }, [selectedCountry]);

  const subscriptionStats = useMemo(() => ({
    totalSubscriptions: subscriptions.filter(s => s.status !== 'Deleted').length,
    activePlans: subscriptions.filter(s => s.status === 'Active').length,
    expiredPlans: subscriptions.filter(s => s.status === 'Expired').length,
    monthlyRevenue: subscriptions
      .filter(s => s.status === 'Active')
      .reduce((sum, sub) => sum + (sub.value || 0), 0)
  }), [subscriptions]);

  const getActualStatus = (plan) => {
    if (plan.endDate) {
      const endDate = new Date(plan.endDate);
      const today = new Date();
      if (endDate < today) {
        return 'Inactive';
      }
    }
    return plan.status || 'Active';
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$', 'INR': '₹', 'GBP': '£', 'EUR': '€', 
      'JPY': '¥', 'AUD': 'A$', 'CAD': 'C$', 'CNY': '¥'
    };
    return symbols[currency] || currency || '$';
  };

  const getCountryFromCurrency = (currency) => {
    const currencyMap = {
      'USD': 'United States', 'INR': 'India', 'GBP': 'United Kingdom',
      'EUR': 'Germany', 'JPY': 'Japan', 'AUD': 'Australia',
      'CAD': 'Canada', 'CNY': 'China'
    };
    return currencyMap[currency] || 'N/A';
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase() || 'unknown';
    return <span className={`status-badge status-${statusClass}`}>{status || 'Unknown'}</span>;
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  const handleAddSubscription = async (newSubscription) => {
    try {
      console.log('Adding subscription:', newSubscription);
      const success = await dbService.createSubscription(newSubscription);
      if (success) {
        console.log('Subscription created successfully');
        await loadData();
        setShowAddModal(false);
        return true;
      } else {
        console.error('Failed to create subscription');
        return false;
      }
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  };

  const handleUpdateSubscription = async (updatedSubscription) => {
    try {
      console.log('Updating subscription:', updatedSubscription);
      const success = await dbService.updateSubscription(updatedSubscription.subscriptionId, updatedSubscription);
      if (success) {
        console.log('Subscription updated successfully');
        loadData();
        setShowEditModal(false);
        setSelectedSubscription(null);
      } else {
        console.error('Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        const success = await dbService.deleteSubscription(subscriptionId);
        if (success) {
          // Force refresh the data
          const freshSubscriptionsData = await dbService.getAllSubscriptions();
          setSubscriptions(freshSubscriptionsData);
          alert('Subscription deleted successfully');
        } else {
          alert('Failed to delete subscription');
        }
      } catch (error) {
        console.error('Error deleting subscription:', error);
        alert('Error: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="subscriptions-page">
        <header className="page-header">
          <h1><i className="fas fa-clipboard-list"></i> Subscription Management</h1>
          <p className="page-subtitle">Manage customer subscriptions and service plans</p>
        </header>
        <div className="content">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading subscriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleViewDetails = () => {
    // Removed unused function
  };

  const handleEditSubscription = (subscriptionId) => {
    const subscription = subscriptions.find(sub => sub.subscriptionId === subscriptionId);
    if (subscription) {
      setSelectedSubscription(subscription);
      setShowEditModal(true);
    }
  };

  const handleRenewSubscription = () => {
    // Removed unused function
  };

  const handleSelectPlan = (planName) => {
    alert(`Selected ${planName}. Redirecting to subscription creation...`);
    setShowAddModal(true);
  };

  const handleEditPlan = () => {
    // Removed unused function
  };

  const handleUpdatePlan = async (updatedPlan) => {
    try {
      const success = await dbService.updateSubscription(updatedPlan.subscriptionId, updatedPlan);
      if (success) {
        await loadData();
        setShowEditPlanModal(false);
        setSelectedPlan(null);
        alert('Plan updated successfully!');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Error updating plan: ' + error.message);
    }
  };

  return (
    <div className="subscriptions-page">
      <header className="page-header">
        <div>
          <h1><i className="fas fa-clipboard-list"></i> Subscription Management</h1>
          <p className="page-subtitle">Manage customer subscriptions and service plans</p>
        </div>
      </header>

      <div className="content">
        <section className="overview-section">
          <div className="overview-cards">
            <div className="overview-card total">
              <span className="overview-icon"><i className="fas fa-clipboard-list"></i></span>
              <div className="overview-content">
                <div className="overview-number">{subscriptionStats.totalSubscriptions}</div>
                <div className="overview-label">Total Subscriptions</div>
              </div>
            </div>
            <div className="overview-card active">
              <span className="overview-icon"><i className="fas fa-check-circle"></i></span>
              <div className="overview-content">
                <div className="overview-number highlight">{subscriptionStats.activePlans}</div>
                <div className="overview-label">Active Plans</div>
              </div>
            </div>
            <div className="overview-card expired">
              <span className="overview-icon"><i className="fas fa-times-circle"></i></span>
              <div className="overview-content">
                <div className="overview-number">{subscriptionStats.expiredPlans}</div>
                <div className="overview-label">Expired Plans</div>
              </div>
            </div>
            <div className="overview-card revenue">
              <span className="overview-icon"><i className="fas fa-dollar-sign"></i></span>
              <div className="overview-content">
                <div className="overview-number">{formatCurrency(subscriptionStats.monthlyRevenue)}</div>
                <div className="overview-label">Monthly Revenue</div>
              </div>
            </div>
          </div>
        </section>

        <section className="country-selection-section">
          <div className="section-header">
            <h2 className="section-title"><i className="fas fa-globe"></i> Country Pricing</h2>
            <div className="section-controls">
              <select 
                className="filter-select" 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                {Object.keys(countryPricing).map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="service-plans-section">
          <h2 className="section-title"><i className="fas fa-tags"></i> Service Plans</h2>
          <div className="service-plans-grid">
            {currentServicePlans.map(plan => (
              <div key={plan.name} className={`service-plan-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                <div className="plan-header" style={{backgroundColor: plan.color}}>
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="currency">{plan.symbol}</span>
                    <span className="amount">{plan.price.toLocaleString()}</span>
                    <span className="period">/month</span>
                  </div>
                </div>
                <div className="plan-features">
                  <ul>
                    {plan.features.map((feature, index) => (
                      <li key={index}>
                        <i className="fas fa-check"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="plan-actions">
                  <button className="btn btn-primary" onClick={() => handleSelectPlan(plan.name)}>Select Plan</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="categories-section">
          <h2 className="section-title"><i className="fas fa-folder"></i> View</h2>
          <div className="category-filters">
            <button 
              className={`category-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <i className="fas fa-clipboard-list"></i> Subscriptions ({subscriptions.length})
            </button>
            <button 
              className={`category-btn ${activeTab === 'plans' ? 'active' : ''}`}
              onClick={() => setActiveTab('plans')}
            >
              <i className="fas fa-tags"></i> Subscription Plans ({subscriptionPlans.length})
            </button>
          </div>
        </section>

        {activeTab === 'subscriptions' && (
        <section className="subscriptions-section">
          <div className="section-header">
            <h2 className="section-title"><i className="fas fa-list"></i> Subscription Directory</h2>
            <div className="section-controls">
              <select 
                className="filter-select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
              <select 
                className="filter-select" 
                value={planFilter} 
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="all">All Plans</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
              <input 
                type="text" 
                placeholder="Search subscriptions..." 
                className="search-input" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <i className="fas fa-plus"></i> New Subscription
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="subscriptions-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Country</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription, index) => (
                  <tr key={subscription.subscriptionId || `sub-${index}`}>
                    <td>
                      <span className={`plan-badge plan-${subscription.planName?.toLowerCase() || 'standard'}`}>
                        {subscription.planName || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="value-amount">
                        {subscription.country === 'India' ? '₹' : 
                         subscription.country === 'United Kingdom' ? '£' : 
                         subscription.country === 'Germany' ? '€' : 
                         subscription.country === 'Japan' ? '¥' : 
                         subscription.country === 'Australia' ? 'A$' : 
                         subscription.country === 'Canada' ? 'C$' : 
                         subscription.country === 'China' ? '¥' : '$'}
                        {subscription.price}
                      </span>
                    </td>
                    <td>{subscription.country || 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleEditSubscription(subscription.subscriptionId)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleDeleteSubscription(subscription.subscriptionId)}
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
        )}

        {activeTab === 'plans' && (
        <section className="subscriptions-section">
          <div className="section-header">
            <h2 className="section-title"><i className="fas fa-tags"></i> Subscription Plans</h2>
          </div>

          <div className="table-container">
            <table className="subscriptions-table">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Customer ID</th>
                  <th>Plan Name</th>
                  <th>Price Paid</th>
                  <th>Currency</th>
                  <th>Country</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptionPlans.map((plan, index) => (
                  <tr key={plan.planId || index}>
                    <td>{plan.deviceId || 'N/A'}</td>
                    <td>{plan.customerId || 'N/A'}</td>
                    <td>
                      <span className={`plan-badge plan-${(plan.planName || plan.name)?.toLowerCase() || 'standard'}`}>
                        {plan.planName || plan.name || 'N/A'}
                      </span>
                    </td>
                    <td>{plan.pricePaid || plan.price || 0}</td>
                    <td>{getCurrencySymbol(plan.currency)} {plan.currency || 'USD'}</td>
                    <td>{plan.country || getCountryFromCurrency(plan.currency)}</td>
                    <td>{plan.startDate || 'N/A'}</td>
                    <td>{plan.endDate || 'N/A'}</td>
                    <td>{getStatusBadge(getActualStatus(plan))}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/subscriptions/${plan.deviceId}`} className="btn btn-primary btn-sm">
                          <i className="fas fa-eye"></i> View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}
      </div>
      
      <NewSubscriptionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddSubscription={handleAddSubscription}
      />
      
      {showEditModal && selectedSubscription ? (
        <EditSubscriptionModal
          subscription={selectedSubscription}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSubscription(null);
          }}
          onUpdateSubscription={handleUpdateSubscription}
        />
      ) : null}
      
      {showViewModal && (
        <ViewSubscriptionModal
          subscription={selectedSubscription}
          onClose={() => {
            setShowViewModal(false);
            setSelectedSubscription(null);
          }}
        />
      )}
      
      {showEditPlanModal && selectedPlan && (
        <EditSubscriptionModal
          subscription={selectedPlan}
          onClose={() => {
            setShowEditPlanModal(false);
            setSelectedPlan(null);
          }}
          onUpdateSubscription={handleUpdatePlan}
        />
      )}
    </div>
  );
};

export default Subscriptions;