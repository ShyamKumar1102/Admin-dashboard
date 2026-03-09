import { dbService } from '../services/unifiedDatabaseService';

// Sample data for initialization
const sampleCustomers = [
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
  },
  {
    id: 'CUST002',
    name: 'Manufacturing Solutions Ltd',
    email: 'contact@mansol.com',
    mobile: '+1-555-0124',
    country: 'United States',
    location: '456 Industrial Blvd, Factory City, TX',
    totalStaff: 200,
    totalEngineers: 15,
    devices: 60,
    monthlySpend: 850
  }
];

const sampleEngineers = [
  { id: 'ENG001', name: 'John Smith', email: 'john@company.com', phone: '+1-555-0101', specialization: 'IoT Systems', devices: 5, status: 'assigned' },
  { id: 'ENG002', name: 'Sarah Johnson', email: 'sarah@company.com', phone: '+1-555-0102', specialization: 'Network Security', devices: 3, status: 'assigned' },
  { id: 'ENG003', name: 'Mike Wilson', email: 'mike@company.com', phone: '+1-555-0103', specialization: 'Hardware', devices: 0, status: 'available' },
  { id: 'ENG004', name: 'Emily Davis', email: 'emily@company.com', phone: '+1-555-0104', specialization: 'Software', devices: 4, status: 'assigned' },
  { id: 'ENG005', name: 'Tom Brown', email: 'tom@company.com', phone: '+1-555-0105', specialization: 'Maintenance', devices: 0, status: 'available' }
];

const sampleDevices = [
  {
    id: 'DEV001',
    productId: 'PROD001',
    deviceName: 'Smart Thermostat',
    macAddress: '00:1B:44:11:3A:B7',
    customerId: 'CUST001',
    category: 'Active',
    assignedEngineer: 'John Smith',
    status: 'Online',
    assignmentStatus: 'Assigned'
  },
  {
    id: 'DEV002',
    productId: 'PROD002',
    deviceName: 'Motion Sensor',
    macAddress: '00:1B:44:11:3A:B8',
    customerId: 'CUST001',
    category: 'Active',
    assignedEngineer: 'Sarah Johnson',
    status: 'Online',
    assignmentStatus: 'Assigned'
  },
  {
    id: 'DEV003',
    productId: 'PROD003',
    deviceName: 'Smart Lock',
    macAddress: '00:1B:44:11:3A:B9',
    customerId: 'CUST002',
    category: 'Fault',
    assignedEngineer: 'Mike Wilson',
    status: 'Fault',
    assignmentStatus: 'Assigned'
  }
];

const sampleSubscriptions = [
  {
    id: 'SUB001',
    customerId: 'CUST001',
    customerName: 'TechCorp Industries',
    deviceId: 'DEV001',
    deviceLocation: 'Building A - Floor 3',
    planName: 'Premium IoT Plan',
    planPrice: 199,
    startDate: '2024-01-01',
    expiryDate: '2024-12-31',
    status: 'Active',
    value: 199
  },
  {
    id: 'SUB002',
    customerId: 'CUST002',
    customerName: 'Manufacturing Solutions Ltd',
    deviceId: 'DEV003',
    deviceLocation: 'Factory Floor - Section B',
    planName: 'Enterprise IoT Plan',
    planPrice: 399,
    startDate: '2023-12-01',
    expiryDate: '2024-11-30',
    status: 'Active',
    value: 399
  }
];

const sampleFaults = [
  {
    id: 'FAULT001',
    deviceId: 'DEV003',
    productId: 'PROD003',
    customerName: 'Manufacturing Solutions Ltd',
    faultCategory: 'Hardware',
    priority: 'High',
    engineerAssigned: 'Mike Wilson',
    assignedDate: '2024-01-15',
    resolvedDate: null,
    status: 'Open'
  },
  {
    id: 'FAULT002',
    deviceId: 'DEV001',
    productId: 'PROD001',
    customerName: 'TechCorp Industries',
    faultCategory: 'Software',
    priority: 'Medium',
    engineerAssigned: 'John Smith',
    assignedDate: '2024-01-10',
    resolvedDate: '2024-01-12',
    status: 'Resolved'
  }
];

export const initializeDatabase = async () => {
  try {
    console.log('Initializing database with sample data...');
    
    // Initialize customers
    for (const customer of sampleCustomers) {
      await dbService.createCustomer(customer);
    }
    
    // Initialize engineers
    for (const engineer of sampleEngineers) {
      await dbService.createEngineer(engineer);
    }
    
    // Initialize devices
    for (const device of sampleDevices) {
      await dbService.createDevice(device);
    }
    
    // Initialize subscriptions
    for (const subscription of sampleSubscriptions) {
      await dbService.createSubscription(subscription);
    }
    
    // Initialize faults
    for (const fault of sampleFaults) {
      await dbService.createFault(fault);
    }
    
    console.log('Database initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

export const checkIfDataExists = async () => {
  try {
    console.log('Checking if data exists in database...');
    console.log('Table name:', process.env.REACT_APP_DYNAMODB_TABLE);
    console.log('Region:', process.env.REACT_APP_AWS_REGION);
    
    // Test database connection first
    const connectionTest = await dbService.testConnection();
    console.log('Connection test result:', connectionTest);
    
    const customers = await dbService.getAllCustomers();
    console.log('Found customers:', customers.length);
    return customers.length > 0;
  } catch (error) {
    console.error('Error checking data existence:', error);
    return false;
  }
};