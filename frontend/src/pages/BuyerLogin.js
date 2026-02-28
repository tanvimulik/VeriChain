import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../utils/api';
import './AuthPages.css';

function BuyerLogin() {
  const [formData, setFormData] = useState({ phone: '', password: '' });
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
      const response = await apiClient.post('/auth/buyer/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'buyer');
      localStorage.setItem('user', JSON.stringify(response.data.buyer));
      navigate('/buyer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('login.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>{t('login.buyerTitle')}</h2>
          <p>{t('login.subtitle')}</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('login.phoneLabel')}</label>
              <input
                type="tel"
                name="phone"
                placeholder={t('login.phonePlaceholder')}
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('login.passwordLabel')}</label>
              <input
                type="password"
                name="password"
                placeholder={t('login.passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('login.loggingIn') : t('login.loginButton')}
            </button>
          </form>

          <p className="auth-footer">
            {t('login.notRegistered')} <Link to="/register/buyer">{t('login.registerHere')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default BuyerLogin;
