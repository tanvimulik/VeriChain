import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Dashboard.css';

function TrackDelivery() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Hardcoded tracking data
  const trackingData = {
    orderId: orderId || 'ORD002',
    cropName: 'Fresh Onions',
    farmerName: 'Suresh Kumar',
    quantity: 200,
    currentStatus: 'in_transit',
    truckNumber: 'MH-12-CD-5678',
    driverName: 'Prakash Jadhav',
    driverPhone: '+91-9876543211',
    estimatedDelivery: '2024-02-28',
    timeline: [
      {
        status: 'Order Confirmed',
        timestamp: '2024-02-25 10:30 AM',
        completed: true,
        icon: '✅',
      },
      {
        status: 'Payment Received',
        timestamp: '2024-02-25 10:35 AM',
        completed: true,
        icon: '💰',
      },
      {
        status: 'Truck Assigned',
        timestamp: '2024-02-25 02:00 PM',
        completed: true,
        icon: '🚚',
        details: 'Truck MH-12-CD-5678 assigned',
      },
      {
        status: 'Picked from Farm',
        timestamp: '2024-02-26 08:00 AM',
        completed: true,
        icon: '📦',
        details: 'Collected from Nashik, Maharashtra',
      },
      {
        status: 'In Transit',
        timestamp: '2024-02-26 10:00 AM',
        completed: true,
        icon: '🛣️',
        details: 'On the way to Pune',
      },
      {
        status: 'Out for Delivery',
        timestamp: 'Expected: 2024-02-28 09:00 AM',
        completed: false,
        icon: '🚛',
      },
      {
        status: 'Delivered',
        timestamp: 'Expected: 2024-02-28 12:00 PM',
        completed: false,
        icon: '🎉',
      },
    ],
  };

  const handleConfirmDelivery = () => {
    if (window.confirm('Have you received the order in good condition?')) {
      alert('Delivery confirmed! Please rate the farmer.');
      navigate(`/rate-farmer/${trackingData.orderId}`);
    }
  };

  const handleContactDriver = () => {
    window.location.href = `tel:${trackingData.driverPhone}`;
  };

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
              <p><strong>Quantity:</strong> {trackingData.quantity} Kg</p>
              <p><strong>Expected Delivery:</strong> {new Date(trackingData.estimatedDelivery).toLocaleDateString()}</p>
            </div>

            {/* Truck Info */}
            <div className="truck-info">
              <h3>🚚 Truck Details</h3>
              <p><strong>Truck Number:</strong> {trackingData.truckNumber}</p>
              <p><strong>Driver:</strong> {trackingData.driverName}</p>
              <p><strong>Contact:</strong> {trackingData.driverPhone}</p>
              <button className="btn-primary" onClick={handleContactDriver}>
                📞 Call Driver
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="tracking-timeline">
            <h3>📦 Order Timeline</h3>
            <div className="timeline">
              {trackingData.timeline.map((event, index) => (
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
