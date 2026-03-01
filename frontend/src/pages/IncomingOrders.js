import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function IncomingOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
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
        responseMessage: responseMessage || 'Order accepted successfully. Will deliver as per schedule.',
      });
      alert('✅ Order accepted successfully!');
      setShowAcceptModal(false);
      setSelectedOrder(null);
      setResponseMessage('');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Error accepting order');
    }
  };

  const handleReject = async (orderId) => {
    const reason = prompt('Please provide a reason for rejection:', 'Out of stock');
    if (reason === null) return;
    
    try {
      await api.put(`/orders/${orderId}/reject`, {
        responseMessage: reason || 'Order rejected due to unavailability',
      });
      alert('❌ Order rejected');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Error rejecting order');
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    return `${diffDays} day ago`;
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.urgent === (filter === 'urgent'));

  const stats = {
    total: orders.length,
    urgent: orders.filter(o => o.urgent).length,
    today: orders.filter(o => {
      const today = new Date();
      const orderDate = new Date(o.createdAt);
      return orderDate.toDateString() === today.toDateString();
    }).length,
  };

  return (
    <div className="incoming-orders-page">
      {/* Font Awesome */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="fas fa-truck"></i>
              Incoming Orders
            </h1>
            <span className="order-count">{orders.length} pending</span>
          </div>
          <button 
            className="btn-outline"
            onClick={() => navigate('/farmer-dashboard')}
          >
            <i className="fas fa-arrow-left"></i>
            Dashboard
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="container">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Orders</span>
              </div>
            </div>
            <div className="stat-card urgent">
              <div className="stat-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.urgent}</span>
                <span className="stat-label">Urgent</span>
              </div>
            </div>
            <div className="stat-card today">
              <div className="stat-icon">
                <i className="fas fa-calendar-day"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.today}</span>
                <span className="stat-label">Today</span>
              </div>
            </div>
            <div className="stat-card response">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">24h</span>
                <span className="stat-label">Response Time</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <i className="fas fa-list"></i>
              All Orders
              <span className="count">{stats.total}</span>
            </button>
            <button
              className={`filter-tab urgent ${filter === 'urgent' ? 'active' : ''}`}
              onClick={() => setFilter('urgent')}
            >
              <i className="fas fa-exclamation-triangle"></i>
              Urgent
              <span className="count">{stats.urgent}</span>
            </button>
          </div>

          {/* Orders Grid */}
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin fa-3x"></i>
              <p>Loading incoming orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open fa-3x"></i>
              <h3>No incoming orders</h3>
              <p>When buyers place orders, they'll appear here</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/my-listings')}
              >
                <i className="fas fa-eye"></i>
                View Your Listings
              </button>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map((order) => (
                <div key={order._id} className="order-card">
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="header-left">
                      <span className="order-id">#{order.orderId?.slice(-8) || order._id.slice(-8)}</span>
                      {order.urgent && (
                        <span className="urgent-badge">
                          <i className="fas fa-exclamation-circle"></i>
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="header-right">
                      <span className="time-ago">
                        <i className="far fa-clock"></i>
                        {getTimeAgo(order.createdAt)}
                      </span>
                      <span className="status-badge pending">Pending</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    {/* Buyer Info */}
                    <div className="buyer-info">
                      <div className="buyer-avatar">
                        <i className="fas fa-user-circle"></i>
                      </div>
                      <div className="buyer-details">
                        <h4>{order.buyerId?.businessName || 'Buyer'}</h4>
                        <p>
                          <i className="fas fa-map-marker-alt"></i>
                          {order.deliveryAddress?.city || 'Location not specified'}
                        </p>
                      </div>
                    </div>

                    {/* Crop Details */}
                    <div className="crop-details">
                      <div className="crop-icon">
                        <i className="fas fa-seedling"></i>
                      </div>
                      <div className="crop-info">
                        <h3>{order.cropId?.cropName || 'Crop'}</h3>
                        <div className="crop-meta">
                          <span>
                            <i className="fas fa-weight"></i>
                            {order.quantity} {order.unit}
                          </span>
                          <span>
                            <i className="fas fa-tag"></i>
                            ₹{order.totalAmount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <div 
                      className={`expandable-section ${expandedOrder === order._id ? 'expanded' : ''}`}
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    >
                      <div className="expand-header">
                        <span>
                          <i className="fas fa-info-circle"></i>
                          Additional Details
                        </span>
                        <i className={`fas fa-chevron-${expandedOrder === order._id ? 'up' : 'down'}`}></i>
                      </div>
                      
                      {expandedOrder === order._id && (
                        <div className="expand-content">
                          {order.deliveryAddress && (
                            <div className="detail-item">
                              <strong>Delivery Address:</strong>
                              <p>{order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                            </div>
                          )}
                          
                          {order.buyerNotes && (
                            <div className="detail-item notes">
                              <strong>Buyer Notes:</strong>
                              <p>{order.buyerNotes}</p>
                            </div>
                          )}

                          <div className="detail-item">
                            <strong>Delivery Type:</strong>
                            <p>
                              <i className="fas fa-truck"></i>
                              Direct Delivery
                            </p>
                          </div>

                          <div className="detail-item">
                            <strong>Order Date:</strong>
                            <p>{new Date(order.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price Summary */}
                    <div className="price-summary">
                      <div className="price-row">
                        <span>Subtotal</span>
                        <span>₹{order.farmerPrice || order.totalAmount}</span>
                      </div>
                      {order.transportCost > 0 && (
                        <div className="price-row">
                          <span>Transport</span>
                          <span>₹{order.transportCost}</span>
                        </div>
                      )}
                      <div className="price-row total">
                        <span>Total Amount</span>
                        <span>₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer">
                    <button
                      className="btn-success"
                      onClick={() => handleAcceptClick(order)}
                    >
                      <i className="fas fa-check-circle"></i>
                      Accept Order
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleReject(order._id)}
                    >
                      <i className="fas fa-times-circle"></i>
                      Reject
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => navigate(`/order-details/${order._id}`)}
                    >
                      <i className="fas fa-eye"></i>
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accept Modal */}
      {showAcceptModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowAcceptModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-check-circle" style={{ color: '#2E7D32' }}></i>
                Accept Order
              </h2>
              <button className="modal-close" onClick={() => setShowAcceptModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="order-summary">
                <h4>Order Summary</h4>
                <div className="summary-row">
                  <span>Order ID:</span>
                  <strong>#{selectedOrder.orderId?.slice(-8) || selectedOrder._id.slice(-8)}</strong>
                </div>
                <div className="summary-row">
                  <span>Crop:</span>
                  <strong>{selectedOrder.cropId?.cropName}</strong>
                </div>
                <div className="summary-row">
                  <span>Quantity:</span>
                  <strong>{selectedOrder.quantity} {selectedOrder.unit}</strong>
                </div>
                <div className="summary-row">
                  <span>Total Amount:</span>
                  <strong className="amount">₹{selectedOrder.totalAmount}</strong>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-comment"></i>
                  Response Message (Optional)
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Add any message for the buyer (e.g., delivery timeline, quality confirmation...)"
                  rows="4"
                />
                <p className="help-text">
                  This message will be sent to the buyer along with your acceptance
                </p>
              </div>
            </div>

            <div className="modal-footer">
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
              <button
                className="btn-success"
                onClick={handleAcceptOrder}
              >
                <i className="fas fa-check-circle"></i>
                Confirm Acceptance
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .incoming-orders-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #f8f9fa 0%, #f0f7f0 100%);
          min-height: 100vh;
        }

        /* Header */
        .page-header {
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 20px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .header-left h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.8rem;
          color: #2E7D32;
          margin: 0;
        }

        .header-left h1 i {
          font-size: 2rem;
        }

        .order-count {
          background: #FFF3E0;
          color: #F57C00;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .btn-outline {
          background: transparent;
          border: 2px solid #2E7D32;
          color: #2E7D32;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-outline:hover {
          background: #2E7D32;
          color: white;
          transform: translateY(-2px);
        }

        .main-content {
          padding: 30px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 22px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 58px;
          height: 58px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.7rem;
        }

        .stat-card.total .stat-icon {
          background: #E8F5E8;
          color: #2E7D32;
        }

        .stat-card.urgent .stat-icon {
          background: #FFEBEE;
          color: #F44336;
        }

        .stat-card.today .stat-icon {
          background: #E3F2FD;
          color: #1976D2;
        }

        .stat-card.response .stat-icon {
          background: #FFF3E0;
          color: #F57C00;
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 25px;
        }

        .filter-tab {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          color: #666;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .filter-tab:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .filter-tab.active {
          background: #2E7D32;
          color: white;
        }

        .filter-tab.urgent.active {
          background: #F44336;
        }

        .filter-tab .count {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 0.8rem;
          margin-left: 5px;
        }

        .filter-tab.active .count {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .loading-state i {
          color: #2E7D32;
          margin-bottom: 20px;
        }

        .loading-state p {
          color: #666;
          font-size: 1.1rem;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .empty-state i {
          color: #999;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          color: #333;
          margin-bottom: 10px;
          font-size: 1.3rem;
        }

        .empty-state p {
          color: #666;
          margin-bottom: 20px;
        }

        .btn-primary {
          background: #2E7D32;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: #1B5E20;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(46, 125, 50, 0.3);
        }

        /* Orders Grid */
        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 25px;
        }

        .order-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .order-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          padding: 20px;
          background: linear-gradient(135deg, #f8f9fa, #e8f5e8);
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .order-id {
          font-weight: 700;
          color: #2E7D32;
          font-size: 1.1rem;
        }

        .urgent-badge {
          background: #FFEBEE;
          color: #F44336;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .time-ago {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #666;
          font-size: 0.85rem;
        }

        .status-badge.pending {
          background: #FFF3E0;
          color: #F57C00;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .card-body {
          padding: 20px;
        }

        .buyer-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }

        .buyer-avatar i {
          font-size: 2.5rem;
          color: #2E7D32;
        }

        .buyer-details h4 {
          margin: 0 0 4px 0;
          color: #333;
        }

        .buyer-details p {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #666;
          font-size: 0.9rem;
        }

        .crop-details {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 12px;
        }

        .crop-icon i {
          font-size: 2rem;
          color: #2E7D32;
        }

        .crop-info h3 {
          margin: 0 0 8px 0;
          color: #333;
        }

        .crop-meta {
          display: flex;
          gap: 15px;
        }

        .crop-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #666;
          font-size: 0.9rem;
        }

        .expandable-section {
          background: #f8f9fa;
          border-radius: 10px;
          margin-bottom: 20px;
          cursor: pointer;
        }

        .expand-header {
          padding: 12px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #2E7D32;
          font-weight: 500;
        }

        .expand-content {
          padding: 15px;
          border-top: 1px solid #e0e0e0;
        }

        .detail-item {
          margin-bottom: 15px;
        }

        .detail-item:last-child {
          margin-bottom: 0;
        }

        .detail-item strong {
          display: block;
          margin-bottom: 4px;
          color: #333;
          font-size: 0.9rem;
        }

        .detail-item p {
          margin: 0;
          color: #666;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .detail-item.notes p {
          background: #FFF3E0;
          padding: 10px;
          border-radius: 8px;
        }

        .price-summary {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 15px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .price-row:last-child {
          border-bottom: none;
        }

        .price-row.total {
          margin-top: 8px;
          padding-top: 12px;
          border-top: 2px solid #2E7D32;
          font-weight: 700;
          color: #2E7D32;
          font-size: 1.1rem;
        }

        .card-footer {
          padding: 20px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 12px;
        }

        .btn-success,
        .btn-danger,
        .btn-secondary {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-success {
          background: #E8F5E8;
          color: #2E7D32;
        }

        .btn-success:hover {
          background: #2E7D32;
          color: white;
          transform: translateY(-2px);
        }

        .btn-danger {
          background: #FFEBEE;
          color: #F44336;
        }

        .btn-danger:hover {
          background: #F44336;
          color: white;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #666;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
          transform: translateY(-2px);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          color: #333;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #666;
          padding: 5px;
          border-radius: 5px;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: #f0f0f0;
          color: #F44336;
        }

        .modal-body {
          padding: 20px;
        }

        .order-summary {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .order-summary h4 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-row .amount {
          color: #2E7D32;
          font-size: 1.1rem;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.95rem;
          font-family: inherit;
          resize: vertical;
          transition: all 0.3s ease;
        }

        .form-group textarea:focus {
          outline: none;
          border-color: #2E7D32;
          box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
        }

        .help-text {
          margin: 5px 0 0 0;
          color: #999;
          font-size: 0.85rem;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 12px;
        }

        .modal-footer button {
          flex: 1;
          padding: 12px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .orders-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 15px;
          }
          
          .filter-tabs {
            flex-direction: column;
          }
          
          .card-footer {
            flex-direction: column;
          }
          
          .modal-footer {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .card-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          
          .header-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

export default IncomingOrders;