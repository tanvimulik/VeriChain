import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function IncomingOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/farmer/orders/incoming');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClick = (order) => {
    setSelectedOrder(order);
    setShowAcceptModal(true);
    setResponseMessage('');
  };

  const handleAcceptOrder = async () => {
    try {
      await api.put(`/orders/${selectedOrder._id}/accept`, {
        responseMessage: responseMessage || 'Order accepted',
      });
      alert('Order accepted successfully!');
      setShowAcceptModal(false);
      setSelectedOrder(null);
      setResponseMessage('');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Error accepting order');
    }
  };

  const handleReject = async (orderId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return;
    
    try {
      await api.put(`/orders/${orderId}/reject`, {
        responseMessage: reason || 'Order rejected',
      });
      alert('Order rejected');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Error rejecting order');
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🛒 Incoming Orders</h1>
          <button onClick={() => navigate('/farmer-dashboard')} className="btn-logout">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {orders.length === 0 ? (
          <div className="no-data">
            <p>📭 No incoming orders at the moment</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.orderId}</h3>
                  <span className="status-badge pending">Pending</span>
                </div>
                <div className="order-body">
                  <p><strong>Buyer:</strong> {order.buyerId?.businessName}</p>
                  <p><strong>Crop:</strong> {order.cropId?.cropName}</p>
                  <p><strong>Quantity:</strong> {order.quantity} {order.unit}</p>
                  <p><strong>Price Offered:</strong> ₹{order.totalAmount}</p>
                  <p><strong>Delivery Type:</strong> Direct Delivery</p>
                  {order.deliveryAddress && (
                    <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                  )}
                  {order.buyerNotes && (
                    <p><strong>Buyer Notes:</strong> {order.buyerNotes}</p>
                  )}
                </div>
                <div className="order-actions">
                  <button
                    className="btn-success"
                    onClick={() => handleAcceptClick(order)}
                  >
                    ✅ Accept
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleReject(order._id)}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAcceptModal && (
        <div className="modal-overlay" onClick={() => setShowAcceptModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Accept Order</h2>
            <p>Confirm that you want to accept this order?</p>

            <div className="form-group">
              <label>Response Message (Optional)</label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Add any message for the buyer..."
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-success"
                onClick={handleAcceptOrder}
              >
                Confirm Accept
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedOrder(null);
                  setResponseMessage('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncomingOrders;
