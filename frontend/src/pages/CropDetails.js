import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function CropDetails() {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const response = await api.get(`/crops/${cropId}`);
        setCrop(response.data.crop);
      } catch (error) {
        console.error('Error fetching crop details:', error);
        alert('Error loading crop details');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchCropDetails();
  }, [cropId, navigate]);

  if (loading) {
    return <div className="loading">Loading crop details...</div>;
  }

  if (!crop) {
    return <div className="error">Crop not found</div>;
  }

  const getCropEmoji = (category) => {
    const emojiMap = {
      'Vegetables': '🥬',
      'Fruits': '🍎',
      'Grains': '🌾',
      'Pulses': '🫘',
      'Spices': '🌶️',
      'Others': '🌱'
    };
    return emojiMap[category] || '🌾';
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>🌾 Crop Details</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/marketplace')} className="btn-secondary">
            Back to Marketplace
          </button>
        </div>
      </header>

      <div className="crop-details-container">
        <div className="crop-details-content">
          {/* Image Gallery */}
          <div className="image-gallery">
            <div className="main-image">
              {crop.cropImages && crop.cropImages.length > 0 ? (
                <img 
                  src={crop.cropImages[selectedImage]} 
                  alt={crop.cropName}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="no-image">
                  <span className="crop-emoji-large">{getCropEmoji(crop.category)}</span>
                  <p>No images available</p>
                </div>
              )}
            </div>
            
            {crop.cropImages && crop.cropImages.length > 1 && (
              <div className="thumbnail-gallery">
                {crop.cropImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${crop.cropName} ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Crop Information */}
          <div className="crop-info-section">
            <div className="crop-header">
              <h2>{crop.cropName}</h2>
              <div className="badges">
                {crop.isOrganic && <span className="badge organic">🌱 Organic</span>}
                <span className="badge grade">Grade {crop.qualityGrade}</span>
              </div>
            </div>

            <div className="price-display">
              <div className="main-price">
                <span className="price-label">Price:</span>
                <span className="price-value">₹{crop.pricePerUnit}/{crop.unit}</span>
              </div>
              {crop.isPriceNegotiable && (
                <span className="negotiable-tag">💬 Negotiable</span>
              )}
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>Category:</label>
                <span>{crop.category} {crop.subCategory && `- ${crop.subCategory}`}</span>
              </div>
              <div className="info-item">
                <label>Variety:</label>
                <span>{crop.variety || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Available Quantity:</label>
                <span>{crop.quantity} {crop.unit}</span>
              </div>
              <div className="info-item">
                <label>Minimum Order:</label>
                <span>{crop.minimumOrderQuantity || 1} {crop.unit}</span>
              </div>
              <div className="info-item">
                <label>Harvest Date:</label>
                <span>{crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Quality Grade:</label>
                <span>Grade {crop.qualityGrade}</span>
              </div>
            </div>

            <div className="farmer-section">
              <h3>👨‍🌾 Farmer Information</h3>
              <div className="farmer-details">
                <p><strong>Name:</strong> {crop.farmerName || 'N/A'}</p>
                <p><strong>Location:</strong> {crop.district}, {crop.state}</p>
                {crop.farmerPhone && <p><strong>Phone:</strong> {crop.farmerPhone}</p>}
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="btn-primary btn-large"
                onClick={() => navigate(`/order/request/${crop._id}`)}
              >
                📤 Send Order Request
              </button>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/marketplace')}
              >
                Back to Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .crop-details-container {
          max-width: 1200px;
          margin: 20px auto;
          padding: 0 20px;
        }

        .crop-details-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .image-gallery {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .main-image {
          width: 100%;
          height: 400px;
          background-color: #f5f5f5;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          text-align: center;
        }

        .crop-emoji-large {
          font-size: 120px;
          display: block;
          margin-bottom: 10px;
        }

        .thumbnail-gallery {
          display: flex;
          gap: 10px;
          overflow-x: auto;
        }

        .thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s;
        }

        .thumbnail:hover {
          border-color: var(--primary-green);
        }

        .thumbnail.active {
          border-color: var(--primary-green);
          box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .crop-info-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .crop-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }

        .crop-header h2 {
          margin: 0;
          color: #333;
        }

        .badges {
          display: flex;
          gap: 8px;
        }

        .badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .badge.organic {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .badge.grade {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .price-display {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .main-price {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .price-label {
          font-size: 16px;
          color: #666;
        }

        .price-value {
          font-size: 32px;
          font-weight: bold;
          color: var(--primary-green);
        }

        .negotiable-tag {
          background-color: #fff3e0;
          color: #e65100;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 14px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .info-item label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .info-item span {
          font-size: 16px;
          color: #333;
        }

        .farmer-section {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
        }

        .farmer-section h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .farmer-details p {
          margin: 8px 0;
          color: #555;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }

        .btn-large {
          flex: 1;
          padding: 15px;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .crop-details-content {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default CropDetails;
