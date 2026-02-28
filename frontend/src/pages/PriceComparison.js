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
          minPrice: (item.minPrice / 100).toFixed(2), // Convert to per kg
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
    if (!useRealAPI) {
      alert('Switching to real-time API data...');
    } else {
      alert('Switching to sample data...');
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
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
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>{t('priceComparison.title')}</h1>
        <div className="header-actions">
          <button 
            onClick={toggleAPIMode} 
            className={useRealAPI ? 'btn-success' : 'btn-secondary'}
            style={{ marginRight: '10px' }}
          >
            {useRealAPI ? t('priceComparison.realTimeAPI') : t('priceComparison.sampleData')}
          </button>
          <button onClick={refreshPrices} className="btn-secondary" disabled={loading}>
            {loading ? t('priceComparison.refreshing') : t('priceComparison.refreshPrices')}
          </button>
          <button onClick={handleBackNavigation} className="btn-secondary">
            {t('order.backToDashboard')}
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Info Banner */}
        <div className="info-banner">
          <div className="banner-content">
            <h3>{t('priceComparison.infoBanner')}</h3>
            <p>{t('priceComparison.realTimePrices')}</p>
            <p className="last-updated">{t('priceComparison.lastUpdated')}: {new Date().toLocaleString()}</p>
          </div>
          <div className="banner-note">
            <p><strong>{t('priceComparison.noteLabel')}:</strong> {t('priceComparison.pricesInQuintal')}</p>
            <p><strong>{t('priceComparison.modalPrice')}:</strong> {t('priceComparison.mostCommonPrice')}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="price-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder={t('priceComparison.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>{t('priceComparison.category')}:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{t('priceComparison.allCategories')}</option>
              <option value="Vegetables">{t('priceComparison.vegetables')}</option>
              <option value="Fruits">{t('priceComparison.fruits')}</option>
              <option value="Grains">{t('priceComparison.grains')}</option>
            </select>
          </div>

          <div className="filter-group">
            <label>{t('priceComparison.state')}:</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="all">{t('priceComparison.allStates')}</option>
              <option value="Maharashtra">{t('marketplace.maharashtra')}</option>
              <option value="Karnataka">{t('marketplace.karnataka')}</option>
              <option value="Gujarat">{t('marketplace.gujarat')}</option>
            </select>
          </div>
        </div>

        {/* Price Cards Grid */}
        <div className="price-grid">
          {filteredPrices.length === 0 ? (
            <div className="no-results">
              <p>{t('priceComparison.noResults')}</p>
            </div>
          ) : (
            filteredPrices.map((item, index) => (
              <div key={index} className="price-card">
                <div className="price-card-header">
                  <h3>{item.commodity}</h3>
                  <span className={`trend-badge ${getTrendClass(item.trend)}`}>
                    {getTrendIcon(item.trend)} {item.change}
                  </span>
                </div>

                <div className="price-card-body">
                  <div className="market-info">
                    <p className="market-name">📍 {item.market}</p>
                    <p className="market-state">{item.state}</p>
                    <p className="category-badge">{item.category}</p>
                  </div>

                  <div className="price-details">
                    <div className="price-row">
                      <span>{t('priceComparison.minPrice')}:</span>
                      <span className="price-value">₹{item.minPrice}</span>
                    </div>
                    <div className="price-row">
                      <span>{t('priceComparison.maxPrice')}:</span>
                      <span className="price-value">₹{item.maxPrice}</span>
                    </div>
                    <div className="price-row highlight">
                      <span><strong>{t('priceComparison.modalPrice')}:</strong></span>
                      <span className="price-value"><strong>₹{item.modalPrice}</strong></span>
                    </div>
                    <div className="price-row">
                      <span className="unit-text">{t('priceComparison.per')} {item.unit}</span>
                    </div>
                  </div>

                  <div className="price-conversion">
                    <p>≈ ₹{convertToKg(item.modalPrice)}/kg</p>
                  </div>

                  <div className="price-date">
                    <small>{t('priceComparison.updated')}: {new Date(item.date).toLocaleDateString()}</small>
                  </div>
                </div>

                {userRole === 'farmer' && (
                  <div className="price-card-footer">
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => navigate('/add-crop')}
                    >
                      {t('priceComparison.listCropAtPrice')}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* API Information */}
        <div className="api-info">
          <h3>{t('priceComparison.dataSource')}</h3>
          <div className="api-details">
            <p><strong>{t('priceComparison.source')}:</strong> {t('priceComparison.enamSource')}</p>
            <p><strong>{t('priceComparison.managedBy')}:</strong> {t('priceComparison.enamManagement')}</p>
            <p><strong>{t('priceComparison.coverage')}:</strong> {t('priceComparison.enamCoverage')}</p>
            <p><strong>{t('priceComparison.updateFrequency')}:</strong> {t('priceComparison.enamFrequency')}</p>
            <p><strong>{t('priceComparison.website')}:</strong> <a href="https://enam.gov.in" target="_blank" rel="noopener noreferrer">enam.gov.in</a></p>
          </div>
          <div className="api-note">
            <p><strong>Note for Developers:</strong> To integrate real eNAM API:</p>
            <ol>
              <li>Register at <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer">data.gov.in</a></li>
              <li>Get API key for eNAM data access</li>
              <li>Replace hardcoded data with API calls in this component</li>
              <li>API Endpoint: <code>https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceComparison;
