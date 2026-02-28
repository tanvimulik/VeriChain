import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('preferredLanguage', lng);
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <span>🌾</span>
            <h1>FarmConnect</h1>
          </div>
          <nav className="nav-links">
            <button>{t('landing.home')}</button>
            <button>{t('landing.howItWorks')}</button>
            <button>{t('landing.about')}</button>
            <select 
              className="language-select"
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
            <button className="btn-primary" onClick={() => navigate('/login/farmer')}>
              {t('landing.farmerLogin')}
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login/buyer')}>
              {t('landing.buyerLogin')}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h2>{t('landing.title')}</h2>
            <p>{t('landing.tagline')}</p>
            <div className="hero-buttons">
              <button
                className="btn-secondary"
                onClick={() => navigate('/register/farmer')}
              >
                {t('landing.farmerButton')}
              </button>
              <button
                className="btn-primary"
                onClick={() => navigate('/register/buyer')}
              >
                {t('landing.buyerButton')}
              </button>
              <button
                className="btn-truck"
                onClick={() => navigate('/register/truck')}
              >
                🚛 {t('landing.truckButton')}
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="placeholder-image">
              <span style={{ fontSize: '100px' }}>🌽</span>
            </div>
          </div>
        </div>
      </section>

      {/* For Farmers Section */}
      <section className="features-section">
        <div className="container">
          <h2>{t('landing.forFarmers')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.farmerFeatures.listCrops')}</h3>
              <p>{t('landing.farmerFeatures.listCropsDesc')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.farmerFeatures.priceComparison')}</h3>
              <p>{t('landing.farmerFeatures.priceComparisonDesc')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.farmerFeatures.truckAssignment')}</h3>
              <p>{t('landing.farmerFeatures.truckAssignmentDesc')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.farmerFeatures.securePayment')}</h3>
              <p>{t('landing.farmerFeatures.securePaymentDesc')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.farmerFeatures.ratings')}</h3>
              <p>{t('landing.farmerFeatures.ratingsDesc')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.farmerFeatures.storage')}</h3>
              <p>{t('landing.farmerFeatures.storageDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Buyers Section */}
      <section className="features-section" style={{ backgroundColor: '#f0f8f4' }}>
        <div className="container">
          <h2>{t('landing.forBuyers')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.buyerFeatures.freshProduce')}</h3>
              <p>{t('landing.buyerFeatures.freshProduceDesc')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.buyerFeatures.comparePrices')}</h3>
              <p>{t('landing.buyerFeatures.comparePricesDesc')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.buyerFeatures.farmerDetails')}</h3>
              <p>{t('landing.buyerFeatures.farmerDetailsDesc')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.buyerFeatures.flexibleDelivery')}</h3>
              <p>{t('landing.buyerFeatures.flexibleDeliveryDesc')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.buyerFeatures.trackCrops')}</h3>
              <p>{t('landing.buyerFeatures.trackCropsDesc')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>{t('landing.buyerFeatures.securePayment')}</h3>
              <p>{t('landing.buyerFeatures.securePaymentDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Truck Drivers / Logistics Partners Section */}
      <section className="features-section truck-section">
        <div className="container">
          <div className="truck-hero">
            <div className="truck-hero-content">
              <h2>🚛 {t('landing.forTruckDrivers')}</h2>
              <p className="truck-tagline">{t('landing.truckTagline')}</p>
              <button
                className="btn-truck-large"
                onClick={() => navigate('/register/truck')}
              >
                {t('landing.registerAsTruck')}
              </button>
            </div>
            <div className="truck-hero-image">
              <span style={{ fontSize: '120px' }}>🚚</span>
            </div>
          </div>
          
          <div className="features-grid">
            <div className="feature-card truck-card">
              <span className="feature-icon">💰</span>
              <h3>{t('landing.truckFeatures.earnMore')}</h3>
              <p>{t('landing.truckFeatures.earnMoreDesc')}</p>
            </div>
            <div className="feature-card truck-card">
              <span className="feature-icon">📍</span>
              <h3>{t('landing.truckFeatures.multiStop')}</h3>
              <p>{t('landing.truckFeatures.multiStopDesc')}</p>
            </div>
            <div className="feature-card truck-card">
              <span className="feature-icon">🗺️</span>
              <h3>{t('landing.truckFeatures.smartRoutes')}</h3>
              <p>{t('landing.truckFeatures.smartRoutesDesc')}</p>
            </div>
            <div className="feature-card truck-card">
              <span className="feature-icon">⚡</span>
              <h3>{t('landing.truckFeatures.instantPayment')}</h3>
              <p>{t('landing.truckFeatures.instantPaymentDesc')}</p>
            </div>
            <div className="feature-card truck-card">
              <span className="feature-icon">📱</span>
              <h3>{t('landing.truckFeatures.easyApp')}</h3>
              <p>{t('landing.truckFeatures.easyAppDesc')}</p>
            </div>
            <div className="feature-card truck-card">
              <span className="feature-icon">⭐</span>
              <h3>{t('landing.truckFeatures.ratings')}</h3>
              <p>{t('landing.truckFeatures.ratingsDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>{t('landing.howItWorksTitle')}</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>{t('landing.step1')}</h3>
              <p>{t('landing.step1Desc')}</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>{t('landing.step2')}</h3>
              <p>{t('landing.step2Desc')}</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>{t('landing.step3')}</h3>
              <p>{t('landing.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>{t('landing.footer')}</p>
        <p>{t('landing.footerTagline')}</p>
      </footer>
    </div>
  );
}

export default LandingPage;
