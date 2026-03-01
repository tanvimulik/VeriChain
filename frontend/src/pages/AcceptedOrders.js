import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './AcceptedOrders.css';

function AcceptedOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcceptedOrders();
  }, []);

  const fetchAcceptedOrders = async () => {
    try {
      const response = await api.get('/orders/buyer/accepted-orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching accepted orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = (orderId) => {
    navigate(`/payment/${orderId}`);
  };

  const isPaymentCompleted = (order) => {
    return order.paymentStatus === 'paid';
  };

  const handleChatWithFarmer = async (order) => {
    try {
      const response = await api.post('/chats/create', {
        farmerId: order.farmerId?._id || order.farmerId,
        cropId: order.cropId?._id || order.cropId
      });
      const chatId = response.data.data._id;
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Unable to start chat. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="amazon-orders-page">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="amazon-orders-page">
      {/* Header */}
      <div className="orders-header">
        <h1>Your Orders</h1>
      </div>

      {/* Orders List */}
      <div className="orders-container">
        {orders.length === 0 ? (
          <div className="no-orders">
            <h2>No orders yet</h2>
            <p>When farmers accept your requests, they'll appear here</p>
            <button onClick={() => navigate('/marketplace')}>Browse Marketplace</button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-box">
              {/* Order Header Bar */}
              <div className="order-header-bar">
                <div className="order-header-group">
                  <div className="header-item">
                    <span className="header-label">ORDER PLACED</span>
                    <span className="header-value">
                      {new Date(order.farmerResponseDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="header-item">
                    <span className="header-label">TOTAL</span>
                    <span className="header-value">₹{order.totalAmount}</span>
                  </div>
                  <div className="header-item">
                    <span className="header-label">FARMER</span>
                    <span className="header-value">{order.farmerName}</span>
                  </div>
                </div>
                <div className="order-header-right">
                  <span className="header-label">ORDER # {order.orderId}</span>
                </div>
              </div>

              {/* Order Content */}
              <div className="order-content">
                {/* Left Side - Product Info */}
                <div className="order-left">
                  <div className="delivery-status">
                    {isPaymentCompleted(order) ? (
                      <h3 className="status-paid">Payment Completed</h3>
                    ) : (
                      <h3 className="status-pending">Payment Pending</h3>
                    )}
                  </div>

                  <div className="product-info">
                    <div className="product-image">
                      <div className="crop-icon">🌾</div>
                    </div>
                    <div className="product-details">
                      <h4>{order.cropType}</h4>
                      <p className="product-meta">Quantity: {order.quantity} {order.unit}</p>
                      <p className="product-meta">Price: ₹{order.pricePerUnit}/{order.unit}</p>
                      {order.farmerResponseMessage && (
                        <div className="farmer-note">
                          <strong>Farmer's Note:</strong> {order.farmerResponseMessage}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="order-actions">
                    {!isPaymentCompleted(order) ? (
                      <button 
                        className="btn-primary-action"
                        onClick={() => handleProceedToPayment(order._id)}
                      >
                        Complete Payment
                      </button>
                    ) : (
                      <button 
                        className="btn-secondary-action"
                        onClick={() => navigate(`/track-delivery/${order._id}`)}
                      >
                        Track Package
                      </button>
                    )}
                    <button 
                      className="btn-secondary-action"
                      onClick={() => handleChatWithFarmer(order)}
                    >
                      Contact Farmer
                    </button>
                  </div>
                </div>

                {/* Right Side - Order Details */}
                <div className="order-right">
                  <div className="order-summary">
                    <h4>Order Summary</h4>
                    <div className="summary-row">
                      <span>Crop Cost:</span>
                      <span>₹{order.farmerPrice}</span>
                    </div>
                    <div className="summary-row">
                      <span>Transport:</span>
                      <span>₹{order.transportCost}</span>
                    </div>
                    <div className="summary-row">
                      <span>Platform Fee:</span>
                      <span>₹{order.platformFee}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Order Total:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {order.farmerPhone && (
                    <div className="contact-info">
                      <p><strong>Farmer Contact:</strong></p>
                      <p>{order.farmerPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AcceptedOrders;
