import React from 'react';
import { NavLink } from 'react-router-dom';
import './layout.css';

const Sidebar = ({ onLogout, isMobileMenuOpen, closeMobileMenu }) => {
  const handleNavClick = () => {
    if (closeMobileMenu) {
      closeMobileMenu();
    }
  };

  return (
    <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <i className="fas fa-microchip"></i>
        <h2>Seniot</h2>
      </div>
      <nav>
        <ul className="sidebar-nav">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={handleNavClick}
            >
              <i className="fas fa-chart-bar"></i> 
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/engineers" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={handleNavClick}
            >
              <i className="fas fa-user-tie"></i> 
              <span>Engineers</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/customers" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={handleNavClick}
            >
              <i className="fas fa-users"></i> 
              <span>Customers</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/devices" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={handleNavClick}
            >
              <i className="fas fa-microchip"></i> 
              <span>Devices</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/invoices" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={handleNavClick}
            >
              <i className="fas fa-file-invoice"></i> 
              <span>Invoices</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/faults" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={handleNavClick}
            >
              <i className="fas fa-exclamation-triangle"></i> 
              <span>Fault Devices</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/subscriptions" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={handleNavClick}
            >
              <i className="fas fa-clipboard-list"></i> 
              <span>Subscriptions</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/banners" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={handleNavClick}
            >
              <i className="fas fa-image"></i> 
              <span>Banners</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <i className="fas fa-sign-out-alt"></i> 
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;