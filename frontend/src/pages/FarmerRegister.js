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
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        cropsGrown: formData.cropsGrown.split(',').map(c => c.trim()),
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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>{t('register.farmerTitle')}</h2>
          <p>{t('register.farmerSubtitle')}</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('register.fullName')}</label>
              <input
                type="text"
                name="fullName"
                placeholder={t('register.fullNamePlaceholder')}
                value={formData.fullName}
                onChange={handleChange}
                required
              />
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
              <label>{t('register.aadhaar')}</label>
              <input
                type="text"
                name="aadhaar"
                placeholder={t('register.aadhaarPlaceholder')}
                value={formData.aadhaar}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('register.village')}</label>
              <input
                type="text"
                name="village"
                placeholder={t('register.villagePlaceholder')}
                value={formData.village}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('register.farmSize')}</label>
              <select
                name="farmSize"
                value={formData.farmSize}
                onChange={handleChange}
                required
              >
                <option value="">{t('register.farmSizePlaceholder')}</option>
                <option value="< 1 acre">{t('register.farmSizeOptions.lessThan1')}</option>
                <option value="1-2 acres">{t('register.farmSizeOptions.1to2')}</option>
                <option value="2-5 acres">{t('register.farmSizeOptions.2to5')}</option>
                <option value="5-10 acres">{t('register.farmSizeOptions.5to10')}</option>
                <option value="> 10 acres">{t('register.farmSizeOptions.moreThan10')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('register.cropsGrown')}</label>
              <input
                type="text"
                name="cropsGrown"
                placeholder={t('register.cropsGrownPlaceholder')}
                value={formData.cropsGrown}
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

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('register.registering') : t('register.registerButton')}
            </button>
          </form>

          <p className="auth-footer">
            {t('register.haveAccount')} <Link to="/login/farmer">{t('register.loginHere')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default FarmerRegister;
