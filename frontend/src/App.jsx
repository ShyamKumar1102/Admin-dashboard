import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import AppRoutes from './routes/AppRoutes';
import { checkIfDataExists, initializeDatabase } from './utils/initializeData';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const authStatus = localStorage.getItem('iotAdminAuth');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }
      
      // Check if data exists, if not initialize with sample data
      const dataExists = await checkIfDataExists();
      if (!dataExists) {
        console.log('No data found, initializing with sample data...');
        await initializeDatabase();
      }
      setDataInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setDataInitialized(true); // Continue even if initialization fails
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    localStorage.setItem('iotAdminAuth', status.toString());
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('iotAdminAuth');
  };

  if (loading || !dataInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px', textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
          {loading ? 'Loading...' : 'Initializing database...'}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout}>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default App;