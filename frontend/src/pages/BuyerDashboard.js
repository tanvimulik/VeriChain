//BuyerDashboard.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

function BuyerDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const buyerName = localStorage.getItem('buyerName') || 'Buyer';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('buyerName');
    navigate('/');
  };

  const handleEmailSignup = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with email: ${email}`);
      setEmail('');
    }
  };

  // Dashboard data
  const stats = [
    { 
      label: 'Total Orders', 
      value: '24', 
      change: '+12%', 
      icon: 'fa-shopping-bag',
      color: '#2E7D32',
      bgColor: '#E8F5E8'
    },
    { 
      label: 'Pending Orders', 
      value: '3', 
      status: 'Active',
      icon: 'fa-clock',
      color: '#F57C00',
      bgColor: '#FFF3E0'
    },
    { 
      label: 'Completed Orders', 
      value: '21', 
      change: '+100%',
      icon: 'fa-check-circle',
      color: '#2E7D32',
      bgColor: '#E8F5E8'
    },
    { 
      label: 'Total Spent', 
      value: '₹45,680', 
      change: '+18%',
      icon: 'fa-rupee-sign',
      color: '#2E7D32',
      bgColor: '#E8F5E8'
    }
  ];

  const quickActions = [
    { label: 'Browse Products', icon: 'fa-leaf', path: '/marketplace' },
    { label: 'My Orders', icon: 'fa-clipboard-list', path: '/buyer-orders' },
    { label: 'Pending Requests', icon: 'fa-hourglass-half', path: '/buyer/pending-requests' },
    { label: 'Track Delivery', icon: 'fa-truck', path: '/track-delivery' },
    { label: 'Accepted Orders', icon: 'fa-check-circle', path: '/buyer/accepted-orders' },
    { label: 'Payments', icon: 'fa-credit-card', path: '/buyer-payments' }
  ];

  const categories = [
    { name: 'Vegetables', icon: 'fa-carrot', color: '#4CAF50' },
    { name: 'Fruits', icon: 'fa-apple-whole', color: '#FF9800' },
    { name: 'Dairy', icon: 'fa-cheese', color: '#2196F3' },
    { name: 'Grains', icon: 'fa-wheat-awn', color: '#FFC107' },
    { name: 'Organic', icon: 'fa-seedling', color: '#8BC34A' },
    { name: 'Herbs', icon: 'fa-spa', color: '#9C27B0' },
    { name: 'Spices', icon: 'fa-pepper-hot', color: '#F44336' },
    { name: 'Flowers', icon: 'fa-fan', color: '#E91E63' }
  ];

  const promotionalBanners = [
    {
      title: 'Fresh Vegetables',
      subtitle: 'Big Discount',
      discount: 'Save up to 50%',
      image: '🥬',
      color: 'linear-gradient(135deg, #4CAF50, #8BC34A)'
    },
    {
      title: 'Organic Fruits',
      subtitle: 'Premium Quality',
      discount: '20% OFF',
      image: '🍎',
      color: 'linear-gradient(135deg, #FF9800, #FFC107)'
    },
    {
      title: 'Farm Fresh',
      subtitle: 'Direct from Farmers',
      discount: 'Best Prices',
      image: '🌾',
      color: 'linear-gradient(135deg, #2196F3, #03A9F4)'
    }
  ];

  const popularProducts = [
    {
      id: 1,
      name: 'Fresh Organic Tomatoes',
      price: 40,
      originalPrice: 80,
      discount: 50,
      image: '🍅',
      rating: 4.5,
      reviews: 128
    },
    {
      id: 2,
      name: 'Premium Spinach Bundle',
      price: 30,
      originalPrice: 50,
      discount: 40,
      image: '🥬',
      rating: 4.3,
      reviews: 89
    },
    {
      id: 3,
      name: 'Organic Carrots',
      price: 35,
      originalPrice: 60,
      discount: 42,
      image: '🥕',
      rating: 4.7,
      reviews: 156
    },
    {
      id: 4,
      name: 'Fresh Potatoes',
      price: 25,
      originalPrice: 40,
      discount: 38,
      image: '🥔',
      rating: 4.2,
      reviews: 95
    },
    {
      id: 5,
      name: 'Quality Onions',
      price: 20,
      originalPrice: 35,
      discount: 43,
      image: '🧅',
      rating: 4.4,
      reviews: 112
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
            <button className="profile-btn" onClick={() => navigate('/buyer-profile')}>
              <i className="fas fa-user-circle"></i>
              <span>{buyerName}</span>
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
            <h1>Fresh Vegetables - Big Discount</h1>
            <p>Save up to 50% off on your first order</p>
            <button className="hero-cta" onClick={() => navigate('/marketplace')}>
              Shop Now <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="hero-image">
            <div className="floating-emoji">🥬</div>
            <div className="floating-emoji" style={{ animationDelay: '1s' }}>🍅</div>
            <div className="floating-emoji" style={{ animationDelay: '2s' }}>🥕</div>
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <section className="email-signup">
        <div className="signup-container">
          <h3>Get Exclusive Deals</h3>
          <p>Subscribe to our newsletter for special offers</p>
          <form className="signup-form" onSubmit={handleEmailSignup}>
            <input
              type="email"
              placeholder="Enter your email address"
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
                  <div className="stat-change positive">
                    <i className="fas fa-arrow-up"></i>
                    <span>{stat.change}</span>
                  </div>
                )}
                {stat.status && (
                  <div className="stat-badge">
                    <span>{stat.status}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
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
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div key={index} className="category-item">
              <div className="category-icon" style={{ backgroundColor: category.color }}>
                <i className={`fas ${category.icon}`}></i>
              </div>
              <span>{category.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="promo-banners">
        <div className="banners-grid">
          {promotionalBanners.map((banner, index) => (
            <div key={index} className="promo-card" style={{ background: banner.color }}>
              <div className="promo-content">
                <h3>{banner.title}</h3>
                <p>{banner.subtitle}</p>
                <span className="promo-discount">{banner.discount}</span>
                <button className="promo-cta" onClick={() => navigate('/marketplace')}>
                  Shop Now
                </button>
              </div>
              <div className="promo-image">
                <span className="promo-emoji">{banner.image}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section className="popular-products">
        <div className="section-header">
          <h2>Popular Products</h2>
          <button className="view-all-btn" onClick={() => navigate('/marketplace')}>
            View All <i className="fas fa-arrow-right"></i>
          </button>
        </div>
        <div className="products-grid">
          {popularProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <span className="product-emoji">{product.image}</span>
                <div className="discount-badge">
                  -{product.discount}%
                </div>
              </div>
              <div className="product-info">
                <h4>{product.name}</h4>
                <div className="product-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={`fas fa-star ${i < Math.floor(product.rating) ? 'active' : ''}`}
                      ></i>
                    ))}
                  </div>
                  <span>({product.reviews})</span>
                </div>
                <div className="product-price">
                  <span className="current-price">₹{product.price}</span>
                  <span className="original-price">₹{product.originalPrice}</span>
                </div>
                <button 
                  className="add-to-cart"
                  onClick={() => navigate(`/order/review/${product.id}`)}
                >
                  <i className="fas fa-shopping-cart"></i> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>FarmConnect</h4>
            <p>Your trusted platform for fresh farm produce directly from farmers.</p>
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
              <li><a href="/marketplace">Shop</a></li>
              <li><a href="/buyer-orders">My Orders</a></li>
              <li><a href="/buyer-profile">Account</a></li>
              <li><a href="/track-delivery">Track Order</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Policies</h4>
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/refund">Refund Policy</a></li>
              <li><a href="/shipping">Shipping Info</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p><i className="fas fa-phone"></i> +91 98765 43210</p>
            <p><i className="fas fa-envelope"></i> support@farmconnect.com</p>
            <p><i className="fas fa-map-marker-alt"></i> Pune, Maharashtra</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 FarmConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default BuyerDashboard;