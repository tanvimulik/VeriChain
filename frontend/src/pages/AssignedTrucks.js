import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';
import './AssignedTrucks.css';

function AssignedTrucks() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      // Fetch farmer's orders that have trucks assigned
      const response = await api.get('/farmer/orders/incoming');
      const allOrders = response.data.data;
      
      // Filter orders that have truck assignments
      const ordersWithTrucks = allOrders.filter(order => 
        order.assignedTruckId || order.requestStatus === 'truck_assigned'
      );

      // Fetch truck details for each order
      const ordersWithTruckDetails = await Promise.all(
        ordersWithTrucks.map(async (order) => {
          if (order.assignedTruckId) {
            try {
              const truckRes = await api.get(`/trucks/${order.assignedTruckId}/details`);
              return {
                ...order,
                truckDetails: truckRes.data.data
              };
            } catch (err) {
              console.error('Error fetching truck details:', err);
              return order;
            }
          }
          return order;
        })
      );

      setOrders(ordersWithTruckDetails);
    } catch (error) {
      console.error('Error fetching assigned trucks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactDriver = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert('Driver contact not available');
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🚚 Assigned Trucks</h1>
          <button onClick={() => navigate('/farmer-dashboard')} className="btn-logout">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {loading ? (
          <div className="loading">Loading assigned trucks...</div>
        ) : orders.length === 0 ? (
          <div className="no-data">
            <p>📭 No trucks assigned yet</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Trucks will be assigned automatically after clustering
            </p>
          </div>
        ) : (
          <div className="trucks-grid">
            {orders.map((order) => (
              <div key={order._id} className="truck-card">
                <div className="truck-header">
                  <h3>🚛 {order.truckDetails?.truckNumber || order.truckNumber || 'Pending'}</h3>
                  <span className={`status-badge ${order.requestStatus}`}>
                    {order.requestStatus}
                  </span>
                </div>
                
                <div className="truck-details">
                  <div className="detail-section">
                    <h4>📦 Order Details</h4>
                    <p><strong>Order ID:</strong> {order.orderId}</p>
                    <p><strong>Crop:</strong> {order.cropId?.cropName || order.cropType}</p>
                    <p><strong>Quantity:</strong> {order.quantity} {order.unit}</p>
                    <p><strong>Buyer:</strong> {order.buyerId?.businessName}</p>
                  </div>

                  {order.truckDetails && (
                    <div className="detail-section">
                      <h4>🚚 Truck Details</h4>
                      <p><strong>Driver:</strong> {order.truckDetails.fullName}</p>
                      <p><strong>Contact:</strong> {order.truckDetails.phone}</p>
                      <p><strong>Vehicle:</strong> {order.truckDetails.vehicleType}</p>
                      <p><strong>Capacity:</strong> {order.truckDetails.capacity} kg</p>
                      <p><strong>Status:</strong> {order.truckDetails.status}</p>
                    </div>
                  )}

                  <div className="detail-section">
                    <h4>📍 Locations</h4>
                    <p><strong>Pickup:</strong> {order.pickupAddress || 'Your farm'}</p>
                    <p><strong>Delivery:</strong> {order.deliveryAddress}</p>
                  </div>

                  {order.truckDetails && (
                    <div className="truck-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => handleContactDriver(order.truckDetails.phone)}
                      >
                        📞 Call Driver
                      </button>
                    </div>
                  )}
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
