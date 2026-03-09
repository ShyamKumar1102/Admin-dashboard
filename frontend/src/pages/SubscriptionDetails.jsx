import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import './pages.css';

const SubscriptionDetails = () => {
  const { id } = useParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, [id]);

  const loadSubscription = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/subscription-plans`);
      const data = await response.json();
      const plans = Array.isArray(data) ? data : (data.data || []);
      
      const found = plans.find(p => p.deviceId === id || p.planId === id);
      setSubscription(found);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Subscription Details" />
        <div className="page-container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading subscription details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!subscription) {
    return (
      <>
        <Header title="Subscription Details" />
        <div className="page-container">
          <div className="customer-details">
            <h2>Subscription Not Found</h2>
            <p>The requested subscription could not be found.</p>
            <Link to="/subscriptions" className="btn btn-primary">
              Back to Subscriptions
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`Subscription Details - ${subscription.deviceId}`} />
      <div className="page-container">
        <div className="customer-details">
          <h2>Subscription Information</h2>
          <div className="customer-info">
            <div>
              <div className="info-item">
                <div className="info-label">Device ID</div>
                <div className="info-value"><code>{subscription.deviceId || 'N/A'}</code></div>
              </div>
              <div className="info-item">
                <div className="info-label">Customer ID</div>
                <div className="info-value">{subscription.customerId || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Plan Name</div>
                <div className="info-value">{subscription.planName || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Status</div>
                <div className="info-value">
                  <span className={`status-badge status-${subscription.status?.toLowerCase() || 'unknown'}`}>
                    {subscription.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="info-item">
                <div className="info-label">Price Paid</div>
                <div className="info-value">{subscription.pricePaid || 0}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Currency</div>
                <div className="info-value">{subscription.currency || 'USD'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Start Date</div>
                <div className="info-value">{subscription.startDate || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">End Date</div>
                <div className="info-value">{subscription.endDate || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div className="action-buttons">
            <Link to="/subscriptions" className="btn btn-secondary">
              Back to Subscriptions
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionDetails;
