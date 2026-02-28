import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function LogisticsDashboard() {
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
          <h1>🚛 Logistics Dashboard</h1>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="dashboard-grid">
          <div className="dash-card">
            <h3>🚚 Register Truck</h3>
            <button className="btn-primary">Add Truck</button>
          </div>

          <div className="dash-card">
            <h3>📋 My Trucks</h3>
            <button className="btn-primary">View Fleet</button>
          </div>

          <div className="dash-card">
            <h3>📦 Assigned Orders</h3>
            <button className="btn-primary">View Orders</button>
          </div>

          <div className="dash-card">
            <h3>🗺️ Truck Location</h3>
            <button className="btn-primary">Track Location</button>
          </div>

          <div className="dash-card">
            <h3>✅ Mark Delivery</h3>
            <button className="btn-primary">Complete Delivery</button>
          </div>

          <div className="dash-card">
            <h3>💰 Earnings</h3>
            <button className="btn-primary">View Earnings</button>
          </div>

          <div className="dash-card">
            <h3>⭐ Rating</h3>
            <button className="btn-primary">View Ratings</button>
          </div>

          <div className="dash-card">
            <h3>🔔 Notifications</h3>
            <button className="btn-primary">View Alerts</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogisticsDashboard;
