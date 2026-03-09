const demoData = {
  customers: [
    { 
      id: 'CUST001', 
      name: 'TechCorp Industries', 
      email: 'john.doe@techcorp.com', 
      phone: '+1-555-0123',
      mobile: '+1-555-0123',
      address: '123 Business Ave, Tech City, CA',
      location: '123 Business Ave, Tech City, CA',
      country: 'United States',
      totalStaff: 150,
      totalEngineers: 12,
      devices: 45,
      monthlySpend: 597,
      createdAt: '2024-01-01T00:00:00Z' 
    },
    { 
      id: 'CUST002', 
      name: 'Manufacturing Solutions Ltd', 
      email: 'contact@mansol.com', 
      phone: '+1-555-0124',
      mobile: '+1-555-0124',
      address: '456 Industrial Blvd, Factory City, TX',
      location: '456 Industrial Blvd, Factory City, TX',
      country: 'United States',
      totalStaff: 200,
      totalEngineers: 15,
      devices: 60,
      monthlySpend: 850,
      createdAt: '2024-01-02T00:00:00Z' 
    }
  ],
  engineers: [
    { 
      id: 'ENG001', 
      name: 'John Smith', 
      email: 'john@seniot.com', 
      phone: '+1-555-0101', 
      specialization: 'IoT Systems',
      devices: 5,
      status: 'assigned',
      createdAt: '2024-01-01T00:00:00Z' 
    },
    { 
      id: 'ENG002', 
      name: 'Sarah Johnson', 
      email: 'sarah@seniot.com', 
      phone: '+1-555-0102', 
      specialization: 'Network Security',
      devices: 3,
      status: 'assigned',
      createdAt: '2024-01-02T00:00:00Z' 
    },
    { 
      id: 'ENG003', 
      name: 'Mike Wilson', 
      email: 'mike@seniot.com', 
      phone: '+1-555-0103', 
      specialization: 'Hardware',
      devices: 0,
      status: 'available',
      createdAt: '2024-01-03T00:00:00Z' 
    }
  ],
  devices: [
    { 
      id: 'DEV001', 
      deviceName: 'Smart Thermostat',
      productId: 'PROD001',
      macAddress: '00:1B:44:11:3A:B7',
      status: 'Online',
      category: 'Indoor Unit',
      customerId: 'CUST001',
      engineerId: 'ENG001',
      assignedEngineer: 'John Smith',
      assignmentStatus: 'Assigned',
      createdAt: '2024-01-01T00:00:00Z' 
    },
    { 
      id: 'DEV002', 
      deviceName: 'Motion Sensor',
      productId: 'PROD002',
      macAddress: '00:1B:44:11:3A:B8',
      status: 'Online',
      category: 'Soft Starter',
      customerId: 'CUST001',
      engineerId: 'ENG002',
      assignedEngineer: 'Sarah Johnson',
      assignmentStatus: 'Assigned',
      createdAt: '2024-01-02T00:00:00Z' 
    },
    { 
      id: 'DEV003', 
      deviceName: 'Smart Lock',
      productId: 'PROD003',
      macAddress: '00:1B:44:11:3A:B9',
      status: 'Fault',
      category: 'VFD',
      customerId: 'CUST002',
      engineerId: 'ENG003',
      assignedEngineer: 'Mike Wilson',
      assignmentStatus: 'Assigned',
      createdAt: '2024-01-03T00:00:00Z' 
    },
    { 
      id: 'DEV004', 
      deviceName: 'Temperature Sensor',
      productId: 'PROD004',
      macAddress: '00:1B:44:11:3A:BA',
      status: 'Offline',
      category: 'Indoor Unit',
      customerId: 'CUST002',
      engineerId: '',
      assignedEngineer: 'Not Assigned',
      assignmentStatus: 'Unassigned',
      createdAt: '2024-01-04T00:00:00Z' 
    },
    { 
      id: 'DEV005', 
      deviceName: 'Power Monitor',
      productId: 'PROD005',
      macAddress: '00:1B:44:11:3A:BB',
      status: 'Online',
      category: 'Soft Starter',
      customerId: 'CUST001',
      engineerId: 'ENG001',
      assignedEngineer: 'John Smith',
      assignmentStatus: 'Assigned',
      createdAt: '2024-01-05T00:00:00Z' 
    }
  ],
  deviceData: [
    { deviceId: 'DEV001', temperature: 25.5, humidity: 60, timestamp: '2024-01-01T12:00:00Z' },
    { deviceId: 'DEV002', temperature: 22.3, humidity: 55, timestamp: '2024-01-02T12:00:00Z' }
  ],
  subscriptions: [
    { 
      subscriptionId: 'SUB001',
      customerId: 'CUST001',
      customerName: 'TechCorp Industries',
      deviceId: 'DEV001',
      deviceLocation: 'Building A - Floor 3',
      planName: 'Premium IoT Plan', 
      price: 199,
      country: 'United States',
      startDate: '2024-01-01',
      expiryDate: '2024-12-31',
      status: 'Active',
      createdAt: '2024-01-01T00:00:00Z' 
    },
    { 
      subscriptionId: 'SUB002',
      customerId: 'CUST002',
      customerName: 'Manufacturing Solutions Ltd',
      deviceId: 'DEV003',
      deviceLocation: 'Factory Floor - Section B',
      planName: 'Enterprise IoT Plan', 
      price: 399,
      country: 'United States',
      startDate: '2023-12-01',
      expiryDate: '2024-11-30',
      status: 'Active',
      createdAt: '2024-01-01T00:00:00Z' 
    },
    { 
      subscriptionId: 'SUB003',
      customerId: 'CUST001',
      customerName: 'TechCorp Industries',
      deviceId: 'DEV005',
      deviceLocation: 'Building B - Floor 1',
      planName: 'Standard IoT Plan', 
      price: 99,
      country: 'United States',
      startDate: '2024-01-05',
      expiryDate: '2024-12-31',
      status: 'Active',
      createdAt: '2024-01-05T00:00:00Z' 
    }
  ],
  subscriptionPlans: [
    {
      planId: 'PLAN001',
      deviceId: 'DEV001',
      customerId: 'CUST001',
      planName: 'Standard',
      pricePaid: 99,
      currency: 'USD',
      country: 'United States',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'Active',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      planId: 'PLAN002',
      deviceId: 'DEV002',
      customerId: 'CUST001',
      planName: 'Premium',
      pricePaid: 199,
      currency: 'USD',
      country: 'United States',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'Active',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      planId: 'PLAN003',
      deviceId: 'DEV003',
      customerId: 'CUST002',
      planName: 'Enterprise',
      pricePaid: 399,
      currency: 'USD',
      country: 'United States',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'Active',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ],
  staff: [
    { id: 'STAFF001', name: 'Admin User', email: 'admin@seniot.com', role: 'Administrator', createdAt: '2024-01-01T00:00:00Z' }
  ],
  invoices: [
    {
      invoiceId: 'inv-001',
      invoiceNumber: 'INV-001',
      paymentId: 'PAY-1234567890',
      customerEmail: 'john@techcorp.com',
      customerName: 'TechCorp Industries',
      deviceId: 'DEV001',
      deviceName: 'Smart Thermostat',
      engineerId: 'ENG001',
      engineerName: 'John Smith',
      netAmount: 800,
      vatRate: 0,
      vatAmount: 0,
      amount: 800,
      totalAmount: 800,
      status: 'Paid',
      emailStatus: 'Sent',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      invoiceId: 'inv-002',
      invoiceNumber: 'INV-002',
      paymentId: 'PAY-1234567891',
      customerEmail: 'contact@mansol.com',
      customerName: 'Manufacturing Solutions Ltd',
      deviceId: 'DEV003',
      deviceName: 'Smart Lock',
      engineerId: 'ENG003',
      engineerName: 'Mike Wilson',
      netAmount: 500,
      vatRate: 0,
      vatAmount: 0,
      amount: 500,
      totalAmount: 500,
      status: 'Paid',
      emailStatus: 'Sent',
      createdAt: '2024-01-20T14:30:00Z'
    }
  ],
  payments: [
    {
      paymentId: 'PAY-1234567890',
      customerEmail: 'john@techcorp.com',
      customerName: 'TechCorp Industries',
      items: [
        { description: 'Device Installation', quantity: 1, price: 500 },
        { description: 'Configuration Service', quantity: 2, price: 150 }
      ],
      netAmount: 800,
      vatRate: 0,
      vatAmount: 0,
      totalAmount: 800,
      status: 'Completed',
      paymentMethod: 'Card',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      paymentId: 'PAY-1234567891',
      customerEmail: 'contact@mansol.com',
      customerName: 'Manufacturing Solutions Ltd',
      items: [
        { description: 'Repair Service', quantity: 1, price: 300 },
        { description: 'Parts Replacement', quantity: 1, price: 200 }
      ],
      netAmount: 500,
      vatRate: 0,
      vatAmount: 0,
      totalAmount: 500,
      status: 'Completed',
      paymentMethod: 'Card',
      createdAt: '2024-01-20T14:30:00Z'
    }
  ],
  removedDevices: []
};

module.exports = demoData;
