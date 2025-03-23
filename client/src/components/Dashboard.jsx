import React from 'react';
import TechnologyManagement from './TechnologyManagement';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Technology Standards Dashboard</h1>
        <p className="dashboard-subtitle">Manage and track your organization's technology standards</p>
      </div>
      
      <div className="dashboard-content">
        <TechnologyManagement />
      </div>
    </div>
  );
};

export default Dashboard; 