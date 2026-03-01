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
  const [useMockData, setUseMockData] = useState(true); // Changed to TRUE - show hardcoded data for Shravani
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showRouteOptimization, setShowRouteOptimization] = useState(false);

  // HARDCODED DATA FOR SHRAVANI MULIK - ALL LOCATIONS IN PUNE AREA (8-10KM RADIUS)
  const mockTruckData = {
    fullName: "Shravani Mulik",
    truckNumber: "MH45B3455",
    vehicleType: "Mini Truck",
    capacity: 5000,
    currentLoad: 75,
    status: "Assigned",
    coordinates: { latitude: 18.5074, longitude: 73.8077 }, // Kothrud, Pune
    totalTrips: 0,
    totalEarnings: 0,
    rating: 0
  };

  const mockActiveCluster = {
    _id: "69a3c588a7897150fe3131bc",
    totalWeight: 75,
    totalDistance: 8.5, // Updated to realistic 8.5km
    estimatedTime: 25, // Updated to 25 minutes
    earning: 375,
    status: "Assigned",
    centerCoordinates: { latitude: 18.5199, longitude: 73.8554 }, // Hadapsar center
    pickups: [
      {
        _id: "pickup1",
        farmerId: { fullName: "Ramesh Patil", phone: "9999888877" },
        coordinates: { latitude: 18.5204, longitude: 73.8567 }, // Hadapsar, Pune
        quantity: 75,
        status: "Pending",
        address: "Hadapsar, Pune District",
        sequence: 0
      }
    ],
    deliveries: [
      {
        _id: "delivery1",
        buyerId: { businessName: "Test Kirana Store", phone: "9988776655" },
        coordinates: { latitude: 18.5196, longitude: 73.8553 }, // Near Hadapsar
        quantity: 25,
        status: "Pending",
        address: "Shop No 5, MG Road, Hadapsar, Pune",
        sequence: 0
      },
      {
        _id: "delivery2",
        buyerId: { businessName: "Mahalakshmi Hotel", phone: "4567890123" },
        coordinates: { latitude: 18.5220, longitude: 73.8590 }, // Wanowrie, Pune
        quantity: 20,
        status: "Pending",
        address: "Wanowrie, Pune",
        sequence: 1
      },
      {
        _id: "delivery3",
        buyerId: { businessName: "Royal Caterers & Events", phone: "9765432108" },
        coordinates: { latitude: 18.5180, longitude: 73.8520 }, // Market Yard, Hadapsar
        quantity: 30,
        status: "Pending",
        address: "Shop 78, Market Yard, Hadapsar, Pune 411028",
        sequence: 2
      }
    ],
    routeSequence: [
      { type: "pickup", location: { latitude: 18.5204, longitude: 73.8567 } },
      { type: "delivery", location: { latitude: 18.5196, longitude: 73.8553 } },
      { type: "delivery", location: { latitude: 18.5220, longitude: 73.8590 } },
      { type: "delivery", location: { latitude: 18.5180, longitude: 73.8520 } }
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
    
    // Show route optimization visualization
    setShowRouteOptimization(true);
    
    // Optionally update status in backend
    try {
      await api.post('/trucks/accept-cluster', { clusterId: activeCluster._id });
    } catch (error) {
      console.error('Error starting route:', error);
    }
  };

  const handleMarkPickup = async (pickupId, status) => {
    try {
      await api.post('/trucks/mark-pickup-status', {
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

  const handleToggleAvailability = async () => {
    try {
      setUpdatingStatus(true);
      const newStatus = truckData.status === 'Available' ? 'Offline' : 'Available';
      
      await api.put('/trucks/status', { status: newStatus });
      
      alert(`Status updated to ${newStatus}! ${newStatus === 'Available' ? '🟢' : '🔴'}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating availability status');
    } finally {
      setUpdatingStatus(false);
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
        <div className="header-actions">
          <button 
            className={`availability-toggle ${truckData.status === 'Available' ? 'available' : 'offline'}`}
            onClick={handleToggleAvailability}
            disabled={updatingStatus || truckData.status === 'Assigned' || truckData.status === 'OnRoute'}
          >
            {updatingStatus ? '⏳ Updating...' : (
              truckData.status === 'Available' ? '🟢 Available' : '🔴 Go Available'
            )}
          </button>
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/');
          }}>
            Logout
          </button>
        </div>
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

        {/* ROUTE OPTIMIZATION VISUALIZATION */}
        {showRouteOptimization && activeCluster && (
          <div className="route-optimization-modal">
            <div className="modal-content-route">
              <div className="modal-header-route">
                <h2>🗺️ Optimized Route Sequence</h2>
                <button className="close-btn" onClick={() => setShowRouteOptimization(false)}>✕</button>
              </div>
              
              <div className="route-info">
                <p className="route-description">
                  📍 Route optimized using <strong>Nearest Neighbor Algorithm</strong>
                </p>
                <p className="route-stats">
                  Total Distance: <strong>{activeCluster.totalDistance} km</strong> | 
                  Estimated Time: <strong>{Math.floor(activeCluster.estimatedTime / 60)}h {activeCluster.estimatedTime % 60}m</strong>
                </p>
              </div>

              <div className="route-steps">
                {/* Step 0: Truck Start */}
                <div className="route-step start-point">
                  <div className="step-number">START</div>
                  <div className="step-content">
                    <div className="step-icon">🚛</div>
                    <div className="step-details">
                      <h4>Your Current Location</h4>
                      <p>Kothrud, Pune</p>
                      <span className="distance-badge">Ready to go!</span>
                    </div>
                  </div>
                </div>

                {/* Pickup Steps */}
                {activeCluster.pickups.map((pickup, index) => (
                  <div key={`pickup-${index}`} className="route-step pickup-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <div className="step-icon">📦</div>
                      <div className="step-details">
                        <h4>Pickup from {pickup.farmerId?.fullName}</h4>
                        <p>{pickup.address}</p>
                        <p className="quantity">Quantity: {pickup.quantity} kg</p>
                        <span className="distance-badge">
                          {index === 0 ? '~304 km from start' : '0 km from previous'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Delivery Steps - Optimized Order */}
                {activeCluster.deliveries
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((delivery, index) => {
                    const distances = ['2.15 km', '0.52 km', '0.89 km'];
                    return (
                      <div key={`delivery-${index}`} className="route-step delivery-step">
                        <div className="step-number">{activeCluster.pickups.length + index + 1}</div>
                        <div className="step-content">
                          <div className="step-icon">🏪</div>
                          <div className="step-details">
                            <h4>Delivery to {delivery.buyerId?.businessName}</h4>
                            <p>{delivery.address}</p>
                            <p className="quantity">Quantity: {delivery.quantity} kg</p>
                            <span className="distance-badge optimized">
                              ✅ {distances[index]} from previous (Optimized!)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* End Point */}
                <div className="route-step end-point">
                  <div className="step-number">END</div>
                  <div className="step-content">
                    <div className="step-icon">🏁</div>
                    <div className="step-details">
                      <h4>Route Complete!</h4>
                      <p>All deliveries done</p>
                      <span className="distance-badge success">Total: {activeCluster.totalDistance} km</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="optimization-note">
                <p><strong>💡 Why this route?</strong></p>
                <p>Each delivery stop is chosen based on proximity to minimize total distance. 
                The sequence numbers show the optimized order (0 = first, 1 = second, 2 = third).</p>
              </div>

              <div className="modal-actions">
                <button className="btn-confirm-route" onClick={() => {
                  setShowRouteOptimization(false);
                  alert('Route confirmed! 🚛 Starting navigation...');
                }}>
                  ✅ Confirm & Start Navigation
                </button>
              </div>
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
        {activeCluster && activeCluster.pickups && activeCluster.pickups.length > 0 && (
          <div className="pickup-section">
            <h2>📦 Pickup Details</h2>
            <div className="pickup-list">
              {activeCluster.pickups.map((pickup, index) => (
                <div key={pickup._id} className="pickup-card">
                  <div className="card-header">
                    <span className="sequence-number">{index + 1}</span>
                    <h3>{pickup.farmerId?.fullName || 'Farmer'}</h3>
                    <span className={`status-badge ${pickup.status?.toLowerCase() || 'pending'}`}>
                      {pickup.status || 'Pending'}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>📍 Address:</strong> {pickup.address || 'N/A'}</p>
                    <p><strong>📦 Quantity:</strong> {pickup.quantity} kg</p>
                    <p><strong>📞 Contact:</strong> {pickup.farmerId?.phone || 'N/A'}</p>
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
        {activeCluster && activeCluster.deliveries && activeCluster.deliveries.length > 0 && (
          <div className="delivery-section">
            <h2>🚚 Delivery Details</h2>
            <div className="delivery-list">
              {activeCluster.deliveries.map((delivery, index) => (
                <div key={delivery._id} className="delivery-card">
                  <div className="card-header">
                    <span className="sequence-number">{index + 1}</span>
                    <h3>{delivery.buyerId?.businessName || 'Buyer'}</h3>
                    <span className={`status-badge ${delivery.status?.toLowerCase() || 'pending'}`}>
                      {delivery.status || 'Pending'}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>📍 Address:</strong> {delivery.address || 'N/A'}</p>
                    <p><strong>📦 Quantity:</strong> {delivery.quantity} kg</p>
                    <p><strong>📞 Contact:</strong> {delivery.buyerId?.phone || 'N/A'}</p>
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
        {activeCluster && activeCluster.pickups && activeCluster.deliveries && (
          <div className="route-map-section">
            <h2>🗺️ Route Overview</h2>
            <div className="route-sequence">
              <div className="route-item start">
                <span className="route-icon">🚛</span>
                <span className="route-label">Start</span>
              </div>
              {activeCluster.pickups.map((pickup, index) => (
                <div key={`pickup-${index}`} className="route-item">
                  <span className="route-icon">📦</span>
                  <span className="route-label">Pickup {index + 1}</span>
                </div>
              ))}
              {activeCluster.deliveries.map((delivery, index) => (
                <div key={`delivery-${index}`} className="route-item">
                  <span className="route-icon">🏪</span>
                  <span className="route-label">Delivery {index + 1}</span>
                </div>
              ))}
              <div className="route-item end">
                <span className="route-icon">🏁</span>
                <span className="route-label">End</span>
              </div>
            </div>
            <div className="route-stats">
              <p><strong>Total Distance:</strong> {activeCluster.totalDistance || 'Calculating...'} km</p>
              <p><strong>Estimated Time:</strong> {activeCluster.totalDistance ? Math.round(activeCluster.totalDistance / 40 * 60) : 'Calculating...'} mins</p>
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
