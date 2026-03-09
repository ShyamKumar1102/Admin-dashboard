import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import CustomerDetails from '../pages/CustomerDetails';
import Devices from '../pages/Devices';
import DeviceDetails from '../pages/DeviceDetails';
import Engineers from '../pages/Engineers';
import EngineerDetails from '../pages/EngineerDetails';
import FaultDevices from '../pages/FaultDevices';
import FaultDetails from '../pages/FaultDetails';
import Subscriptions from '../pages/Subscriptions';
import SubscriptionDetails from '../pages/SubscriptionDetails';
import Invoices from '../pages/Invoices';
import InvoiceDetails from '../pages/InvoiceDetails';
import Banners from '../pages/Banners';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/engineers" element={<Engineers />} />
      <Route path="/engineers/:id" element={<EngineerDetails />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:id" element={<CustomerDetails />} />
      <Route path="/devices" element={<Devices />} />
      <Route path="/devices/:deviceId" element={<DeviceDetails />} />
      <Route path="/faults" element={<FaultDevices />} />
      <Route path="/faults/:id" element={<FaultDetails />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/subscriptions/:id" element={<SubscriptionDetails />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/invoices/:id" element={<InvoiceDetails />} />
      <Route path="/banners" element={<Banners />} />
    </Routes>
  );
};

export default AppRoutes;