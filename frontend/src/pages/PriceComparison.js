import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './Dashboard.css';
import './PriceComparison.css';

// Hardcoded mandi prices (can be replaced with eNAM API)
const MANDI_PRICES = [
  {
    commodity: 'Tomato',
    category: 'Vegetables',
    state: 'Maharashtra',
    market: 'Pune APMC',
    minPrice: 800,
    maxPrice: 1200,
    modalPrice: 1000,
    unit: 'Quintal',
    date: '2024-02-28',
    trend: 'up',
    change: '+5%',
  },
  {
    commodity: 'Onion',
    category: 'Vegetables',
    state: 'Maharashtra',
    market: 'Nashik APMC',
    minPrice: 1500,
    maxPrice: 2000,
    modalPrice: 1800,
    unit: 'Quintal',
    date: '2024-02-28',
    trend: 'down',
    change: '-3%',
  },
  {
    commodity: 'Potato',
    category: 'Vegetables',
    state: 'Maharashtra',
    market: 'Satara APMC',
    minPrice: 1200,
    maxPrice: 1600,
    modalPrice: 1400,
    unit: 'Quintal',
    date: '2024-02-28',
    trend: 'stable',
    change: '0%',
  },
  {
    commodity: 'Wheat',
    category: 'Grains',
    state: 'Maharashtra',
    market: 'Solapur APMC',
    minPrice: 2000,
    maxPrice: 2400,
    modalPrice: 2200,
    unit: 'Quintal',
    date: '2024-02-28',
    trend: 'up',
    change: '+2%',
  },
  {
    commodity: 'Rice',
    category: 'Grains',
    state: 'Maharashtra',
    market: 'Kolhapur APMC',
    minPrice: 3500,
    maxPrice: 4500,
    modalPrice: 4000,
    unit: 'Quintal',
    date: '2024-02-28',
    trend: 'stable',
    change: '0%',
  },
  {
    commodity: 'Mango',
    category: 'Fruits',
    state: 'Maharashtra',
    market: 'Ratnagiri APMC',
    minPrice: 8000,
    maxPrice: 15000,
    modalPrice: 12000,
    unit: 'Quintal',
    date: '2024-02-28',
    trend: 'up',
    change: '+8%',
  },
  {
    commodity: 'Cabbage',
    category: 'Vegetables',
    state: 'Maharashtra',
    market: 'Pune APMC',
    minPrice: 600,
    maxPrice: 900,
    modalPrice: 750,
    unit: 'Quintal',
    date: '2024-02-28',
    trend: 'down',
    change: '-2%',
  },
  {
    commodity: 'Cauliflower',
    category: 'Vegetables',
    state: 'Maharashtra',
    market: 'Pune APMC',
    minPrice: 800,
    maxPrice: 1200,
    modalPrice: 1000,
    unit: 'Quintal',
    date: '2024-02-28',
    trend: 'stable',
    change: '0%',
  },
  {
    commodity: 'Brinjal',
    category: 'Vegetables',
    state: 'Maharashtra',
    market: 'Nashik APMC',
    minPrice: 1000,
    maxPrice: 1500,
    modalPrice: 1250,
    unit: 'Quintal',
    date: '2024-02-28',
    trend: 'up',
    change: '+4%',
  },
  {
    commodity: 'Green Chilli',
    category: 'Vegetables',
    state: 'Maharashtra',
    market: 'Solapur APMC',
    minPrice: 2000,
    maxPrice: 3000,
    modalPrice: 2500,
    unit: 'Quintal',
    date: '2024-02-28',
    trend: 'up',
    change: '+6%',
  },
];

function PriceComparison() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [prices] = useState(MANDI_PRICES);
  const [filteredPrices, setFilteredPrices] = useState(MANDI_PRICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [loading, setLoading] = useState(false);
  const [useRealAPI, setUseRealAPI] = useState(false);
  const userRole = localStorage.getItem('role') || 'buyer';

  const fetchRealPrices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState !== 'all') params.append('state', selectedState);
      if (searchTerm) params.append('commodity', searchTerm);
      
      const response = await api.get(`/prices/mandi-prices?${params.toString()}`);
      
      if (response.data.success) {
        const transformedPrices = response.data.data.map(item => ({
          commodity: item.commodity,
          variety: item.variety,
          market: item.market,
          state: item.state,
          district: item.district,
          minPrice: (item.minPrice / 100).toFixed(2),
          maxPrice: (item.maxPrice / 100).toFixed(2),
          modalPrice: (item.modalPrice / 100).toFixed(2),
          date: item.priceDate,
          category: getCategoryFromCommodity(item.commodity),
          trend: 'stable',
          change: '0%',
        }));
        setFilteredPrices(transformedPrices);
      }
    } catch (error) {
      console.error('Error fetching real prices:', error);
      alert('Failed to fetch real-time prices. Using sample data.');
      setUseRealAPI(false);
      applyFilters();
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromCommodity = (commodity) => {
    const vegetables = ['Onion', 'Tomato', 'Potato', 'Brinjal', 'Cabbage'];
    const fruits = ['Mango', 'Banana', 'Apple', 'Orange', 'Grapes'];
    const grains = ['Wheat', 'Rice', 'Maize', 'Bajra', 'Jowar'];
    
    if (vegetables.includes(commodity)) return 'Vegetables';
    if (fruits.includes(commodity)) return 'Fruits';
    if (grains.includes(commodity)) return 'Grains';
    return 'Others';
  };

  const applyFilters = () => {
    let filtered = [...prices];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.market.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedState !== 'all') {
      filtered = filtered.filter(item => item.state === selectedState);
    }

    setFilteredPrices(filtered);
  };

  useEffect(() => {
    if (useRealAPI) {
      fetchRealPrices();
    } else {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, selectedState, useRealAPI]);

  const refreshPrices = () => {
    setLoading(true);
    if (useRealAPI) {
      fetchRealPrices();
    } else {
      setTimeout(() => {
        setLoading(false);
        alert('Prices refreshed! (Using sample data)');
      }, 1000);
    }
  };

  const toggleAPIMode = () => {
    setUseRealAPI(!useRealAPI);
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <i className="fas fa-arrow-up"></i>;
    if (trend === 'down') return <i className="fas fa-arrow-down"></i>;
    return <i className="fas fa-minus"></i>;
  };

  const getTrendClass = (trend) => {
    if (trend === 'up') return 'trend-up';
    if (trend === 'down') return 'trend-down';
    return 'trend-stable';
  };

  const convertToKg = (pricePerQuintal) => {
    return (pricePerQuintal / 100).toFixed(2);
  };

  const handleBackNavigation = () => {
    if (userRole === 'farmer') {
      navigate('/farmer-dashboard');
    } else {
      navigate('/buyer/dashboard');
    }
  };

  return (
    <div className="price-comparison-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="fas fa-chart-line"></i>
              {t('priceComparison.title')}
            </h1>
            <span className={`api-badge ${useRealAPI ? 'api-live' : 'api-sample'}`}>
              {useRealAPI ? (
                <>
                  <i className="fas fa-cloud"></i>
                  Live Data
                </>
              ) : (
                <>
                  <i className="fas fa-database"></i>
                  Sample Data
                </>
              )}
            </span>
          </div>
          <div className="header-actions">
            <button 
              onClick={toggleAPIMode} 
              className="btn-outline"
              title={useRealAPI ? 'Switch to sample data' : 'Switch to live data'}
            >
              <i className={`fas ${useRealAPI ? 'fa-database' : 'fa-cloud'}`}></i>
              {useRealAPI ? 'Sample Data' : 'Live Data'}
            </button>
            <button 
              onClick={refreshPrices} 
              className="btn-outline" 
              disabled={loading}
            >
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={handleBackNavigation} className="btn-primary">
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="container">
          {/* Info Banner */}
          <div className="info-banner">
            <div className="banner-left">
              <h3>📍 Mandi Price Insights</h3>
              <p>Real-time wholesale prices from APMC markets across India</p>
              <div className="banner-stats">
                <div className="stat">
                  <span className="stat-value">{filteredPrices.length}</span>
                  <span className="stat-label">Commodities</span>
                </div>
                <div className="stat">
                  <span className="stat-value">10+</span>
                  <span className="stat-label">Markets</span>
                </div>
                <div className="stat">
                  <span className="stat-value">Daily</span>
                  <span className="stat-label">Updates</span>
                </div>
              </div>
            </div>
            <div className="banner-right">
              <div className="price-note">
                <p><i className="fas fa-info-circle"></i> Prices are per quintal (100 kg)</p>
                <p><i className="fas fa-star"></i> Modal price = Most common trading price</p>
                <p className="last-updated">
                  <i className="far fa-clock"></i> Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="filters-section">
            <div className="search-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search commodity or market..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-wrapper">
              <div className="filter-group">
                <label>
                  <i className="fas fa-tag"></i>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                </select>
              </div>

              <div className="filter-group">
                <label>
                  <i className="fas fa-map-marker-alt"></i>
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="all">All States</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <p>
              Showing <strong>{filteredPrices.length}</strong> commodities
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              {selectedState !== 'all' && ` from ${selectedState}`}
            </p>
          </div>

          {/* Price Cards Grid */}
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin fa-3x"></i>
              <p>Fetching latest prices...</p>
            </div>
          ) : filteredPrices.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-search fa-3x"></i>
              <h3>No results found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="price-grid">
              {filteredPrices.map((item, index) => (
                <div key={index} className="price-card">
                  <div className="card-header">
                    <div className="commodity-info">
                      <h3>{item.commodity}</h3>
                      <span className="category-chip">{item.category}</span>
                    </div>
                    <span className={`trend-badge ${getTrendClass(item.trend)}`}>
                      {getTrendIcon(item.trend)} {item.change}
                    </span>
                  </div>

                  <div className="market-info">
                    <p className="market-name">
                      <i className="fas fa-store"></i>
                      {item.market}
                    </p>
                    <p className="market-state">
                      <i className="fas fa-map-pin"></i>
                      {item.state}
                    </p>
                  </div>

                  <div className="price-details">
                    <div className="price-row">
                      <span>Min Price</span>
                      <span className="price-value">₹{item.minPrice}</span>
                    </div>
                    <div className="price-row">
                      <span>Max Price</span>
                      <span className="price-value">₹{item.maxPrice}</span>
                    </div>
                    <div className="price-row modal-price">
                      <span>
                        <strong>Modal Price</strong>
                      </span>
                      <span className="price-value modal">
                        <strong>₹{item.modalPrice}</strong>
                      </span>
                    </div>
                    <div className="price-unit">per {item.unit} (100 kg)</div>
                  </div>

                  <div className="price-conversion">
                    <span>≈ ₹{convertToKg(item.modalPrice)}/kg</span>
                  </div>

                  <div className="card-footer">
                    <div className="updated-date">
                      <i className="far fa-calendar-alt"></i>
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    {userRole === 'farmer' && (
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => navigate('/add-crop')}
                      >
                        <i className="fas fa-plus-circle"></i>
                        List at this price
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* API Information */}
          <div className="api-info-section">
            <div className="api-header">
              <i className="fas fa-cloud-sun"></i>
              <h3>Data Source Information</h3>
            </div>
            <div className="api-content">
              <div className="api-details">
                <div className="detail-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <strong>Source:</strong> eNAM (National Agriculture Market)
                  </div>
                </div>
                <div className="detail-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <strong>Coverage:</strong> 1000+ APMC markets across India
                  </div>
                </div>
                <div className="detail-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <strong>Update Frequency:</strong> Daily
                  </div>
                </div>
                <div className="detail-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <strong>Website:</strong> 
                    <a href="https://enam.gov.in" target="_blank" rel="noopener noreferrer">
                      enam.gov.in
                    </a>
                  </div>
                </div>
              </div>
              <div className="api-note">
                <i className="fas fa-lightbulb"></i>
                <p>
                  <strong>For Developers:</strong> Integrate real eNAM API using 
                  <code>https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceComparison;