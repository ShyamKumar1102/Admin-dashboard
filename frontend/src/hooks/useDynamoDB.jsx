import { useState, useEffect } from 'react';
import { dbService } from '../services/unifiedDatabaseService';

// Static data imports as fallback
import { devices as staticDevices } from '../data/devices';
import { subscriptions as staticSubscriptions } from '../data/subscriptions';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const staticCustomers = [
    {
      id: 'CUST001',
      name: 'TechCorp Industries',
      email: 'john.doe@techcorp.com',
      mobile: '+1-555-0123',
      country: 'United States',
      location: '123 Business Ave, Tech City, CA',
      totalStaff: 150,
      totalEngineers: 12,
      devices: 45,
      monthlySpend: 597
    }
  ];

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await dbService.getAllCustomers();
        setCustomers(data.length > 0 ? data : staticCustomers);
      } catch (err) {
        setError(err);
        setCustomers(staticCustomers);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const addCustomer = async (customer) => {
    try {
      await dbService.createCustomer(customer);
      setCustomers(prev => [...prev, customer]);
      return true;
    } catch (err) {
      setCustomers(prev => [...prev, customer]);
      return true;
    }
  };

  const updateCustomer = async (id, updates) => {
    try {
      await dbService.updateCustomer(id, updates);
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      return true;
    } catch (err) {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      return true;
    }
  };

  return { customers, loading, error, addCustomer, updateCustomer };
};

export const useDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await dbService.getAllDevices();
        setDevices(data.length > 0 ? data : staticDevices);
      } catch (err) {
        setError(err);
        setDevices(staticDevices);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const addDevice = async (device) => {
    try {
      await dbService.createDevice(device);
      setDevices(prev => [...prev, device]);
      return true;
    } catch (err) {
      setDevices(prev => [...prev, device]);
      return true;
    }
  };

  const updateDevice = async (id, updates) => {
    try {
      await dbService.updateDevice(id, updates);
      setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      return true;
    } catch (err) {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      return true;
    }
  };

  return { devices, loading, error, addDevice, updateDevice };
};

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const data = await dbService.getAllSubscriptions();
        setSubscriptions(data.length > 0 ? data : staticSubscriptions);
      } catch (err) {
        setError(err);
        setSubscriptions(staticSubscriptions);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const addSubscription = async (subscription) => {
    try {
      await dbService.createSubscription(subscription);
      setSubscriptions(prev => [...prev, subscription]);
      return true;
    } catch (err) {
      setSubscriptions(prev => [...prev, subscription]);
      return true;
    }
  };

  const updateSubscription = async (id, updates) => {
    try {
      await dbService.updateSubscription(id, updates);
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      return true;
    } catch (err) {
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      return true;
    }
  };

  return { subscriptions, loading, error, addSubscription, updateSubscription };
};