export const devices = [
  {
    id: 'DEV001',
    productId: 'PRD-IU-001',
    deviceName: 'AC Control Unit - Main Hall',
    macAddress: '00:1B:44:11:3A:B7',
    customerId: 'CUST001',
    category: 'Indoor Unit',
    subscriptionStartDate: '2023-01-15',
    subscriptionEndDate: '2024-01-15',
    resolvedEngineer: 'John Smith',
    faultType: null,
    status: 'Online',
    assignmentStatus: 'Assigned',
    assignedEngineer: 'John Smith',
    installedDate: '2023-01-15',
    lastActiveDate: '2024-01-20'
  },
  {
    id: 'DEV002',
    productId: 'PRD-SS-002',
    deviceName: 'Motor Starter - Production Line A',
    macAddress: '00:1B:44:11:3A:B8',
    customerId: 'CUST001',
    category: 'Soft Starter',
    subscriptionStartDate: '2023-02-01',
    subscriptionEndDate: '2024-02-01',
    resolvedEngineer: 'Sarah Johnson',
    faultType: null,
    status: 'Online',
    assignmentStatus: 'Assigned',
    assignedEngineer: 'Sarah Johnson',
    installedDate: '2023-02-01',
    lastActiveDate: '2024-01-20'
  },
  {
    id: 'DEV003',
    productId: 'PRD-VFD-003',
    deviceName: 'Variable Drive - Conveyor System',
    macAddress: '00:1B:44:11:3A:B9',
    customerId: 'CUST002',
    category: 'VFD',
    subscriptionStartDate: '2023-03-01',
    subscriptionEndDate: '2024-03-01',
    resolvedEngineer: 'Mike Wilson',
    faultType: 'Hardware Failure',
    status: 'Fault',
    assignmentStatus: 'Assigned',
    assignedEngineer: 'Mike Wilson',
    installedDate: '2023-03-01',
    lastActiveDate: '2024-01-18'
  },
  {
    id: 'DEV004',
    productId: 'PRD-IU-004',
    deviceName: 'Climate Controller - Office Block',
    macAddress: '00:1B:44:11:3A:C0',
    customerId: 'CUST002',
    category: 'Indoor Unit',
    subscriptionStartDate: '2023-04-01',
    subscriptionEndDate: '2024-04-01',
    resolvedEngineer: null,
    faultType: null,
    status: 'Offline',
    assignmentStatus: 'Unassigned',
    assignedEngineer: null,
    installedDate: '2023-04-01',
    lastActiveDate: '2024-01-19'
  },
  {
    id: 'DEV005',
    productId: 'PRD-SS-005',
    deviceName: 'Pump Controller - Water Treatment',
    macAddress: '00:1B:44:11:3A:C1',
    customerId: 'CUST003',
    category: 'Soft Starter',
    subscriptionStartDate: '2023-05-01',
    subscriptionEndDate: '2024-05-01',
    resolvedEngineer: 'Emily Davis',
    faultType: 'Network Issue',
    status: 'Fault',
    assignmentStatus: 'Assigned',
    assignedEngineer: 'Emily Davis',
    installedDate: '2023-05-01',
    lastActiveDate: '2024-01-17'
  }
];

export const deviceHistory = [
  {
    deviceId: 'DEV001',
    type: 'status',
    fromStatus: 'Offline',
    toStatus: 'Online',
    timestamp: '2024-01-20T10:30:00Z',
    engineerId: 1,
    engineerName: 'John Smith'
  },
  {
    deviceId: 'DEV003',
    type: 'fault',
    faultType: 'Hardware Failure',
    assignedEngineer: 'Mike Wilson',
    assignedDate: '2024-01-18',
    resolvedDate: null,
    status: 'Open'
  }
];

export const deviceUpdates = [
  {
    deviceId: 'DEV001',
    version: '2.1.3',
    updateType: 'Firmware',
    approvedByEngineerId: 1,
    approvedByEngineerName: 'John Smith',
    batchId: 'BATCH001',
    productName: 'Indoor Unit Pro',
    updateDate: '2024-01-15',
    updateStatus: 'Success',
    remarks: 'Security patch applied successfully'
  },
  {
    deviceId: 'DEV002',
    version: '1.8.2',
    updateType: 'Software',
    approvedByEngineerId: 2,
    approvedByEngineerName: 'Sarah Johnson',
    batchId: 'BATCH002',
    productName: 'Soft Starter Elite',
    updateDate: '2024-01-10',
    updateStatus: 'Success',
    remarks: 'Performance optimization update'
  },
  {
    deviceId: 'DEV003',
    version: '3.0.1',
    updateType: 'Config',
    approvedByEngineerId: 3,
    approvedByEngineerName: 'Mike Wilson',
    batchId: 'BATCH003',
    productName: 'VFD Advanced',
    updateDate: '2024-01-05',
    updateStatus: 'Failed',
    remarks: 'Configuration rollback required due to compatibility issues'
  }
];

export const deletedDevices = [
  {
    id: 'DEV999',
    customerId: 'CUST001',
    category: 'Indoor Unit',
    deletedDate: '2024-01-01',
    reason: 'Hardware replacement'
  }
];