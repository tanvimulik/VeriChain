import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchListings = async () => {
    setLoading(true);
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

  const handleDuplicate = async (crop) => {
    const duplicateCrop = {
      ...crop,
      cropName: `${crop.cropName} (Copy)`,
      listingStatus: 'draft',
    };
    delete duplicateCrop._id;
    delete duplicateCrop.createdAt;
    delete duplicateCrop.updatedAt;

    try {
      await api.post('/farmer/crops', duplicateCrop);
      alert('Listing duplicated successfully');
      fetchListings();
    } catch (error) {
      alert('Error duplicating listing');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return '🟢';
      case 'sold': return '💰';
      case 'draft': return '📝';
      default: return '📦';
    }
  };

  const filteredListings = listings.filter(listing => 
    listing.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.listingStatus === 'active').length,
    sold: listings.filter(l => l.listingStatus === 'sold').length,
    draft: listings.filter(l => l.listingStatus === 'draft').length,
  };

  return (
    <div className="my-listings-page">
      {/* Font Awesome for icons */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />

      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="fas fa-list"></i>
              My Listings
            </h1>
            <button 
              className="btn-primary"
              onClick={() => navigate('/add-crop')}
            >
              <i className="fas fa-plus-circle"></i>
              Add New Crop
            </button>
          </div>
          <button 
            className="btn-outline"
            onClick={() => navigate('/farmer-dashboard')}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="container">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Listings</span>
              </div>
            </div>
            <div className="stat-card active">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.active}</span>
                <span className="stat-label">Active</span>
              </div>
            </div>
            <div className="stat-card sold">
              <div className="stat-icon">
                <i className="fas fa-rupee-sign"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.sold}</span>
                <span className="stat-label">Sold</span>
              </div>
            </div>
            <div className="stat-card draft">
              <div className="stat-icon">
                <i className="fas fa-pen"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.draft}</span>
                <span className="stat-label">Drafts</span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="filters-section">
            <div className="search-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search by crop name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
                {stats.total > 0 && <span className="count">{stats.total}</span>}
              </button>
              <button
                className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Active
                {stats.active > 0 && <span className="count">{stats.active}</span>}
              </button>
              <button
                className={`filter-tab ${filter === 'sold' ? 'active' : ''}`}
                onClick={() => setFilter('sold')}
              >
                Sold
                {stats.sold > 0 && <span className="count">{stats.sold}</span>}
              </button>
              <button
                className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
                onClick={() => setFilter('draft')}
              >
                Drafts
                {stats.draft > 0 && <span className="count">{stats.draft}</span>}
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <div className="summary-left">
              <span className="result-count">{filteredListings.length}</span>
              <span className="result-text">
                {filteredListings.length === 1 ? 'listing' : 'listings'} found
                {searchTerm && ` for "${searchTerm}"`}
                {filter !== 'all' && ` in ${filter}`}
              </span>
            </div>
            <div className="summary-right">
              {(searchTerm || filter !== 'all') && (
                <button 
                  className="clear-filters"
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                >
                  <i className="fas fa-times"></i>
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin fa-3x"></i>
              <p>Loading your listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open fa-3x"></i>
              <h3>No listings found</h3>
              <p>
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : filter !== 'all' 
                  ? `You don't have any ${filter} listings yet`
                  : 'Start by adding your first crop listing'}
              </p>
              {!searchTerm && filter === 'all' && (
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/add-crop')}
                >
                  <i className="fas fa-plus-circle"></i>
                  Add Your First Crop
                </button>
              )}
            </div>
          ) : (
            <div className="listings-grid">
              {filteredListings.map((crop) => (
                <div key={crop._id} className="listing-card">
                  <div className="card-header">
                    <div className="header-left">
                      <h3>{crop.cropName}</h3>
                      <span className={`status-badge ${crop.listingStatus}`}>
                        {getStatusIcon(crop.listingStatus)} {crop.listingStatus}
                      </span>
                    </div>
                    {crop.isOrganic && (
                      <span className="organic-badge">
                        <i className="fas fa-leaf"></i>
                        Organic
                      </span>
                    )}
                  </div>

                  <div className="card-body">
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Category</span>
                        <span className="info-value">{crop.category}</span>
                      </div>
                      {crop.subCategory && (
                        <div className="info-item">
                          <span className="info-label">Type</span>
                          <span className="info-value">{crop.subCategory}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="info-label">Quantity</span>
                        <span className="info-value">{crop.quantity} {crop.unit}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Price</span>
                        <span className="info-value price">₹{crop.pricePerUnit}/{crop.unit}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Quality</span>
                        <span className="info-value">Grade {crop.qualityGrade}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Posted</span>
                        <span className="info-value">{new Date(crop.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {crop.cropImages && crop.cropImages.length > 0 && (
                      <div className="image-preview">
                        <img src={crop.cropImages[0]} alt={crop.cropName} />
                        {crop.cropImages.length > 1 && (
                          <span className="image-count">+{crop.cropImages.length - 1}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => navigate(`/edit-crop/${crop._id}`)}
                        title="Edit listing"
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      
                      {crop.listingStatus === 'active' && (
                        <button 
                          className="btn-success"
                          onClick={() => handleMarkAsSold(crop._id)}
                          title="Mark as sold"
                        >
                          <i className="fas fa-check-circle"></i>
                          Mark Sold
                        </button>
                      )}

                      <button 
                        className="btn-duplicate"
                        onClick={() => handleDuplicate(crop)}
                        title="Duplicate listing"
                      >
                        <i className="fas fa-copy"></i>
                        Duplicate
                      </button>

                      <button 
                        className="btn-danger"
                        onClick={() => handleDelete(crop._id)}
                        title="Delete listing"
                      >
                        <i className="fas fa-trash-alt"></i>
                        Delete
                      </button>
                    </div>

                    <div className="listing-meta">
                      <span className="listing-id">ID: {crop._id.slice(-6)}</span>
                      {crop.listingStatus === 'active' && (
                        <span className="views-count">
                          <i className="fas fa-eye"></i> {crop.views || 0} views
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .my-listings-page {
          background: linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%);
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Header */
        .page-header {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
          gap: 20px;
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

        .btn-primary {
          background: #2E7D32;
          color: white;
          border: none;
          padding: 10px 20px;
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
        .stat-card.active::before { background: #2196F3; }
        .stat-card.sold::before { background: #F57C00; }
        .stat-card.draft::before { background: #9C27B0; }

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
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.1);
        }

        .stat-card.total .stat-icon {
          background: #E8F5E8;
          color: #2E7D32;
        }

        .stat-card.active .stat-icon {
          background: #E3F2FD;
          color: #2196F3;
        }

        .stat-card.sold .stat-icon {
          background: #FFF3E0;
          color: #F57C00;
        }

        .stat-card.draft .stat-icon {
          background: #F3E5F5;
          color: #9C27B0;
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
          letter-spacing: 0.3px;
        }

        /* Filters Section */
        .filters-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 15px;
          background: white;
          padding: 16px 20px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .search-wrapper {
          flex: 1;
          min-width: 300px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          font-size: 1rem;
          transition: color 0.3s ease;
        }

        .search-input {
          width: 100%;
          padding: 12px 20px 12px 45px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }

        .search-input:focus {
          outline: none;
          border-color: #2E7D32;
          background: white;
          box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
        }

        .search-input:focus + .search-icon {
          color: #2E7D32;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
          background: #f8f9fa;
          padding: 4px;
          border-radius: 12px;
        }

        .filter-tab {
          padding: 8px 16px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: #666;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-tab:hover {
          background: #e0e0e0;
          color: #333;
        }

        .filter-tab.active {
          background: #2E7D32;
          color: white;
          box-shadow: 0 4px 10px rgba(46, 125, 50, 0.2);
        }

        .filter-tab .count {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .filter-tab.active .count {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        /* Results Summary */
        .results-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          background: white;
          padding: 12px 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .summary-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .result-count {
          background: #2E7D32;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .result-text {
          color: #666;
          font-size: 0.95rem;
        }

        .clear-filters {
          background: #f0f0f0;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-filters:hover {
          background: #e0e0e0;
          color: #F44336;
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

        /* Listings Grid */
        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 25px;
        }

        .listing-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .listing-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          padding: 20px;
          background: linear-gradient(135deg, #f8f9fa, #e8f5e8);
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .header-left h3 {
          font-size: 1.3rem;
          color: #2E7D32;
          margin: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.active {
          background: #E3F2FD;
          color: #1976D2;
        }

        .status-badge.sold {
          background: #FFF3E0;
          color: #F57C00;
        }

        .status-badge.draft {
          background: #F3E5F5;
          color: #7B1FA2;
        }

        .organic-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: #E8F5E8;
          color: #2E7D32;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .card-body {
          padding: 20px;
          display: flex;
          gap: 20px;
        }

        .info-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 0.8rem;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
        }

        .info-value.price {
          color: #2E7D32;
        }

        .image-preview {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-count {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
        }

        .card-footer {
          padding: 15px 20px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }

        .btn-edit,
        .btn-success,
        .btn-duplicate,
        .btn-danger {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-edit {
          background: #E3F2FD;
          color: #1976D2;
        }

        .btn-edit:hover {
          background: #1976D2;
          color: white;
          transform: translateY(-2px);
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

        .btn-duplicate {
          background: #FFF3E0;
          color: #F57C00;
        }

        .btn-duplicate:hover {
          background: #F57C00;
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

        .listing-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: #999;
          border-top: 1px dashed #ddd;
          padding-top: 10px;
        }

        .listing-id {
          font-family: monospace;
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .views-count {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .listings-grid {
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .header-left {
            width: 100%;
            flex-direction: column;
          }
          
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-wrapper {
            min-width: auto;
          }
          
          .filter-tabs {
            width: 100%;
            justify-content: space-between;
          }
          
          .filter-tab {
            flex: 1;
            justify-content: center;
            padding: 8px 8px;
          }
          
          .card-body {
            flex-direction: column;
          }
          
          .image-preview {
            width: 100%;
            height: 150px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-wrap: wrap;
          }
          
          .btn-edit,
          .btn-success,
          .btn-duplicate,
          .btn-danger {
            flex: 1;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .listings-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-tabs {
            flex-wrap: wrap;
          }
          
          .filter-tab {
            width: calc(50% - 4px);
          }
          
          .results-summary {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default MyListings;