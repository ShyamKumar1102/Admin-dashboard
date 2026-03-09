import apiService from './apiService';

class UnifiedDatabaseService {
  constructor() {
    this.isConnected = false;
    console.log('Database service initialized - using backend API');
  }

  async testConnection() {
    try {
      await apiService.get('/customers');
      this.isConnected = true;
      console.log('Backend API connection successful');
      return { success: true, mode: 'api' };
    } catch (error) {
      console.error('Backend API connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllCustomers() {
    try {
      console.log('Fetching customers from API...');
      const data = await apiService.get('/customers');
      console.log('Customers received:', data);
      return data;
    } catch (error) {
      console.error('Error getting customers:', error);
      return [];
    }
  }

  async getAllDevices() {
    try {
      return await apiService.get('/devices');
    } catch (error) {
      console.error('Error getting devices:', error);
      return [];
    }
  }

  async getAllEngineers() {
    try {
      return await apiService.get('/engineers');
    } catch (error) {
      console.error('Error getting engineers:', error);
      return [];
    }
  }

  async getAllSubscriptions() {
    try {
      return await apiService.get('/subscriptions');
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  }

  async getAllFaults() {
    try {
      const devices = await apiService.get('/devices');
      return devices.filter(d => d.status === 'Fault');
    } catch (error) {
      console.error('Error getting faults:', error);
      return [];
    }
  }

  async createCustomer(customer) {
    try {
      await apiService.post('/customers', customer);
      return true;
    } catch (error) {
      console.error('Error creating customer:', error);
      return false;
    }
  }

  async createEngineer(engineer) {
    try {
      await apiService.post('/engineers', engineer);
      return true;
    } catch (error) {
      console.error('Error creating engineer:', error);
      return false;
    }
  }

  async createDevice(device) {
    try {
      await apiService.post('/devices', device);
      return true;
    } catch (error) {
      console.error('Error creating device:', error);
      return false;
    }
  }

  async createSubscription(subscription) {
    try {
      await apiService.post('/subscriptions', subscription);
      return true;
    } catch (error) {
      console.error('Error creating subscription:', error);
      return false;
    }
  }

  async updateCustomer(id, customer) {
    try {
      await apiService.put(`/customers/${id}`, customer);
      return true;
    } catch (error) {
      console.error('Error updating customer:', error);
      return false;
    }
  }

  async updateEngineer(id, engineer) {
    try {
      await apiService.put(`/engineers/${id}`, engineer);
      return true;
    } catch (error) {
      console.error('Error updating engineer:', error);
      return false;
    }
  }

  async updateDevice(id, device) {
    try {
      await apiService.put(`/devices/${id}`, device);
      return true;
    } catch (error) {
      console.error('Error updating device:', error);
      return false;
    }
  }

  async updateFault(id, fault) {
    try {
      await apiService.put(`/devices/${id}`, fault);
      return true;
    } catch (error) {
      console.error('Error updating fault:', error);
      return false;
    }
  }

  async updateSubscription(subscriptionId, subscription) {
    try {
      await apiService.put(`/subscriptions/${subscriptionId}`, subscription);
      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  }

  async deleteCustomer(id) {
    try {
      await apiService.delete(`/customers/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
  }

  async deleteEngineer(id) {
    try {
      await apiService.delete(`/engineers/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting engineer:', error);
      return false;
    }
  }

  async deleteDevice(id) {
    try {
      await apiService.delete(`/devices/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting device:', error);
      return false;
    }
  }

  async deleteSubscription(subscriptionId) {
    try {
      await apiService.delete(`/subscriptions/${subscriptionId}`);
      return true;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      return false;
    }
  }
  async createFault(fault) {
    try {
      await apiService.post('/devices', { ...fault, status: 'Fault' });
      return true;
    } catch (error) {
      console.error('Error creating fault:', error);
      return false;
    }
  }

  async deleteFault(id) {
    try {
      await apiService.delete(`/devices/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting fault:', error);
      return false;
    }
  }
}

export const dbService = new UnifiedDatabaseService();