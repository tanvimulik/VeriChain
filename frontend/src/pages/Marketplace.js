import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import './Marketplace.css';

function Marketplace() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await apiClient.get('/crops/available');
      setCrops(response.data.crops || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crops:', error);
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter(crop =>
    crop.cropType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlaceOrder = (cropId) => {
    navigate(`/order/review/${cropId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="marketplace-page">
      {/* Header */}
      <header className="marketplace-header">
        <div className="header-content">
          <div className="logo">
            <span>🌾</span>
            <h1>FarmConnect</h1>
          </div>
          <div className="user-menu">
            <button onClick={() => navigate('/buyer/dashboard')}>📊 Dashboard</button>
            <button onClick={handleLogout} className="btn-danger">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="marketplace-container">
        <h2>🛒 Fresh Produce from Farmers</h2>
        <p>Browse fresh crops directly from verified farmers</p>

        {/* Search Bar */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Search crops (Wheat, Tomato, Potato, etc.)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="btn-primary">Search</button>
        </div>

        {/* Today's Market Prices */}
        <section className="market-prices">
          <h3>📊 Today's Market Prices</h3>
          <div className="price-grid">
            <div className="price-card">
              <h4>🧅 Onion</h4>
              <p className="price">₹22/kg</p>
              <p className="location">Pune</p>
            </div>
            <div className="price-card">
              <h4>🍅 Tomato</h4>
              <p className="price">₹18/kg</p>
              <p className="location">Nashik</p>
            </div>
            <div className="price-card">
              <h4>🥔 Potato</h4>
              <p className="price">₹15/kg</p>
              <p className="location">Solapur</p>
            </div>
            <div className="price-card">
              <h4>🌾 Wheat</h4>
              <p className="price">₹20/kg</p>
              <p className="location">Baramati</p>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && <div className="loader">Loading crops...</div>}

        {/* Available Crops */}
        <section className="available-crops">
          <h3>🥕 Available Crops</h3>
          {filteredCrops.length === 0 ? (
            <p>No crops available at the moment</p>
          ) : (
            <div className="crops-grid">
              {filteredCrops.map((crop) => (
                <div key={crop._id} className="crop-card">
                  <div className="crop-header">
                    <h3>{crop.cropType}</h3>
                    <span className="verified-badge">✓ Verified Farmer</span>
                  </div>

                  <div className="crop-info">
                    <div className="info-row">
                      <span>Farmer:</span>
                      <span className="value">{crop.farmerName || 'Farmer Name'}</span>
                    </div>
                    <div className="info-row">
                      <span>Location:</span>
                      <span className="value">{crop.farmerLocation || 'Location'}</span>
                    </div>
                    <div className="info-row">
                      <span>Available Qty:</span>
                      <span className="value">{crop.quantity} kg</span>
                    </div>
                    <div className="info-row">
                      <span>Harvest Date:</span>
                      <span className="value">
                        {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="price-section">
                    <div className="price-row">
                      <span>Mandi Price:</span>
                      <span className="mandi-price">₹{crop.mandiPrice}/kg</span>
                    </div>
                    <div className="price-row highlight">
                      <span>Farmer Price:</span>
                      <span className="farmer-price">₹{crop.farmerAskingPrice}/kg</span>
                    </div>
                    <div className="price-row">
                      <span>Est. Transport:</span>
                      <span className="transport">₹{crop.estimatedTransportCost || 0}</span>
                    </div>
                    <div className="total-row">
                      <span>Total for {crop.quantity}kg:</span>
                      <span className="total">₹{crop.farmerAskingPrice * crop.quantity}</span>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    onClick={() => handlePlaceOrder(crop._id)}
                  >
                    Place Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="marketplace-footer">
        <p>© 2024 FarmConnect. Direct Farm to Market. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Marketplace;
