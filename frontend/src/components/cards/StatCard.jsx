import React from 'react';
import './statCard.css';

const StatCard = ({ icon, value, label, variant = 'primary' }) => {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon">
          {icon}
        </div>
      </div>
      <div className="stat-card-value">{value ?? 0}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
};

export default StatCard;