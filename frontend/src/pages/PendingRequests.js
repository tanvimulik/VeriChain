import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function PendingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/buyer/pending-requests');
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending_farmer_approval: { 
        text: 'Waiting for Farmer', 
        class: 'pending', 
        icon: '⏳',
        color: '#F57C00',
        bgColor: '#FFF3E0'
      },
      farmer_accepted: { 
        text: 'Accepted', 
        class: 'success', 
        icon: '✅',
        color: '#2E7D32',
        bgColor: '#E8F5E8'
      },
      farmer_rejected: { 
        text: 'Rejected', 
        class: 'danger', 
        icon: '❌',
        color: '#F44336',
        bgColor: '#FFEBEE'
      },
    };
    return badges[status] || { 
      text: status, 
      class: 'default', 
      icon: '📋',
      color: '#666',
      bgColor: '#f0f0f0'
    };
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.requestStatus === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.requestStatus === 'pending_farmer_approval').length,
    accepted: requests.filter(r => r.requestStatus === 'farmer_accepted').length,
    rejected: requests.filter(r => r.requestStatus === 'farmer_rejected').length,
  };

  return (
    <div className="pending-requests-page">
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
              <i className="fas fa-hourglass-half"></i>
              Pending Order Requests
            </h1>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/marketplace')} 
              className="btn-primary"
            >
              <i className="fas fa-store"></i>
              Browse Market
            </button>
            <button 
              onClick={() => navigate('/buyer/dashboard')} 
              className="btn-outline"
            >
              <i className="fas fa-arrow-left"></i>
              Dashboard
            </button>
          </div>
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
                <span className="stat-label">Total Requests</span>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.pending}</span>
                <span className="stat-label">Waiting</span>
              </div>
            </div>
            <div className="stat-card accepted">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.accepted}</span>
                <span className="stat-label">Accepted</span>
              </div>
            </div>
            <div className="stat-card rejected">
              <div className="stat-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.rejected}</span>
                <span className="stat-label">Rejected</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Requests
              {stats.total > 0 && <span className="count">{stats.total}</span>}
            </button>
            <button
              className={`filter-tab pending ${filter === 'pending_farmer_approval' ? 'active' : ''}`}
              onClick={() => setFilter('pending_farmer_approval')}
            >
              <span className="dot" style={{ background: '#F57C00' }}></span>
              Waiting
              {stats.pending > 0 && <span className="count">{stats.pending}</span>}
            </button>
            <button
              className={`filter-tab accepted ${filter === 'farmer_accepted' ? 'active' : ''}`}
              onClick={() => setFilter('farmer_accepted')}
            >
              <span className="dot" style={{ background: '#2E7D32' }}></span>
              Accepted
              {stats.accepted > 0 && <span className="count">{stats.accepted}</span>}
            </button>
            <button
              className={`filter-tab rejected ${filter === 'farmer_rejected' ? 'active' : ''}`}
              onClick={() => setFilter('farmer_rejected')}
            >
              <span className="dot" style={{ background: '#F44336' }}></span>
              Rejected
              {stats.rejected > 0 && <span className="count">{stats.rejected}</span>}
            </button>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <p>
              Showing <strong>{filteredRequests.length}</strong> request{filteredRequests.length !== 1 ? 's' : ''}
              {filter !== 'all' && ` in selected filter`}
            </p>
          </div>

          {/* Requests Grid */}
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin fa-3x"></i>
              <p>Loading your requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox fa-3x"></i>
              <h3>No requests found</h3>
              <p>
                {filter !== 'all' 
                  ? `You don't have any ${filter.replace('_', ' ')} requests` 
                  : "You haven't made any purchase requests yet"}
              </p>
              <button 
                onClick={() => navigate('/marketplace')} 
                className="btn-primary"
              >
                <i className="fas fa-store"></i>
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="requests-grid">
              {filteredRequests.map((request) => {
                const badge = getStatusBadge(request.requestStatus);
                return (
                  <div key={request._id} className="request-card">
                    <div className="card-header">
                      <div className="header-left">
                        <div className="request-id">
                          <i className="fas fa-hashtag"></i>
                          {request.orderId || request._id.slice(-8)}
                        </div>
                        <span 
                          className="status-badge"
                          style={{ 
                            background: badge.bgColor, 
                            color: badge.color 
                          }}
                        >
                          {badge.icon} {badge.text}
                        </span>
                      </div>
                      <div className="request-date">
                        <i className="far fa-calendar-alt"></i>
                        {new Date(request.requestDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="crop-info">
                        <h3>{request.cropType}</h3>
                        {request.cropVariety && (
                          <span className="variety">{request.cropVariety}</span>
                        )}
                      </div>

                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">
                            <i className="fas fa-user"></i>
                            Farmer
                          </span>
                          <span className="info-value">{request.farmerName}</span>
                        </div>

                        <div className="info-item">
                          <span className="info-label">
                            <i className="fas fa-weight"></i>
                            Quantity
                          </span>
                          <span className="info-value">{request.quantity} {request.unit}</span>
                        </div>

                        <div className="info-item">
                          <span className="info-label">
                            <i className="fas fa-tag"></i>
                            Price
                          </span>
                          <span className="info-value price">₹{request.pricePerUnit}/{request.unit}</span>
                        </div>

                        <div className="info-item">
                          <span className="info-label">
                            <i className="fas fa-truck"></i>
                            Delivery
                          </span>
                          <span className="info-value">
                            {request.deliveryType === 'fpo' ? 'FPO Storage' : 'Direct'}
                          </span>
                        </div>
                      </div>

                      {request.selectedFPO && (
                        <div className="fpo-info">
                          <i className="fas fa-building"></i>
                          <div>
                            <strong>FPO:</strong> {request.selectedFPO.name}
                          </div>
                        </div>
                      )}

                      <div className="price-breakdown">
                        <h4>Price Breakdown</h4>
                        <div className="breakdown-item">
                          <span>Crop Cost</span>
                          <span>₹{request.farmerPrice}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Transport</span>
                          <span>₹{request.transportCost}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Platform Fee</span>
                          <span>₹{request.platformFee}</span>
                        </div>
                        <div className="breakdown-item total">
                          <span>Total Amount</span>
                          <span>₹{request.totalAmount}</span>
                        </div>
                      </div>

                      {request.buyerNotes && (
                        <div className="notes-section">
                          <i className="fas fa-pencil-alt"></i>
                          <p>{request.buyerNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <button 
                        className="btn-secondary"
                        onClick={() => navigate(`/order-details/${request._id}`)}
                      >
                        <i className="fas fa-eye"></i>
                        View Details
                      </button>
                      {request.requestStatus === 'farmer_accepted' && (
                        <button 
                          className="btn-primary"
                          onClick={() => navigate(`/payment/${request._id}`)}
                        >
                          <i className="fas fa-credit-card"></i>
                          Proceed to Payment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .pending-requests-page {
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

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary {
          background: #2E7D32;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
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

        .btn-outline {
          background: transparent;
          border: 2px solid #2E7D32;
          color: #2E7D32;
          padding: 12px 24px;
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

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
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
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .stat-card.total::before { background: #2E7D32; }
        .stat-card.pending::before { background: #F57C00; }
        .stat-card.accepted::before { background: #2E7D32; }
        .stat-card.rejected::before { background: #F44336; }

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
          transition: all 0.3s ease;
        }

        .stat-card.total .stat-icon {
          background: #E8F5E8;
          color: #2E7D32;
        }

        .stat-card.pending .stat-icon {
          background: #FFF3E0;
          color: #F57C00;
        }

        .stat-card.accepted .stat-icon {
          background: #E8F5E8;
          color: #2E7D32;
        }

        .stat-card.rejected .stat-icon {
          background: #FFEBEE;
          color: #F44336;
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.1);
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          display: block;
          font-size: 2.2rem;
          font-weight: 700;
          color: #333;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          background: white;
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: #666;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-tab:hover {
          background: #f5f5f5;
        }

        .filter-tab.active {
          background: #2E7D32;
          color: white;
          box-shadow: 0 4px 10px rgba(46, 125, 50, 0.2);
        }

        .filter-tab.pending.active {
          background: #F57C00;
        }

        .filter-tab.accepted.active {
          background: #2E7D32;
        }

        .filter-tab.rejected.active {
          background: #F44336;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .filter-tab .count {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .filter-tab.active .count {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        /* Results Summary */
        .results-summary {
          margin-bottom: 20px;
          color: #666;
          font-size: 0.95rem;
        }

        .results-summary strong {
          color: #2E7D32;
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

        /* Requests Grid */
        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 25px;
        }

        .request-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .request-card:hover {
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

        .request-id {
          font-weight: 600;
          color: #2E7D32;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .request-id i {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .status-badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .request-date {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #666;
          font-size: 0.85rem;
        }

        .card-body {
          padding: 20px;
        }

        .crop-info {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px dashed #e0e0e0;
        }

        .crop-info h3 {
          font-size: 1.4rem;
          color: #2E7D32;
          margin: 0 0 5px 0;
        }

        .variety {
          color: #666;
          font-size: 0.9rem;
          background: #f0f0f0;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.85rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-label i {
          width: 16px;
          color: #2E7D32;
        }

        .info-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .info-value.price {
          color: #2E7D32;
        }

        .fpo-info {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #E8F5E8;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .fpo-info i {
          color: #2E7D32;
          font-size: 1.2rem;
        }

        .price-breakdown {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .price-breakdown h4 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 1rem;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .breakdown-item:last-child {
          border-bottom: none;
        }

        .breakdown-item.total {
          margin-top: 8px;
          padding-top: 12px;
          border-top: 2px solid #2E7D32;
          font-weight: 700;
          color: #2E7D32;
        }

        .notes-section {
          display: flex;
          gap: 10px;
          background: #FFF3E0;
          padding: 12px;
          border-radius: 10px;
        }

        .notes-section i {
          color: #F57C00;
        }

        .notes-section p {
          margin: 0;
          color: #666;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .card-footer {
          padding: 20px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 12px;
        }

        .card-footer button {
          flex: 1;
          justify-content: center;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .requests-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 15px;
          }
          
          .header-actions {
            width: 100%;
          }
          
          .header-actions button {
            flex: 1;
          }
          
          .filter-tabs {
            justify-content: center;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .card-footer {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-tabs {
            flex-direction: column;
          }
          
          .filter-tab {
            width: 100%;
            justify-content: center;
          }
          
          .card-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default PendingRequests;