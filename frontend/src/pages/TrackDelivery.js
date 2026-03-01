import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function TrackDelivery() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchTrackingData();
    } else {
      fetchTrackableOrders();
    }
  }, [orderId]);

  const fetchTrackableOrders = async () => {
    try {
      // Fetch all buyer orders that can be tracked
      const response = await api.get('/orders/buyer/orders');
      const allOrders = response.data.data;
      
      // Filter orders that have been accepted or have trucks assigned
      const trackableOrders = allOrders.filter(order => 
        ['accepted', 'truck_assigned', 'in_transit', 'delivered', 'completed'].includes(order.requestStatus) ||
        ['paid', 'truck_assigned', 'in_transit', 'delivered', 'completed'].includes(order.orderStatus)
      );
      
      setOrders(trackableOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingData = async () => {
    if (!orderId) {
      return;
    }

    try {
      // Fetch order details with truck assignment
      const response = await api.get(`/orders/${orderId}`);
      const order = response.data.data;

      // Fetch truck details if assigned
      let truckDetails = null;
      if (order.assignedTruckId) {
        try {
          const truckRes = await api.get(`/trucks/${order.assignedTruckId}/details`);
          truckDetails = truckRes.data.data;
        } catch (err) {
          console.error('Error fetching truck details:', err);
        }
      }

      setTrackingData({
        orderId: order.orderId,
        cropName: order.cropType,
        farmerName: order.farmerName,
        quantity: order.quantity,
        unit: order.unit,
        currentStatus: order.orderStatus,
        truckNumber: truckDetails?.truckNumber || order.truckNumber || 'Not assigned yet',
        driverName: truckDetails?.fullName || order.driverName || 'Pending',
        driverPhone: truckDetails?.phone || order.driverPhone || 'N/A',
        estimatedDelivery: order.estimatedDelivery || 'TBD',
        deliveryAddress: order.deliveryAddress,
        pickupAddress: order.pickupAddress,
        requestStatus: order.requestStatus,
        paymentStatus: order.paymentStatus,
      });
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      alert('Error loading tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getTimeline = () => {
    if (!trackingData) return [];

    const timeline = [];

    // Order Confirmed
    timeline.push({
      status: 'Order Requested',
      timestamp: 'Completed',
      completed: true,
      icon: '📝',
    });

    // Farmer Accepted
    if (trackingData.requestStatus === 'accepted' || trackingData.requestStatus === 'truck_assigned') {
      timeline.push({
        status: 'Farmer Accepted',
        timestamp: 'Completed',
        completed: true,
        icon: '✅',
      });
    }

    // Payment
    if (trackingData.paymentStatus === 'paid') {
      timeline.push({
        status: 'Payment Received',
        timestamp: 'Completed',
        completed: true,
        icon: '💰',
      });
    } else {
      timeline.push({
        status: 'Payment Pending',
        timestamp: 'Awaiting payment',
        completed: false,
        icon: '💳',
      });
    }

    // Truck Assigned
    if (trackingData.requestStatus === 'truck_assigned' || trackingData.currentStatus === 'truck_assigned') {
      timeline.push({
        status: 'Truck Assigned',
        timestamp: 'Completed',
        completed: true,
        icon: '🚚',
        details: `Truck ${trackingData.truckNumber} assigned`,
      });
    } else {
      timeline.push({
        status: 'Awaiting Truck Assignment',
        timestamp: 'Pending clustering',
        completed: false,
        icon: '🚛',
      });
    }

    // In Transit
    if (trackingData.currentStatus === 'in_transit') {
      timeline.push({
        status: 'In Transit',
        timestamp: 'On the way',
        completed: true,
        icon: '🛣️',
        details: `From ${trackingData.pickupAddress}`,
      });
    }

    // Delivered
    if (trackingData.currentStatus === 'delivered' || trackingData.currentStatus === 'completed') {
      timeline.push({
        status: 'Delivered',
        timestamp: 'Completed',
        completed: true,
        icon: '🎉',
      });
    } else {
      timeline.push({
        status: 'Delivery Pending',
        timestamp: 'Expected soon',
        completed: false,
        icon: '📦',
      });
    }

    return timeline;
  };

  const handleConfirmDelivery = () => {
    if (window.confirm('Have you received the order in good condition?')) {
      alert('Delivery confirmed! Please rate the farmer.');
      navigate(`/rate-farmer/${trackingData.orderId}`);
    }
  };

  const handleContactDriver = () => {
    if (trackingData.driverPhone && trackingData.driverPhone !== 'N/A') {
      window.location.href = `tel:${trackingData.driverPhone}`;
    } else {
      alert('Driver contact not available yet');
    }
  };

  if (loading) {
    return <div className="loading">Loading tracking information...</div>;
  }

  // If no orderId, show list of trackable orders
  if (!orderId) {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <h1>📍 Track Deliveries</h1>
          <button onClick={() => navigate('/buyer-dashboard')} className="btn-secondary">
            Back to Dashboard
          </button>
        </header>

        <div className="dashboard-container">
          {orders.length === 0 ? (
            <div className="no-data">
              <p>📭 No orders to track</p>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                Orders will appear here once they are accepted by farmers
              </p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.orderId}</h3>
                    <span className={`status-badge ${order.requestStatus}`}>
                      {order.requestStatus}
                    </span>
                  </div>
                  <div className="order-body">
                    <p><strong>Crop:</strong> {order.cropType}</p>
                    <p><strong>Quantity:</strong> {order.quantity} {order.unit}</p>
                    <p><strong>Farmer:</strong> {order.farmerName}</p>
                    {order.truckNumber && (
                      <p><strong>Truck:</strong> {order.truckNumber}</p>
                    )}
                  </div>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate(`/track-delivery/${order._id}`)}
                  >
                    📍 Track This Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return <div className="error">Order not found</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>📍 Track Delivery</h1>
        <button onClick={() => navigate('/buyer-orders')} className="btn-secondary">
          Back to Orders
        </button>
      </header>

      <div className="dashboard-container">
        <div className="tracking-container">
          {/* Order Summary Card */}
          <div className="tracking-summary">
            <h2>Order #{trackingData.orderId}</h2>
            <div className="summary-details">
              <p><strong>Crop:</strong> {trackingData.cropName}</p>
              <p><strong>Farmer:</strong> {trackingData.farmerName}</p>
              <p><strong>Quantity:</strong> {trackingData.quantity} {trackingData.unit}</p>
              <p><strong>Delivery Address:</strong> {trackingData.deliveryAddress}</p>
              <p><strong>Status:</strong> <span className={`status-badge ${trackingData.currentStatus}`}>{trackingData.currentStatus}</span></p>
            </div>

            {/* Truck Info */}
            <div className="truck-info">
              <h3>🚚 Truck Details</h3>
              {trackingData.truckNumber !== 'Not assigned yet' ? (
                <>
                  <p><strong>Truck Number:</strong> {trackingData.truckNumber}</p>
                  <p><strong>Driver:</strong> {trackingData.driverName}</p>
                  <p><strong>Contact:</strong> {trackingData.driverPhone}</p>
                  {trackingData.driverPhone !== 'N/A' && (
                    <button className="btn-primary" onClick={handleContactDriver}>
                      📞 Call Driver
                    </button>
                  )}
                </>
              ) : (
                <p style={{ color: '#ff9800' }}>⏳ Truck will be assigned after clustering</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="tracking-timeline">
            <h3>📦 Order Timeline</h3>
            <div className="timeline">
              {getTimeline().map((event, index) => (
                <div
                  key={index}
                  className={`timeline-item ${event.completed ? 'completed' : 'pending'}`}
                >
                  <div className="timeline-icon">{event.icon}</div>
                  <div className="timeline-content">
                    <h4>{event.status}</h4>
                    <p className="timeline-time">{event.timestamp}</p>
                    {event.details && <p className="timeline-details">{event.details}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {trackingData.currentStatus === 'out_for_delivery' && (
            <div className="delivery-actions">
              <button className="btn-success" onClick={handleConfirmDelivery}>
                ✅ Confirm Delivery
              </button>
              <button className="btn-secondary" onClick={handleContactDriver}>
                📞 Contact Driver
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackDelivery;
