import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import StatCard from '../components/cards/StatCard';
import PieChart from '../components/charts/PieChart';
import AddDeviceModal from '../components/modals/AddDeviceModal';
import AddEngineerModal from '../components/modals/AddEngineerModal';
import { dbService } from '../services/unifiedDatabaseService';
import './pages.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showEngineerModal, setShowEngineerModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({});
  const [engineerChartData, setEngineerChartData] = useState([]);
  const [deviceChartData, setDeviceChartData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [engineers, setEngineers] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [engineers, customers, devices, faults, subscriptions] = await Promise.all([
        dbService.getAllEngineers(),
        dbService.getAllCustomers(),
        dbService.getAllDevices(),
        dbService.getAllFaults(),
        dbService.getAllSubscriptions()
      ]);

      // Filter out deleted records
      const activeEngineers = engineers.filter(e => e.status !== 'Deleted');
      const activeCustomers = customers.filter(c => c.status !== 'Deleted');
      const activeDevices = devices.filter(d => d.status !== 'Deleted');
      const activeFaults = faults.filter(f => f.status !== 'Deleted');
      const activeSubscriptions = subscriptions.filter(s => s.status !== 'Deleted');

      // Calculate assigned engineers based on device assignments
      const assignedCount = activeEngineers.filter(eng => {
        return activeDevices.some(d => 
          d.engineerId === eng.id || 
          d.engineerId === eng.username || 
          d.assignedEngineer === eng.name ||
          d.assignedEngineer === eng.username
        );
      }).length;

      const stats = {
        totalEngineers: activeEngineers.length,
        assignedEngineers: assignedCount,
        availableEngineers: activeEngineers.length - assignedCount,
        totalCustomers: activeCustomers.length,
        subscribedCustomers: new Set(activeSubscriptions.filter(s => s.status === 'Active').map(s => s.customerId)).size,
        totalDevices: activeDevices.length,
        activeDevices: activeDevices.filter(d => d.status === 'Online').length,
        faultDevices: activeDevices.filter(d => d.status === 'Fault').length,
        issuesResolved: activeFaults.filter(f => f.status === 'Resolved').length,
        openTickets: activeFaults.filter(f => f.status === 'Open').length
      };

      const engineerChart = [
        { name: 'Assigned', value: stats.assignedEngineers, color: '#667eea' },
        { name: 'Available', value: stats.availableEngineers, color: '#27ae60' }
      ].filter(item => item.value > 0);

      const deviceChart = [
        { name: 'Online', value: stats.activeDevices || 0, color: '#27ae60' },
        { name: 'Offline', value: activeDevices.filter(d => d.status === 'Offline').length || 0, color: '#e74c3c' },
        { name: 'Fault', value: stats.faultDevices || 0, color: '#f39c12' }
      ].filter(item => item.value > 0);

      setDashboardStats(stats);
      setEngineerChartData(engineerChart);
      setDeviceChartData(deviceChart);
      setCustomers(activeCustomers);
      setEngineers(activeEngineers);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleAddDevice = () => {
    setShowDeviceModal(true);
  };

  const handleAddEngineer = () => {
    setShowEngineerModal(true);
  };

  const handleViewIssues = () => {
    navigate('/faults');
  };

  const handleGenerateReport = () => {
    // Generate and download a simple report
    const reportData = {
      timestamp: new Date().toISOString(),
      totalEngineers: dashboardStats.totalEngineers,
      assignedEngineers: dashboardStats.assignedEngineers,
      availableEngineers: dashboardStats.availableEngineers,
      totalCustomers: dashboardStats.totalCustomers,
      subscribedCustomers: dashboardStats.subscribedCustomers,
      totalDevices: dashboardStats.totalDevices,
      activeDevices: dashboardStats.activeDevices,
      faultDevices: dashboardStats.faultDevices,
      issuesResolved: dashboardStats.issuesResolved,
      openTickets: dashboardStats.openTickets
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iot-dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <>
      <Header title="Seniot Dashboard" />
      <div className="page-container">
        <div className="stats-grid">
          <StatCard
            icon={<i className="fas fa-user-tie"></i>}
            value={dashboardStats.totalEngineers}
            label="Total Engineers"
            variant="primary"
          />
          <StatCard
            icon={<i className="fas fa-user-check"></i>}
            value={dashboardStats.assignedEngineers}
            label="Assigned Engineers"
            variant="success"
          />
          <StatCard
            icon={<i className="fas fa-user-clock"></i>}
            value={dashboardStats.availableEngineers}
            label="Available Engineers"
            variant="warning"
          />
          <StatCard
            icon={<i className="fas fa-building"></i>}
            value={dashboardStats.totalCustomers}
            label="Total Customers"
            variant="info"
          />
          <StatCard
            icon={<i className="fas fa-clipboard-check"></i>}
            value={dashboardStats.subscribedCustomers}
            label="Subscribed Customers"
            variant="success"
          />
          <StatCard
            icon={<i className="fas fa-microchip"></i>}
            value={dashboardStats.totalDevices}
            label="Total Devices"
            variant="info"
          />
          <StatCard
            icon={<i className="fas fa-wifi"></i>}
            value={dashboardStats.activeDevices}
            label="Active Devices"
            variant="success"
          />
          <StatCard
            icon={<i className="fas fa-exclamation-triangle"></i>}
            value={dashboardStats.faultDevices}
            label="Fault Devices"
            variant="danger"
          />
          <StatCard
            icon={<i className="fas fa-check-circle"></i>}
            value={dashboardStats.issuesResolved}
            label="Issues Resolved"
            variant="success"
          />
          <StatCard
            icon={<i className="fas fa-ticket-alt"></i>}
            value={dashboardStats.openTickets}
            label="Open Tickets"
            variant="warning"
          />
        </div>

        <div className="charts-grid">
          <PieChart
            title="Engineers Assignment Distribution"
            data={engineerChartData}
          />
          <PieChart
            title="Device Health Status"
            data={deviceChartData}
          />
        </div>

        <div className="quick-actions-section">
          <h3 className="section-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            <div className="quick-action-card" onClick={handleAddDevice}>
              <i className="fas fa-plus-circle"></i>
              <h4>Add New Device</h4>
              <p>Register a new IoT device</p>
            </div>
            <div className="quick-action-card" onClick={handleAddEngineer}>
              <i className="fas fa-user-plus"></i>
              <h4>Add Engineer</h4>
              <p>Onboard new technical staff</p>
            </div>
            <div className="quick-action-card" onClick={handleViewIssues}>
              <i className="fas fa-exclamation-triangle"></i>
              <h4>View Critical Issues</h4>
              <p>Check urgent device faults</p>
            </div>
            <div className="quick-action-card" onClick={handleGenerateReport}>
              <i className="fas fa-download"></i>
              <h4>Generate Report</h4>
              <p>Download dashboard analytics</p>
            </div>
          </div>
        </div>
        
      </div>
      
      {showDeviceModal && (
        <AddDeviceModal 
          isOpen={showDeviceModal}
          onClose={() => setShowDeviceModal(false)} 
          onAddDevice={(device) => {
            console.log('New device added:', device);
            setShowDeviceModal(false);
            loadDashboardData(); // Refresh data
          }}
          customers={customers}
          engineers={engineers}
        />
      )}
      
      {showEngineerModal && (
        <AddEngineerModal 
          isOpen={showEngineerModal}
          onClose={() => setShowEngineerModal(false)}
          onAddEngineer={(engineer) => {
            console.log('New engineer added:', engineer);
            setShowEngineerModal(false);
            loadDashboardData(); // Refresh data
          }}
        />
      )}
    </>
  );
};

export default Dashboard;