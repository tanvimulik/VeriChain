import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './TruckDashboard.css';

function TruckDashboard() {
  const navigate = useNavigate();
  const [truckData, setTruckData] = useState(null);
  const [activeCluster, setActiveCluster] = useState(null);
  const [tripHistory, setTripHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(true); // Toggle for demo

  // HARDCODED MOCK DATA for design testing
  const mockTruckData = {
    fullName: "Suresh Kumar",
    truckNumber: "MH12AB1234",
    vehicleType: "Tata Ace",
    capacity: 2000,
    currentLoad: 850,
    status: "OnRoute",
    coordinates: { latitude: 19.9975, longitude: 73.7898 },
    totalTrips: 15,
    totalEarnings: 22500,
    rating: 4.5
  };

  const mockActiveCluster = {
    _id: "cluster123",
    totalWeight: 850,
    totalDistance: 45.5,
    earning: 682,
    status: "InProgress",
    pickups: [
      {
        _id: "pickup1",
        farmerId: { fullName: "Ramesh Patil", phone: "9876543210" },
        coordinates: { latitude: 19.9975, longitude: 73.7898 },
        quantity: 500,
        status: "Pending",
        address: "Nashik Road, Maharashtra"
      },
      {
        _id: "pickup2",
        farmerId: { fullName: "Vijay Sharma", phone: "9876543211" },
        coordinates: { latitude: 19.9980, longitude: 73.7900 },
        quantity: 350,
        status: "Pending",
        address: "Satpur, Nashik"
      }
    ],
    deliveries: [
      {
        _id: "delivery1",
        buyerId: { businessName: "Fresh Mart", phone: "9123456789" },
        coordinates: { latitude: 19.1234, longitude: 72.8765 },
        quantity: 500,
        status: "Pending",
        address: "Andheri, Mumbai"
      },
      {
        _id: "delivery2",
        buyerId: { businessName: "Veggie Store", phone: "9123456790" },
        coordinates: { latitude: 19.1240, longitude: 72.8770 },
        quantity: 350,
        status: "Pending",
        address: "Bandra, Mumbai"
      }
    ],
    routeSequence: [
      { type: "pickup", location: { latitude: 19.9975, longitude: 73.7898 } },
      { type: "pickup", location: { latitude: 19.9980, longitude: 73.7900 } },
      { type: "delivery", location: { latitude: 19.1234, longitude: 72.8765 } },
      { type: "delivery", location: { latitude: 19.1240, longitude: 72.8770 } }
    ]
  };

  const mockTripHistory = [
    {
      _id: "trip1",
      date: "2024-03-10",
      totalWeight: 1200,
      totalDistance: 65.5,
      farmersCount: 3,
      buyersCount: 2,
      earning: 982,
      status: "Completed"
    },
    {
      _id: "trip2",
      date: "2024-03-09",
      totalWeight: 800,
      totalDistance: 42.3,
      farmersCount: 2,
      buyersCount: 2,
      earning: 634,
      status: "Completed"
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (useMockData) {
        // Use mock data for design testing
        setTruckData(mockTruckData);
        setActiveCluster(mockActiveCluster);
        setTripHistory(mockTripHistory);
        setLoading(false);
        return;
      }

      // Real API calls
      const [profileRes, clusterRes, historyRes] = await Promise.all([
        api.get('/trucks/profile'),
        api.get('/trucks/active-cluster'),
        api.get('/trucks/trip-history')
      ]);

      setTruckData(profileRes.data.data);
      setActiveCluster(clusterRes.data.data);
      setTripHistory(historyRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Error loading dashboard. Using demo data.');
      // Fallback to mock data
      setTruckData(mockTruckData);
      setActiveCluster(mockActiveCluster);
      setTripHistory(mockTripHistory);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRoute = async () => {
    if (!activeCluster) return;
    try {
      await api.post('/trucks/accept-cluster', { clusterId: activeCluster._id });
      alert('Route started! 🚛');
      fetchDashboardData();
    } catch (error) {
      console.error('Error starting route:', error);
      alert('Error starting route');
    }
  };

  const handleMarkPickup = async (pickupId, status) => {
    try {
      await api.post('/trucks/mark-pickup', {
        clusterId: activeCluster._id,
        pickupId,
        status
      });
      alert(`Pickup marked as ${status}! ✅`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking pickup:', error);
      alert('Error updating pickup status');
    }
  };

  const handleMarkDelivery = async (deliveryId) => {
    try {
      await api.post('/trucks/mark-delivery', {
        clusterId: activeCluster._id,
        deliveryId
      });
      alert('Delivery marked as complete! ✅');
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking delivery:', error);
      alert('Error updating delivery status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Available: '#28a745',
      OnRoute: '#007bff',
      Loading: '#ffc107',
      Delivering: '#17a2b8',
      Offline: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!truckData) {
    return <div className="error">Unable to load dashboard</div>;
  }

  return (
    <div className="truck-dashboard">
      {/* SECTION 1: DRIVER PROFILE HEADER */}
      <header className="driver-profile-header">
        <div className="profile-left">
          <div className="driver-avatar">🚛</div>
          <div className="driver-info">
            <h1>{truckData.fullName}</h1>
            <p className="truck-number">{truckData.truckNumber}</p>
            <p className="vehicle-type">{truckData.vehicleType}</p>
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-label">Capacity</span>
            <span className="stat-value">{truckData.capacity} kg</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Current Load</span>
            <span className="stat-value">{truckData.currentLoad} kg</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Status</span>
            <span 
              className="stat-value status-badge" 
              style={{ backgroundColor: getStatusColor(truckData.status) }}
            >
              {truckData.status}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Trips</span>
            <span className="stat-value">{truckData.totalTrips}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Earnings</span>
            <span className="stat-value">₹{truckData.totalEarnings}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Rating</span>
            <span className="stat-value">⭐ {truckData.rating}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('token');
          navigate('/login/truck');
        }}>
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        {/* SECTION 2: ACTIVE ASSIGNMENT CARD */}
        {activeCluster && (
          <div className="active-assignment-card">
            <h2>🎯 Active Assignment</h2>
            <div className="assignment-details">
              <div className="detail-row">
                <span>Cluster ID:</span>
                <span className="value">#{activeCluster._id.slice(-8)}</span>
              </div>
              <div className="detail-row">
                <span>Total Weight:</span>
                <span className="value">{activeCluster.totalWeight} kg</span>
              </div>
              <div className="detail-row">
                <span>Farmers:</span>
                <span className="value">{activeCluster.pickups.length}</span>
              </div>
              <div className="detail-row">
                <span>Buyers:</span>
                <span className="value">{activeCluster.deliveries.length}</span>
              </div>
              <div className="detail-row">
                <span>Distance:</span>
                <span className="value">{activeCluster.totalDistance} km</span>
              </div>
              <div className="detail-row">
                <span>Earning:</span>
                <span className="value earning">₹{activeCluster.earning}</span>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span className="value status">{activeCluster.status}</span>
              </div>
            </div>

            {/* SECTION 6: ACTION BUTTONS */}
            <div className="action-buttons">
              {activeCluster.status === 'Assigned' && (
                <button className="btn-start-route" onClick={handleStartRoute}>
                  🟢 Start Route
                </button>
              )}
            </div>
          </div>
        )}

        {!activeCluster && (
          <div className="no-assignment-card">
            <h2>📭 No Active Assignment</h2>
            <p>Waiting for cluster assignment...</p>
            <p className="hint">Make sure your status is set to "Available"</p>
          </div>
        )}

        {/* SECTION 3: PICKUP DETAILS */}
        {activeCluster && activeCluster.pickups.length > 0 && (
          <div className="pickup-section">
            <h2>📦 Pickup Details</h2>
            <div className="pickup-list">
              {activeCluster.pickups.map((pickup, index) => (
                <div key={pickup._id} className="pickup-card">
                  <div className="card-header">
                    <span className="sequence-number">{index + 1}</span>
                    <h3>{pickup.farmerId.fullName}</h3>
                    <span className={`status-badge ${pickup.status.toLowerCase()}`}>
                      {pickup.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>📍 Address:</strong> {pickup.address}</p>
                    <p><strong>📦 Quantity:</strong> {pickup.quantity} kg</p>
                    <p><strong>📞 Contact:</strong> {pickup.farmerId.phone}</p>
                  </div>
                  <div className="card-actions">
                    {pickup.status === 'Pending' && (
                      <>
                        <button 
                          className="btn-action btn-arrived"
                          onClick={() => handleMarkPickup(pickup._id, 'Arrived')}
                        >
                          🟡 Mark Arrived
                        </button>
                      </>
                    )}
                    {pickup.status === 'Arrived' && (
                      <button 
                        className="btn-action btn-loaded"
                        onClick={() => handleMarkPickup(pickup._id, 'Loaded')}
                      >
                        🟢 Mark Loaded
                      </button>
                    )}
                    {pickup.status === 'Loaded' && (
                      <span className="completed-badge">✅ Loaded</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: DELIVERY DETAILS */}
        {activeCluster && activeCluster.deliveries.length > 0 && (
          <div className="delivery-section">
            <h2>🚚 Delivery Details</h2>
            <div className="delivery-list">
              {activeCluster.deliveries.map((delivery, index) => (
                <div key={delivery._id} className="delivery-card">
                  <div className="card-header">
                    <span className="sequence-number">{index + 1}</span>
                    <h3>{delivery.buyerId.businessName}</h3>
                    <span className={`status-badge ${delivery.status.toLowerCase()}`}>
                      {delivery.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>📍 Address:</strong> {delivery.address}</p>
                    <p><strong>📦 Quantity:</strong> {delivery.quantity} kg</p>
                    <p><strong>📞 Contact:</strong> {delivery.buyerId.phone}</p>
                  </div>
                  <div className="card-actions">
                    {delivery.status === 'Pending' && (
                      <button 
                        className="btn-action btn-deliver"
                        onClick={() => handleMarkDelivery(delivery._id)}
                      >
                        🟢 Mark Delivered
                      </button>
                    )}
                    {delivery.status === 'Delivered' && (
                      <span className="completed-badge">✅ Delivered</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: ROUTE MAP (Simplified) */}
        {activeCluster && (
          <div className="route-map-section">
            <h2>🗺️ Route Overview</h2>
            <div className="route-sequence">
              <div className="route-item start">
                <span className="route-icon">🚛</span>
                <span className="route-label">Start</span>
              </div>
              {activeCluster.routeSequence.map((point, index) => (
                <div key={index} className="route-item">
                  <span className="route-icon">
                    {point.type === 'pickup' ? '📦' : '🏪'}
                  </span>
                  <span className="route-label">
                    {point.type === 'pickup' ? `Pickup ${index + 1}` : `Delivery ${index + 1}`}
                  </span>
                </div>
              ))}
              <div className="route-item end">
                <span className="route-icon">🏁</span>
                <span className="route-label">End</span>
              </div>
            </div>
            <div className="route-stats">
              <p><strong>Total Distance:</strong> {activeCluster.totalDistance} km</p>
              <p><strong>Estimated Time:</strong> {Math.round(activeCluster.totalDistance / 40 * 60)} mins</p>
            </div>
          </div>
        )}

        {/* SECTION 7: EARNINGS */}
        <div className="earnings-section">
          <h2>💰 Earnings Summary</h2>
          <div className="earnings-grid">
            <div className="earning-card">
              <span className="earning-label">Current Trip</span>
              <span className="earning-value">₹{activeCluster?.earning || 0}</span>
            </div>
            <div className="earning-card">
              <span className="earning-label">Today</span>
              <span className="earning-value">₹{activeCluster?.earning || 0}</span>
            </div>
            <div className="earning-card">
              <span className="earning-label">This Month</span>
              <span className="earning-value">₹{truckData.totalEarnings}</span>
            </div>
            <div className="earning-card">
              <span className="earning-label">Per KM Rate</span>
              <span className="earning-value">₹15/km</span>
            </div>
          </div>
        </div>

        {/* SECTION 8: TRIP HISTORY */}
        <div className="history-section">
          <h2>📜 Trip History</h2>
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Distance</th>
                  <th>Farmers</th>
                  <th>Buyers</th>
                  <th>Earning</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tripHistory.map((trip) => (
                  <tr key={trip._id}>
                    <td>{trip.date}</td>
                    <td>{trip.totalWeight} kg</td>
                    <td>{trip.totalDistance} km</td>
                    <td>{trip.farmersCount}</td>
                    <td>{trip.buyersCount}</td>
                    <td>₹{trip.earning}</td>
                    <td><span className="status-badge completed">{trip.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Demo Mode Toggle */}
      <div className="demo-toggle">
        <label>
          <input 
            type="checkbox" 
            checked={useMockData} 
            onChange={(e) => {
              setUseMockData(e.target.checked);
              fetchDashboardData();
            }}
          />
          Use Demo Data (for design testing)
        </label>
      </div>
    </div>
  );
}

export default TruckDashboard;
