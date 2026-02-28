import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function MyRatings() {
  const navigate = useNavigate();
  const [ratingsData, setRatingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState({});

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await api.get('/farmer/ratings');
      setRatingsData(response.data.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (ratingId) => {
    try {
      await api.post(`/farmer/ratings/${ratingId}/respond`, {
        response: responseText[ratingId],
      });
      alert('Response submitted successfully');
      setResponseText({ ...responseText, [ratingId]: '' });
      fetchRatings();
    } catch (error) {
      alert('Error submitting response');
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>⭐ Ratings & Reviews</h1>
        <button onClick={() => navigate('/farmer-dashboard')} className="btn-secondary">
          Back to Dashboard
        </button>
      </header>

      <div className="dashboard-container">
        {loading ? (
          <p>Loading...</p>
        ) : !ratingsData ? (
          <p>No ratings yet</p>
        ) : (
          <>
            <div className="ratings-summary">
              <h2>Average Rating: {ratingsData.averageRating} ⭐</h2>
              <p>Total Reviews: {ratingsData.totalReviews}</p>
            </div>

            <div className="ratings-list">
              {ratingsData.ratings.map((rating) => (
                <div key={rating._id} className="rating-card">
                  <div className="rating-header">
                    <strong>{rating.buyerName}</strong>
                    <span className="rating-stars">{'⭐'.repeat(rating.rating)}</span>
                  </div>
                  <p className="rating-comment">{rating.comment}</p>
                  <p className="rating-date">{new Date(rating.createdAt).toLocaleDateString()}</p>

                  {rating.farmerResponse ? (
                    <div className="farmer-response">
                      <strong>Your Response:</strong>
                      <p>{rating.farmerResponse}</p>
                    </div>
                  ) : (
                    <div className="response-form">
                      <textarea
                        placeholder="Write your response..."
                        value={responseText[rating._id] || ''}
                        onChange={(e) =>
                          setResponseText({ ...responseText, [rating._id]: e.target.value })
                        }
                      />
                      <button
                        className="btn-primary"
                        onClick={() => handleRespond(rating._id)}
                        disabled={!responseText[rating._id]}
                      >
                        Submit Response
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyRatings;
