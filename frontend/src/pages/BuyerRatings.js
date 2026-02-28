import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Hardcoded ratings data
const DEMO_RATINGS = [
  {
    _id: 'RAT001',
    orderId: 'ORD001',
    farmerName: 'Ramesh Patil',
    farmerRating: 4.5,
    cropName: 'Organic Tomatoes',
    myRating: 5,
    myReview: 'Excellent quality tomatoes! Fresh and organic as promised. Will order again.',
    date: '2024-02-23',
  },
  {
    _id: 'RAT002',
    orderId: 'ORD002',
    farmerName: 'Suresh Kumar',
    farmerRating: 4.2,
    cropName: 'Fresh Onions',
    myRating: 4,
    myReview: 'Good quality onions. Delivery was on time. Satisfied with the purchase.',
    date: '2024-02-26',
  },
];

const PENDING_RATINGS = [
  {
    orderId: 'ORD005',
    farmerName: 'Ganesh Pawar',
    cropName: 'Organic Mangoes',
    deliveryDate: '2024-02-27',
  },
];

function BuyerRatings() {
  const navigate = useNavigate();
  const [ratings] = useState(DEMO_RATINGS);
  const [pendingRatings] = useState(PENDING_RATINGS);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newRating, setNewRating] = useState({
    rating: 5,
    review: '',
  });

  const handleRateNow = (order) => {
    setSelectedOrder(order);
    setShowRatingForm(true);
  };

  const handleSubmitRating = () => {
    alert(`Rating submitted for ${selectedOrder.farmerName}!`);
    setShowRatingForm(false);
    setSelectedOrder(null);
    setNewRating({ rating: 5, review: '' });
  };

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.myRating, 0) / ratings.length).toFixed(1)
    : 0;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>⭐ My Ratings & Reviews</h1>
        <button onClick={() => navigate('/buyer/dashboard')} className="btn-secondary">
          Back to Dashboard
        </button>
      </header>

      <div className="dashboard-container">
        {/* Summary */}
        <div className="ratings-summary">
          <div className="summary-stat">
            <h3>Average Rating Given</h3>
            <p className="rating-value">{averageRating} ⭐</p>
          </div>
          <div className="summary-stat">
            <h3>Total Reviews</h3>
            <p className="count-value">{ratings.length}</p>
          </div>
          <div className="summary-stat">
            <h3>Pending Ratings</h3>
            <p className="count-value">{pendingRatings.length}</p>
          </div>
        </div>

        {/* Pending Ratings */}
        {pendingRatings.length > 0 && (
          <div className="pending-section">
            <h2>⏳ Pending Ratings</h2>
            <div className="pending-list">
              {pendingRatings.map((order, index) => (
                <div key={index} className="pending-card">
                  <div className="pending-info">
                    <h4>{order.cropName}</h4>
                    <p>Farmer: {order.farmerName}</p>
                    <p>Delivered: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => handleRateNow(order)}
                  >
                    Rate Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Ratings */}
        <div className="ratings-section">
          <h2>📝 My Reviews</h2>
          {ratings.length === 0 ? (
            <div className="no-data">
              <p>You haven't rated any farmers yet</p>
            </div>
          ) : (
            <div className="ratings-list">
              {ratings.map((rating) => (
                <div key={rating._id} className="rating-card">
                  <div className="rating-header">
                    <div>
                      <h3>{rating.farmerName}</h3>
                      <p className="crop-name">{rating.cropName}</p>
                    </div>
                    <div className="rating-stars">
                      {'⭐'.repeat(rating.myRating)}
                    </div>
                  </div>

                  <div className="rating-body">
                    <p className="review-text">{rating.myReview}</p>
                    <p className="review-date">
                      Reviewed on {new Date(rating.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="farmer-info-badge">
                    <span>Farmer's Overall Rating: {rating.farmerRating} ⭐</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating Form Modal */}
      {showRatingForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Rate Your Experience</h2>
            <p>Order: {selectedOrder?.cropName} from {selectedOrder?.farmerName}</p>

            <div className="rating-form">
              <div className="form-group">
                <label>Your Rating</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= newRating.rating ? 'active' : ''}`}
                      onClick={() => setNewRating({ ...newRating, rating: star })}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  rows="4"
                  placeholder="Share your experience with this farmer..."
                  value={newRating.review}
                  onChange={(e) => setNewRating({ ...newRating, review: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button className="btn-primary" onClick={handleSubmitRating}>
                  Submit Rating
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowRatingForm(false);
                    setSelectedOrder(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerRatings;
