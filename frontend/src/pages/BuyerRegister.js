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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>{t('register.buyerTitle')}</h2>
          <p>{t('register.buyerSubtitle')}</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('register.businessName')}</label>
              <input
                type="text"
                name="businessName"
                placeholder={t('register.businessNamePlaceholder')}
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('register.businessType')}</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
              >
                <option value="">{t('register.businessTypePlaceholder')}</option>
                <option value="Kirana">{t('register.businessTypeOptions.kirana')}</option>
                <option value="Hotel">{t('register.businessTypeOptions.hotel')}</option>
                <option value="Catering">{t('register.businessTypeOptions.catering')}</option>
                <option value="Institutional">{t('register.businessTypeOptions.institutional')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('register.phone')}</label>
              <input
                type="tel"
                name="phone"
                placeholder={t('register.phonePlaceholder')}
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
                placeholder={t('register.gstPlaceholder')}
                value={formData.gst}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>{t('register.deliveryAddress')}</label>
              <input
                type="text"
                name="deliveryAddress"
                placeholder={t('register.deliveryAddressPlaceholder')}
                value={formData.deliveryAddress}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('register.city')}</label>
              <input
                type="text"
                name="city"
                placeholder={t('register.cityPlaceholder')}
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>{t('register.state')}</label>
              <input
                type="text"
                name="state"
                placeholder={t('register.statePlaceholder')}
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>{t('register.email')}</label>
              <input
                type="email"
                name="email"
                placeholder={t('register.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>{t('register.password')}</label>
              <input
                type="password"
                name="password"
                placeholder={t('register.passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('register.gpsLocation')}</label>
              <button
                type="button"
                className="btn-location"
                onClick={handleGetLocation}
                disabled={fetchingLocation}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '5px'
                }}
              >
                {fetchingLocation ? t('register.gettingLocation') : t('register.useCurrentLocation')}
              </button>
              {formData.latitude && formData.longitude && (
                <p style={{ color: '#4CAF50', marginTop: '10px', fontSize: '14px' }}>
                  ✅ {t('register.locationCaptured')}: {formData.latitude}, {formData.longitude}
                </p>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('register.registering') : t('register.registerButton')}
            </button>
          </form>

          <p className="auth-footer">
            {t('register.haveAccount')} <Link to="/login/buyer">{t('register.loginHere')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default BuyerRegister;
