import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function AdminPanel() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🏢 Admin Panel</h1>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="dashboard-grid">
          <div className="dash-card">
            <h3>✅ Approve Farmers</h3>
            <button className="btn-primary">Manage Farmers</button>
          </div>

          <div className="dash-card">
            <h3>✅ Approve Buyers</h3>
            <button className="btn-primary">Manage Buyers</button>
          </div>

          <div className="dash-card">
            <h3>🚛 Approve Logistics</h3>
            <button className="btn-primary">Manage Logistics</button>
          </div>

          <div className="dash-card">
            <h3>🏬 Register FPO Storage</h3>
            <button className="btn-primary">FPO Management</button>
          </div>

          <div className="dash-card">
            <h3>📊 Analytics</h3>
            <button className="btn-primary">View Analytics</button>
          </div>

          <div className="dash-card">
            <h3>💰 Revenue</h3>
            <button className="btn-primary">View Revenue</button>
          </div>

          <div className="dash-card">
            <h3>📈 Active Listings</h3>
            <button className="btn-primary">View Listings</button>
          </div>

          <div className="dash-card">
            <h3>🔍 Monitor Platform</h3>
            <button className="btn-primary">View Metrics</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
