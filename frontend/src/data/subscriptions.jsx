export const subscriptions = [
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
    customerId: 'CUST001',
    customerName: 'TechCorp Industries',
    deviceId: 'DEV002',
    deviceLocation: 'Building A - Floor 5',
    planName: 'Standard IoT Plan',
    planPrice: 99,
    startDate: '2023-01-15',
    expiryDate: '2024-01-15',
    status: 'Expired',
    value: 99
  },
  {
    id: 'SUB003',
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
  },
  {
    id: 'SUB004',
    customerId: 'CUST002',
    customerName: 'Manufacturing Solutions Ltd',
    deviceId: 'DEV004',
    deviceLocation: 'Factory Floor - Section C',
    planName: 'Premium IoT Plan',
    planPrice: 199,
    startDate: '2023-10-15',
    expiryDate: '2024-10-15',
    status: 'Active',
    value: 199
  },
  {
    id: 'SUB005',
    customerId: 'CUST003',
    customerName: 'Energy Co',
    deviceId: 'DEV005',
    deviceLocation: 'Power Plant - Unit 1',
    planName: 'Standard IoT Plan',
    planPrice: 99,
    startDate: '2023-01-20',
    expiryDate: '2024-01-20',
    status: 'Expired',
    value: 99
  },
  {
    id: 'SUB006',
    customerId: 'CUST003',
    customerName: 'Energy Co',
    deviceId: 'DEV006',
    deviceLocation: 'Power Plant - Unit 2',
    planName: 'Enterprise IoT Plan',
    planPrice: 399,
    startDate: '2023-09-30',
    expiryDate: '2024-09-30',
    status: 'Active',
    value: 399
  },
  {
    id: 'SUB007',
    customerId: 'CUST004',
    customerName: 'Smart Factory Inc',
    deviceId: 'DEV007',
    deviceLocation: 'Assembly Line 1',
    planName: 'Premium IoT Plan',
    planPrice: 199,
    startDate: '2023-08-31',
    expiryDate: '2024-08-31',
    status: 'Active',
    value: 199
  },
  {
    id: 'SUB008',
    customerId: 'CUST004',
    customerName: 'Smart Factory Inc',
    deviceId: 'DEV008',
    deviceLocation: 'Assembly Line 2',
    planName: 'Standard IoT Plan',
    planPrice: 99,
    startDate: '2023-07-15',
    expiryDate: '2024-07-15',
    status: 'Active',
    value: 99
  },
  {
    id: 'SUB009',
    customerId: 'CUST005',
    customerName: 'AutoTech Systems',
    deviceId: 'DEV009',
    deviceLocation: 'Production Floor - Zone A',
    planName: 'Enterprise IoT Plan',
    planPrice: 399,
    startDate: '2023-01-10',
    expiryDate: '2024-01-10',
    status: 'Expired',
    value: 399
  },
  {
    id: 'SUB010',
    customerId: 'CUST005',
    customerName: 'AutoTech Systems',
    deviceId: 'DEV010',
    deviceLocation: 'Production Floor - Zone B',
    planName: 'Premium IoT Plan',
    planPrice: 199,
    startDate: '2023-06-30',
    expiryDate: '2024-06-30',
    status: 'Active',
    value: 199
  }
];

export const countryPricing = {
  'United States': { currency: 'USD', symbol: '$', multiplier: 1 },
  'India': { currency: 'INR', symbol: '₹', multiplier: 83 },
  'United Kingdom': { currency: 'GBP', symbol: '£', multiplier: 0.79 },
  'Germany': { currency: 'EUR', symbol: '€', multiplier: 0.92 },
  'Japan': { currency: 'JPY', symbol: '¥', multiplier: 149 },
  'Australia': { currency: 'AUD', symbol: 'A$', multiplier: 1.52 },
  'Canada': { currency: 'CAD', symbol: 'C$', multiplier: 1.36 },
  'China': { currency: 'CNY', symbol: '¥', multiplier: 7.24 }
};

export const servicePlans = [
  {
    name: 'Standard',
    price: 99,
    features: [
      'Basic device monitoring',
      'Email alerts',
      'Monthly reports',
      'Standard support'
    ],
    color: '#3498db',
    popular: false
  },
  {
    name: 'Premium',
    price: 199,
    features: [
      'Advanced monitoring',
      'Real-time alerts',
      'Weekly reports',
      'Priority support',
      'Custom dashboards'
    ],
    color: '#e74c3c',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 399,
    features: [
      'Full monitoring suite',
      'Instant notifications',
      'Daily reports',
      '24/7 dedicated support',
      'Custom integrations',
      'API access'
    ],
    color: '#f39c12',
    popular: false
  }
];

export const getServicePlansForCountry = (country = 'United States') => {
  const pricing = countryPricing[country] || countryPricing['United States'];
  
  return servicePlans.map(plan => ({
    ...plan,
    price: Math.round(plan.price * pricing.multiplier),
    currency: pricing.currency,
    symbol: pricing.symbol,
    country: country
  }));
};

export const formatPrice = (price, country = 'United States') => {
  const pricing = countryPricing[country] || countryPricing['United States'];
  const convertedPrice = Math.round(price * pricing.multiplier);
  return `${pricing.symbol}${convertedPrice.toLocaleString()}`;
};

export const subscriptionStats = {
  totalSubscriptions: subscriptions.length,
  activePlans: subscriptions.filter(s => s.status === 'Active').length,
  expiredPlans: subscriptions.filter(s => s.status === 'Expired').length,
  monthlyRevenue: subscriptions
    .filter(s => s.status === 'Active')
    .reduce((sum, sub) => sum + sub.value, 0)
};