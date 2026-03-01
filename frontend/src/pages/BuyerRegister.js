import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../utils/api';
import './AuthPages.css';

function BuyerRegister() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    phone: '',
    gst: '',
    deliveryAddress: '',
    city: '',
    state: '',
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
        gpsLocation: formData.latitude && formData.longitude ? {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        } : null,
      };
      await apiClient.post('/auth/buyer/register', payload);
      alert(t('register.registrationSuccess'));
      navigate('/login/buyer');
    } catch (err) {
      setError(err.response?.data?.message || t('register.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-auth-page">
      {/* Left Side - Branding */}
      <div className="auth-branding-side buyer-branding">
        <div className="branding-content">
          <div className="brand-logo">
            <i className="fas fa-store"></i>
            <h1>FarmConnect</h1>
          </div>
          <h2>Source Fresh Produce Directly from Farmers</h2>
          <p>Join thousands of businesses getting quality crops at wholesale prices</p>
          
          <div className="benefits-list">
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>Wholesale pricing</span>
            </div>
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>Quality guaranteed</span>
            </div>
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>Direct from farm</span>
            </div>
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>Flexible delivery options</span>
            </div>
          </div>

          <div className="trust-badges">
            <div className="badge">
              <strong>5,000+</strong>
              <span>Businesses</span>
            </div>
            <div className="badge">
              <strong>₹100Cr+</strong>
              <span>Saved</span>
            </div>
            <div className="badge">
              <strong>24/7</strong>
              <span>Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="auth-form-side">
        <div className="form-container">
          <div className="form-header">
            <h2>Create Your Business Account</h2>
            <p>Start sourcing fresh produce at wholesale prices</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            {/* Business Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-building"></i> Business Information
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>{t('register.businessName')} <span className="required">*</span></label>
                  <input
                    type="text"
                    name="businessName"
                    placeholder="Your business name"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('register.businessType')} <span className="required">*</span></label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select business type</option>
                    <option value="Kirana">Kirana Store</option>
                    <option value="Hotel">Hotel/Restaurant</option>
                    <option value="Catering">Catering Service</option>
                    <option value="Institutional">Institutional Buyer</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
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

                <div className="form-group">
                  <label>{t('register.gst')}</label>
                  <input
                    type="text"
                    name="gst"
                    placeholder="GST Number (optional)"
                    value={formData.gst}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('register.email')}</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@business.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Delivery Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-map-marked-alt"></i> Delivery Information
              </h3>
              
              <div className="form-group">
                <label>{t('register.deliveryAddress')} <span className="required">*</span></label>
                <input
                  type="text"
                  name="deliveryAddress"
                  placeholder="Complete delivery address"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  required
                />
                <small className="form-hint">Where should we deliver your orders?</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('register.city')}</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>{t('register.state')}</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
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
                <small className="form-hint">Helps us find nearby farmers and optimize delivery</small>
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
                  <i className="fas fa-store"></i> Create Business Account
                </>
              )}
            </button>

            <div className="form-footer">
              <p>
                Already have an account? 
                <Link to="/login/buyer" className="link-primary"> Sign in here</Link>
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

export default BuyerRegister;
