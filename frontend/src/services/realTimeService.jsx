import apiService from './apiService';

class RealTimeService {
  constructor() {
    this.subscribers = {};
    this.pollingIntervals = {};
    this.pollingInterval = 30000; // Poll every 30 seconds
  }

  subscribe(dataType, callback) {
    if (!this.subscribers[dataType]) {
      this.subscribers[dataType] = [];
    }
    
    this.subscribers[dataType].push(callback);
    
    // Start polling if not already started
    if (!this.pollingIntervals[dataType]) {
      this.startPolling(dataType);
    }
    
    return () => this.unsubscribe(dataType, callback);
  }

  unsubscribe(dataType, callback) {
    if (this.subscribers[dataType]) {
      this.subscribers[dataType] = this.subscribers[dataType].filter(cb => cb !== callback);
      
      if (this.subscribers[dataType].length === 0) {
        this.stopPolling(dataType);
      }
    }
  }

  async startPolling(dataType) {
    const fetchData = async () => {
      try {
        let data;
        switch (dataType) {
          case 'customers':
            data = await apiService.get('/customers');
            break;
          case 'engineers':
            data = await apiService.get('/engineers');
            break;
          case 'devices':
            data = await apiService.get('/devices');
            break;
          case 'subscriptions':
            data = await apiService.get('/subscriptions');
            break;
          default:
            return;
        }
        
        if (this.subscribers[dataType]) {
          this.subscribers[dataType].forEach(callback => callback(data));
        }
      } catch (error) {
        console.error(`Error polling ${dataType}:`, error);
      }
    };

    await fetchData();
    
    this.pollingIntervals[dataType] = setInterval(fetchData, this.pollingInterval);
  }

  stopPolling(dataType) {
    if (this.pollingIntervals[dataType]) {
      clearInterval(this.pollingIntervals[dataType]);
      delete this.pollingIntervals[dataType];
    }
  }

  cleanup() {
    Object.keys(this.pollingIntervals).forEach(dataType => {
      this.stopPolling(dataType);
    });
    this.subscribers = {};
  }
}

export const realTimeService = new RealTimeService();
