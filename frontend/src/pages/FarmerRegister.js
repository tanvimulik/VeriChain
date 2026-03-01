import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../utils/api';
import './AuthPages.css';

function FarmerRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    aadhaar: '',
    village: '',
    farmSize: '',
    cropsGrown: '',
    password: '',
    email: '',
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
        setFetchingLocation(false);
        alert(t('register.locationCaptured'));
      },
      (error) => {
        setFetchingLocation(false);
        alert(t('register.locationError'));
        console.error('Location error:', error);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        cropsGrown: formData.cropsGrown.split(',').map(c => c.trim()),
        gpsLocation: formData.latitude && formData.longitude ? {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        } : null,
      };
      await apiClient.post('/auth/farmer/register', payload);
      alert(t('register.registrationSuccess'));
      navigate('/login/farmer');
    } catch (err) {
      setError(err.response?.data?.message || t('register.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-auth-page">
      {/* Left Side - Branding */}
      <div className="auth-branding-side">
        <div className="branding-content">
          <div className="brand-logo">
            <i className="fas fa-leaf"></i>
            <h1>FarmConnect</h1>
          </div>
          <h2>Join India's Fastest Growing Farmer Network</h2>
          <p>Connect directly with buyers, get fair prices, and grow your business</p>
          
          <div className="benefits-list">
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>Direct market access</span>
            </div>
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>Fair pricing guaranteed</span>
            </div>
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>Free logistics support</span>
            </div>
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>Instant payment processing</span>
            </div>
          </div>

          <div className="trust-badges">
            <div className="badge">
              <strong>10,000+</strong>
              <span>Farmers</span>
            </div>
            <div className="badge">
              <strong>₹50Cr+</strong>
              <span>Transactions</span>
            </div>
            <div className="badge">
              <strong>4.8★</strong>
              <span>Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="auth-form-side">
        <div className="form-container">
          <div className="form-header">
            <h2>Create Your Farmer Account</h2>
            <p>Start selling your crops directly to buyers</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-user"></i> Personal Information
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>{t('register.fullName')} <span className="required">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('register.phone')} <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('register.aadhaar')} <span className="required">*</span></label>
                  <input
                    type="text"
                    name="aadhaar"
                    placeholder="12-digit Aadhaar number"
                    value={formData.aadhaar}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('register.email')}</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Farm Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-tractor"></i> Farm Information
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>{t('register.village')} <span className="required">*</span></label>
                  <input
                    type="text"
                    name="village"
                    placeholder="Your village/town name"
                    value={formData.village}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('register.farmSize')} <span className="required">*</span></label>
                  <select
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select farm size</option>
                    <option value="< 1 acre">Less than 1 acre</option>
                    <option value="1-2 acres">1-2 acres</option>
                    <option value="2-5 acres">2-5 acres</option>
                    <option value="5-10 acres">5-10 acres</option>
                    <option value="> 10 acres">More than 10 acres</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{t('register.cropsGrown')}</label>
                <input
                  type="text"
                  name="cropsGrown"
                  placeholder="e.g., Tomato, Onion, Wheat (comma separated)"
                  value={formData.cropsGrown}
                  onChange={handleChange}
                />
                <small className="form-hint">Enter crops separated by commas</small>
              </div>
            </div>

            {/* Location Section */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-map-marker-alt"></i> Location
              </h3>
              
              <div className="location-capture">
                <button
                  type="button"
                  className="btn-location-modern"
                  onClick={handleGetLocation}
                  disabled={fetchingLocation}
                >
                  {fetchingLocation ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Getting location...
                    </>
                  ) : formData.latitude && formData.longitude ? (
                    <>
                      <i className="fas fa-check-circle"></i> Location Captured
                    </>
                  ) : (
                    <>
                      <i className="fas fa-crosshairs"></i> Use My Current Location
                    </>
                  )}
                </button>
                {formData.latitude && formData.longitude && (
                  <div className="location-info">
                    <i className="fas fa-map-pin"></i>
                    <span>Lat: {parseFloat(formData.latitude).toFixed(4)}, Long: {parseFloat(formData.longitude).toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Security Section */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-lock"></i> Security
              </h3>
              
              <div className="form-group">
                <label>{t('register.password')} <span className="required">*</span></label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <small className="form-hint">Minimum 6 characters</small>
              </div>
            </div>

            {error && (
              <div className="error-banner">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <button type="submit" className="btn-submit-modern" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i> Create Farmer Account
                </>
              )}
            </button>

            <div className="form-footer">
              <p>
                Already have an account? 
                <Link to="/login/farmer" className="link-primary"> Sign in here</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Font Awesome */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
    </div>
  );
}

export default FarmerRegister;
