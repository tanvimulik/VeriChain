import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

// Updated: Professional weather and AI cards with standard sizing

function FarmerDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const farmerName = localStorage.getItem('farmerName') || 'Rajesh Kumar';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('farmerName');
    navigate('/');
  };

  const handleEmailSignup = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with email: ${email}`);
      setEmail('');
    }
  };

  // Fetch weather data
  const fetchWeather = async () => {
    setWeatherLoading(true);
    try {
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Fetch weather from backend
            const response = await fetch(
              `http://localhost:8000/api/weather/current?lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setWeather(data);

            // Fetch AI suggestions
            const token = localStorage.getItem('token');
            if (token) {
              const suggestionsResponse = await fetch(
                `http://localhost:8000/api/weather/farmer-suggestions?temp=${data.temperature}&humidity=${data.humidity}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              const suggestionsData = await suggestionsResponse.json();
              setAiSuggestions(suggestionsData.suggestion);
            }
            
            setWeatherLoading(false);
          },
          (error) => {
            console.error('Location error:', error);
            // Fallback to Pune coordinates
            fetchWeatherByCoords(18.5204, 73.8567);
          }
        );
      } else {
        // Fallback to Pune coordinates
        fetchWeatherByCoords(18.5204, 73.8567);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeatherLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/weather/current?lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      setWeather(data);
      setWeatherLoading(false);
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeatherLoading(false);
    }
  };

  // Fetch weather on component mount
  useEffect(() => {
    fetchWeather();
  }, []);

  // Dashboard statistics
  const stats = [
    { 
      label: 'Total Crops Listed', 
      value: '156', 
      change: '+23%', 
      icon: 'fa-seedling',
      color: '#2E7D32',
      bgColor: '#E8F5E8'
    },
    { 
      label: 'Active Listings', 
      value: '42', 
      status: 'Live',
      icon: 'fa-leaf',
      color: '#F57C00',
      bgColor: '#FFF3E0'
    },
    { 
      label: 'Orders Received', 
      value: '89', 
      change: '+15%',
      icon: 'fa-truck',
      color: '#2196F3',
      bgColor: '#E3F2FD'
    },
    { 
      label: 'Total Earnings', 
      value: '₹1,85,450', 
      change: '+32%',
      icon: 'fa-rupee-sign',
      color: '#2E7D32',
      bgColor: '#E8F5E8'
    }
  ];

  // Quick Actions
  const quickActions = [
    { label: 'List New Crop', icon: 'fa-plus-circle', path: '/add-crop' },
    { label: 'My Listings', icon: 'fa-list', path: '/my-listings' },
    { label: 'Incoming Orders', icon: 'fa-clipboard-list', path: '/incoming-orders' },
    { label: 'Mandi Prices', icon: 'fa-chart-line', path: '/price-comparison' },
    { label: 'Assigned Trucks', icon: 'fa-truck', path: '/assigned-trucks' },
    { label: 'Payments', icon: 'fa-wallet', path: '/my-payments' },
    { label: 'Ratings', icon: 'fa-star', path: '/my-ratings' },
    { label: 'Messages', icon: 'fa-comments', path: '/chats' },
    { label: 'Notifications', icon: 'fa-bell', path: '/my-notifications' }
  ];

  // Crop Categories
  const categories = [
    { name: 'Vegetables', icon: 'fa-carrot', count: 45 },
    { name: 'Fruits', icon: 'fa-apple-whole', count: 32 },
    { name: 'Grains', icon: 'fa-wheat-awn', count: 28 },
    { name: 'Pulses', icon: 'fa-seedling', count: 19 },
    { name: 'Spices', icon: 'fa-pepper-hot', count: 15 },
    { name: 'Oilseeds', icon: 'fa-oil-can', count: 12 },
    { name: 'Organic', icon: 'fa-spa', count: 24 },
    { name: 'Flowers', icon: 'fa-fan', count: 8 }
  ];

  // Recent orders
  const recentOrders = [
    {
      id: 'ORD001',
      crop: 'Organic Tomatoes',
      quantity: '50 kg',
      buyer: 'FreshMart',
      amount: '₹4,000',
      status: 'Pending',
      date: '2024-01-15'
    },
    {
      id: 'ORD002',
      crop: 'Premium Potatoes',
      quantity: '100 kg',
      buyer: 'VeggieHub',
      amount: '₹3,500',
      status: 'Confirmed',
      date: '2024-01-14'
    },
    {
      id: 'ORD003',
      crop: 'Fresh Onions',
      quantity: '75 kg',
      buyer: 'Local Store',
      amount: '₹2,250',
      status: 'Delivered',
      date: '2024-01-13'
    }
  ];

  return (
    <div className="ecommerce-dashboard">
      {/* Font Awesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />

      {/* Sticky Navigation */}
      <header className="sticky-nav">
        <div className="nav-container">
          <div className="nav-left">
            <div className="logo">
              <i className="fas fa-leaf"></i>
              <span>FarmConnect</span>
            </div>
          </div>
          <div className="nav-right">
            <button className="profile-btn" onClick={() => navigate('/farmer-profile')}>
              <i className="fas fa-user-circle"></i>
              <span>{farmerName}</span>
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome back, {farmerName}! 🌾</h1>
            <p>Manage your crops, track orders, and grow your business</p>
            <div className="hero-buttons" style={{ display: 'flex', gap: '1rem' }}>
              <button className="hero-cta" onClick={() => navigate('/add-crop')}>
                <i className="fas fa-plus-circle"></i> List New Crop
              </button>
              <button 
                className="hero-cta" 
                onClick={() => navigate('/price-comparison')}
                style={{ background: 'transparent', border: '2px solid white' }}
              >
                <i className="fas fa-chart-line"></i> Check Mandi Prices
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-emoji">🌽</div>
            <div className="floating-emoji" style={{ animationDelay: '1s' }}>🌾</div>
            <div className="floating-emoji" style={{ animationDelay: '2s' }}>🚜</div>
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <section className="email-signup">
        <div className="signup-container">
          <h3>Get Farming Updates</h3>
          <p>Subscribe for market prices, weather alerts, and farming tips</p>
          <form className="signup-form" onSubmit={handleEmailSignup}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">
              <i className="fas fa-paper-plane"></i> Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Statistics Grid */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
                {stat.change && (
                  <div className="stat-change">
                    <i className="fas fa-arrow-up"></i>
                    <span>{stat.change}</span>
                  </div>
                )}
                {stat.status && (
                  <span className="stat-badge">{stat.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weather & AI Suggestions Widget */}
      <section className="weather-section" key="weather-ai-v2" style={{ 
        maxWidth: '1200px', 
        margin: '2rem auto', 
        padding: '0 1rem' 
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1.5rem' 
        }}>
          {/* Weather Card */}
          <div key="weather-card-v2" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '1.75rem',
            color: 'white',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
            minHeight: '320px',
            maxHeight: '320px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-cloud-sun"></i> Weather Today
                </h3>
                {weather && (
                  <p style={{ margin: '0.25rem 0 0 0', opacity: 0.85, fontSize: '0.85rem' }}>
                    <i className="fas fa-map-marker-alt"></i> {weather.city}
                  </p>
                )}
              </div>
              <button 
                onClick={fetchWeather}
                disabled={weatherLoading}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.4rem 0.8rem',
                  color: 'white',
                  cursor: weatherLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                <i className={`fas fa-sync-alt ${weatherLoading ? 'fa-spin' : ''}`}></i>
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {weatherLoading ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
                  <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading...</p>
                </div>
              ) : weather ? (
                <div>
                  {/* Temperature Display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                      {weather.description?.includes('rain') ? '🌧️' : 
                       weather.description?.includes('cloud') ? '☁️' : 
                       weather.description?.includes('clear') ? '☀️' : '🌤️'}
                    </div>
                    <div>
                      <div style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: 1 }}>
                        {Math.round(weather.temperature)}°C
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.85, textTransform: 'capitalize', marginTop: '0.25rem' }}>
                        {weather.description || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Weather Details */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '0.875rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>💧</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{weather.humidity}%</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '0.1rem' }}>Humidity</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>💨</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{weather.windSpeed} m/s</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '0.1rem' }}>Wind</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>🌡️</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{weather.pressure}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '0.1rem' }}>Pressure</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌤️</div>
                  <p style={{ margin: 0, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Unable to fetch weather</p>
                  <button 
                    onClick={fetchWeather}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Suggestions Card */}
          <div key="ai-card-v2" style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            padding: '1.75rem',
            color: 'white',
            boxShadow: '0 4px 16px rgba(240, 147, 251, 0.25)',
            minHeight: '320px',
            maxHeight: '320px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-robot"></i> AI Farming Tips
              </h3>
            </div>
            
            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {weatherLoading ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
                  <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Generating...</p>
                </div>
              ) : aiSuggestions ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  lineHeight: '1.55',
                  fontSize: '0.875rem',
                  overflowY: 'auto',
                  flex: 1
                }}>
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {aiSuggestions}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  flex: 1
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🤖</div>
                  <p style={{ margin: '0 0 0.75rem 0', lineHeight: '1.5', fontSize: '0.875rem' }}>
                    AI-powered farming suggestions based on weather and your crops
                  </p>
                  <button 
                    onClick={fetchWeather}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      margin: '0 auto'
                    }}
                  >
                    Get Suggestions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-container">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="action-btn"
              onClick={() => navigate(action.path)}
            >
              <i className={`fas ${action.icon}`}></i>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories-section">
        <h2>Your Crop Categories</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div key={index} className="category-item" onClick={() => navigate(`/category/${category.name}`)}>
              <div className="category-icon" style={{ backgroundColor: '#4CAF50' }}>
                <i className={`fas ${category.icon}`}></i>
              </div>
              <span>{category.name}</span>
              <span style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                {category.count} listings
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Orders */}
      <section className="popular-products">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <button className="view-all-btn" onClick={() => navigate('/incoming-orders')}>
            View All <i className="fas fa-arrow-right"></i>
          </button>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#666' }}>Order ID</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#666' }}>Crop</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#666' }}>Buyer</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#666' }}>Quantity</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#666' }}>Amount</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#666' }}>Status</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#666' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: '600', color: '#2E7D32' }}>{order.id}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{order.crop}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{order.buyer}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{order.quantity}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: '600', color: '#2E7D32' }}>{order.amount}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      background: 
                        order.status === 'Pending' ? '#FFF3E0' :
                        order.status === 'Confirmed' ? '#E3F2FD' : '#E8F5E8',
                      color: 
                        order.status === 'Pending' ? '#F57C00' :
                        order.status === 'Confirmed' ? '#1976D2' : '#2E7D32'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <button 
                      onClick={() => navigate(`/order/${order.id}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '6px'
                      }}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>FarmConnect</h4>
            <p>Empowering farmers with direct market access and fair prices.</p>
            <div className="social-links">
              <i className="fab fa-facebook"></i>
              <i className="fab fa-twitter"></i>
              <i className="fab fa-instagram"></i>
              <i className="fab fa-whatsapp"></i>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><button onClick={() => navigate('/add-crop')} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>List New Crop</button></li>
              <li><button onClick={() => navigate('/my-listings')} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>My Listings</button></li>
              <li><button onClick={() => navigate('/price-comparison')} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>Mandi Prices</button></li>
              <li><button onClick={() => navigate('/incoming-orders')} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>Orders</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><button onClick={() => navigate('/farmer-guide')} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>Farmer Guide</button></li>
              <li><button onClick={() => navigate('/faq')} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>FAQ</button></li>
              <li><button onClick={() => navigate('/contact')} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>Contact Us</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p><i className="fas fa-phone"></i> +91 98765 43210</p>
            <p><i className="fas fa-envelope"></i> farmers@farmconnect.com</p>
            <p><i className="fas fa-map-marker-alt"></i> Pune, Maharashtra</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 FarmConnect. All rights reserved. | Made for Indian Farmers</p>
        </div>
      </footer>
    </div>
  );
}

export default FarmerDashboard;