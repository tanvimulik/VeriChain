import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const url = filter === 'all' 
        ? '/farmer/crops/my-listings' 
        : `/farmer/crops/my-listings?status=${filter}`;
      const response = await api.get(url);
      setListings(response.data.data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/farmer/crops/${id}`);
        alert('Listing deleted successfully');
        fetchListings();
      } catch (error) {
        alert('Error deleting listing');
      }
    }
  };

  const handleMarkAsSold = async (id) => {
    try {
      await api.put(`/farmer/crops/${id}`, { listingStatus: 'sold' });
      alert('Marked as sold');
      fetchListings();
    } catch (error) {
      alert('Error updating listing');
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>📦 My Listings</h1>
        <button onClick={() => navigate('/farmer-dashboard')} className="btn-secondary">
          Back to Dashboard
        </button>
      </header>

      <div className="dashboard-container">
        <div className="filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Listings
          </button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={filter === 'sold' ? 'active' : ''}
            onClick={() => setFilter('sold')}
          >
            Sold
          </button>
          <button
            className={filter === 'draft' ? 'active' : ''}
            onClick={() => setFilter('draft')}
          >
            Drafts
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : listings.length === 0 ? (
          <p>No listings found</p>
        ) : (
          <div className="listings-grid">
            {listings.map((crop) => (
              <div key={crop._id} className="listing-card">
                <div className="listing-header">
                  <h3>{crop.cropName}</h3>
                  <span className={`status-badge ${crop.listingStatus}`}>
                    {crop.listingStatus}
                  </span>
                </div>
                
                <div className="listing-details">
                  <p><strong>Category:</strong> {crop.category}</p>
                  {crop.subCategory && <p><strong>Type:</strong> {crop.subCategory}</p>}
                  <p><strong>Quantity:</strong> {crop.quantity} {crop.unit}</p>
                  <p><strong>Price:</strong> ₹{crop.pricePerUnit}/{crop.unit}</p>
                  <p><strong>Quality:</strong> Grade {crop.qualityGrade}</p>
                  {crop.isOrganic && <p className="organic-badge">🌱 Organic</p>}
                  <p><strong>Posted:</strong> {new Date(crop.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="listing-actions">
                  <button className="btn-edit" onClick={() => navigate(`/edit-crop/${crop._id}`)}>
                    Edit
                  </button>
                  {crop.listingStatus === 'active' && (
                    <button className="btn-success" onClick={() => handleMarkAsSold(crop._id)}>
                      Mark as Sold
                    </button>
                  )}
                  <button className="btn-danger" onClick={() => handleDelete(crop._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyListings;
