import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './Marketplace.css';

function EnhancedMarketplace() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    state: '',
    district: '',
    organicOnly: false,
    minPrice: '',
    maxPrice: '',
    sortBy: 'nearest',
  });
  const [loading, setLoading] = useState(true);

  const buyerDistrict = 'Pune'; // TODO: Get from buyer profile

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...crops];

      if (searchTerm) {
        filtered = filtered.filter(crop =>
          crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crop.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crop.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (filters.category) {
        filtered = filtered.filter(crop => crop.category === filters.category);
      }

      if (filters.state) {
        filtered = filtered.filter(crop => crop.state === filters.state);
      }

      if (filters.district) {
        filtered = filtered.filter(crop => crop.district === filters.district);
      }

      if (filters.organicOnly) {
        filtered = filtered.filter(crop => crop.isOrganic);
      }

      if (filters.minPrice) {
        filtered = filtered.filter(crop => crop.pricePerUnit >= parseFloat(filters.minPrice));
      }

      if (filters.maxPrice) {
        filtered = filtered.filter(crop => crop.pricePerUnit <= parseFloat(filters.maxPrice));
      }

      if (filters.sortBy === 'price_low') {
        filtered.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
      } else if (filters.sortBy === 'price_high') {
        filtered.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
      } else if (filters.sortBy === 'quantity') {
        filtered.sort((a, b) => b.quantity - a.quantity);
      } else if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => (b.farmerRating || 0) - (a.farmerRating || 0));
      } else if (filters.sortBy === 'nearest') {
        filtered.sort((a, b) => {
          const aIsLocal = a.district === buyerDistrict ? 0 : 1;
          const bIsLocal = b.district === buyerDistrict ? 0 : 1;
          return aIsLocal - bIsLocal;
        });
      }

      setFilteredCrops(filtered);
    };

    applyFilters();
  }, [searchTerm, filters, crops, buyerDistrict]);

  const fetchCrops = async () => {
    try {
      const response = await api.get('/crops/available');
      const cropsData = response.data.data || response.data.crops || [];
      setCrops(cropsData);
      setFilteredCrops(cropsData);
    } catch (error) {
      console.error('Error fetching crops:', error);
      alert(t('marketplace.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      state: '',
      district: '',
      organicOnly: false,
      minPrice: '',
      maxPrice: '',
      sortBy: 'nearest',
    });
    setSearchTerm('');
  };

  const calculateSavings = (crop) => {
    const savings = crop.mandiPrice - crop.pricePerUnit;
    return savings > 0 ? savings : 0;
  };

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

  const handleChatWithFarmer = async (crop) => {
    try {
      const farmerId = crop.farmerId?._id || crop.farmerId;
      const response = await api.post('/chats/create', {
        farmerId: farmerId,
        cropId: crop._id
      });
      
      if (response.data.success) {
        navigate(`/chat/${response.data.data._id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  return (
    <div className="marketplace-page">
      <header className="marketplace-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/buyer/dashboard')}>
            <span>🌾</span>
            <h1>{t('marketplace.title')}</h1>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/buyer/dashboard')} className="btn-secondary">
              {t('marketplace.dashboard')}
            </button>
            <button onClick={() => navigate('/cart')} className="btn-primary">
              {t('marketplace.cart')} (0)
            </button>
          </div>
        </div>
      </header>

      <div className="marketplace-container">
        {/* Search Section */}
        <div className="search-section">
          <input
            type="text"
            placeholder={t('marketplace.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="btn-primary">{t('marketplace.search')}</button>
        </div>

        <div className="marketplace-content">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>{t('marketplace.filters')}</h3>
              <button onClick={clearFilters} className="btn-link">{t('marketplace.clearAll')}</button>
            </div>

            <div className="filter-group">
              <label>{t('marketplace.category')}</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">{t('marketplace.allCategories')}</option>
                <option value="Vegetables">{t('marketplace.vegetables')}</option>
                <option value="Fruits">{t('marketplace.fruits')}</option>
                <option value="Grains">{t('marketplace.grains')}</option>
                <option value="Pulses">{t('marketplace.pulses')}</option>
              </select>
            </div>

            <div className="filter-group">
              <label>{t('marketplace.state')}</label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
              >
                <option value="">{t('marketplace.allStates')}</option>
                <option value="Maharashtra">{t('marketplace.maharashtra')}</option>
                <option value="Karnataka">{t('marketplace.karnataka')}</option>
                <option value="Gujarat">{t('marketplace.gujarat')}</option>
              </select>
            </div>

            <div className="filter-group">
              <label>{t('marketplace.district')}</label>
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
              >
                <option value="">{t('marketplace.allDistricts')}</option>
                <option value="Pune">{t('marketplace.pune')}</option>
                <option value="Nashik">{t('marketplace.nashik')}</option>
                <option value="Solapur">{t('marketplace.solapur')}</option>
                <option value="Satara">{t('marketplace.satara')}</option>
              </select>
            </div>

            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.organicOnly}
                  onChange={(e) => handleFilterChange('organicOnly', e.target.checked)}
                />
                {t('marketplace.organicOnly')}
              </label>
            </div>

            <div className="filter-group">
              <label>{t('marketplace.priceRange')}</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder={t('marketplace.min')}
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <span>{t('marketplace.to')}</span>
                <input
                  type="number"
                  placeholder={t('marketplace.max')}
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>{t('marketplace.sortBy')}</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="nearest">{t('marketplace.nearestFirst')}</option>
                <option value="price-low">{t('marketplace.priceLowToHigh')}</option>
                <option value="price-high">{t('marketplace.priceHighToLow')}</option>
                <option value="rating">{t('marketplace.highestRated')}</option>
              </select>
            </div>
          </aside>

          {/* Crops Grid */}
          <main className="crops-section">
            <div className="crops-header">
              <h2>{t('marketplace.availableCrops')} ({filteredCrops.length})</h2>
              <p className="location-info">{t('marketplace.showingResults')} {buyerDistrict}</p>
            </div>

            {loading ? (
              <div className="loader">{t('marketplace.loadingCrops')}</div>
            ) : filteredCrops.length === 0 ? (
              <div className="no-results">
                <p>{t('marketplace.noCropsFound')}</p>
                <button onClick={clearFilters} className="btn-primary">{t('marketplace.clearFilters')}</button>
              </div>
            ) : (
              <div className="crops-grid">
                {filteredCrops.map((crop) => (
                  <div key={crop._id} className="crop-card">
                    <div className="crop-image">
                      {crop.cropImages && crop.cropImages.length > 0 ? (
                        <img 
                          src={crop.cropImages[0]} 
                          alt={crop.cropName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="40"%3E🌾%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="crop-emoji">{getCropEmoji(crop.category)}</div>
                      )}
                      {crop.cropImages && crop.cropImages.length > 1 && (
                        <span className="image-count">+{crop.cropImages.length - 1} {t('marketplace.imageCount')}</span>
                      )}
                    </div>
                    
                    <div className="crop-badges">
                      {crop.isOrganic && <span className="badge organic">{t('marketplace.organic')}</span>}
                      {crop.district === buyerDistrict && <span className="badge local">{t('marketplace.local')}</span>}
                      <span className="badge grade">{t('marketplace.grade')} {crop.qualityGrade}</span>
                    </div>

                    <h3>{crop.cropName}</h3>
                    <p className="variety">{crop.variety || crop.subCategory}</p>

                    <div className="farmer-info">
                      <p><strong>👨‍🌾 {crop.farmerName || crop.farmerId?.fullName || 'Farmer'}</strong></p>
                      <p className="rating">⭐ {crop.farmerId?.rating || 4.0} {t('marketplace.rating')}</p>
                      <p className="location">📍 {crop.district}, {crop.state}</p>
                    </div>

                    <div className="crop-details">
                      <p><strong>{t('marketplace.available')}:</strong> {crop.quantity} {crop.unit}</p>
                      <p><strong>{t('marketplace.harvest')}:</strong> {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}</p>
                    </div>

                    <div className="price-section">
                      {crop.mandiPrice && (
                        <div className="price-row">
                          <span>{t('marketplace.mandiPrice')}:</span>
                          <span className="mandi-price">₹{crop.mandiPrice}/kg</span>
                        </div>
                      )}
                      <div className="price-row highlight">
                        <span>{t('marketplace.ourPrice')}:</span>
                        <span className="our-price">₹{crop.pricePerUnit}/{crop.unit}</span>
                      </div>
                      {crop.estimatedTransportCost && (
                        <div className="price-row">
                          <span>{t('marketplace.transport')}:</span>
                          <span>₹{crop.estimatedTransportCost}</span>
                        </div>
                      )}
                      {crop.mandiPrice && calculateSavings(crop) > 0 && (
                        <div className="savings">
                          {t('marketplace.save')} ₹{calculateSavings(crop)}/kg
                        </div>
                      )}
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn-chat"
                        onClick={() => handleChatWithFarmer(crop)}
                        title="Chat with Farmer"
                      >
                        💬
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => navigate(`/crop-details/${crop._id}`)}
                      >
                        {t('marketplace.viewDetails')}
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => navigate(`/order/request/${crop._id}`)}
                      >
                        {t('marketplace.sendRequest')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default EnhancedMarketplace;
