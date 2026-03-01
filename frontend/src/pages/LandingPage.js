import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('preferredLanguage', lng);
  };

  return (
    <div className="landing-page">
      {/* Font Awesome for icons */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />

      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            <div className="top-bar-left">
              <span><i className="fas fa-phone"></i> +91 98765 43210</span>
              <span><i className="fas fa-envelope"></i> support@farmconnect.com</span>
            </div>
            <div className="top-bar-right">
              <select 
                className="language-select"
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                <option value="en">🇬🇧 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
                <option value="mr">🇮🇳 मराठी</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-leaf"></i>
              <h1>FarmConnect</h1>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>

            {/* Navigation */}
            <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
              <a href="#home">{t('landing.home')}</a>
              <a href="#how-it-works">{t('landing.howItWorks')}</a>
              <a href="#features">{t('landing.about')}</a>
              <div className="nav-buttons">
                <button className="btn-outline" onClick={() => navigate('/login/farmer')}>
                  <i className="fas fa-tractor"></i>
                  {t('landing.farmerLogin')}
                </button>
                <button className="btn-primary" onClick={() => navigate('/login/buyer')}>
                  <i className="fas fa-shopping-cart"></i>
                  {t('landing.buyerLogin')}
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {/* Hero Section */}
<section className="hero-section" id="home">
  <div className="container">
    <div className="hero-content">
      <div className="hero-text">
        <span className="hero-badge">Welcome to FarmConnect</span>
        <h1>
          FarmConnect - Direct Farm to <br />
          <span className="highlight">Market</span>
        </h1>
        <h1 style={{ fontSize: '2rem', marginTop: '-10px', color: '#333' }}>
          Fresh & Organic
        </h1>
        <p>Connect farmers directly with buyers for fair prices</p>
        <div className="hero-buttons">
          <button
            className="btn-primary btn-large"
            onClick={() => navigate('/register/farmer')}
          >
            <i className="fas fa-tractor"></i>
            I am a Farmer
          </button>
          <button
            className="btn-secondary btn-large"
            onClick={() => navigate('/register/buyer')}
          >
            <i className="fas fa-shopping-bag"></i>
            I am a Buyer
          </button>
          <button
            className="btn-truck btn-large"
            onClick={() => navigate('/register/truck')}
          >
            <i className="fas fa-truck"></i>
            Become a Delivery Partner
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Happy Farmers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50K+</span>
            <span className="stat-label">Happy Buyers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100+</span>
            <span className="stat-label">Cities</span>
          </div>
        </div>
      </div>
      <div className="hero-image">
        <div className="image-grid">
          <span className="grid-item">🌽</span>
          <span className="grid-item">🍅</span>
          <span className="grid-item">🥕</span>
          <span className="grid-item">🌾</span>
          <span className="grid-item">🍎</span>
          <span className="grid-item">🥬</span>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">What We Offer</span>
            <h2 className="section-title">{t('landing.forFarmers')}</h2>
            <p className="section-description">Empowering farmers with technology and direct market access</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#E8F5E9' }}>
                <i className="fas fa-seedling" style={{ color: '#2E7D32' }}></i>
              </div>
              <h3>{t('landing.farmerFeatures.listCrops')}</h3>
              <p>{t('landing.farmerFeatures.listCropsDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#FFF3E0' }}>
                <i className="fas fa-chart-line" style={{ color: '#F57C00' }}></i>
              </div>
              <h3>{t('landing.farmerFeatures.priceComparison')}</h3>
              <p>{t('landing.farmerFeatures.priceComparisonDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#E3F2FD' }}>
                <i className="fas fa-truck" style={{ color: '#1976D2' }}></i>
              </div>
              <h3>{t('landing.farmerFeatures.truckAssignment')}</h3>
              <p>{t('landing.farmerFeatures.truckAssignmentDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#F3E5F5' }}>
                <i className="fas fa-shield-alt" style={{ color: '#7B1FA2' }}></i>
              </div>
              <h3>{t('landing.farmerFeatures.securePayment')}</h3>
              <p>{t('landing.farmerFeatures.securePaymentDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#FFEBEE' }}>
                <i className="fas fa-star" style={{ color: '#C2185B' }}></i>
              </div>
              <h3>{t('landing.farmerFeatures.ratings')}</h3>
              <p>{t('landing.farmerFeatures.ratingsDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#E0F2F1' }}>
                <i className="fas fa-warehouse" style={{ color: '#00796B' }}></i>
              </div>
              <h3>{t('landing.farmerFeatures.storage')}</h3>
              <p>{t('landing.farmerFeatures.storageDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Buyers Section */}
      <section className="features-section bg-light">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Fresh & Direct</span>
            <h2 className="section-title">{t('landing.forBuyers')}</h2>
            <p className="section-description">Get fresh farm produce directly from farmers</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#E8F5E9' }}>
                <i className="fas fa-apple-alt" style={{ color: '#2E7D32' }}></i>
              </div>
              <h3>{t('landing.buyerFeatures.freshProduce')}</h3>
              <p>{t('landing.buyerFeatures.freshProduceDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#FFF3E0' }}>
                <i className="fas fa-balance-scale" style={{ color: '#F57C00' }}></i>
              </div>
              <h3>{t('landing.buyerFeatures.comparePrices')}</h3>
              <p>{t('landing.buyerFeatures.comparePricesDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#E3F2FD' }}>
                <i className="fas fa-user-check" style={{ color: '#1976D2' }}></i>
              </div>
              <h3>{t('landing.buyerFeatures.farmerDetails')}</h3>
              <p>{t('landing.buyerFeatures.farmerDetailsDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#F3E5F5' }}>
                <i className="fas fa-clock" style={{ color: '#7B1FA2' }}></i>
              </div>
              <h3>{t('landing.buyerFeatures.flexibleDelivery')}</h3>
              <p>{t('landing.buyerFeatures.flexibleDeliveryDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#FFEBEE' }}>
                <i className="fas fa-map-marked-alt" style={{ color: '#C2185B' }}></i>
              </div>
              <h3>{t('landing.buyerFeatures.trackCrops')}</h3>
              <p>{t('landing.buyerFeatures.trackCropsDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#E0F2F1' }}>
                <i className="fas fa-lock" style={{ color: '#00796B' }}></i>
              </div>
              <h3>{t('landing.buyerFeatures.securePayment')}</h3>
              <p>{t('landing.buyerFeatures.securePaymentDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Truck Driver Section */}
      <section className="truck-section">
        <div className="container">
          <div className="truck-content">
            <div className="truck-text">
              <span className="truck-badge">🚛 Logistics Partner</span>
              <h2>{t('landing.forTruckDrivers')}</h2>
              <p className="truck-tagline">{t('landing.truckTagline')}</p>
              
              <div className="truck-features">
                <div className="truck-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>{t('landing.truckFeatures.earnMore')}</span>
                </div>
                <div className="truck-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>{t('landing.truckFeatures.multiStop')}</span>
                </div>
                <div className="truck-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>{t('landing.truckFeatures.smartRoutes')}</span>
                </div>
                <div className="truck-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>{t('landing.truckFeatures.instantPayment')}</span>
                </div>
              </div>

              <button
                className="btn-truck-large"
                onClick={() => navigate('/register/truck')}
              >
                {t('landing.registerAsTruck')} 
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <div className="truck-image">
              <div className="truck-emoji">🚛</div>
              <div className="floating-emoji">📦</div>
              <div className="floating-emoji">📍</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Simple Process</span>
            <h2 className="section-title">{t('landing.howItWorksTitle')}</h2>
            <p className="section-description">Three easy steps to start your journey with FarmConnect</p>
          </div>
          
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <h3>{t('landing.step1')}</h3>
              <p>{t('landing.step1Desc')}</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <i className="fas fa-hand-holding-heart"></i>
              </div>
              <h3>{t('landing.step2')}</h3>
              <p>{t('landing.step2Desc')}</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <i className="fas fa-truck-loading"></i>
              </div>
              <h3>{t('landing.step3')}</h3>
              <p>{t('landing.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of farmers, buyers, and logistics partners on FarmConnect</p>
            <div className="cta-buttons">
              <button className="btn-primary btn-large" onClick={() => navigate('/register/farmer')}>
                <i className="fas fa-tractor"></i>
                Join as Farmer
              </button>
              <button className="btn-secondary btn-large" onClick={() => navigate('/register/buyer')}>
                <i className="fas fa-shopping-bag"></i>
                Join as Buyer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo">
                <i className="fas fa-leaf"></i>
                <span>FarmConnect</span>
              </div>
              <p>Connecting farmers directly to markets, ensuring fair prices and fresh produce.</p>
              <div className="social-links">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-whatsapp"></i></a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#">About Us</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>For Farmers</h4>
              <ul>
                <li><button onClick={() => navigate('/register/farmer')}>Register as Farmer</button></li>
                <li><button onClick={() => navigate('/login/farmer')}>Farmer Login</button></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Success Stories</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>For Buyers</h4>
              <ul>
                <li><button onClick={() => navigate('/register/buyer')}>Register as Buyer</button></li>
                <li><button onClick={() => navigate('/login/buyer')}>Buyer Login</button></li>
                <li><a href="#">How to Order</a></li>
                <li><a href="#">Delivery Areas</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <ul className="contact-info">
                <li><i className="fas fa-phone"></i> +91 98765 43210</li>
                <li><i className="fas fa-envelope"></i> support@farmconnect.com</li>
                <li><i className="fas fa-map-marker-alt"></i> Pune, Maharashtra</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 FarmConnect. All rights reserved. | Made with ❤️ for Indian Farmers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;