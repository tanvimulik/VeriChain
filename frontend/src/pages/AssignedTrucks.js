import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function AssignedTrucks() {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      const response = await api.get('/farmer/trucks/assigned');
      setTrucks(response.data.data);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>🚚 Assigned Trucks</h1>
        <button onClick={() => navigate('/farmer-dashboard')} className="btn-secondary">
          Back to Dashboard
        </button>
      </header>

      <div className="dashboard-container">
        {loading ? (
          <p>Loading...</p>
        ) : trucks.length === 0 ? (
          <p>No trucks assigned yet</p>
        ) : (
          <div className="trucks-grid">
            {trucks.map((truck) => (
              <div key={truck._id} className="truck-card">
                <h3>🚛 {truck.truckNumber}</h3>
                <div className="truck-details">
                  <p><strong>Driver:</strong> {truck.driverName}</p>
                  <p><strong>Contact:</strong> {truck.driverContact}</p>
                  <p><strong>Pickup:</strong> {truck.pickupLocation}</p>
                  <p><strong>Drop:</strong> {truck.dropLocation}</p>
                  <p><strong>Pickup Date:</strong> {new Date(truck.pickupDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${truck.status}`}>{truck.status}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignedTrucks;
