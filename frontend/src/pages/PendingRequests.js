import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function PendingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
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
      pending_farmer_approval: { text: 'Waiting for Farmer', class: 'pending', icon: '⏳' },
      farmer_accepted: { text: 'Accepted', class: 'success', icon: '✅' },
      farmer_rejected: { text: 'Rejected', class: 'danger', icon: '❌' },
    };
    return badges[status] || { text: status, class: 'default', icon: '📋' };
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>⏳ Pending Order Requests</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/marketplace')} className="btn-primary">
            Browse More Crops
          </button>
          <button onClick={() => navigate('/buyer/dashboard')} className="btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="no-data">
            <p>No pending requests</p>
            <button onClick={() => navigate('/marketplace')} className="btn-primary">
              Browse Crops
            </button>
          </div>
        ) : (
          <div className="orders-grid">
            {requests.map((request) => {
              const badge = getStatusBadge(request.requestStatus);
              return (
                <div key={request._id} className="order-card">
                  <div className="order-header">
                    <h3>{badge.icon} Request #{request.orderId}</h3>
                    <span className={`status-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <strong>Crop:</strong>
                      <span>{request.cropType}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Farmer:</strong>
                      <span>{request.farmerName}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Quantity:</strong>
                      <span>{request.quantity} {request.unit}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Price:</strong>
                      <span>₹{request.pricePerUnit}/{request.unit}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Total Amount:</strong>
                      <span className="highlight">₹{request.totalAmount}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Delivery:</strong>
                      <span>{request.deliveryType === 'fpo' ? 'FPO Storage' : 'Direct'}</span>
                    </div>
                    {request.selectedFPO && (
                      <div className="detail-row">
                        <strong>FPO:</strong>
                        <span>{request.selectedFPO.name}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <strong>Requested:</strong>
                      <span>{new Date(request.requestDate).toLocaleDateString()}</span>
                    </div>
                    {request.buyerNotes && (
                      <div className="detail-row">
                        <strong>Your Notes:</strong>
                        <span className="notes">{request.buyerNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="price-breakdown">
                    <h4>Price Breakdown</h4>
                    <div className="price-row">
                      <span>Crop Cost:</span>
                      <span>₹{request.farmerPrice}</span>
                    </div>
                    <div className="price-row">
                      <span>Transport:</span>
                      <span>₹{request.transportCost}</span>
                    </div>
                    <div className="price-row">
                      <span>Platform Fee:</span>
                      <span>₹{request.platformFee}</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => navigate(`/order-details/${request._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingRequests;
